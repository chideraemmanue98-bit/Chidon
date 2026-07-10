import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Plus, Search, DollarSign, Clock, ArrowRight, 
  MessageSquare, PlusCircle, CheckCircle, Calendar, X, RefreshCw, User, Tag, ShieldCheck, Zap
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { FreelanceProfile } from './types';

export interface JobPost {
  id: string;
  userId: string;
  buyerName: string;
  buyerAvatar: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deliveryTime: number; // in days
  createdAt: any;
}

interface JobBoardViewProps {
  profile: FreelanceProfile;
  onOpenChat: (sellerId: string, sellerName: string) => void;
  isDarkMode?: boolean;
}

export const JobBoardView: React.FC<JobBoardViewProps> = ({ profile, onOpenChat, isDarkMode }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Job Post Modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Programming');
  const [newBudget, setNewBudget] = useState<number>(100);
  const [newDeliveryTime, setNewDeliveryTime] = useState<number>(7);
  const [submitting, setSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Load active jobs from Firestore
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'jobs');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const querySnap = await getDocs(q);
      
      const dbJobs = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobPost[];
      
      setJobs(dbJobs);
    } catch (err) {
      console.warn("Failed to retrieve job posts from firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle posting a job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || newBudget <= 0 || newDeliveryTime <= 0) return;
    
    setSubmitting(true);
    try {
      const jobData = {
        userId: profile.uid,
        buyerName: profile.fullName || profile.username,
        buyerAvatar: profile.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        budget: Number(newBudget),
        deliveryTime: Number(newDeliveryTime),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'jobs'), jobData);
      
      setPostSuccess(true);
      setNewTitle('');
      setNewDescription('');
      setNewBudget(100);
      setNewDeliveryTime(7);
      
      setTimeout(() => {
        setIsPostModalOpen(false);
        setPostSuccess(false);
        fetchJobs();
      }, 1500);
    } catch (err) {
      console.error("Failed to post job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter computation
  const filteredJobs = jobs.filter(job => {
    const queryLower = search.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(queryLower);
    const descMatch = job.description?.toLowerCase().includes(queryLower);
    const searchMatches = !search || titleMatch || descMatch;

    const catMatches = selectedCategory === 'All' || job.category === selectedCategory;

    return searchMatches && catMatches;
  });

  const categories = ['All', 'Graphics', 'Writing', 'Video', 'Programming', 'Marketing'];

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* 1. Header Hero Panel */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-100 via-slate-50 to-indigo-50 border border-slate-250 dark:from-[#090D16] dark:via-[#0F172A] dark:to-indigo-950/20 dark:border-slate-800 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand/10 border border-brand/20 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-full text-brand dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Active Job Board
            </span>
            <span className="text-slate-500 text-[11px] font-mono">Commission-Free Contract Escrow</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-cyan-400 dark:to-brand leading-none">
            Post & Browse Active Projects
          </h1>
          <p className="text-xs md:text-sm text-slate-900 dark:text-slate-400 font-bold dark:font-semibold max-w-xl">
            Sellers can bid and apply directly. Buyers can post escrow-protected projects instantly. Work is secured and released commission-free!
          </p>
        </div>

        {/* Plus Button inside the Hero Header */}
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-5 py-3 bg-brand dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Post Active Job</span>
        </button>
      </div>

      {/* 2. Search & Categories Filter Panel */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                selectedCategory === cat 
                  ? 'bg-brand text-white border-brand dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500' 
                  : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords (e.g., React, UI UX)..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold focus:border-brand focus:ring-0 focus:outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
        </div>
      </div>

      {/* 3. Job Board Gigs Marketplace Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-brand mx-auto" />
            <p className="text-xs font-mono text-slate-400">Syncing active job boards...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-6 rounded-2xl flex flex-col justify-between gap-5 transition-all shadow-sm hover:shadow"
              >
                <div className="space-y-4">
                  {/* Top Row: Buyer Avatar + Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={job.buyerAvatar} 
                        alt={job.buyerName} 
                        className="w-8 h-8 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                      />
                      <div className="leading-tight">
                        <h4 className="text-xs font-black text-slate-950 dark:text-white">@{job.buyerName}</h4>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Client</span>
                      </div>
                    </div>
                    
                    {/* Budget Chip */}
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-black font-mono">
                      ₦{(job.budget * 1500).toLocaleString()} <span className="text-[10px] opacity-60">(${job.budget})</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-black dark:text-white hover:text-brand dark:hover:text-cyan-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-800 dark:text-slate-400 leading-relaxed font-bold dark:font-semibold">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Footer Section: Meta details & CTA button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag size={12} className="text-brand" />
                      {job.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {job.deliveryTime} Days Deadline
                    </span>
                  </div>

                  {profile.uid !== job.userId ? (
                    <button
                      onClick={() => onOpenChat(job.userId, job.buyerName)}
                      className="px-4 py-2 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand hover:bg-brand hover:text-white border border-brand/20 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>Chat to Apply</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      Your Posted Job
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <Briefcase size={32} className="text-slate-400 dark:text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">No Active Jobs</h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Be the first to post an active escrow project or clear your category filter!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Post Job Dialog/Modal overlay */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setIsPostModalOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-brand dark:text-emerald-400" />
                  <h3 className="text-md font-black text-black dark:text-white uppercase tracking-wider">Post an Escrow Project</h3>
                </div>
                <button 
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-black dark:hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Success state */}
              {postSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-950 dark:text-white">Job Broadcasted Successfully!</h4>
                    <p className="text-xs text-slate-400 font-mono">Publishing to Market Place & System Nodes...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePostJob} className="space-y-4">
                  {/* Job Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Job / Contract Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Build clean React portfolio website with responsive grid"
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-brand text-xs font-bold"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-brand text-xs font-bold"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget & Timeline Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Budget (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          required
                          min={10}
                          value={newBudget}
                          onChange={(e) => setNewBudget(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-brand text-xs font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Deadline (Days)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newDeliveryTime}
                        onChange={(e) => setNewDeliveryTime(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-brand text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Requirements & Project Scope</label>
                    <textarea
                      required
                      rows={4}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="List detailed technical requirements, scope of work, responsive breakpoints needed, or content copywriting goals..."
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-brand text-xs font-bold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPostModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 text-slate-800 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-brand dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Broadcasting...' : 'Publish Project'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
