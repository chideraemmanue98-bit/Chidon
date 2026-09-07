import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Video, 
  FileText, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  RotateCcw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User } from 'firebase/auth';
import { getStorageKey } from '../lib/userStorage';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isBenignIdleDisconnect = errMsg.includes('CANCELLED') || errMsg.includes('Disconnecting idle stream') || errMsg.includes('idle stream');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  if (isBenignIdleDisconnect) {
    console.debug('Firestore Idle Stream Disconnected (self-healing):', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error in DailyContentGoal: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}

// Helper to get local date string YYYY-MM-DD reliably
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Default goals
const DEFAULT_GOAL = {
  targetVideos: 1,
  targetPosts: 3,
  completedVideos: 0,
  completedPosts: 0,
};

interface DailyContentGoalProps {
  user: User | null;
}

export function DailyContentGoal({ user }: DailyContentGoalProps) {
  const dateString = getLocalDateString();
  
  // State variables
  const [targetVideos, setTargetVideos] = useState<number>(DEFAULT_GOAL.targetVideos);
  const [targetPosts, setTargetPosts] = useState<number>(DEFAULT_GOAL.targetPosts);
  const [completedVideos, setCompletedVideos] = useState<number>(DEFAULT_GOAL.completedVideos);
  const [completedPosts, setCompletedPosts] = useState<number>(DEFAULT_GOAL.completedPosts);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editVideos, setEditVideos] = useState<number>(DEFAULT_GOAL.targetVideos);
  const [editPosts, setEditPosts] = useState<number>(DEFAULT_GOAL.targetPosts);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Helper: Retrieve local cache
  const getLocalGoal = (date: string) => {
    const key = `chidon_goal_${date}`;
    const data = localStorage.getItem(getStorageKey(key));
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // ignore parsing error
      }
    }
    return DEFAULT_GOAL;
  };

  // Synchronize with Firestore (if user signed in) or LocalStorage
  useEffect(() => {
    setIsLoading(true);
    const dateToday = getLocalDateString();

    if (!user) {
      // Offline / Unauthenticated Mode
      const cached = getLocalGoal(dateToday);
      setTargetVideos(cached.targetVideos);
      setTargetPosts(cached.targetPosts);
      setCompletedVideos(cached.completedVideos);
      setCompletedPosts(cached.completedPosts);
      
      setEditVideos(cached.targetVideos);
      setEditPosts(cached.targetPosts);
      setIsLoading(false);
      return;
    }

    // Authenticated Mode - listen to live goals in Firestore
    const docRef = doc(db, 'users', user.uid, 'daily_goals', dateToday);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const tV = typeof data.targetVideos === 'number' ? data.targetVideos : DEFAULT_GOAL.targetVideos;
        const tP = typeof data.targetPosts === 'number' ? data.targetPosts : DEFAULT_GOAL.targetPosts;
        const cV = typeof data.completedVideos === 'number' ? data.completedVideos : DEFAULT_GOAL.completedVideos;
        const cP = typeof data.completedPosts === 'number' ? data.completedPosts : DEFAULT_GOAL.completedPosts;

        setTargetVideos(tV);
        setTargetPosts(tP);
        setCompletedVideos(cV);
        setCompletedPosts(cP);
        
        setEditVideos(tV);
        setEditPosts(tP);
      } else {
        // Fall back to local storage cache if doc doesn't exist in firestore yet
        const cached = getLocalGoal(dateToday);
        setTargetVideos(cached.targetVideos);
        setTargetPosts(cached.targetPosts);
        setCompletedVideos(cached.completedVideos);
        setCompletedPosts(cached.completedPosts);
        
        setEditVideos(cached.targetVideos);
        setEditPosts(cached.targetPosts);
      }
      setIsLoading(false);
    }, (error) => {
      console.warn('Real-time snapshot error. Falling back to local state:', error);
      const cached = getLocalGoal(dateToday);
      setTargetVideos(cached.targetVideos);
      setTargetPosts(cached.targetPosts);
      setCompletedVideos(cached.completedVideos);
      setCompletedPosts(cached.completedPosts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, dateString]);

  // Persist update
  const persistChanges = async (
    vTarget: number, 
    pTarget: number, 
    vCompleted: number, 
    pCompleted: number
  ) => {
    const today = getLocalDateString();
    const payload = {
      targetVideos: vTarget,
      targetPosts: pTarget,
      completedVideos: vCompleted,
      completedPosts: pCompleted,
      date: today,
    };

    // 1. Store locally in cache
    localStorage.setItem(getStorageKey(`chidon_goal_${today}`), JSON.stringify(payload));

    // 2. Write to Firestore if authorized
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'daily_goals', today);
        await setDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/daily_goals/${today}`);
      }
    }
  };

  // Increment completion
  const handleIncrement = async (type: 'video' | 'post') => {
    if (type === 'video') {
      const newVal = completedVideos + 1;
      setCompletedVideos(newVal);
      await persistChanges(targetVideos, targetPosts, newVal, completedPosts);
    } else {
      const newVal = completedPosts + 1;
      setCompletedPosts(newVal);
      await persistChanges(targetVideos, targetPosts, completedVideos, newVal);
    }
  };

  // Decrement completion
  const handleDecrement = async (type: 'video' | 'post') => {
    if (type === 'video') {
      if (completedVideos <= 0) return;
      const newVal = completedVideos - 1;
      setCompletedVideos(newVal);
      await persistChanges(targetVideos, targetPosts, newVal, completedPosts);
    } else {
      if (completedPosts <= 0) return;
      const newVal = completedPosts - 1;
      setCompletedPosts(newVal);
      await persistChanges(targetVideos, targetPosts, completedVideos, newVal);
    }
  };

  // Reset completion
  const handleResetProgress = async () => {
    if (window.confirm("Reset today's output progress back to 0?")) {
      setCompletedVideos(0);
      setCompletedPosts(0);
      await persistChanges(targetVideos, targetPosts, 0, 0);
    }
  };

  // Save customized targets
  const handleSaveTargets = async () => {
    setIsSaving(true);
    const validatedVideos = Math.max(0, Math.min(50, editVideos));
    const validatedPosts = Math.max(0, Math.min(100, editPosts));
    
    setTargetVideos(validatedVideos);
    setTargetPosts(validatedPosts);
    
    await persistChanges(validatedVideos, validatedPosts, completedVideos, completedPosts);
    setIsSaving(false);
    setIsEditing(false);
  };

  // Load a target preset
  const applyPreset = (v: number, p: number) => {
    setEditVideos(v);
    setEditPosts(p);
  };

  // Progress metrics
  const videoPercent = targetVideos > 0 ? Math.min(100, (completedVideos / targetVideos) * 100) : 100;
  const postPercent = targetPosts > 0 ? Math.min(100, (completedPosts / targetPosts) * 100) : 100;
  
  // Overall weighted score
  const totalCompleted = completedVideos + completedPosts;
  const totalTarget = targetVideos + targetPosts;
  const overallPercent = totalTarget > 0 ? Math.min(100, (totalCompleted / totalTarget) * 100) : 100;

  const isGoalMet = completedVideos >= targetVideos && completedPosts >= targetPosts;

  const formatDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="card-base p-6 flex items-center justify-center h-48 border border-brand/5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--text-secondary)]">Initializing Daily Content Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-6 md:p-8 border border-brand/10 dark:border-brand/15 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-app)] relative overflow-hidden">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <Target size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Daily Content Goal</h2>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--border-base)]">
                {formatDateLabel()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Maintain your output targets to scale channel engagement and trigger algorithm growth.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-base)] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[var(--text-primary)] transition-all active:scale-95 duration-200 cursor-pointer"
            id="adjust-targets-btn"
          >
            <Sliders size={13} className="text-brand" />
            <span>{isEditing ? "Close Panel" : "Adjust Targets"}</span>
          </button>
          
          <button
            onClick={handleResetProgress}
            className="p-1.5 rounded-xl border border-transparent hover:border-[var(--border-base)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
            title="Reset Daily Output Logs"
            id="reset-goals-btn"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Settings / Adjust Targets (AnimatePresence slide-down) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-[var(--border-base)] pb-6 relative z-10"
          >
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-[var(--border-base)] grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" /> Adjust Content Metrics
                </h3>
                
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Video size={13} className="text-brand" /> Daily Video Target
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditVideos(Math.max(0, editVideos - 1))}
                        className="w-8 h-8 rounded-lg border border-[var(--border-base)] flex items-center justify-center text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={editVideos}
                        onChange={(e) => setEditVideos(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center text-sm font-bold font-mono bg-transparent border-b border-[var(--border-base)] focus:border-brand outline-none py-1 text-[var(--text-primary)]"
                        min="0"
                        max="50"
                      />
                      <button
                        onClick={() => setEditVideos(Math.min(50, editVideos + 1))}
                        className="w-8 h-8 rounded-lg border border-[var(--border-base)] flex items-center justify-center text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <FileText size={13} className="text-cyan-primary" /> Daily Post/Thread Target
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditPosts(Math.max(0, editPosts - 1))}
                        className="w-8 h-8 rounded-lg border border-[var(--border-base)] flex items-center justify-center text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={editPosts}
                        onChange={(e) => setEditPosts(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center text-sm font-bold font-mono bg-transparent border-b border-[var(--border-base)] focus:border-brand outline-none py-1 text-[var(--text-primary)]"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => setEditPosts(Math.min(100, editPosts + 1))}
                        className="w-8 h-8 rounded-lg border border-[var(--border-base)] flex items-center justify-center text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand" /> Output Presets
                </h3>
                
                {/* Presets Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => applyPreset(1, 1)}
                    className="p-2 text-[10px] font-bold rounded-xl border border-[var(--border-base)] hover:border-brand/40 bg-white dark:bg-slate-900 text-center transition-all cursor-pointer hover:bg-brand/5"
                  >
                    <span className="block text-[var(--text-primary)] font-mono">1v, 1p</span>
                    <span className="text-[var(--text-secondary)] text-[8px]">Relaxed</span>
                  </button>
                  <button
                    onClick={() => applyPreset(1, 3)}
                    className="p-2 text-[10px] font-bold rounded-xl border border-brand/30 bg-brand/5 text-brand text-center transition-all cursor-pointer hover:bg-brand/10"
                  >
                    <span className="block font-mono">1v, 3p</span>
                    <span className="text-[8px] opacity-85">Consistent</span>
                  </button>
                  <button
                    onClick={() => applyPreset(2, 5)}
                    className="p-2 text-[10px] font-bold rounded-xl border border-[var(--border-base)] hover:border-brand/40 bg-white dark:bg-slate-900 text-center transition-all cursor-pointer hover:bg-brand/5"
                  >
                    <span className="block text-[var(--text-primary)] font-mono">2v, 5p</span>
                    <span className="text-[var(--text-secondary)] text-[8px]">Aggressive</span>
                  </button>
                </div>

                {/* Save controls */}
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-base)] hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTargets}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand/90 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? "Saving..." : "Save Targets"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Achieved Overlay Celebration */}
      <AnimatePresence>
        {isGoalMet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 relative z-10"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">🎉 Daily Content Targets Complete!</h3>
              <p className="text-[10px] text-emerald-500 leading-normal font-medium">
                Awesome work maintaining consistency. Your channel is building momentum for global reach!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats and Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Weighted Circular/Linear Progress Breakdown */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-[var(--border-base)] text-center h-full">
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-2">Overall Completion</p>
          
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circle Progress */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground circle */}
              <motion.circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-brand"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - overallPercent / 100) }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">{Math.round(overallPercent)}%</span>
              <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">Combined</span>
            </div>
          </div>

          <p className="text-[10px] text-[var(--text-secondary)] mt-4 font-bold">
            {totalCompleted} of {totalTarget} outputs logged
          </p>
        </div>

        {/* Right Column: Interactive Video/Post Progress Bars */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Row 1: Videos Progress */}
          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-[var(--border-base)]">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Video size={14} />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-primary)]">Video Output</span>
                  <span className="block text-[9px] text-[var(--text-secondary)]">Reels, TikTok, YouTube Shorts</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-[var(--text-primary)] text-sm">{completedVideos}</span>
                <span className="text-[var(--text-secondary)] text-[10px] font-bold"> / {targetVideos} goal</span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${videoPercent}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-brand rounded-full"
              />
            </div>

            {/* Increment/Decrement Controls */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium italic">
                {videoPercent >= 100 ? "Video target achieved!" : "Logs your final publications"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDecrement('video')}
                  disabled={completedVideos <= 0}
                  className="w-7 h-7 rounded-lg border border-[var(--border-base)] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed text-[var(--text-primary)] cursor-pointer"
                  title="Remove Video"
                >
                  <Minus size={11} />
                </button>
                <button
                  onClick={() => handleIncrement('video')}
                  className="w-10 h-7 rounded-lg bg-brand/10 hover:bg-brand/15 flex items-center justify-center text-brand font-black cursor-pointer"
                  title="Add Completed Video"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Posts/Threads Progress */}
          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-[var(--border-base)]">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-primary shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-primary)]">Post / Thread Output</span>
                  <span className="block text-[9px] text-[var(--text-secondary)]">X/Twitter, LinkedIn, Threads</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-[var(--text-primary)] text-sm">{completedPosts}</span>
                <span className="text-[var(--text-secondary)] text-[10px] font-bold"> / {targetPosts} goal</span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${postPercent}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-cyan-500 rounded-full"
              />
            </div>

            {/* Increment/Decrement Controls */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium italic">
                {postPercent >= 100 ? "Post target achieved!" : "Logs written updates / graphics"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDecrement('post')}
                  disabled={completedPosts <= 0}
                  className="w-7 h-7 rounded-lg border border-[var(--border-base)] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed text-[var(--text-primary)] cursor-pointer"
                  title="Remove Post"
                >
                  <Minus size={11} />
                </button>
                <button
                  onClick={() => handleIncrement('post')}
                  className="w-10 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 flex items-center justify-center text-cyan-primary font-black cursor-pointer"
                  title="Add Completed Post"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
