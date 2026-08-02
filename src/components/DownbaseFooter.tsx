import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChidonLogo } from './ChidonLogo';
import { 
  FileText, Shield, Mail, Info, BookOpen, Cpu, X, 
  ChevronRight, Download, Send, AlertCircle, Briefcase, FileCheck, CheckCircle2,
  Calendar, MapPin, Users, HeartHandshake, HelpCircle, Laptop, Share2, Zap, Trash2, Plus
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoadingJobs(true);
        return;
      }

      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const unsubscribeJobs = onSnapshot(q, (snapshot) => {
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

      return () => {
        unsubscribeJobs();
      };
    });

    return () => unsubscribeAuth();
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
          <ChidonLogo size="sm" />
          <p className="text-[10px] text-[var(--text-secondary)] font-mono max-w-lg uppercase tracking-widest leading-relaxed">
            State-of-the-art social intelligence networks, Video SEO Optimization, and Freelancer Creator Hubs (v2.0)
          </p>
        </div>

        {/* Separated Links grid structure specified by Downbase Requirements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 w-full max-w-4xl text-center">
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
            <Zap size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
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
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer col-span-2 sm:col-span-1"
          >
            <Shield size={16} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Privacy Policy</span>
          </button>
        </div>

        {/* Dynamic Legal Copyright and network latency badge */}
        <div className="w-full border-t border-[var(--border-base)]/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} CHIDON IQ INC. ALL RIGHTS RESERVED.
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
                    {activeModal === 'solutions' && <Zap size={16} />}
                    {activeModal === 'resources' && <BookOpen size={16} />}
                    {activeModal === 'careers' && <Briefcase size={16} />}
                    {activeModal === 'contact' && <Mail size={16} />}
                    {activeModal === 'terms' && <FileText size={16} />}
                    {activeModal === 'privacy' && <Shield size={16} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-wider font-mono text-[var(--text-secondary)] uppercase">
                      {activeModal === 'about' && 'Project Codex'}
                      {activeModal === 'solutions' && 'Sectoral Resolution Lab'}
                      {activeModal === 'resources' && 'Operational Downloads'}
                      {activeModal === 'careers' && 'Cognitive Recruitment Gate'}
                      {activeModal === 'contact' && 'Uplink Center'}
                      {activeModal === 'terms' && 'Compliance Frame'}
                      {activeModal === 'privacy' && 'Secure Integrity Standards'}
                    </h2>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                      {activeModal === 'about' && 'About CHIDON IQ'}
                      {activeModal === 'solutions' && 'Platform & Application Solutions'}
                      {activeModal === 'resources' && 'Advanced Knowledge Bases'}
                      {activeModal === 'careers' && 'Join the Frontier'}
                      {activeModal === 'contact' && 'Contact Engineering Support'}
                      {activeModal === 'terms' && 'Terms of Use Agreement'}
                      {activeModal === 'privacy' && 'Privacy Blueprint & Standards'}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveModal(null); setSelectedJob(null); }}
                  className="p-1 px-2 hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-secondary)] rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 text-xs"
                >
                  <X size={15} /> Close
                </button>
              </div>

              {/* Modal Content container */}
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-sm text-[var(--text-primary)]">
                
                {/* 1. ABOUT THE APP */}
                {activeModal === 'about' && (
                  <div className="space-y-4 leading-relaxed">
                    <p className="text-zinc-600 dark:text-zinc-300">
                      <strong>CHIDON IQ</strong> is a sovereign cognitive engine designed to align advanced generative language intelligence with standard social architectures. Emphasizing premium design layouts, rigorous data encapsulation, and lightning-fast prompt dispatch, CHIDON IQ replaces fragmented workflow patterns with high-fidelity, production-grade output.
                    </p>
                    <div className="bg-neutral-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-[var(--border-base)]/60">
                      <h4 className="font-bold text-xs font-mono text-brand mb-2 tracking-widest uppercase">System Core Specifications:</h4>
                      <ul className="space-y-2 text-xs font-mono text-[var(--text-secondary)]">
                        <li className="flex items-center gap-2">
                           <Cpu size={12} className="text-brand" /> Engine Model: Linguistic Optimizer Core (v2.0)
                        </li>
                        <li className="flex items-center gap-2">
                           <Zap size={12} className="text-brand animate-pulse" /> Delivery State: Organic Video Feed & Video SEO Hubs
                        </li>
                        <li className="flex items-center gap-2">
                           <Users size={12} className="text-brand" /> User Target: High-impact Creators, SEO Strategists, & Freelance Talents
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          localStorage.removeItem('chidon_welcome_dismissed');
                          window.location.reload();
                        }}
                        className="inline-flex items-center gap-2 p-2.5 px-4 bg-brand/10 border border-brand/25 hover:bg-brand/20 text-brand rounded-xl font-bold font-mono text-xs transition-all cursor-pointer"
                      >
                        <Zap size={12} /> Relaunch Visual Welcome Page &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SOLUTIONS */}
                {activeModal === 'solutions' && (
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
                          >                            <span className="font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                              <span className="text-brand">●</span> Organic Video Feed Strategizer (Shadowban Alignment)
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'social1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'social1' && (
                            <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                              <p className="font-bold text-[var(--text-primary)]">Symptoms: Sudden drops in non-follower reach, content recommendation cooling.</p>
                              <p><strong>Step-by-Step Resolution:</strong></p>
                              <ol className="list-decimal list-inside space-y-1 pl-1">
                                <li><strong>Purge Systemic Metadata:</strong> Delete non-original tags and repetitive descriptions.</li>
                                <li><strong>Organic Video Feed Strategizer Protocol:</strong> Use the strategizer to create alternative scripts and original SEO keywords.</li>
                                <li><strong>Bypass Filters:</strong> Shift content away from borderline topics toward high-relevance themes.</li>
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
                              <span className="text-brand">●</span> Algorithmic Retention Hook Optimizations
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'social2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'social2' && (
                            <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                              <p className="font-bold text-[var(--text-primary)]">Symptoms: Low CTR and retention in the first 30 seconds.</p>
                              <p><strong>Retention Engineering Hacks:</strong></p>
                              <ul className="list-disc list-inside space-y-1 pl-1">
                                <li><strong>Linguistic Optimizer Core Hooks:</strong> Inject high-CTR hooks crafted by our optimizer core.</li>
                                <li><strong>Video SEO & Tag Optimizers:</strong> Optimize description headings for crawl readability.</li>
                                <li><strong>Chidon Social Freelance Hub:</strong> Distribute drafts to team reviewers before scheduling.</li>
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
                              <span className="text-zinc-500">■</span> Slow Generator / Linguistic Optimizer Core Lag
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'app1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'app1' && (
                            <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                              <p><strong>System Core Resolution:</strong></p>
                              <p>When high load stresses the server-side proxy queue, the Linguistic Optimizer Core might delay responses. Toggle the cache refresh or try smaller prompt instructions.</p>
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
                              <span className="text-zinc-500">■</span> Workspace Productivity Vault Offline / Sync Error
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">{activeSolutionId === 'app2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'app2' && (
                            <div className="p-4 border-t border-[var(--border-base)]/60 bg-neutral-100 dark:bg-zinc-900/30 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
                              <p><strong>Synchronization Solutions:</strong></p>
                              <p>CHIDON IQ writes draft blueprints securely to the Workspace Productivity Vault database. If you encounter status sync issues, refresh the vault connection or reset the database streams in the Settings menu.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Linguistic Optimizer Core Handbook (v2.0)</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">240 structured templates to boost high-converting copywriting and content models precision.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-1', 'Linguistic_Optimizer_Core_Handbook_v2.0')}
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
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Organic Video Feed Strategizer Playbook</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">Framework matrices to improve organic retention and bypass recommendation filters.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-2', 'Organic_Video_Feed_Strategizer_Playbook')}
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
                            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Video SEO Suite & Freelancer Creator Hub Spec</h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">Technical documentation for configuring live stream outputs and hub publishing.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-3', 'Universal_Crawl_Indexer_Unified_Team_Channels_Hub_Spec')}
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

                    <div className="w-full">
                      <div className="p-5 border border-brand/20 rounded-xl bg-[var(--bg-card)]/80 space-y-3 shadow-md">
                        <span className="text-[11px] font-mono font-bold text-brand uppercase tracking-wider block font-black">SUPPORT CORE UPLINK:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
                          <p className="flex items-center gap-2 p-2.5 bg-neutral-100 dark:bg-zinc-900/40 rounded-lg border border-[var(--border-base)]/40"><Mail size={13} className="text-brand shrink-0" /> support@chidon.iq</p>
                          <p className="flex items-center gap-2 p-2.5 bg-neutral-100 dark:bg-zinc-900/40 rounded-lg border border-[var(--border-base)]/40"><Users size={13} className="text-brand shrink-0" /> developer@chidon.iq</p>
                          <p className="flex items-center gap-2 p-2.5 bg-neutral-100 dark:bg-zinc-900/40 rounded-lg border border-[var(--border-base)]/40"><Calendar size={13} className="text-brand shrink-0" /> Response: Under 4 Hours</p>
                        </div>
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
                  <div className="space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                    <p className="font-bold text-[var(--text-primary)]">Last Updated: July 25, 2026</p>
                    <p>
                      Welcome to <strong>CHIDON IQ</strong> (the "System"). By mapping credentials, accessing cognitive tool sectors, or initiating generation triggers, you agree to comply with the operational conditions outlined within this regulatory frame.
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2">1. Cognitive Output & Ownership</h4>
                    <p>
                      All content pieces, hashtags, script structures, and SEO score summaries generated by CHIDON IQ models under individual account sessions are owned entirely by the generating actor. CHIDON IQ claims zero proprietary title to user outcomes but does not promise accuracy against localized platform updates.
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2">2. Respectful Automation Guidelines</h4>
                    <p>
                      Users are strictly requested not to stress the core API via bulk automated loop scripts or script injection vectors. CHIDON IQ serves human creators looking to align content pipelines organically.
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2">3. Limitation of Liability</h4>
                    <p>
                      CHIDON IQ is provided "AS-IS". We accept zero liability for subsequent social platform reach decay, shadowbanners, deletion of draft indices, or regional connectivity issues.
                    </p>
                  </div>
                )}
 
                {/* 7. PRIVACY POLICY */}
                {activeModal === 'privacy' && (
                  <div className="space-y-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                    <p className="font-bold text-[var(--text-primary)]">Last Updated: July 25, 2026</p>
                    <p>
                      At <strong>CHIDON IQ</strong>, your privacy is decoupled from tracking metrics. We operate clean sandbox configurations as detailed below to preserve candidate and content integrity:
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2">1. Local Storage State Handling</h4>
                    <p>
                      All tone choices, customized system preferences, and theme choices are compiled directly inside your client-side browser storage (React state + `localStorage`). We do not scrape parameters outside specified database schemas.
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2">2. Firebase Core Auth & Database Integration</h4>
                    <p>
                      When checking your blueprints in the Vault, files are cataloged securely inside Chidon Cloud Database. Authorized rules keep records visible strictly to authenticated owners.
                    </p>
                    <h4 className="font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider mt-2 font-mono uppercase tracking-wider mt-2">3. Model Prompt Encapsulation</h4>
                    <p>
                      When transmitting input text parameter fields to our generative agents, text feeds do not persist for secondary telemetry modeling or corporate profiling purposes.
                    </p>
                  </div>
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
