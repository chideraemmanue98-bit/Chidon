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
  FileText,
  Eye,
  Copy,
  X
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
import { getStorageKey } from '../lib/userStorage';
import emptyRuledBookImg from '../assets/images/empty_ruled_book_1781319215699.jpg';

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
  
  // Modal viewer state for reading note fully from beginning to end
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
        console.error("Notepad load error:", error);
        setLoading(false);
      });
    } else {
      // Guest local storage fallback
      const localKey = getStorageKey('guest_ruled_pages');
      const local = localStorage.getItem(localKey);
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
    const defaultPageName = `Page ${pages.length + 1}: Creative Insight`;
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
        localStorage.setItem(getStorageKey('guest_ruled_pages'), JSON.stringify(newPages));
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
        localStorage.setItem(getStorageKey('guest_ruled_pages'), JSON.stringify(updatedList));
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
    if (!window.confirm("Are you sure you want to delete this sheet from NOTEPAD SAVE?")) return;
    
    const pageToDelete = pages[indexToDelete];
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'notes', pageToDelete.id));
      } else {
        const updatedList = pages.filter((_, idx) => idx !== indexToDelete);
        setPages(updatedList);
        localStorage.setItem(getStorageKey('guest_ruled_pages'), JSON.stringify(updatedList));
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

  // Copy full content
  const handleCopyContent = () => {
    if (activePageIndex < 0 || activePageIndex >= pages.length) return;
    const activePage = pages[activePageIndex];
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Filter notebook pages matching search queries
  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-[75vh] flex flex-col xl:flex-row gap-6 relative">
      {/* LEFT COLUMN: Sidebar / Index (Table of Contents) */}
      <div className="xl:w-80 flex flex-col gap-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl p-4 h-[75vh] xl:h-auto overflow-hidden shadow-lg transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-vibrant animate-pulse shrink-0" />
            <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-zinc-950 dark:text-white">Notepad Index</h3>
          </div>
          <button 
            onClick={() => handleAddNewPage()}
            className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 rounded-xl text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 duration-150 shadow-md"
            title="Create New Sheet"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Index Search */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search saved sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 outline-none text-xs text-zinc-800 dark:text-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-zinc-400"
          />
        </div>

        {/* List of Pages */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
          {loading ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
              <Loader2 className="w-5 h-5 text-purple-vibrant animate-spin" />
              <span>Indexing saved pages...</span>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-center text-xs text-zinc-500 dark:text-slate-500 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4">
              <Layers size={20} className="text-zinc-300 dark:text-slate-700" />
              <span>No pages found. Click the + icon above to write your first sheet.</span>
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
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 shadow-sm"
                      : "bg-transparent border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-slate-400 hover:text-zinc-950 hover:dark:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isActive ? "bg-purple-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"
                    )} />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate pr-3">{page.title}</p>
                      <p className="text-[10px] font-mono text-zinc-400 dark:text-slate-500 mt-0.5">
                        {page.updatedAt instanceof Date 
                          ? page.updatedAt.toLocaleDateString()
                          : "Unsaved local"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePageIndex(originalIndex);
                        setIsReaderOpen(true);
                      }}
                      className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
                      title="View full written content"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(originalIndex);
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-500 transition-all cursor-pointer"
                      title="Delete Sheet"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Ruled Digital Notepad Design */}
      <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-[70vh] relative overflow-hidden shadow-inner p-[1px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20">
        
        {/* Colorful gradient border wrapper for Notepad */}
        <div className="w-full h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 rounded-[15px] overflow-hidden">
          
          {/* Binder spiral rings simulated along the top/side to enhance the high-fidelity Notebook feel */}
          <div className="absolute left-[3%] top-0 bottom-0 pointer-events-none flex flex-col justify-around py-8 z-30">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center">
                {/* Colorful Metallic binder loops */}
                <div className="w-6 h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full border border-zinc-950/20 -ml-2.5 shadow-md shadow-purple-500/30" />
              </div>
            ))}
          </div>

          {activePageIndex >= 0 && activePageIndex < pages.length ? (
            <div className="flex-1 flex flex-col relative">
              
              {/* Notebook Action Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 pl-16">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-extrabold">
                    SHEET {activePageIndex + 1} OF {pages.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdatePage}
                    disabled={saving}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all uppercase tracking-wider cursor-pointer active:scale-95 duration-150 border shadow-sm",
                      savedSuccess 
                        ? "bg-emerald-500 border-emerald-600 text-white"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-purple-700"
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
                    onClick={() => setIsReaderOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border border-cyan-600 rounded-lg text-xs font-black tracking-wider text-white transition-all uppercase cursor-pointer shadow-sm"
                    title="View Full text written from beginning to end"
                  >
                    <Eye className="w-3.5 h-3.5 animate-bounce-slow" />
                    <span>View Full</span>
                  </button>

                  <button
                    onClick={handleExportPage}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-xs font-black tracking-wider text-zinc-700 dark:text-zinc-300 transition-all uppercase cursor-pointer"
                    title="Export to Text Document"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              {/* Notebook Lined Paper Canvas: STRICTLY SOLID WHITE BACKGROUND AND DARK BOLD BLACK TEXT WITH FAINT RULES */}
              <div className="flex-1 relative flex flex-col pl-16 pr-8 py-8 transition-colors select-text bg-white">
                
                {/* Horizontal Lines (Rules) Background */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all pr-4 pl-16"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(168, 85, 247, 0.12) 27px, rgba(168, 85, 247, 0.12) 28px)',
                    lineHeight: '28px'
                  }}
                />

                {/* Red Vertical Bleed Margin Line */}
                <div className="absolute left-14 top-0 bottom-0 border-r-2 border-red-400/40 pointer-events-none" />

                {/* Document Title input sitting elegantly in upper header */}
                <div className="relative z-10 mb-6 flex flex-col gap-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sheet Title..."
                    className="w-full bg-transparent border-none text-xl font-extrabold font-sans text-zinc-950 outline-none placeholder-zinc-400 focus:ring-0 px-0 py-0"
                    style={{ fontWeight: 800 }}
                  />
                  <span className="text-[10px] font-mono text-purple-600 tracking-tight font-bold">
                    Last refined: {pages[activePageIndex].updatedAt instanceof Date 
                      ? pages[activePageIndex].updatedAt.toLocaleString() 
                      : "Local Session Only"}
                  </span>
                  <div className="w-full h-px bg-zinc-200 mt-2" />
                </div>

                {/* Lined Textarea Body: EXPLICITLY BOLD DARK BLACK TEXT FOR BEST READABILITY */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Pen down your campaign scripts, tags, strategies, or prompts over these lines..."
                    className="w-full flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none font-sans text-sm font-bold leading-[28px] text-zinc-950 p-0 shadow-none selection:bg-purple-500/20 align-baseline"
                    style={{
                      lineHeight: '28px',
                    }}
                  />
                </div>

                {/* Mini Pagination footer overlay inside notebook */}
                <div className="relative z-10 flex items-center justify-between border-t border-zinc-200 pt-4 mt-6">
                  <button
                    disabled={activePageIndex <= 0}
                    onClick={() => setActivePageIndex(activePageIndex - 1)}
                    className="flex items-center gap-1 text-[11px] font-black text-zinc-500 hover:text-purple-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Previous Page
                  </button>
                  <span className="text-[10px] font-mono text-zinc-500 font-extrabold">
                    Page {activePageIndex + 1} / {pages.length}
                  </span>
                  <button
                    disabled={activePageIndex >= pages.length - 1}
                    onClick={() => setActivePageIndex(activePageIndex + 1)}
                    className="flex items-center gap-1 text-[11px] font-black text-zinc-500 hover:text-purple-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    Next Page <ChevronRight size={14} />
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5 bg-white dark:bg-zinc-950 transition-colors">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                <img 
                  src={emptyRuledBookImg} 
                  alt="No active sheet loaded" 
                  className="w-full h-full object-cover select-none pointer-events-none filter saturate-[0.8]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
              </div>
              <div className="max-w-md">
                <h4 className="font-sans font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono">No active sheet loaded</h4>
                <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-xs mt-2 mx-auto leading-relaxed">
                  Open a sheet from the index sidebar, send generated copy from any growth tool, or insert a brand new sheet directly.
                </p>
              </div>
              <button
                onClick={() => handleAddNewPage()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest hover:opacity-95 transition-all cursor-pointer shadow-lg active:scale-95 duration-150 mt-1"
              >
                <Plus size={14} /> Insert Blank Page
              </button>
            </div>
          )}

        </div>
      </div>

      {/* FULL VIEW READER MODAL: Shows complete written content from beginning to end with high-fidelity, colorful styling */}
      <AnimatePresence>
        {isReaderOpen && activePageIndex >= 0 && activePageIndex < pages.length && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-purple-500 overflow-hidden relative"
            >
              {/* Colorful gradient header ribbon */}
              <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
              
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                    NOTEPAD SAVE Reader • Sheet {activePageIndex + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                    title="Copy full text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy All"}</span>
                  </button>
                  <button
                    onClick={handleExportPage}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                    title="Download document as text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setIsReaderOpen(false)}
                    className="p-1.5 hover:bg-zinc-200 text-zinc-600 rounded-full transition-all cursor-pointer"
                    title="Close Reader"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lined Paper sheet viewer */}
              <div className="p-8 max-h-[70vh] overflow-y-auto relative bg-white select-text">
                {/* Horizontal Lines (Rules) Background */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all pr-4 pl-16"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(168, 85, 247, 0.1) 27px, rgba(168, 85, 247, 0.1) 28px)',
                    lineHeight: '28px'
                  }}
                />

                {/* Red Vertical Bleed Margin Line */}
                <div className="absolute left-14 top-0 bottom-0 border-r-2 border-red-400/40 pointer-events-none" />

                {/* Text Content */}
                <div className="relative z-10 pl-12 pr-4">
                  <h1 className="text-2xl font-black text-zinc-950 font-sans mb-1 border-none focus:ring-0">
                    {title || "Untitled Sheet"}
                  </h1>
                  <p className="text-[10px] font-mono text-purple-600 font-bold mb-6">
                    SAVED CHIDON INTELLIGENCE ENGINE RECORD
                  </p>
                  <div className="w-full h-px bg-zinc-200 mb-6" />

                  {/* Complete note printed from start to finish */}
                  <div className="font-sans text-sm font-bold text-zinc-950 whitespace-pre-wrap leading-[28px] selection:bg-purple-500/20">
                    {content || "No content has been added to this sheet yet."}
                  </div>
                </div>
              </div>

              {/* Colorful gradient footer ribbon */}
              <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
