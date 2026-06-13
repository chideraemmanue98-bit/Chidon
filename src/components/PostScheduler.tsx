import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Upload, 
  Clock, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon,
  AlertCircle,
  Download,
  PenTool
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';
import { exportToJSON, exportToCSV } from '../lib/exportUtils';
import emptySchedulerImg from '../assets/images/empty_scheduler_1781319203016.jpg';
import { Zap, Wand2, Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ScheduledPost {
  id: string;
  caption: string;
  scheduledAt: Date;
  mediaUrl?: string;
  platform: string;
  status: 'scheduled' | 'published' | 'failed';
}

export const PostScheduler = ({ initialCaption, onClearPreFill, feature, onBack, user }: { initialCaption?: string, onClearPreFill?: () => void, feature?: any, onBack?: () => void, user?: any }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // New Post Form State
  const [caption, setCaption] = useState('');
  const [time, setTime] = useState('12:00');
  const [platform, setPlatform] = useState('instagram');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialCaption) {
      setCaption(initialCaption);
      setIsModalOpen(true);
      // Wait a bit then clear the pre-fill state in parent to avoid re-opening if the component re-renders
      if (onClearPreFill) {
        onClearPreFill();
      }
    }
  }, [initialCaption]);

  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAICaption = async () => {
    if (!aiTopic) return;
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `Act as a Viral Social Media Strategist. Generate a high-performance caption for ${platform} about the topic: "${aiTopic}".
      
      Requirements:
      1. Platform Optimization: Tailor the tone, length, and formatting specifically for ${platform}.
      2. Engagement: Include a compelling hook and a clear Call to Action (CTA).
      3. Visuals: Use relevant emojis strategically.
      4. Reach: Include 5-10 highly relevant hashtags.
      5. Tone: Professional yet disruptive and viral-focused.
      
      Return ONLY the caption text, no prefixes, no surrounding quotes, and no commentary.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text;
      if (text) {
        setCaption(text);
        setAiTopic('');
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setAiError("Neural link failed. Verify connectivity.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    let q;
    if (user) {
      q = query(
        collection(db, 'scheduled_posts'),
        where('userId', '==', user.uid)
      );
    } else {
      q = query(collection(db, 'scheduled_posts'));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let postsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledAt: data.scheduledAt instanceof Timestamp ? data.scheduledAt.toDate() : new Date(data.scheduledAt)
        } as ScheduledPost;
      });

      // Deduplicate postsData by ID to guarantee unique keys
      const uniquePosts: ScheduledPost[] = [];
      const seenIds = new Set<string>();
      for (const item of postsData) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniquePosts.push(item);
        }
      }

      postsData = uniquePosts;
      postsData.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

      if (!user) {
        postsData = postsData.filter(post => !('userId' in post) || !post.userId);
      }

      setPosts(postsData);
    }, (error) => {
      console.error("Firestore List Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate))
  });

  const handleAddPost = async () => {
    if (!caption || !selectedDate) return;
    setIsSubmitting(true);
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes);

      const postPayload: any = {
        caption,
        scheduledAt: Timestamp.fromDate(scheduledAt),
        platform,
        mediaUrl: mediaUrl || null,
        status: 'scheduled',
        createdAt: serverTimestamp()
      };

      if (user) {
        postPayload.userId = user.uid;
      }

      await addDoc(collection(db, 'scheduled_posts'), postPayload);

      setIsModalOpen(false);
      setCaption('');
      setMediaUrl('');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scheduled_posts', id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan-primary transition-all group mb-4"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest font-mono">Back to Hub</span>
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-primary/20 to-purple-vibrant/20 rounded-2xl text-cyan-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <CalendarIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-white tracking-tighter uppercase leading-none">Content Calendar</h2>
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-[0.3em] font-black mt-1">{format(currentDate, 'MMMM yyyy')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Protocol Synchronized</span>
            </motion.div>
          )}
          <Tooltip content="Export Schedule (CSV)">
            <button 
              onClick={() => {
                const csvData = posts.map(p => ({
                  platform: p.platform,
                  date: format(p.scheduledAt, 'yyyy-MM-dd'),
                  time: format(p.scheduledAt, 'HH:mm'),
                  caption: p.caption,
                  status: p.status
                }));
                exportToCSV(csvData, `content-schedule-${format(new Date(), 'yyyy-MM-dd')}`);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-cyan-primary"
            >
              <Download size={20} />
            </button>
          </Tooltip>
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 bg-white/[0.08] border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/20 transition-all">
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-navy-black/60 p-5 text-center border-b border-white/5">
            <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">{day}</span>
          </div>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayPosts = posts.filter(p => isSameDay(p.scheduledAt, day));
          return (
            <div 
              key={i} 
              className={cn(
                "min-h-[140px] bg-navy-black/40 p-3 border-t border-l border-white/5 transition-all cursor-pointer hover:bg-white/[0.06] group/day",
                !isSameMonth(day, currentDate) && "opacity-10 pointer-events-none"
              )}
              onClick={() => {
                setSelectedDate(day);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all",
                  isSameDay(day, new Date()) 
                    ? "bg-gradient-to-br from-cyan-primary to-blue-600 text-navy-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "text-slate-500 group-hover/day:text-white"
                )}>
                  {format(day, 'd')}
                </span>
                {dayPosts.length > 0 && (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-primary animate-pulse" />
                    {dayPosts.length > 1 && <div className="w-1.5 h-1.5 rounded-full bg-purple-vibrant animate-pulse delay-75" />}
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                {dayPosts.slice(0, 3).map(post => (
                  <div 
                    key={post.id} 
                    className="p-2 bg-white/[0.05] border border-white/5 rounded-lg text-[10px] text-white truncate font-bold flex items-center gap-2 group-hover/day:bg-white/10 transition-colors"
                  >
                    <span className="text-cyan-primary shrink-0 font-black">{format(post.scheduledAt, 'HH:mm')}</span>
                    <span className="truncate opacity-80">{post.caption}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest pl-1">+{dayPosts.length - 3} More</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl glass-card p-8 relative border border-white/10 shadow-[0_0_100px_rgba(34,211,238,0.2)] overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X size={20} />
              </button>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Section */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase mb-1">New Deployment</h3>
                    <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">{format(selectedDate, 'EEEE, MMMM do')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4 p-5 bg-cyan-primary/5 border border-cyan-primary/10 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-cyan-primary" />
                        <label className="text-[10px] uppercase tracking-[0.2em] text-cyan-primary font-black">AI Content Lab</label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="Topic or theme for AI generation..."
                          className="flex-1 bg-navy-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-primary transition-all"
                        />
                        <Tooltip content="Generate Tactical Caption">
                          <button
                            onClick={handleGenerateAICaption}
                            disabled={isGeneratingAI || !aiTopic}
                            className="p-2.5 bg-cyan-primary text-navy-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                          >
                            {isGeneratingAI ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                        </Tooltip>
                      </div>
                      {aiError && <p className="text-[9px] text-red-500 font-mono mt-1 uppercase tracking-wider">{aiError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Caption Protocol</label>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Define your transmission or use AI Lab above..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-primary transition-colors text-white text-sm resize-none font-sans"
                      />
                      {/* Notepad trigger removed */}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Timing</label>
                        <div className="relative">
                          <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-primary" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 outline-none focus:border-cyan-primary transition-colors text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-primary transition-colors text-white text-sm appearance-none"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="twitter">X / Twitter</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Media Resource URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-primary transition-colors text-white text-sm"
                        />
                      </div>
                    </div>

                    <button
                      disabled={!caption || isSubmitting}
                      onClick={handleAddPost}
                      className={cn(
                        "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase transition-all mt-4",
                        caption && !isSubmitting
                          ? "bg-cyan-primary text-navy-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(34,211,238,0.3)]" 
                          : "bg-white/5 text-slate-600 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? "TRANSMITTING..." : (
                        <>
                          <Send size={18} />
                          Initialize Post
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview/Existing Section */}
                <div className="w-full lg:w-64 space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Day Manifest</label>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {posts.filter(p => isSameDay(p.scheduledAt, selectedDate)).map(post => (
                      <div key={post.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl group relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-cyan-primary">{format(post.scheduledAt, 'HH:mm')}</span>
                          <button onClick={() => handleDeletePost(post.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-3 mb-2">{post.caption}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{post.platform}</span>
                          <CheckCircle2 size={10} className="text-cyan-primary opacity-50" />
                        </div>
                      </div>
                    ))}
                    {posts.filter(p => isSameDay(p.scheduledAt, selectedDate)).length === 0 && (
                      <div className="text-center py-4 px-3 bg-white/[0.01] border border-white/[0.05] rounded-2xl space-y-3 flex flex-col items-center justify-center">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md border border-white/5 bg-slate-950/20">
                          <img 
                            src={emptySchedulerImg} 
                            alt="No deployments" 
                            className="w-full h-full object-cover select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">No Deployments</p>
                          <p className="text-[9px] text-slate-500 max-w-[180px] leading-relaxed mx-auto">
                            Design or compose a creative social release on this slot.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
