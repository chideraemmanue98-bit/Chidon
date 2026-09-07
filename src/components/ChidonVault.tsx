import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
  Calendar,
  Layers,
  Video,
  PenTool,
  Award,
  Clock,
  LayoutGrid,
  FileDown
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
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportToTXT } from '../lib/exportUtils';
import { ConfirmationDialog } from './ConfirmationDialog';
import { getStorageKey } from '../lib/userStorage';
import emptyVaultImg from '../assets/images/empty_vault_1781319190599.jpg';

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
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'type-asc' | 'type-desc'>('date-desc');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ title, message, onConfirm });
    setIsConfirmOpen(true);
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
          const savedSandbox = localStorage.getItem("chidon_sandbox_session");
          if (!auth.currentUser || savedSandbox) {
            const localKey = getStorageKey('guest_chidon_vault_drafts');
            const local = localStorage.getItem(localKey);
            if (local) {
              const list = JSON.parse(local);
              const filtered = list.filter((item: any) => !selectedIds.includes(item.id));
              localStorage.setItem(localKey, JSON.stringify(filtered));
              setDrafts(filtered);
            }
          } else {
            const promises = selectedIds.map(id => deleteDoc(doc(db, 'drafts', id)));
            await Promise.all(promises);
          }
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
    // We bind to real-time snapshot
    let unsubscribe = () => {};

    // Check if we have a sandbox session or are using local auth
    const savedSandbox = localStorage.getItem("chidon_sandbox_session");
    let isSandbox = false;
    if (savedSandbox) {
      try {
        const parsed = JSON.parse(savedSandbox);
        if (parsed && parsed.uid) {
          isSandbox = true;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (auth.currentUser && !isSandbox) {
      const q = query(
        collection(db, 'drafts'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: SavedDraft[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as SavedDraft);
        });
        
        // Deduplicate list by id
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
        console.error("Firestore loading error:", error);
        setLoading(false);
      });
    } else {
      // Local storage fallback for sandbox / guest operator
      const localKey = getStorageKey('guest_chidon_vault_drafts');
      const local = localStorage.getItem(localKey);
      if (local) {
        try {
          const list = JSON.parse(local);
          setDrafts(list);
        } catch (e) {
          console.error("Failed to parse local drafts:", e);
        }
      } else {
        setDrafts([]);
      }
      setLoading(false);
    }

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
      "Are you sure you want to permanently discard this blueprint from your CHIDON Vault?",
      async () => {
        try {
          const savedSandbox = localStorage.getItem("chidon_sandbox_session");
          if (!auth.currentUser || savedSandbox) {
            const localKey = getStorageKey('guest_chidon_vault_drafts');
            const local = localStorage.getItem(localKey);
            if (local) {
              const list = JSON.parse(local);
              const filtered = list.filter((item: any) => item.id !== id);
              localStorage.setItem(localKey, JSON.stringify(filtered));
              setDrafts(filtered);
            }
          } else {
            await deleteDoc(doc(db, 'drafts', id));
          }
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
    if (!featureId) return '';
    const cleanId = featureId.replace(/^features\./i, '').replace(/^Feature\./i, '').replace(/Feature\./gi, '');
    switch (cleanId) {
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
      default: return cleanId.replace('-', ' ').toUpperCase();
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

  // Filter and Sort Logic
  const filteredDrafts = useMemo(() => {
    const rawFiltered = drafts.filter((d) => {
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

    // Quick Sort based on sortBy
    return rawFiltered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const timeA = getDraftDate(a)?.getTime() || 0;
        const timeB = getDraftDate(b)?.getTime() || 0;
        return timeB - timeA;
      } else if (sortBy === 'date-asc') {
        const timeA = getDraftDate(a)?.getTime() || 0;
        const timeB = getDraftDate(b)?.getTime() || 0;
        return timeA - timeB;
      } else if (sortBy === 'type-asc') {
        const labelA = getFeatureLabel(a.featureId).toLowerCase();
        const labelB = getFeatureLabel(b.featureId).toLowerCase();
        return labelA.localeCompare(labelB);
      } else if (sortBy === 'type-desc') {
        const labelA = getFeatureLabel(a.featureId).toLowerCase();
        const labelB = getFeatureLabel(b.featureId).toLowerCase();
        return labelB.localeCompare(labelA);
      }
      return 0;
    });
  }, [drafts, searchQuery, selectedCategory, selectedFeatureTag, dateFilter, customDateStr, sortBy]);

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
              <Lock size={10} className="mr-1 inline animate-pulse" /> Vault
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            A specialized, neural index holding your generated content. Access scripts, video formulas, copyable hashtags, and optimization metrics.
          </p>
        </div>

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

      {/* Control Tools Panel */}
      <div className="flex flex-col gap-4 bg-[var(--card-bg)]/40 p-5 rounded-2xl border border-[var(--border-base)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
          {/* Search Query Input */}
          <div className="relative w-full md:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
            <input 
              type="text"
              placeholder="Search saved content by name, metadata, or keywords..."
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)]"
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
          <div className="relative w-full md:col-span-2">
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

          {/* Quick Sort Dropdown */}
          <div className="relative w-full md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border-base)] rounded-xl py-2.5 pl-3 pr-8 text-xs outline-none focus:border-brand transition-all text-[var(--text-primary)] appearance-none cursor-pointer font-bold"
            >
              <option value="date-desc">⚡ Newest Saved First</option>
              <option value="date-asc">⏳ Oldest Saved First</option>
              <option value="type-asc">🏷️ Type (A - Z)</option>
              <option value="type-desc">🏷️ Type (Z - A)</option>
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
                setSortBy('date-desc');
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
            <div className="text-center py-12 px-6 bg-[var(--card-bg)] border border-[var(--border-base)] rounded-3xl space-y-5 flex flex-col items-center justify-center overflow-hidden">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl border border-[var(--border-base)]/50 bg-slate-900/40">
                <img 
                  src={emptyVaultImg} 
                  alt="Empty Vault State" 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
              </div>
              <div className="max-w-md space-y-2">
                <p className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest">Vault Pipeline Empty</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans max-w-sm">
                  Generate resources (such as video tags, social optimization scripts, competitor intelligence reports) and click the <strong className="font-bold text-brand">Save to Vault</strong> button to collect them in your intelligence base.
                </p>
              </div>
            </div>
          ) : (
            <motion.div layout className={cn("grid gap-3", selectedDraft ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
              {filteredDrafts.map((draft) => {
                const isSelected = selectedDraft?.id === draft.id;
                const isSelectedInBulk = selectedIds.includes(draft.id);
                return (
                  <motion.div
                    key={draft.id}
                    layout
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
            </motion.div>
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
              {/* Card Title Bar */}
              <div className="p-6 border-b border-[var(--border-base)] flex items-center justify-between bg-gray-50/20 dark:bg-white/5">
                <div className="space-y-1.5 min-w-0 pr-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand">
                    {getFeatureLabel(selectedDraft.featureId)}
                  </span>
                  <h2 className="text-base font-black text-[var(--text-primary)] truncate">
                    {selectedDraft.title || 'Untitled Saved Item'}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(selectedDraft.content, 'selected')}
                    className="p-2 border border-[var(--border-base)] rounded-xl text-[var(--text-secondary)] hover:text-brand hover:border-brand/40 bg-[var(--card-bg)] transition-all flex items-center gap-1.5 text-xs font-bold"
                  >
                    {copiedId === 'selected' ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
                    {copiedId === 'selected' ? 'Copied' : 'Copy'}
                  </button>

                  {/* Edit button removed */}

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

              {/* Detailed Content Display */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[550px] custom-scrollbar selection:bg-brand/20">
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)] space-y-4 font-mono select-text whitespace-pre-wrap">
                  {selectedDraft.content}
                </div>
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
