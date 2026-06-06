import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChidonIqLogo } from './ChidonIqLogo';
import { 
  FileText, Shield, Mail, Info, BookOpen, Cpu, Sparkles, X, 
  ChevronRight, Download, Send, AlertCircle, Briefcase, FileCheck, CheckCircle2,
  Calendar, MapPin, Users, HeartHandshake, HelpCircle, Laptop, Share2, Zap, Trash2, Plus, 
  RefreshCw
} from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

// Dedicated automatic AI translator container for Downbase content to translate to the active language natively
const AutoTranslate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Extract all text content recursively from React nodes
  const getTextFromChildren = (node: React.ReactNode): string => {
    if (!node) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextFromChildren).join('');
    if (React.isValidElement(node)) {
      return getTextFromChildren((node.props as any)?.children);
    }
    return '';
  };

  const textVal = getTextFromChildren(children);

  useEffect(() => {
    const lang = (i18n.language || 'en').split('-')[0].toLowerCase();
    if (lang === 'en') {
      setTranslatedText(null);
      return;
    }

    if (!textVal.trim()) return;

    const cacheKey = `tr_${lang}_${textVal.slice(0, 80)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    let active = true;
    const runTranslation = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gemini/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textVal, targetLanguage: lang })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text && active) {
            setTranslatedText(data.text);
            localStorage.setItem(cacheKey, data.text);
          }
        }
      } catch (e) {
        console.error("Auto-trans element failed:", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    runTranslation();
    return () => { active = false; };
  }, [textVal, i18n.language]);

  if (loading) {
    return (
      <div className="space-y-3 py-6 animate-pulse">
        <div className="h-2 bg-slate-400/20 dark:bg-slate-700/40 rounded w-5/6"></div>
        <div className="h-2 bg-slate-400/20 dark:bg-slate-700/40 rounded w-full"></div>
        <div className="h-2 bg-slate-400/20 dark:bg-slate-700/40 rounded w-4/5"></div>
        <div className="h-2 bg-slate-400/20 dark:bg-slate-700/40 rounded w-2/3"></div>
        <span className="text-[10px] text-brand/70 font-mono tracking-widest block font-bold">TRANSLATING COMMAND MATRIX INTEL...</span>
      </div>
    );
  }

  if (translatedText) {
    return (
      <div className="whitespace-pre-line leading-relaxed text-[var(--text-secondary)]">
        {translatedText}
      </div>
    );
  }

  return <>{children}</>;
};

interface DownbaseFooterProps {}

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
}

export const DownbaseFooter: React.FC<DownbaseFooterProps> = () => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Job App State
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [jobName, setJobName] = useState('');
  const [jobEmail, setJobEmail] = useState('');
  const [jobCoverLetter, setJobCoverLetter] = useState('');
  const [jobResumeName, setJobResumeName] = useState('');
  const [jobSuccess, setJobSuccess] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Resource Download State
  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Solutions state (Active sub-category)
  const [solutionsTab, setSolutionsTab] = useState<'social' | 'app'>('social');
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(null);

  // Support Message state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Dynamic Jobs list from Firestore
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  
  // Fields for adding new job opening
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newType, setNewType] = useState('Full-time');
  const [newSalary, setNewSalary] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmittingNewJob, setIsSubmittingNewJob] = useState(false);
  const [newJobSuccess, setNewJobSuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: JobOpening[] = [];
      snapshot.forEach((docSnapshot) => {
        list.push({ id: docSnapshot.id, ...docSnapshot.data() } as any);
      });
      setJobOpenings(list);
      setLoadingJobs(false);
    }, (error) => {
      console.error("Error loading jobs:", error);
      setLoadingJobs(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApplyJob = (job: JobOpening) => {
    setSelectedJob(job);
    setJobSuccess(false);
  };

  const handleAddNewJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDept || !newLoc || !newDesc) return;
    setIsSubmittingNewJob(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        title: newTitle,
        department: newDept,
        location: newLoc,
        type: newType,
        salary: newSalary || "Undisclosed",
        description: newDesc,
        createdAt: serverTimestamp()
      });
      setNewJobSuccess(true);
      setNewTitle('');
      setNewDept('');
      setNewLoc('');
      setNewType('Full-time');
      setNewSalary('');
      setNewDesc('');
      setTimeout(() => {
        setNewJobSuccess(false);
        setShowAddJobForm(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding dynamic job opening:", error);
    } finally {
      setIsSubmittingNewJob(false);
    }
  };

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this job posting? This is an irreversible operation.")) return;
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (error) {
      console.error("Failed to delete job opening:", error);
    }
  };

  const submitJobApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName || !jobEmail || !selectedJob) return;
    setIsSubmittingJob(true);
    try {
      await addDoc(collection(db, 'job_applications'), {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        candidateName: jobName,
        email: jobEmail,
        resumeUrl: jobResumeName || "No CV reference provided",
        motivation: jobCoverLetter || "No motivation statement provided",
        createdAt: serverTimestamp()
      });
      setJobSuccess(true);
      setTimeout(() => {
        setSelectedJob(null);
        setJobName('');
        setJobEmail('');
        setJobCoverLetter('');
        setJobResumeName('');
        setJobSuccess(false);
      }, 3500);
    } catch (err) {
      console.error("Application write failed:", err);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleDownloadResource = (id: string, name: string) => {
    if (downloadingResourceId) return;
    setDownloadingResourceId(id);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingResourceId(null);
            // Create trigger download anchor for a reference file
            const blob = new Blob([`CHIDON IQ Official Intel Release: ${name}\n\nThank you for downloading this reference. Maximize your digital reach with cognitive automation networks!`], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_guide.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactSubject('');
      setContactMessage('');
      setActiveModal(null);
    }, 3000);
  };

  return (
    <footer className="w-full bg-[var(--bg-card)]/50 border-t border-[var(--border-base)]/80 mt-16 px-6 py-10 relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-8">
        
        {/* Brand visual header inside downbase */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2">
            <ChidonIqLogo size={24} cropped />
            <span className="font-bold tracking-wider text-sm font-mono text-[var(--text-primary)]">CHIDON IQ COGNITIVE SUITE</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-mono max-w-lg uppercase tracking-widest leading-relaxed">
            State-of-the-art social intelligence networks & organic CTR enhancement engines
          </p>
        </div>

        {/* Separated Links grid structure specified by Downbase Requirements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 w-full max-w-4xl text-center">
          <button 
            type="button"
            onClick={() => setActiveModal('about')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Info size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">About App</span>
          </button>

          <button 
            type="button"
            onClick={() => { setActiveModal('solutions'); setSolutionsTab('social'); }}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Sparkles size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Solutions</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('resources')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <BookOpen size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Resources</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('careers')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Briefcase size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Careers</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('contact')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Mail size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Contact Info</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('terms')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <FileText size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Terms of Use</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('privacy')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Shield size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Privacy Policy</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('refund')}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <RefreshCw size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Refund Policy</span>
          </button>
        </div>

        {/* Dynamic Legal Copyright and network latency badge */}
        <div className="w-full border-t border-[var(--border-base)]/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} CHIDON IQ INC. ALL VECTOR CHANNELS SECURED.
          </span>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Downbase Uplink Active</span>
          </div>
        </div>
      </div>

      {/* Downbase Overlay Modals - Fully styled, responsive */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--border-base)] flex items-center justify-between bg-[var(--bg-card)]/90 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
                    {activeModal === 'about' && <Info size={16} />}
                    {activeModal === 'solutions' && <Sparkles size={16} />}
                    {activeModal === 'resources' && <BookOpen size={16} />}
                    {activeModal === 'careers' && <Briefcase size={16} />}
                    {activeModal === 'contact' && <Mail size={16} />}
                    {activeModal === 'terms' && <FileText size={16} />}
                    {activeModal === 'privacy' && <Shield size={16} />}
                    {activeModal === 'refund' && <RefreshCw size={16} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wider font-mono text-[var(--text-secondary)] uppercase">
                      {activeModal === 'about' && t("downbase.header.about.sub", "Project Codex")}
                      {activeModal === 'solutions' && t("downbase.header.solutions.sub", "Sectoral Resolution Lab")}
                      {activeModal === 'resources' && t("downbase.header.resources.sub", "Operational Downloads")}
                      {activeModal === 'careers' && t("downbase.header.careers.sub", "Cognitive Recruitment Gate")}
                      {activeModal === 'contact' && t("downbase.header.contact.sub", "Uplink Center")}
                      {activeModal === 'terms' && t("downbase.header.terms.sub", "Compliance Frame")}
                      {activeModal === 'privacy' && t("downbase.header.privacy.sub", "Secure Integrity Standards")}
                      {activeModal === 'refund' && t("downbase.header.refund.sub", "Billing Guarantee Resolution")}
                    </h2>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                      {activeModal === 'about' && t("downbase.header.about.title", "About CHIDON IQ")}
                      {activeModal === 'solutions' && t("downbase.header.solutions.title", "Platform & Application Solutions")}
                      {activeModal === 'resources' && t("downbase.header.resources.title", "Advanced Knowledge Bases")}
                      {activeModal === 'careers' && t("downbase.header.careers.title", "Join the Frontier")}
                      {activeModal === 'contact' && t("downbase.header.contact.title", "Contact Support Channels")}
                      {activeModal === 'terms' && t("downbase.header.terms.title", "Terms of Use Agreement")}
                      {activeModal === 'privacy' && t("downbase.header.privacy.title", "Privacy Blueprint & Standards")}
                      {activeModal === 'refund' && t("downbase.header.refund.title", "Refund Policy & Guarantee")}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveModal(null); setSelectedJob(null); }}
                  className="p-1 px-2 hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-secondary)] rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 text-xs"
                >
                  <X size={15} /> {t("downbase.header.close_btn", "Close")}
                </button>
              </div>

              {/* Modal Content container */}
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-sm text-[var(--text-primary)]">
                
                {/* 1. ABOUT THE APP */}
                {activeModal === 'about' && (
                  <AutoTranslate>
                    <div className="space-y-4 leading-relaxed">
                      <p className="text-zinc-600 dark:text-zinc-300">
                        <strong>CHIDON IQ</strong> is a sovereign cognitive engine designed to align advanced generative language intelligence with standard social architectures. Emphasizing premium design layouts, rigorous data encapsulation, and lightning-fast prompt dispatch, CHIDON IQ replaces fragmented workflow patterns with high-fidelity, production-grade output.
                      </p>
                      <div className="bg-neutral-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-[var(--border-base)]/60">
                        <h4 className="font-bold text-xs font-mono text-brand mb-2 tracking-widest uppercase">System Core Specifications:</h4>
                        <ul className="space-y-2 text-xs font-mono text-[var(--text-secondary)]">
                          <li className="flex items-center gap-2">
                            <Cpu size={12} className="text-brand" /> Engine Model: CHIDON IQ Core Real-time Context Integration
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles size={12} className="text-brand" /> State Cache: Cloud Firestore Reactive Sync Streams
                          </li>
                          <li className="flex items-center gap-2">
                            <Users size={12} className="text-brand" /> User Target: Creators, Media Broadcasters, SEO Architects
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AutoTranslate>
                )}

                {/* 2. SOLUTIONS */}
                {activeModal === 'solutions' && (
                  <AutoTranslate>
                    <div className="space-y-5">
                      {/* Switcher */}
                      <div className="flex border-b border-[var(--border-base)]/60">
                        <button
                          onClick={() => { setSolutionsTab('social'); setActiveSolutionId(null); }}
                          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${solutionsTab === 'social' ? 'border-brand text-brand' : 'border-transparent text-[var(--text-secondary)]'}`}
                        >
                          Social Media Problems
                        </button>
                        <button
                          onClick={() => { setSolutionsTab('app'); setActiveSolutionId(null); }}
                          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${solutionsTab === 'app' ? 'border-brand text-brand' : 'border-transparent text-[var(--text-secondary)]'}`}
                        >
                          App Problems & Tech Hacks
                        </button>
                      </div>

                      {solutionsTab === 'social' ? (
                        <div className="space-y-3">
                          {/* Solved 1 */}
                          <div className="border border-[var(--border-base)]/60 rounded-xl overflow-hidden bg-[var(--bg-card)]/50">
                            <button
                              onClick={() => setActiveSolutionId(activeSolutionId === 'social1' ? null : 'social1')}
                              className="w-full text-left p-3 flex items-center justify-between hover:bg-brand/5 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                                <span className="text-brand">●</span> Shadowban Alignment Matrix
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'social1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                            </button>
                            {activeSolutionId === 'social1' && (
                              <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                                <p className="font-bold text-[var(--text-primary)]">Symptoms: Sudden drops in non-follower reach, tag exclusion.</p>
                                <p><strong>Step-by-Step Resolution:</strong></p>
                                <ol className="list-decimal list-inside space-y-1 pl-1">
                                  <li><strong>Purge Systemic Metadata:</strong> Delete non-original audio tags and excessive copy-paste links from your previous 5 descriptions.</li>
                                  <li><strong>Cooling Protocol:</strong> Deactivate all automation plugins and limit outgoing interactions for exactly 36 hours.</li>
                                  <li><strong>Native Seed Feeding:</strong> Post a single high-engagement native text thread without links on day 3. Use search-grounded topics.</li>
                                </ol>
                              </div>
                            )}
                          </div>

                          {/* Solved 2 */}
                          <div className="border border-[var(--border-base)]/60 rounded-xl overflow-hidden bg-[var(--bg-card)]/50">
                            <button
                              onClick={() => setActiveSolutionId(activeSolutionId === 'social2' ? null : 'social2')}
                              className="w-full text-left p-3 flex items-center justify-between hover:bg-brand/5 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                                <span className="text-brand">●</span> Algorithmic Retention Hook collapse
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'social2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                            </button>
                            {activeSolutionId === 'social2' && (
                              <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                                <p className="font-bold text-[var(--text-primary)]">Symptoms: High initial impressions but catastrophic drop-offs in under 3 seconds.</p>
                                <p><strong>Retention Engineering Hacks:</strong></p>
                                <ul className="list-disc list-inside space-y-1 pl-1">
                                  <li><strong>Phase Shift Frame:</strong> Inject a dual-sentence paradox hook within the very first 1.5 seconds. Do not intro yourself.</li>
                                  <li><strong>Visual Micro-Stimulation:</strong> Ensure dynamic secondary overlays of B-roll or typography appear at precisely a 2.1-second frequency.</li>
                                  <li><strong>Reverse Climax Hook:</strong> Show the final synthesis outcome first in the dynamic thumbnail layout.</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Solved 3 */}
                          <div className="border border-[var(--border-base)]/60 rounded-xl overflow-hidden bg-[var(--bg-card)]/50">
                            <button
                              onClick={() => setActiveSolutionId(activeSolutionId === 'app1' ? null : 'app1')}
                              className="w-full text-left p-3 flex items-center justify-between hover:bg-brand/5 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                                <span className="text-zinc-500">■</span> Slow Generator / Core AI Delay Timeouts
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'app1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                            </button>
                            {activeSolutionId === 'app1' && (
                              <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                                <p><strong>App Platform Resolution:</strong></p>
                                <p>When high load stresses the server-side proxy pipeline, response generation might stall. Toggle your system local cache or reduce the scope of prompt instruction modifiers in the Settings menu. Ensure you do not submit multiple quick identical triggers while a generation block is locked green.</p>
                              </div>
                            )}
                          </div>

                          {/* Solved 4 */}
                          <div className="border border-[var(--border-base)]/60 rounded-xl overflow-hidden bg-[var(--bg-card)]/50">
                            <button
                              onClick={() => setActiveSolutionId(activeSolutionId === 'app2' ? null : 'app2')}
                              className="w-full text-left p-3 flex items-center justify-between hover:bg-brand/5 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                                <span className="text-zinc-500">■</span> Cloud Sync & Vault Offline status
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'app2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                            </button>
                            {activeSolutionId === 'app2' && (
                              <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                                <p><strong>Synchronization Solutions:</strong></p>
                                <p>CHIDON IQ writes draft blueprints securely to cloud-provisioned Firestore channels. If you encounter an "Offline status" alert state in the vault, it indicates either missing auth verification or a localized internet latency drop. Ensure you are completely signed in using the Auth modal on top, or clear the storage state once via the language reload link.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AutoTranslate>
                )}

                {/* 3. RESOURCES */}
                {activeModal === 'resources' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider">PREMIUM COGNITIVE TEMPLATES AVAILABLE IN COMPILATION:</p>
                    
                    <div className="space-y-3">
                      {/* Res 1 */}
                      <div className="flex items-center justify-between p-4 border border-[var(--border-base)]/60 rounded-xl bg-[var(--bg-card)]/30 hover:bg-brand/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-neutral-100 dark:bg-zinc-900">
                            <FileText size={18} className="text-brand" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">CHIDON IQ Prompt Book (v2.4)</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">240 structured templates to boost AI copywriting precision.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-1', 'CHIDON_IQ_Prompt_Book_v2.4')}
                          className="px-3 py-1.5 rounded-lg bg-brand text-xs font-bold text-white hover:bg-brand/90 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {downloadingResourceId === 'res-1' ? `Downloading ${downloadProgress}%` : <><Download size={13} /> Get</>}
                        </button>
                      </div>

                      {/* Res 2 */}
                      <div className="flex items-center justify-between p-4 border border-[var(--border-base)]/60 rounded-xl bg-[var(--bg-card)]/30 hover:bg-brand/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-neutral-100 dark:bg-zinc-900">
                            <BookOpen size={18} className="text-brand" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">CTR Psychology Blueprint</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">Frame matrices to hack viewer gaze and click patterns on modern feeds.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-2', 'CTR_Psychology_Blueprint')}
                          className="px-3 py-1.5 rounded-lg bg-brand text-xs font-bold text-white hover:bg-brand/90 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {downloadingResourceId === 'res-2' ? `Downloading ${downloadProgress}%` : <><Download size={13} /> Get</>}
                        </button>
                      </div>

                      {/* Res 3 */}
                      <div className="flex items-center justify-between p-4 border border-[var(--border-base)]/60 rounded-xl bg-[var(--bg-card)]/30 hover:bg-brand/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-neutral-100 dark:bg-zinc-900">
                            <Cpu size={18} className="text-brand" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Algorithmic Scheduling Maps (2026)</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">High-resolution schedule windows suited for global multi-regional distribution.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-3', 'Algorithmic_Scheduling_Maps_2026')}
                          className="px-3 py-1.5 rounded-lg bg-brand text-xs font-bold text-white hover:bg-brand/90 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {downloadingResourceId === 'res-3' ? `Downloading ${downloadProgress}%` : <><Download size={13} /> Get</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CAREERS */}
                {activeModal === 'careers' && (
                  <div className="space-y-4">
                    {selectedJob === null ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-base)]/40 pb-4">
                          <div>
                            <p className="text-xs text-[var(--border-base)] font-mono uppercase tracking-widest">ACTIVE ENGINEERING & STRATEGY SECTORS:</p>
                            <span className="text-[10px] text-[var(--text-secondary)] font-sans">
                              Fully dynamic community-sourced talent directory. Create or apply below.
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setShowAddJobForm(!showAddJobForm)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand/15 text-brand hover:bg-brand/25 text-xs font-bold transition-all border border-brand/20 cursor-pointer self-start sm:self-auto"
                          >
                            {showAddJobForm ? <X size={13} /> : <Plus size={13} />}
                            {showAddJobForm ? "Close Form" : "Publish Slot"}
                          </button>
                        </div>

                        {/* Add Job Form */}
                        {showAddJobForm && (
                          <div className="p-4 border border-brand/20 bg-brand/5 rounded-xl space-y-4">
                            <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono text-[var(--text-primary)]">Publish a New Career Slot</h4>
                            
                            {newJobSuccess ? (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-lg font-bold text-center">
                                ✓ Dynamic job slot published successfully!
                              </div>
                            ) : (
                              <form onSubmit={handleAddNewJob} className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Job Title</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newTitle}
                                      onChange={(e) => setNewTitle(e.target.value)}
                                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand"
                                      placeholder="e.g. Creator Growth Manager"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Department</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newDept}
                                      onChange={(e) => setNewDept(e.target.value)}
                                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand"
                                      placeholder="e.g. Growth Systems"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Location</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newLoc}
                                      onChange={(e) => setNewLoc(e.target.value)}
                                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand"
                                      placeholder="e.g. Remote (UK/US)"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Type</label>
                                    <select
                                      value={newType}
                                      onChange={(e) => setNewType(e.target.value)}
                                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand text-xs text-[var(--text-primary)]"
                                    >
                                      <option value="Full-time">Full-time</option>
                                      <option value="Contract">Contract</option>
                                      <option value="Part-time">Part-time</option>
                                      <option value="Remote">Remote</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Salary / Comp</label>
                                    <input 
                                      type="text" 
                                      value={newSalary}
                                      onChange={(e) => setNewSalary(e.target.value)}
                                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand"
                                      placeholder="e.g. $120k/yr or $50/hr"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase">Role Description</label>
                                  <textarea 
                                    required
                                    rows={3}
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg p-2.5 outline-none focus:border-brand resize-none"
                                    placeholder="Briefly state key targets, skills required and responsibilities..."
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={isSubmittingNewJob}
                                  className="w-full py-2 bg-brand text-xs font-black text-white rounded-lg hover:bg-brand/90 uppercase tracking-widest disabled:opacity-50 transition-all cursor-pointer"
                                >
                                  {isSubmittingNewJob ? "Broadcasting listing..." : "Broadast Dynamic Job Listing"}
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {loadingJobs ? (
                          <div className="py-12 text-center text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest">
                            Syncing Recruitment Channels...
                          </div>
                        ) : jobOpenings.length === 0 ? (
                          <div className="border border-dashed border-[var(--border-base)]/80 rounded-xl p-8 text-center space-y-3">
                            <Briefcase size={28} className="mx-auto text-[var(--text-secondary)] opacity-65" />
                            <h4 className="font-bold text-xs uppercase font-mono text-[var(--text-primary)]">NO CURRENT SECTOR SLOTS AVAILABLE</h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                              All default mock data has been cleared. Click "Publish Slot" above to deploy your own job opening securely onto the live network!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {jobOpenings.map((job) => (
                              <div key={job.id} className="p-4 border border-[var(--border-base)]/80 rounded-xl bg-[var(--bg-card)]/50 hover:border-brand/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative group">
                                <div className="space-y-1.5 flex-1 pr-6">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-brand/15 text-brand uppercase">{job.type}</span>
                                    <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1">
                                      <MapPin size={10} /> {job.location}
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1">
                                      <Users size={10} /> {job.department}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-[var(--text-primary)]">{job.title}</h4>
                                  <p className="text-xs text-[var(--text-secondary)] max-w-lg leading-relaxed">{job.description}</p>
                                  <span className="inline-block text-[11px] font-mono font-bold text-brand bg-brand/5 px-2 py-0.5 rounded">Comp: {job.salary}</span>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                                  <button
                                    onClick={() => handleApplyJob(job)}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand text-xs font-bold text-white hover:bg-brand/90 transition-all cursor-pointer whitespace-nowrap text-center"
                                  >
                                    Quick Apply
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteJob(job.id, e)}
                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 text-[var(--text-secondary)] rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                    title="Delete Career Opening"
                                    aria-label="Delete posting"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-5 border border-brand/20 bg-brand/5 rounded-2xl relative">
                        <button 
                          onClick={() => setSelectedJob(null)}
                          className="absolute top-4 right-4 text-xs font-mono font-bold text-brand hover:underline"
                        >
                          ← BACK TO JOB BOARD
                        </button>
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">Apply: {selectedJob.title}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase font-mono tracking-wider mb-4">{selectedJob.department} // {selectedJob.location}</p>

                        {jobSuccess ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl p-6 text-center space-y-3"
                          >
                            <div className="inline-flex w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-500 mx-auto">
                              <CheckCircle2 size={22} />
                            </div>
                            <h5 className="font-bold text-xs uppercase tracking-wider font-mono">Transmission Complete</h5>
                            <p className="text-xs font-bold leading-relaxed">
                              Your candidate capsule has been aligned. CHIDON IQ recruiting teams will contact you shortly if credentials map successfully!
                            </p>
                          </motion.div>
                        ) : (
                          <form onSubmit={submitJobApplication} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Candidate Name</label>
                                <input 
                                  type="text" 
                                  required
                                  value={jobName}
                                  onChange={(e) => setJobName(e.target.value)}
                                  className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs focus:border-brand outline-none" 
                                  placeholder="John Doe"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">E-Mail Channel</label>
                                <input 
                                  type="email" 
                                  required
                                  value={jobEmail}
                                  onChange={(e) => setJobEmail(e.target.value)}
                                  className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs focus:border-brand outline-none" 
                                  placeholder="john@example.com"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Target Resume Link / Plaintext Portfolio</label>
                              <input 
                                type="text"
                                value={jobResumeName}
                                onChange={(e) => setJobResumeName(e.target.value)}
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs focus:border-brand outline-none" 
                                placeholder="E.g. linkedin.com/in/username or GidHub URL"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Key Motivation Statement</label>
                              <textarea 
                                value={jobCoverLetter}
                                onChange={(e) => setJobCoverLetter(e.target.value)}
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs focus:border-brand outline-none h-20 resize-none" 
                                placeholder="Tell us how you'll improve CHIDON IQ content models..."
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingJob}
                              className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                            >
                              {isSubmittingJob ? 'Aligning credentials...' : 'Transmit Application'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. CONTACT INFORMATION */}
                {activeModal === 'contact' && (
                  <div className="space-y-5">
                    <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                      Need direct engineering support or brand alignment consulting? Establish an uplink message to our central NOC (Network Operations Center).
                    </p>

                    <div className="p-4 border border-[var(--border-base)]/60 rounded-xl bg-[var(--bg-card)]/50 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-brand uppercase tracking-wider block">SUPPORT CORE:</span>
                      <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                        <p className="flex items-center gap-2"><Mail size={12} className="text-brand" /> support@chidon.iq</p>
                        <p className="flex items-center gap-2"><Users size={12} className="text-brand" /> developer@chidon.iq</p>
                        <p className="flex items-center gap-2"><Calendar size={12} className="text-brand" /> NOC Hours: 08:00 - 18:00 UTC</p>
                      </div>
                    </div>

                    <div className="p-4 border border-[var(--border-base)]/80 rounded-xl bg-neutral-100 dark:bg-zinc-900/40">
                      <h4 className="font-bold text-xs uppercase font-mono tracking-wider mb-3">Instant Dispatch Box:</h4>
                      {contactSuccess ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs text-center rounded-xl font-bold font-mono">
                          ✓ DISPATCH SUCCESSFUL. MESSAGE ROUTED TO NOC.
                        </div>
                      ) : (
                        <form onSubmit={handleSendContact} className="space-y-3 text-xs">
                          <div className="space-y-1">
                            <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Subject Theme</label>
                            <input 
                              type="text" 
                              required
                              value={contactSubject}
                              onChange={(e) => setContactSubject(e.target.value)}
                              className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs focus:border-brand outline-none" 
                              placeholder="E.g. Custom platform integration help"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Message Intel</label>
                            <textarea 
                              required
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl p-2 text-xs h-20 resize-none outline-none focus:border-brand" 
                              placeholder="Please detail your platform setup or app optimization query..."
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-brand text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-brand/90 transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Send size={12} /> Dispatch Link
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. TERMS OF USE */}
                {activeModal === 'terms' && (
                  <AutoTranslate>
                    <div className="space-y-5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <p className="font-bold text-[var(--text-primary)]">Last Updated: April 2026</p>
                      
                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>📝</span> Agreement
                        </h4>
                        <p>
                          Welcome to Chidon Iq! By accessing and using our web application, tools, or smart generators, you are agreeing to these Terms of Use. Please read them carefully. If you do not agree to everything here, you should not use Chidon Iq.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>👤</span> Accounts
                        </h4>
                        <p>
                          To explore our intelligent tools, you must create an account. You agree to give us a real email address that belongs to you. Please only create one account per person. Keep your password safe! If we find out you are using fake profiles or abusing the platform, we reserve the right to suspend or block your account immediately.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>💳</span> Payments & Refunds
                        </h4>
                        <p>
                          Payments processed by Paystack. See <a href="https://paystack.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] underline">paystack.com/legal/terms</a>. When you subscribe to Pro Creator tools, premium features activate instantly. Because custom computing power is used right away to generate your content, we do not cover refunds after access is granted, unless a severe, unresolvable technical failure happens on our end. For any billing problems or concerns, please reach out to our dedicated support channels at <strong className="text-[var(--text-primary)]">support@chidoniq.com</strong>.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>✅</span> Acceptable Use
                        </h4>
                        <p>
                          We love dynamic content creators, but please use Chidon Iq responsibly. You promise not to use our product for illegal things, create spam networks, or try to decode or reverse engineer the inner workings of Chidon Iq. Please do not overload our servers or run automated bots to scrape content.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🧠</span> Content & IP
                        </h4>
                        <p>
                          You own all the custom social scripts, descriptions, and ideas you generate using our assistant. However, Chidon Iq owns the app wrapper, entire brand, logo designs, systems, underlying source code, and intellectual property. No copying of our layout or code is allowed!
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🚫</span> Termination
                        </h4>
                        <p>
                          We want our community to remain safe and fair. We reserve the right to block or terminate your access for credit fraud, unauthorized chargebacks, or violations of these Terms of Use. If your account is closed for causa, you will not be issued any refunds for unused subscription periods.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>⚠️</span> Disclaimers
                        </h4>
                        <p>
                          Chidon Iq is provided on an "as is" and "as available" basis. While we work around the clock to build premium engines, we do not guarantee 100% continuous uptime or that our generated ideas will always match your social audience forecasts. We hope they do, but we are not legally responsible if they do not.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🌍</span> Governing Law
                        </h4>
                        <p>
                          These Terms and any platform disputes will be regulated by the modern laws of Everyone. If you are having issues, please talk to us first! We are dedicated to peace and want to settle all matters through direct support. Send an email to <strong className="text-[var(--text-primary)]">support@chidoniq.com</strong> before initiating any external processes.
                        </p>
                      </div>
                    </div>
                  </AutoTranslate>
                )}

                {/* 7. PRIVACY POLICY */}
                {activeModal === 'privacy' && (
                  <AutoTranslate>
                    <div className="space-y-5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <p className="font-bold text-[var(--text-primary)]">Last Updated: June 4, 2026</p>
                      <p>
                        Welcome to <strong>Chidon Iq</strong>! We believe privacy rules should be easy to understand. We want you to feel totally safe and relaxed while building cool things. Here is a simple, human-friendly breakdown of how we protect you and your data:
                      </p>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🔒</span> What data we collect
                        </h4>
                        <p>
                          We keep things super simple. Here is what we collect from you when you use Chidon Iq:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                          <li><strong>Your Account Details:</strong> Your email address and display name so we can secure your account and greet you on your dashboard.</li>
                          <li><strong>Your Creator Canvas:</strong> Your customized social scripts, keyword research lists, tone choices, and content schedules. We save these inside our secure database so you never lose your hard work.</li>
                        </ul>
                        <p>
                          We do not collect sneaky background information, and we do not track your device location.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>💳</span> Payments with Paystack
                        </h4>
                        <p>
                          Chidon Iq uses Paystack to process payments. We do not store your card details. All card information is encrypted and processed directly by Paystack, our PCI-DSS compliant secure payment partner. Paystack sends us a safe confirmation token so we can instantly unlock your premium Pro tools!
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🍪</span> Cookies & Analytics
                        </h4>
                        <p>
                          We use tiny, safe files called cookies to keep you signed in so you do not have to write your password every time. We also use light, privacy-friendly analytics trackers to check which features (like script generators) are used the most. This helps us make Chidon Iq faster and more helpful for you.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🤝</span> Who we share data with
                        </h4>
                        <p>
                          We respect your ideas! We will <strong>never</strong> sell or rent your digital ideas, scripts, or details to spam networks or third-party advertising companies. We only share necessary instructions with trusted services like CHIDON AI Engine (to generate your content) and Firebase (to host your secure vault).
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🌍</span> Your rights - GDPR & NDPR
                        </h4>
                        <p>
                          Whether you are creating content from Everyone or standard cities worldwide, you have absolute control over your digital identity under laws like GDPR and NDPR. You can:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                          <li>View all the information we have about your account at any time.</li>
                          <li>Fix or update your account name and email.</li>
                          <li>Ask us to completely delete your account and erase all your scripts from our databases forever.</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🔐</span> How we protect your data
                        </h4>
                        <p>
                          We work hard to protect your records from bad actors. Chidon Iq uses top-grade servers, firewalls, and modern encryption to lock down your personal records. Only you can access, read, or print your creative content logs using your secure password login.
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-white/5 pt-3">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>📧</span> Contact us
                        </h4>
                        <p>
                          Have some feedback, privacy questions, or just want to swap ideas? Shoot us a friendly note at <strong className="text-[var(--text-primary)]">support@chidon.iq</strong> or reach our lead developer directly at <strong className="text-[var(--text-primary)]">chideraemmanue98@gmail.com</strong>. We always love hearing from you!
                        </p>
                      </div>
                    </div>
                  </AutoTranslate>
                )}

                {/* 8. REFUND POLICY */}
                {activeModal === 'refund' && (
                  <AutoTranslate>
                    <div className="space-y-5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <p className="font-bold text-[var(--text-primary)]">Last Updated: June 4, 2026</p>
                      <p>
                        At <strong>Chidon Iq</strong>, we are committed to building advanced social intelligence and content optimization tools. We want you to feel totally confident when using our platform. If you find that the service does not meet your expectations, we have established a customer-first refund guarantee.
                      </p>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>⌛</span> 14-Day Money-Back Guarantee
                        </h4>
                        <p>
                          We offer a full <strong>14-day refund policy</strong> for all our premium membership subscription tiers. If you subscribe to our pro tier and decide within 14 days that our platform doesn't suit your workflow needs, you can demand a full refund—no difficult questions asked.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>🔄</span> Eligibility Guidelines
                        </h4>
                        <p>
                          To protect our network from bad actors while keeping legitimate creatives completely safe, refunds are approved based on standard compliance guidelines:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
                          <li>The request must be raised within exactly <strong>14 calendar days</strong> of the billing or upgrade transaction.</li>
                          <li>The account should not have registered excessive robotic content extraction or script generation volume indicating intentional commercial mining of the engines prior to cancellation.</li>
                          <li>Only your most recent subscription renewal or original registration purchase is eligible for refund resolution.</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>💳</span> Processing & Settlement
                        </h4>
                        <p>
                          Once your refund is approved, the total amount will be credited back via our PCI-compliant payment channel (Paystack) to your original card, bank channel, or digital wallet. Standard settlement cycles may take between <strong>3 to 7 working days</strong>, depending on your financial institution.
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-white/5 pt-3">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1 mt-3">
                          <span>📧</span> How to Request a Refund
                        </h4>
                        <p>
                          Initiating a refund is simple! You do not need to fill out any complicated compliance grids. Just send an email containing your account user identifier or email to our direct billing team. Contact us at <strong className="text-[var(--text-primary)]">billing@chidoniq.com</strong> or reach out directly to the principal support channel <strong className="text-[var(--text-primary)]">support@chidoniq.com</strong>. We will review and process your request immediately.
                        </p>
                      </div>
                    </div>
                  </AutoTranslate>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
export default DownbaseFooter;
