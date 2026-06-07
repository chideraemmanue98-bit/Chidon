import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  Download, 
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Lock,
  Calendar,
  Layers,
  Video,
  PenTool,
  Award,
  Clock,
  LayoutGrid,
  FileDown,
  MessageSquare,
  Send,
  Share2,
  Globe,
  Users,
  CheckCircle2,
  Unlock,
  MessageCircle,
  Plus,
  HelpCircle,
  Clock3,
  Edit2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportToTXT } from '../lib/exportUtils';
import { ConfirmationDialog } from './ConfirmationDialog';

interface SavedDraft {
  id: string;
  featureId: string;
  content: string;
  title: string;
  createdAt: any;
  userId?: string;
}

interface ChidonVaultProps {
  onBack?: () => void;
  onSignIn?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Intel', icon: Layers },
  { id: 'ideas', label: 'Content Ideas', icon: Video, features: ['content-ideas', 'daily-ideas'] },
  { id: 'scripts', label: 'AI Scripts', icon: PenTool, features: ['scripts', 'ai-script-outline'] },
  { id: 'bios', label: 'Social Bios', icon: LayoutGrid, features: ['bio'] },
  { id: 'seo', label: 'SEO & Tech', icon: Award, features: ['competitor-analysis', 'keyword-research', 'youtube-seo', 'seo-scorecard', 'thumbnails', 'posting-schedule', 'post-optimizer'] }
];

export const ChidonVault: React.FC<ChidonVaultProps> = ({ onBack, onSignIn }) => {
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDraft, setSelectedDraft] = useState<SavedDraft | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFeatureTag, setSelectedFeatureTag] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateStr, setCustomDateStr] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // --- REAL-TIME COLLABORATION STATES ---
  const [collabCode, setCollabCode] = useState('');
  const [isCollabSharingOpen, setIsCollabSharingOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  
  // Real-time editor local input states (prevents text cursor jumps)
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<any>(null);

  // User presence parameters
  const [sessionUserId] = useState(() => {
    const savedId = localStorage.getItem('collab_session_uid');
    if (savedId) return savedId;
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('collab_session_uid', newId);
    return newId;
  });

  const [collabNickname, setCollabNickname] = useState(() => {
    const saved = localStorage.getItem('collab_nickname');
    if (saved) return saved;
    const activeUserObj = auth.currentUser || (localStorage.getItem('simulated_user') ? JSON.parse(localStorage.getItem('simulated_user')!) : null);
    if (activeUserObj) {
      return activeUserObj.displayName || activeUserObj.email?.split('@')[0] || 'Teammate';
    }
    const funNames = ['Alpha Creator', 'Hexa Copywriter', 'Vortex Editor', 'Scalar Designer', 'Sync Maverick', 'Binary Author'];
    const chosen = funNames[Math.floor(Math.random() * funNames.length)];
    localStorage.setItem('collab_nickname', chosen);
    return chosen;
  });

  const [collabUserColor] = useState(() => {
    const colors = ['#00FF87', '#60EFFF', '#FF007F', '#FFB800', '#E040FB', '#00E5FF', '#FF5252', '#9D4EDD', '#FFBE0B', '#3A86C8'];
    const chosen = colors[Math.floor(Math.random() * colors.length)];
    return colors.includes(chosen) ? chosen : '#00E5FF';
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ title, message, onConfirm });
    setIsConfirmOpen(true);
  };

  // Deep-linking URL capture + custom code joiner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collabId = params.get('collab');
    if (collabId) {
      const getCollabDraft = async () => {
        try {
          const docRef = doc(db, 'drafts', collabId);
          const docSnap = await getDoc(docRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            const draftObj = { id: docSnap.id, ...data } as SavedDraft;
            setSelectedDraft(draftObj);
            
            // Clean up query param so clicking around doesn't stay stuck on deep link
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        } catch (error) {
          console.error("Collab fetch failed:", error);
        }
      };
      getCollabDraft();
    }
  }, []);

  // Synchronize local input state with selectedDraft values on load
  useEffect(() => {
    if (selectedDraft) {
      setLocalContent(selectedDraft.content || '');
      setLocalTitle(selectedDraft.title || '');
    } else {
      setLocalContent('');
      setLocalTitle('');
    }
  }, [selectedDraft?.id]);

  // Synchronize incoming remote edits immediately, but ONLY if we are not actively typing
  useEffect(() => {
    if (selectedDraft && !isTyping) {
      setLocalContent(selectedDraft.content || '');
      setLocalTitle(selectedDraft.title || '');
    }
  }, [selectedDraft?.content, selectedDraft?.title]);

  // Handle Real-Time Comments and Presence Listeners for Selected Draft
  useEffect(() => {
    if (!selectedDraft) {
      setActiveCollaborators([]);
      setComments([]);
      return;
    }

    const draftId = selectedDraft.id;

    // A. COMMENTS STREAM
    const commentsQuery = query(
      collection(db, 'drafts', draftId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setComments(list);
    }, (error) => {
      console.warn("Real-time comments feed offline. Cached views active:", error);
    });

    // B. PRESENCE REGISTRATION & HEARTBEAT
    const presenceDocRef = doc(db, 'drafts', draftId, 'presence', sessionUserId);
    
    const writePresence = async () => {
      try {
        await updateDoc(presenceDocRef, {
          userName: collabNickname,
          userColor: collabUserColor,
          lastActive: Date.now() // Use simple milliseconds for sub-second offline compatibility
        }).catch(async (err) => {
          // If document doesn't exist yet, we write with setDoc
          await setDoc(presenceDocRef, {
            userName: collabNickname,
            userColor: collabUserColor,
            lastActive: Date.now(),
            userId: sessionUserId
          });
        });
      } catch (e) {
        // Silently catch exceptions
      }
    };

    // Trigger immediately
    writePresence();

    // Setup periodic heart-beat
    const heartbeat = setInterval(() => {
      writePresence();
    }, 15000);

    // C. PRESENCE INCOMING BROADCAST LISTENERS
    const presenceQuery = collection(db, 'drafts', draftId, 'presence');
    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const list: any[] = [];
      const cutoff = Date.now() - 45000; // 45 seconds stale cutoff
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== sessionUserId && data.lastActive && data.lastActive > cutoff) {
          list.push({ id: doc.id, ...data });
        }
      });
      setActiveCollaborators(list);
    }, (error) => {
      console.warn("Presence registration offline:", error);
    });

    // CLEANUP ON UNMOUNT OR TRANSITION
    return () => {
      unsubscribeComments();
      unsubscribePresence();
      clearInterval(heartbeat);
      try {
        deleteDoc(presenceDocRef);
      } catch (e) {
        // Silently skip
      }
    };
  }, [selectedDraft?.id, collabNickname]);

  // Submit local changes live to Firestore
  const saveDraftLiveContent = async (updatedContent: string, updatedTitle: string) => {
    if (!selectedDraft) return;
    setIsCloudSyncing(true);
    try {
      const draftRef = doc(db, 'drafts', selectedDraft.id);
      await updateDoc(draftRef, {
        content: updatedContent,
        title: updatedTitle
      });
    } catch (error) {
      console.warn("Failed to sync co-authoring changes:", error);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleContentInput = (val: string) => {
    setLocalContent(val);
    setIsTyping(true);
    
    // Clear existing debounce timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      saveDraftLiveContent(val, localTitle);
    }, 450); // Fast 450ms debounce for high-quality instant sync
  };

  const handleTitleInput = (val: string) => {
    setLocalTitle(val);
    setIsTyping(true);
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      saveDraftLiveContent(localContent, val);
    }, 450);
  };

  // Convert draft from Private to Collaborative
  const handleEnableCollaboration = async () => {
    if (!selectedDraft) return;
    setIsCloudSyncing(true);
    try {
      const draftRef = doc(db, 'drafts', selectedDraft.id);
      // Remove private userId block to enable open collaboration
      await updateDoc(draftRef, {
        userId: null,
        title: selectedDraft.title.startsWith("Collaborative:") ? selectedDraft.title : `Collaborative: ${selectedDraft.title}`
      });
      
      // Re-hydrate the local selectedDraft state
      setSelectedDraft(prev => prev ? { 
        ...prev, 
        userId: undefined, 
        title: prev.title.startsWith("Collaborative:") ? prev.title : `Collaborative: ${prev.title}` 
      } : null);
      
      setIsCollabSharingOpen(true);
    } catch (error) {
      console.warn("Collaboration scaling failed:", error);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Direct join code handler
  const handleJoinByCode = async (codeValue: string) => {
    if (!codeValue.trim()) return;
    
    setLoading(true);
    try {
      let targetId = codeValue.trim();
      if (targetId.includes('collab=')) {
        const urlParams = new URLSearchParams(targetId.split('?')[1]);
        targetId = urlParams.get('collab') || targetId;
      }
      
      const docRef = doc(db, 'drafts', targetId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const draftObj = { id: docSnap.id, ...data } as SavedDraft;
        
        // Add to drafts array locally if not already present
        if (!drafts.some(d => d.id === draftObj.id)) {
          setDrafts(prev => [draftObj, ...prev]);
        }
        
        setSelectedDraft(draftObj);
        setCollabCode('');
      } else {
        alert("We couldn't locate any collaborative workspace matching this code / link. Please verify and try again.");
      }
    } catch (err) {
      console.error("Join co-authoring session failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send a collaborative comment/feedback node
  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || !selectedDraft) return;

    try {
      const tempText = commentText;
      setCommentText('');
      
      // Add a doc to collection drafts/{id}/comments
      await addDoc(collection(db, 'drafts', selectedDraft.id, 'comments'), {
        text: tempText,
        userName: collabNickname,
        userColor: collabUserColor,
        userId: sessionUserId,
        createdAt: new Date().toISOString() // String for simple sorted parsing
      });
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  // Dynamically compile unique feature IDs available from saved drafts
  const uniqueAvailableTags = Array.from(new Set(drafts.map(d => d.featureId).filter(Boolean)));

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredDrafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDrafts.map(d => d.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    triggerConfirm(
      "CONFIRM BULK DISCARD",
      `Are you sure you want to permanently discard all ${selectedIds.length} selected blueprints from your CHIDON Vault? This operation is irreversible.`,
      async () => {
        try {
          const promises = selectedIds.map(id => deleteDoc(doc(db, 'drafts', id)));
          await Promise.all(promises);
          if (selectedDraft && selectedIds.includes(selectedDraft.id)) {
            setSelectedDraft(null);
          }
          setSelectedIds([]);
        } catch (err) {
          console.error("Bulk discard failed:", err);
        }
      }
    );
  };

  useEffect(() => {
    // Fail-safe real-time subscriber for both user-owned and collaborative drafts
    let unsubscribe = () => {};
    const activeUser = auth.currentUser || (localStorage.getItem('simulated_user') ? JSON.parse(localStorage.getItem('simulated_user')!) : null);

    const q = query(
      collection(db, 'drafts'),
      orderBy('createdAt', 'desc')
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SavedDraft[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const matchesUser = activeUser && data.userId === activeUser.uid;
        const matchesCollab = !data.userId; // No userId indicates a shared public workspace draft
        
        if (matchesUser || matchesCollab) {
          list.push({ id: doc.id, ...data } as SavedDraft);
        }
      });
      
      // Deduplicate consolidated list
      const uniqueList: SavedDraft[] = [];
      const seenIds = new Set<string>();
      for (const item of list) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueList.push(item);
        }
      }
      
      setDrafts(uniqueList);
      setLoading(false);
    }, (error) => {
      console.warn("Unified real-time drafts subscriber paused, falling back to local storage cache:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerConfirm(
      "DISCARD BLUEPRINT",
      "Are you sure you want to permanently discard this blueprint from your CHIDON Vault? This blueprint will be deleted from the database.",
      async () => {
        try {
          await deleteDoc(doc(db, 'drafts', id));
          if (selectedDraft?.id === id) {
            setSelectedDraft(null);
          }
          setSelectedIds(prev => prev.filter(item => item !== id));
        } catch (err) {
          console.error("Discard failed:", err);
        }
      }
    );
  };

  const handleDownload = (draft: SavedDraft) => {
    exportToTXT(draft.content, `${draft.title || 'Saved Intel'}.txt`);
  };

  // Prepares the feature label badge
  const getFeatureLabel = (featureId: string) => {
    switch (featureId) {
      case 'content-ideas': return 'Video Ideas';
      case 'scripts': return 'Script Writer';
      case 'bio': return 'Bio Optimizer';
      case 'competitor-analysis': return 'Competitor Lab';
      case 'posting-schedule': return 'Schedule Lab';
      case 'youtube-seo': return 'Youtube SEO';
      case 'seo-scorecard': return 'SEO Scorecard';
      case 'keyword-research': return 'Keyword Intel';
      case 'post-optimizer': return 'Time Optimizer';
      case 'ai-script-outline': return 'Script Outline';
      case 'daily-ideas': return 'Daily Ideas';
      default: return featureId.replace('-', ' ').toUpperCase();
    }
  };

  // Safe helper to obtain JavaScript Date from database Timestamp or standard Date representations
  const getDraftDate = (d: SavedDraft): Date | null => {
    if (!d.createdAt) return null;
    if (d.createdAt.toDate) return d.createdAt.toDate();
    if (d.createdAt instanceof Date) return d.createdAt;
    if (typeof d.createdAt === 'string' || typeof d.createdAt === 'number') return new Date(d.createdAt);
    if (d.createdAt.seconds) return new Date(d.createdAt.seconds * 1000);
    return null;
  };

  // Filter Logic
  const filteredDrafts = drafts.filter((d) => {
    // 1. Search Query
    const matchesSearch = 
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (d.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Hub Category Tag filter
    if (selectedCategory !== 'all') {
      const catObj = CATEGORIES.find(c => c.id === selectedCategory);
      const isFeatureInCat = catObj && catObj.features ? catObj.features.includes(d.featureId) : true;
      if (!isFeatureInCat) return false;
    }

    // 3. Specific Feature Tag filter dropdown
    if (selectedFeatureTag !== 'all' && d.featureId !== selectedFeatureTag) {
      return false;
    }

    // 4. Creation Date filtering
    if (dateFilter !== 'all') {
      const draftDate = getDraftDate(d);
      if (!draftDate) return false;

      const now = new Date();
      
      if (dateFilter === 'today') {
        if (draftDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const diffTime = now.getTime() - draftDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else if (dateFilter === 'month') {
        const diffTime = now.getTime() - draftDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      } else if (dateFilter === 'custom' && customDateStr) {
        // customDateStr is in "YYYY-MM-DD" style
        const targetDate = new Date(customDateStr);
        if (
          draftDate.getFullYear() !== targetDate.getFullYear() ||
          draftDate.getMonth() !== targetDate.getMonth() ||
          draftDate.getDate() !== targetDate.getDate()
        ) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen pb-24">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-brand transition-all group w-fit"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Back to Hub</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              CHIDON SAVED INTEL
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-brand/10 text-brand uppercase border border-brand/20">
              <Sparkles size={10} className="mr-1 inline animate-pulse" /> Vault
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            A specialized, neural index holding your generated content. Access scripts, video formulas, copyable hashtags, and optimization metrics.
          </p>
        </div>

        {/* Authenticate Suggestion Indicator */}
        {!(auth.currentUser || localStorage.getItem('simulated_user')) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl border border-brand/20 bg-brand/5 max-w-md flex items-center gap-4 shadow-sm"
          >
            <div className="p-2.5 bg-brand/15 rounded-xl text-brand">
              <Lock size={18} />
            </div>
            <div className="text-left space-y-1">
              <p className="text-xs font-bold text-[var(--text-primary)]">Sync Cloud Cryptography</p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">Sign in to sync your saved items securely across mobile and web.</p>
              {onSignIn && (
                <button 
                  onClick={onSignIn} 
                  className="mt-1 text-[10px] font-bold uppercase tracking-wider text-brand hover:underline"
                >
                  Authorize Node &rarr;
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-base)]">
        {CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border",
                isActive 
                  ? "bg-brand text-white border-brand shadow-md" 
                  : "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--border-base)] hover:text-[var(--text-primary)]"
              )}
            >
              <IconComponent size={14} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Join Workspace input row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-brand/[0.03] border border-brand/20 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-brand text-left shrink-0">
          <Users size={16} />
          <span className="text-xs font-black uppercase tracking-wider font-mono">Join Live Workspace:</span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleJoinByCode(collabCode); }} className="flex-1 flex gap-2 w-full">
          <input 
            type="text"
            placeholder="Paste Workspace Room Code ID or Collaboration link... (e.g. ?collab=XYZ)"
            className="flex-1 bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)]"
            value={collabCode}
            onChange={(e) => setCollabCode(e.target.value)}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-active transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={13} /> Join Space
          </button>
        </form>
      </div>

      {/* Control Tools Panel */}
      <div className="flex flex-col gap-4 bg-[var(--card-bg)]/40 p-5 rounded-2xl border border-[var(--border-base)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
          {/* Search Query Input */}
          <div className="relative w-full md:col-span-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
            <input 
              type="text"
              placeholder="Search saved content by name, metadata, or keywords..."
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Feature Tag Dropdown */}
          <div className="relative w-full md:col-span-3">
            <select
              value={selectedFeatureTag}
              onChange={(e) => setSelectedFeatureTag(e.target.value)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl py-2.5 pl-3 pr-8 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)] appearance-none cursor-pointer font-bold"
            >
              <option value="all">🏷️ All Feature Tags</option>
              {uniqueAvailableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {getFeatureLabel(tag)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
              <span className="text-[8px]">▼</span>
            </div>
          </div>

          {/* Creation Date Dropdown */}
          <div className="relative w-full md:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl py-2.5 pl-3 pr-8 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)] appearance-none cursor-pointer font-bold"
            >
              <option value="all">📅 All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
              <option value="custom">📅 Custom Date...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
              <span className="text-[8px]">▼</span>
            </div>
          </div>
        </div>

        {/* Custom Date Input sub-panel if 'custom' date selected */}
        {dateFilter === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 pt-3 border-t border-[var(--border-base)]/60"
          >
            <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-wider">Target Date:</span>
            <input 
              type="date"
              className="bg-[var(--card-bg)]/50 border border-[var(--border-base)] hover:border-brand rounded-xl py-1.5 px-3 text-xs inline-block outline-none text-[var(--text-primary)] transition-colors cursor-pointer"
              value={customDateStr}
              onChange={(e) => setCustomDateStr(e.target.value)}
            />
            {customDateStr && (
              <button 
                onClick={() => setCustomDateStr('')}
                className="text-danger hover:underline text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}

        {/* Reset Filters Shortcut Badge */}
        {(selectedFeatureTag !== 'all' || dateFilter !== 'all' || searchQuery !== '') && (
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">ACTIVE FILTERS:</span>
            {selectedFeatureTag !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                🏷️ {getFeatureLabel(selectedFeatureTag)}
                <button onClick={() => setSelectedFeatureTag('all')} className="hover:text-danger text-[11px] font-black cursor-pointer leading-none">×</button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                📅 {dateFilter === 'custom' ? (customDateStr || 'Select Date') : dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Past week' : 'Past month'}
                <button onClick={() => { setDateFilter('all'); setCustomDateStr(''); }} className="hover:text-danger text-[11px] font-black cursor-pointer leading-none">×</button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedFeatureTag('all');
                setDateFilter('all');
                setCustomDateStr('');
              }}
              className="text-[10px] text-brand hover:underline font-bold uppercase cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-base)]">
          <div className="text-xs text-[var(--text-secondary)] font-mono">
            INDEX STATE: <span className="font-bold text-[var(--text-primary)]">{filteredDrafts.length} item(s)</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {filteredDrafts.length > 0 && (
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand hover:bg-brand/10 bg-transparent transition-all flex items-center gap-1.5 cursor-pointer border border-brand/20"
              >
                {selectedIds.length === filteredDrafts.length ? 'Deselect All' : 'Select All'}
              </button>
            )}

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs font-bold font-mono text-brand bg-brand/10 px-2.5 py-1.5 rounded-lg border border-brand/20">
                    {selectedIds.length} Selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={13} />
                    Bulk Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Draft Cards List */}
        <div className={cn("col-span-1 lg:col-span-5 space-y-3", selectedDraft ? "lg:col-span-5" : "lg:col-span-12")}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)]/40 animate-pulse space-y-3">
                  <div className="h-4 bg-[var(--border-base)] rounded-full w-2/3" />
                  <div className="h-3 bg-[var(--border-base)] rounded-full w-1/3" />
                  <div className="h-10 bg-[var(--border-base)] rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-base)] rounded-3xl space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/5 text-brand flex items-center justify-center shadow-inner">
                <BookOpen size={28} />
              </div>
              <div className="max-w-md space-y-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">Your CHIDON Vault is offline</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Generate resources (such as video tags, social optimization scripts, competitor intelligence reports) & click the <strong className="font-bold text-brand">Vault</strong> button to collect them here.
                </p>
              </div>
            </div>
          ) : (
            <div className={cn("grid gap-3", selectedDraft ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
              {filteredDrafts.map((draft) => {
                const isSelected = selectedDraft?.id === draft.id;
                const isSelectedInBulk = selectedIds.includes(draft.id);
                return (
                  <motion.div
                    key={draft.id}
                    layoutId={`draft-${draft.id}`}
                    onClick={() => setSelectedDraft(draft)}
                    className={cn(
                      "group p-5 rounded-2xl border transition-all text-left cursor-pointer bg-[var(--card-bg)] relative flex flex-col justify-between h-56",
                      isSelected 
                        ? "border-brand ring-1 ring-brand/30 shadow-md" 
                        : "border-[var(--border-base)] hover:border-brand/40 hover:shadow-sm",
                      isSelectedInBulk && "bg-brand/[0.02] border-brand/50 ring-1 ring-brand/20"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelectedInBulk) {
                                setSelectedIds(prev => prev.filter(id => id !== draft.id));
                              } else {
                                setSelectedIds(prev => [...prev, draft.id]);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none"
                            title={isSelectedInBulk ? "Deselect item" : "Select item"}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              isSelectedInBulk 
                                ? "bg-brand border-brand text-white" 
                                : "border-[var(--border-base)] group-hover:border-slate-500/50 text-transparent bg-transparent"
                            )}>
                              {isSelectedInBulk && <Check size={10} strokeWidth={3} />}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeatureTag(draft.featureId);
                            }}
                            className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand hover:bg-brand/25 transition-colors cursor-pointer"
                            title={`Filter strictly by ${getFeatureLabel(draft.featureId)}`}
                          >
                            {getFeatureLabel(draft.featureId)}
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(draft.content, draft.id);
                            }}
                            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--border-base)] transition-all"
                            title="Copy Intel"
                          >
                            {copiedId === draft.id ? <Check size={12} className="text-brand" /> : <Copy size={12} />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(draft.id, e)}
                            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-danger hover:bg-danger/5 transition-all"
                            title="Discard Intel"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-brand transition-colors line-clamp-1 mb-2">
                        {draft.title || 'Untitled Intel Saved'}
                      </h3>

                      <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed opacity-80">
                        {draft.content?.replace(/[#*`]/g, '')}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--border-base)] flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {draft.createdAt?.toDate ? draft.createdAt.toDate().toLocaleDateString() : 'Instant'}
                      </span>
                      <span className="text-brand font-bold uppercase tracking-widest text-[9px] group-hover:underline">Preview &rarr;</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Active Detailed Content Render */}
        <AnimatePresence>
          {selectedDraft && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="col-span-1 lg:col-span-7 rounded-3xl border border-[var(--border-base)] bg-[var(--card-bg)] flex flex-col overflow-hidden shadow-xl"
            >
              {/* Nickname Customization Sub-Header for Collaborative Drafts */}
              {!selectedDraft.userId && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900/10 border-b border-[var(--border-base)]/40 px-6 py-2 gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-mono">
                    <Users size={12} className="text-brand animate-pulse" />
                    <span>CO-AUTHOR NICKNAME:</span>
                    <span className="font-black text-brand uppercase">{collabNickname}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <input 
                      type="text"
                      placeholder="My co-author nickname..."
                      value={collabNickname}
                      onChange={(e) => {
                        setCollabNickname(e.target.value);
                        localStorage.setItem('collab_nickname', e.target.value);
                      }}
                      className="bg-[var(--card-bg)]/80 border border-[var(--border-base)] rounded-lg px-2 py-1 text-[9px] font-bold text-[var(--text-primary)] outline-none focus:border-brand w-full sm:w-36 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Card Title Bar */}
              <div className="p-6 border-b border-[var(--border-base)] flex flex-col gap-4 bg-gray-50/20 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand">
                      {getFeatureLabel(selectedDraft.featureId)}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedDraft.userId ? (
                        <span className="inline-flex items-center text-[9px] font-bold font-mono text-amber-500 gap-1 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <Lock size={9} /> Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-bold font-mono text-emerald-500 gap-1 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded animate-pulse">
                          <Globe size={9} /> Shared Live
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(localContent || selectedDraft.content, 'selected')}
                      className="p-2 border border-[var(--border-base)] rounded-xl text-[var(--text-secondary)] hover:text-brand hover:border-brand/40 bg-[var(--card-bg)] transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      {copiedId === 'selected' ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
                      {copiedId === 'selected' ? 'Copied' : 'Copy'}
                    </button>

                    {/* Dynamic Collaboration toggle and invites */}
                    {selectedDraft.userId ? (
                      <button
                        onClick={handleEnableCollaboration}
                        className="p-2 bg-brand/15 text-brand hover:bg-brand hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-brand/30 shadow-sm"
                        title="Turn this Private Draft into a Collaborative Shared link"
                      >
                        <Share2 size={13} />
                        Go Collaborative
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCollabSharingOpen(prev => !prev)}
                        className={cn(
                          "p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm",
                          isCollabSharingOpen 
                            ? "bg-brand text-white border-brand" 
                            : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20"
                        )}
                        title="Configure Share / Invite Teammates link"
                      >
                        <Share2 size={13} />
                        Share Workspace
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(selectedDraft)}
                      className="p-2 hover:bg-[var(--border-base)] rounded-xl text-[var(--text-secondary)] hover:text-brand transition-all"
                      title="Export TXT"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(selectedDraft.id)}
                      className="p-2 hover:bg-danger/10 text-[var(--text-secondary)] hover:text-danger rounded-xl transition-all"
                      title="Discard Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Live Real-time Collaborators Bubble List */}
                {!selectedDraft.userId && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand/[0.02] border border-brand/10 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {/* Current User */}
                        <div 
                          style={{ backgroundColor: collabUserColor }}
                          className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-black text-slate-950 border border-[var(--card-bg)] shadow-sm select-none"
                          title={`${collabNickname} (You)`}
                        >
                          {collabNickname.slice(0, 2).toUpperCase()}
                        </div>
                        {/* Remote collaborators */}
                        {activeCollaborators.map((co) => (
                          <div 
                            key={co.id}
                            style={{ backgroundColor: co.userColor }}
                            className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-black text-slate-950 border border-[var(--card-bg)] shadow-sm select-none relative animate-fade-in"
                            title={co.userName || 'Anonymous'}
                          >
                            {(co.userName || 'Teammate').slice(0, 2).toUpperCase()}
                            <span className="absolute bottom-0 right-0 h-1 rounded-full bg-emerald-400 ring-1 ring-white" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono font-black uppercase">
                        {activeCollaborators.length > 0
                          ? `ACTIVE PEERS: +${activeCollaborators.length}`
                          : 'CO-AUTHOR SECURE TUNNEL ONLINE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      {isCloudSyncing ? (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={10} className="inline" />
                          Cloud Synced
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shared invite co-authoring block */}
              {isCollabSharingOpen && !selectedDraft.userId && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-brand/[0.04] border-b border-[var(--border-base)] space-y-3 px-6 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-brand uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={11} />
                      Co-Authoring Room Access Nodes
                    </h3>
                    <button 
                      onClick={() => setIsCollabSharingOpen(false)}
                      className="text-[11px] font-bold text-zinc-400 hover:text-white"
                    >
                      × Dismiss
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    Teammates can copy and update this workspace live! Send them this Collaboration Workspace Link or Room ID:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl p-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 pl-1">
                        <span className="block text-[8px] font-mono text-zinc-500 uppercase font-black">Co-Author URL</span>
                        <span className="block text-[10px] font-mono text-[var(--text-primary)] select-all truncate">
                          {`${window.location.origin}${window.location.pathname}?collab=${selectedDraft.id}`}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?collab=${selectedDraft.id}`;
                          navigator.clipboard.writeText(url);
                          alert("Collaboration Link copied to clipboard!");
                        }}
                        className="px-2.5 py-1 bg-brand text-white rounded-lg text-[10px] font-bold hover:bg-brand-active shrink-0 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl p-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 pl-1">
                        <span className="block text-[8px] font-mono text-zinc-500 uppercase font-black">Room Code ID</span>
                        <span className="block text-[10px] font-mono text-[var(--text-primary)] select-all truncate">
                          {selectedDraft.id}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDraft.id);
                          alert("Workspace Room ID copied to clipboard!");
                        }}
                        className="px-2.5 py-1 bg-brand text-white rounded-lg text-[10px] font-bold hover:bg-brand-active shrink-0 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Unified live content editor split with live comment node discussion feeds */}
              <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-base)] overflow-hidden min-h-[440px]">
                
                {/* Text co-authoring space */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-h-[550px] custom-scrollbar selection:bg-brand/20 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest font-mono uppercase">Blueprint Label / Name</label>
                    <input 
                      type="text"
                      value={localTitle}
                      onChange={(e) => handleTitleInput(e.target.value)}
                      placeholder="Blueprint title..."
                      className="w-full bg-transparent border-b border-[var(--border-base)] focus:border-brand text-sm font-black text-[var(--text-primary)] outline-none pb-1 transition-colors"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 min-h-[220px]">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest font-mono uppercase">Intelligence Content Payload</label>
                    <textarea 
                      value={localContent}
                      onChange={(e) => handleContentInput(e.target.value)}
                      placeholder="Intelligence payload content... edits are saved live across collaborators in real-time."
                      className="flex-1 w-full bg-[var(--card-bg)] border border-[var(--border-base)] focus:border-brand rounded-2xl p-4 text-xs font-mono text-[var(--text-primary)] outline-none resize-none leading-relaxed transition-all min-h-[180px] custom-scrollbar"
                    />
                  </div>
                </div>

                {/* Teammate Comments & Feedback Roster */}
                {!selectedDraft.userId && (
                  <div className="w-full lg:w-72 flex flex-col bg-zinc-900/5 dark:bg-white/[0.01] h-[340px] lg:h-auto border-t lg:border-t-0 divide-y divide-[var(--border-base)] text-left">
                    <div className="p-4 flex items-center justify-between bg-zinc-900/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[var(--text-primary)] font-mono">
                        <MessageSquare size={13} className="text-brand text-indigo-400" />
                        <span>Team Chat Feed</span>
                        {comments.length > 0 && (
                          <span className="bg-brand/10 text-brand rounded-full text-[9px] font-black px-1.5 py-0.5 border border-brand/20">
                            {comments.length}
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">Live Link</span>
                    </div>

                    {/* Chat messaging logs */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar flex flex-col pt-2 bg-slate-900/5">
                      {comments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2 opacity-50 m-auto">
                          <MessageCircle size={24} className="text-zinc-600 stroke-1" />
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider">No Comments</p>
                            <p className="text-[9px] text-[var(--text-secondary)] leading-normal">Post suggestions, notes, or teammate feedback below.</p>
                          </div>
                        </div>
                      ) : (
                        comments.map((msg: any) => {
                          const matchesMe = msg.userId === sessionUserId;
                          return (
                            <div 
                              key={msg.id}
                              className={cn(
                                "flex flex-col gap-1 max-w-[85%] text-left",
                                matchesMe ? "self-end items-end" : "self-start items-start"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <span 
                                  style={{ color: msg.userColor }}
                                  className="text-[9px] font-black uppercase"
                                >
                                  {msg.userName || 'Teammate'}
                                </span>
                                <span className="text-[7.5px] font-mono text-zinc-500">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Instant'}
                                </span>
                              </div>
                              <div 
                                className={cn(
                                  "rounded-xl px-2.5 py-1.5 text-xs font-sans font-medium break-words max-w-full",
                                  matchesMe 
                                    ? "bg-brand text-white rounded-tr-none shadow-sm" 
                                    : "bg-white/5 border border-zinc-700/20 text-[var(--text-primary)] rounded-tl-none animate-fade-in"
                                )}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Comments submit input form */}
                    <form onSubmit={handleSendComment} className="p-2 bg-zinc-950/25 flex gap-1.5 items-center shrink-0">
                      <input 
                        type="text"
                        placeholder="Add co-author feedback..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand text-[var(--text-primary)]"
                      />
                      <button 
                        type="submit"
                        className="p-2 bg-brand hover:bg-brand-active text-white rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        <Send size={11} />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Footer bar for information metadata */}
              <div className="p-4 border-t border-[var(--border-base)] bg-gray-50/10 dark:bg-white/5 flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Saved: {selectedDraft.createdAt?.toDate ? selectedDraft.createdAt.toDate().toLocaleString() : 'Recent timestamp'}
                </span>
                <span className="font-mono text-[9px] uppercase">
                  LENGTH: {selectedDraft.content?.length || 0} characters
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmConfig?.onConfirm || (() => {})}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
      />
    </div>
  );
};
