import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, 
  Plus, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Check, 
  FileDown, 
  Loader2, 
  ArrowLeft,
  Calendar,
  Layers,
  FileText
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
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportToTXT } from '../lib/exportUtils';
import emptyRuledBookImg from '../assets/images/journal_ruled_cover_1783488617827.jpg';

interface NotePage {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  userId?: string;
}

interface RuledBookProps {
  initialContent?: string;
  initialTitle?: string;
  onClearPreFill?: () => void;
  feature?: any;
  onBack?: () => void;
}

export const RuledBook: React.FC<RuledBookProps> = ({ 
  initialContent, 
  initialTitle,
  onClearPreFill, 
  feature, 
  onBack 
}) => {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Active editing states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Firestore & Local storage Sync
  useEffect(() => {
    let unsubscribe = () => {};

    if (auth.currentUser) {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: NotePage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
          } as NotePage);
        });
        
        // Deduplicate and Sort pages chronologically for the notebook flip feel
        const uniqueList: NotePage[] = [];
        const seenIds = new Set<string>();
        for (const item of list) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueList.push(item);
          }
        }

        const sortedList = [...uniqueList].sort((a, b) => {
          const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return timeA - timeB;
        });
        
        setPages(sortedList);
        setLoading(false);
      }, (error) => {
        console.error("Ruled Book load error:", error);
        setLoading(false);
      });
    } else {
      // Guest local storage fallback
      const local = localStorage.getItem('guest_ruled_pages');
      if (local) {
        try {
          const list = JSON.parse(local).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          }));
          setPages(list);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, [auth.currentUser]);

  // Handle pre-fill injection when sent from other feature tools
  useEffect(() => {
    if (initialContent) {
      const generatedTitle = initialTitle ? `${initialTitle} Draft` : `Generated Draft - ${new Date().toLocaleDateString()}`;
      handleAddNewPage(generatedTitle, initialContent);
      if (onClearPreFill) onClearPreFill();
    }
  }, [initialContent, initialTitle]);

  // Adjust current edit values when active page changes
  useEffect(() => {
    if (activePageIndex >= 0 && activePageIndex < pages.length) {
      setTitle(pages[activePageIndex].title);
      setContent(pages[activePageIndex].content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activePageIndex, pages]);

  // Handle creation of a new lined page
  const handleAddNewPage = async (customTitle?: string, customContent?: string) => {
    const defaultPageName = `Page ${pages.length + 1}: Uncharted Intelligence`;
    const newPageTitle = customTitle || defaultPageName;
    const newPageContent = customContent || '';

    setSaving(true);
    try {
      if (auth.currentUser) {
        const docPayload = {
          title: newPageTitle,
          content: newPageContent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: auth.currentUser.uid
        };
        const docRef = await addDoc(collection(db, 'notes'), docPayload);
        
        // Create client-side representation instantly while listener syncs
        const tempPage: NotePage = {
          id: docRef.id,
          title: newPageTitle,
          content: newPageContent,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: auth.currentUser.uid
        };
        
        const newPages = [...pages, tempPage];
        // Deduplicate newPages by ID to guard against real-time snapshot timing overlapping
        const uniquePages: NotePage[] = [];
        const seen = new Set<string>();
        for (const p of newPages) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            uniquePages.push(p);
          }
        }
        setPages(uniquePages);
        setActivePageIndex(uniquePages.length - 1);
      } else {
        const guestPage: NotePage = {
          id: `local-${Date.now()}`,
          title: newPageTitle,
          content: newPageContent,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const newPages = [...pages, guestPage];
        setPages(newPages);
        localStorage.setItem('guest_ruled_pages', JSON.stringify(newPages));
        setActivePageIndex(newPages.length - 1);
      }
    } catch (err) {
      console.error("Failed to add page:", err);
    } finally {
      setSaving(false);
    }
  };

  // Perform persistence on edit updates
  const handleUpdatePage = async () => {
    if (activePageIndex < 0 || activePageIndex >= pages.length) return;
    const activePage = pages[activePageIndex];
    
    // Prevent empty saves or limits
    if (title.length > 200) return alert("Title must be less than 200 characters.");
    if (content.length > 50000) return alert("Content exceeds maximum length.");

    setSaving(true);
    try {
      if (auth.currentUser) {
        const noteRef = doc(db, 'notes', activePage.id);
        await updateDoc(noteRef, {
          title: title,
          content: content,
          updatedAt: serverTimestamp()
        });
      } else {
        const updatedList = pages.map((page, index) => {
          if (index === activePageIndex) {
            return { ...page, title, content, updatedAt: new Date() };
          }
          return page;
        });
        setPages(updatedList);
        localStorage.setItem('guest_ruled_pages', JSON.stringify(updatedList));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to update page:", err);
    } finally {
      setSaving(false);
    }
  };

  // Discard page
  const handleDeletePage = async (indexToDelete: number) => {
    if (!window.confirm("Are you sure you want to rip this page out of your notebook?")) return;
    
    const pageToDelete = pages[indexToDelete];
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'notes', pageToDelete.id));
      } else {
        const updatedList = pages.filter((_, idx) => idx !== indexToDelete);
        setPages(updatedList);
        localStorage.setItem('guest_ruled_pages', JSON.stringify(updatedList));
      }
      
      // Pivot active index safety
      if (activePageIndex === indexToDelete) {
        setActivePageIndex(pages.length - 2 >= 0 ? pages.length - 2 : -1);
      } else if (activePageIndex > indexToDelete) {
        setActivePageIndex(activePageIndex - 1);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Export current ruled template
  const handleExportPage = () => {
    if (activePageIndex < 0 || activePageIndex >= pages.length) return;
    const activePage = pages[activePageIndex];
    exportToTXT(title, content);
  };

  // Filter notebook pages matching search queries
  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-[75vh] flex flex-col xl:flex-row gap-6">
      {/* LEFT COLUMN: Sidebar / Index (Table of Contents) */}
      <div className="xl:w-80 flex flex-col gap-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-4 h-[75vh] xl:h-auto overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-cyan-primary animate-pulse" />
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white">Notebook Index</h3>
          </div>
          <button 
            onClick={() => handleAddNewPage()}
            className="p-2 border border-cyan-primary/20 bg-cyan-primary/10 rounded-xl text-cyan-primary hover:bg-cyan-primary/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 duration-150"
            title="Insert Rule Sheet"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Index Search */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search notebook notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 outline-none text-xs text-slate-300 focus:border-cyan-primary/50 transition-colors"
          />
        </div>

        {/* List of Pages */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
          {loading ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-5 h-5 text-cyan-primary animate-spin" />
              <span>Indexing pages...</span>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-500 rounded-xl border border-dashed border-white/5 p-4">
              <Layers size={20} className="text-slate-600" />
              <span>No pages found. Click the + icon above to generate the first page.</span>
            </div>
          ) : (
            filteredPages.map((page) => {
              const originalIndex = pages.findIndex(p => p.id === page.id);
              const isActive = originalIndex === activePageIndex;
              return (
                <div 
                  key={page.id}
                  onClick={() => setActivePageIndex(originalIndex)}
                  className={cn(
                    "group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border text-left",
                    isActive
                      ? "bg-cyan-primary/10 border-cyan-primary/30 text-white"
                      : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isActive ? "bg-cyan-primary animate-pulse" : "bg-slate-600"
                    )} />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate pr-3">{page.title}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {page.updatedAt instanceof Date 
                          ? page.updatedAt.toLocaleDateString()
                          : "Unsaved local"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(originalIndex);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-500 transition-all cursor-pointer"
                    title="Rip out page"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Ruled Digital Notebook Design */}
      <div className="flex-1 flex flex-col bg-zinc-950/20 rounded-2xl border border-white/10 min-h-[70vh] relative overflow-hidden">
        
        {/* Binder spiral rings simulated along the top/side to enhance the high-fidelity Notebook feel */}
        <div className="absolute left-[3%] top-0 bottom-0 pointer-events-none flex flex-col justify-around py-8 z-30">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center">
              {/* Notebook Binder Spiral Rings */}
              <div className="w-5 h-3.5 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-900 rounded-full border border-zinc-950/50 -ml-1.5 shadow-md shadow-zinc-950/20" />
            </div>
          ))}
        </div>

        {activePageIndex >= 0 && activePageIndex < pages.length ? (
          <div className="flex-1 flex flex-col relative">
            
            {/* Notebook Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 pl-16">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  SHEET {activePageIndex + 1} OF {pages.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdatePage}
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer active:scale-95 duration-150 border",
                    savedSuccess 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-cyan-primary/10 border-cyan-primary/30 text-cyan-primary hover:bg-cyan-primary/20"
                  )}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : savedSuccess ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{savedSuccess ? "Saved" : saving ? "Saving" : "Save Changes"}</span>
                </button>

                <button
                  onClick={handleExportPage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider text-slate-300 transition-all uppercase cursor-pointer"
                  title="Export to Text Document"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Page</span>
                </button>
              </div>
            </div>

            {/* Notebook Lined Paper Canvas */}
            <div className="flex-1 relative flex flex-col pl-16 pr-8 py-8 transition-colors select-text">
              
              {/* The ultimate physical paper look */}
              {/* Cream digital vintage notebook paper with faint cyan horizontal rules and red left bleed margins */}
              <div className="absolute inset-0 bg-[#fefdfa] dark:bg-[#14181f] pointer-events-none transition-colors duration-200" />
              
              {/* Horizontal Lines (Rules) Background */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all pr-4 pl-16"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(6, 182, 212, 0.08) 27px, rgba(6, 182, 212, 0.08) 28px)',
                  lineHeight: '28px'
                }}
              />

              {/* Red Vertical Bleed Margin Line */}
              <div className="absolute left-14 top-0 bottom-0 border-r border-red-500/30 pointer-events-none" />

              {/* Document Title input sitting elegantly in upper header */}
              <div className="relative z-10 mb-6 flex flex-col gap-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sheet Identifier..."
                  className="w-full bg-transparent border-none text-xl font-bold font-sans text-neutral-900 dark:text-slate-100 outline-none placeholder-zinc-400 focus:ring-0 px-0 py-0"
                />
                <span className="text-[10px] font-mono text-cyan-primary dark:text-cyan-primary/70 tracking-tight">
                  Last refined: {pages[activePageIndex].updatedAt instanceof Date 
                    ? pages[activePageIndex].updatedAt.toLocaleString() 
                    : "Local Session Only"}
                </span>
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800/60 mt-2" />
              </div>

              {/* Lined Textarea Body */}
              <div className="relative z-10 flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pen down your campaign scripts, tags, strategies, or prompts over these lines..."
                  className="w-full flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none font-mono text-[13px] leading-[28px] text-neutral-800 dark:text-slate-200 p-0 shadow-none selection:bg-cyan-primary/20 align-baseline"
                  style={{
                    lineHeight: '28px',
                    fontFamily: '"Fira Code", "JetBrains Mono", Courier, monospace'
                  }}
                />
              </div>

              {/* Mini Pagination footer overlay inside notebook */}
              <div className="relative z-10 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/40 pt-4 mt-6">
                <button
                  disabled={activePageIndex <= 0}
                  onClick={() => setActivePageIndex(activePageIndex - 1)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-cyan-primary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous Page
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  Page {activePageIndex + 1} / {pages.length}
                </span>
                <button
                  disabled={activePageIndex >= pages.length - 1}
                  onClick={() => setActivePageIndex(activePageIndex + 1)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-cyan-primary disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  Next Page <ChevronRight size={14} />
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-slate-900/40">
              <img 
                src={emptyRuledBookImg} 
                alt="No active sheet loaded" 
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
            </div>
            <div className="max-w-md">
              <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider font-mono">No active sheet loaded</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-2 mx-auto leading-relaxed">
                Open a sheet from the index sidebar, send generated copy from any growth tool, or insert a brand new ruled page directly.
              </p>
            </div>
            <button
              onClick={() => handleAddNewPage()}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-primary text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-cyan-primary/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 duration-150 mt-1"
            >
              <Plus size={14} /> Insert Blank Page
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
