import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChidonLogo } from './ChidonLogo';
import { 
  FileText, Shield, Mail, Info, BookOpen, Cpu, X, 
  ChevronRight, Download, Send, AlertCircle, Briefcase, FileCheck, CheckCircle2,
  Calendar, MapPin, Users, HeartHandshake, HelpCircle, Laptop, Share2, Zap, Trash2, Plus, Globe, Key
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

  // Static highly professional default job openings to display if Firestore is syncing or empty
  const defaultJobs: JobOpening[] = [
    {
      id: 'default-1',
      title: 'Principal Cognitive Systems Architect',
      department: 'Linguistic Engineering Core',
      location: 'Silicon Oasis (Hybrid)',
      type: 'Full-time',
      salary: '$165,000 - $190,000 / yr',
      description: 'Lead the continuous integration of server-side Gemini API interfaces. Optimize response parsing, context-window alignment, and real-time prompt calibration for creator workflows.'
    },
    {
      id: 'default-2',
      title: 'Senior Developer (React, Tailwind & Firebase)',
      department: 'Platform Delivery',
      location: 'Remote (US/Europe/UK)',
      type: 'Contract',
      salary: '$90 - $115 / hr',
      description: 'Own state synchronization layers between React components and Firestore. Standardize security rules, offline client-side caching, and responsive Dark Cosmic Slate layouts.'
    },
    {
      id: 'default-3',
      title: 'Organic Retention & SEO strategist',
      department: 'Growth Analytics Hub',
      location: 'London Headquarters',
      type: 'Full-time',
      salary: '£75,000 - £88,000 / yr',
      description: 'Translate algorithmic trends from TikTok, YouTube Shorts, and Instagram Reels into concrete, promptable optimization templates for our Linguistic Optimizer Core.'
    }
  ];

  useEffect(() => {
    // Attempt to load dynamic job openings from Firestore
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribeJobs = onSnapshot(q, (snapshot) => {
      const list: JobOpening[] = [];
      snapshot.forEach((docSnapshot) => {
        list.push({ id: docSnapshot.id, ...docSnapshot.data() } as any);
      });
      // If Firestore is empty or contains no records, defaultJobs will act as our robust base
      setJobOpenings(list);
      setLoadingJobs(false);
    }, (error) => {
      console.warn("Firestore jobs collection read bypassed or empty. Using offline fallback.");
      setJobOpenings([]);
      setLoadingJobs(false);
    });

    return () => {
      unsubscribeJobs();
    };
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
    if (id.startsWith('default-')) {
      alert("Note: Default slots are immutable offline references and cannot be deleted from the remote database.");
      return;
    }
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

  const activeJobsList = jobOpenings.length > 0 ? jobOpenings : defaultJobs;

  return (
    <footer className="w-full bg-[var(--bg-card)]/50 border-t border-[var(--border-base)]/80 mt-16 px-6 py-12 relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-10">
        
        {/* Brand visual header inside downbase */}
        <div className="flex flex-col items-center text-center space-y-3">
          <ChidonLogo size="sm" />
          <p className="text-[10px] text-[var(--text-secondary)] font-mono max-w-2xl uppercase tracking-widest leading-relaxed">
            State-of-the-art social intelligence networks, cognitive SEO optimization, & organic creator growth engines
          </p>
        </div>

        {/* Separated Links grid structure specified by Downbase Requirements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 w-full max-w-5xl text-center">
          <button 
            type="button"
            onClick={() => setActiveModal('about')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Info size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">About App</span>
          </button>

          <button 
            type="button"
            onClick={() => { setActiveModal('solutions'); setSolutionsTab('social'); }}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Cpu size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Solutions</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('resources')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <BookOpen size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Resources</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('careers')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Briefcase size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Careers</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('contact')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <Mail size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Contact Info</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('terms')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer"
          >
            <FileText size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Terms of Use</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal('privacy')}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-[var(--border-base)]/60 bg-[var(--bg-card)]/40 hover:bg-brand/5 hover:border-brand/40 transition-all group cursor-pointer col-span-2 sm:col-span-1"
          >
            <Shield size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Privacy Policy</span>
          </button>
        </div>

        {/* Dynamic Legal Copyright and network latency badge */}
        <div className="w-full border-t border-[var(--border-base)]/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} CHIDON IQ INC. ALL RIGHTS RESERVED. REGISTERED AGENCY 98A77B.
          </span>
          <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Secured Cloud Uplink Active</span>
          </div>
        </div>
      </div>

      {/* Downbase Overlay Modals - Fully styled, responsive, immersive and thorough */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Decorative top strip */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500" />

              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/25">
                    {activeModal === 'about' && <Info size={18} />}
                    {activeModal === 'solutions' && <Cpu size={18} />}
                    {activeModal === 'resources' && <BookOpen size={18} />}
                    {activeModal === 'careers' && <Briefcase size={18} />}
                    {activeModal === 'contact' && <Mail size={18} />}
                    {activeModal === 'terms' && <FileText size={18} />}
                    {activeModal === 'privacy' && <Shield size={18} />}
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black tracking-wider font-mono text-cyan-400 uppercase">
                      {activeModal === 'about' && 'Project Codex Hub'}
                      {activeModal === 'solutions' && 'Operational Resolution Center'}
                      {activeModal === 'resources' && 'Advanced Reference Assets'}
                      {activeModal === 'careers' && 'Sovereign Talent Directory'}
                      {activeModal === 'contact' && 'Support Communication Center'}
                      {activeModal === 'terms' && 'Regulatory Agreement Platform'}
                      {activeModal === 'privacy' && 'Secure Privacy & Cryptography standards'}
                    </h2>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {activeModal === 'about' && 'About CHIDON IQ platform'}
                      {activeModal === 'solutions' && 'Technical & Conceptual Solutions'}
                      {activeModal === 'resources' && 'Premium Downloads & Handbooks'}
                      {activeModal === 'careers' && 'Join the Intellectual Frontier'}
                      {activeModal === 'contact' && 'Uplink to Engineering NOC'}
                      {activeModal === 'terms' && 'Terms of Use Agreement'}
                      {activeModal === 'privacy' && 'Sovereign Data Privacy Blueprint'}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveModal(null); setSelectedJob(null); }}
                  className="p-1 px-2.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs border border-transparent hover:border-rose-500/10"
                >
                  <X size={15} /> Close
                </button>
              </div>

              {/* Modal Content container */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
                
                {/* 1. ABOUT THE APP */}
                {activeModal === 'about' && (
                  <div className="space-y-6 leading-relaxed">
                    <p className="text-slate-300">
                      <strong>CHIDON IQ</strong> is a highly aligned, sovereign social intelligence network built to optimize and scale generative workflows. Designed with a meticulous focus on fast latency, security isolation, and design integrity, CHIDON IQ serves high-impact creators, SEO strategists, and marketing teams worldwide.
                    </p>
                    <p className="text-slate-300">
                      By integrating state-of-the-art neural content strategies directly into your workspace terminal, CHIDON IQ translates abstract concepts into converting blueprints, high-relevance hashtags, and engaging scripts in real-time.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <h4 className="font-extrabold text-xs font-mono text-cyan-400 mb-3 tracking-widest uppercase">System Core Specifications:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2"><Cpu size={14} className="text-cyan-400" /> Platform Version: Chidon IQ v4.5.2</p>
                          <p className="flex items-center gap-2"><Zap size={14} className="text-cyan-400" /> Host Environment: Google Cloud Run</p>
                          <p className="flex items-center gap-2"><Shield size={14} className="text-cyan-400" /> Database Stack: Cloud Firestore / Auth</p>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center gap-2"><Globe size={14} className="text-cyan-400" /> Primary Location: Silicon Oasis NOC</p>
                          <p className="flex items-center gap-2"><Users size={14} className="text-cyan-400" /> Network Target: High-impact Creators</p>
                          <p className="flex items-center gap-2 text-amber-400 font-bold"><Calendar size={14} className="text-amber-400" /> Current Audit: Verified July 10, 2026</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex items-center justify-between border-t border-slate-900 pt-4">
                      <span className="text-xs text-slate-500 font-mono">Build ID: d6d64897-8afb-45e3-ab92-6b0119ed38b4</span>
                      <button
                        onClick={() => {
                          localStorage.removeItem('chidon_welcome_dismissed');
                          window.location.reload();
                        }}
                        className="inline-flex items-center gap-2 p-2.5 px-4 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer"
                      >
                        <Zap size={12} /> Relaunch Welcome Splash Page
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SOLUTIONS */}
                {activeModal === 'solutions' && (
                  <div className="space-y-6">
                    <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Chidon IQ Global Resolution Matrix • Current Revision: July 10, 2026</p>
                    
                    <div className="flex border-b border-slate-800">
                      <button
                        onClick={() => { setSolutionsTab('social'); setActiveSolutionId(null); }}
                        className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${solutionsTab === 'social' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                      >
                        Social Media Optimization
                      </button>
                      <button
                        onClick={() => { setSolutionsTab('app'); setActiveSolutionId(null); }}
                        className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${solutionsTab === 'app' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                      >
                        Application Integration Hacks
                      </button>
                    </div>

                    {solutionsTab === 'social' ? (
                      <div className="space-y-4">
                        {/* Solved 1 */}
                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
                          <button
                            onClick={() => setActiveSolutionId(activeSolutionId === 'social1' ? null : 'social1')}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-all cursor-pointer"
                          >
                            <span className="font-extrabold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                              <span className="text-cyan-500">●</span> Organic Video Feed Optimizations (Shadowban Alignment)
                            </span>
                            <span className="text-xs text-cyan-400 font-mono">{activeSolutionId === 'social1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'social1' && (
                            <div className="p-5 border-t border-slate-850 bg-slate-950/80 text-xs text-slate-400 leading-relaxed space-y-3">
                              <p className="font-bold text-white">Symptoms: Unexpected drops in non-follower reach, profile discovery blocks, comment deletion cycles.</p>
                              <p className="font-semibold text-cyan-400 font-mono uppercase tracking-widest text-[9px]">Step-by-Step Systemic Resolution Protocol:</p>
                              <ol className="list-decimal list-inside space-y-2 pl-1">
                                <li><strong>Purge Systemic Metadata:</strong> Eliminate spammy tag blocks, repetitive captions, and identical video-title loops from pending drafts.</li>
                                <li><strong>Trigger Alternative Scripting Loops:</strong> Utilize CHIDON IQ's script generator to rewrite hooks, introducing semantic variations and organic hooks.</li>
                                <li><strong>Align with Natural Keywords:</strong> Embed highly-searched SEO phrases generated by our crawler to trigger natural discovery filters.</li>
                                <li><strong>Dynamic Buffer Windowing:</strong> Restrict post intervals to a minimum of 4 hours to avoid rate limit flags in algorithms.</li>
                              </ol>
                            </div>
                          )}
                        </div>

                        {/* Solved 2 */}
                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
                          <button
                            onClick={() => setActiveSolutionId(activeSolutionId === 'social2' ? null : 'social2')}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-all cursor-pointer"
                          >
                            <span className="font-extrabold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                              <span className="text-cyan-500">●</span> Audience Retention Hook Engineering
                            </span>
                            <span className="text-xs text-cyan-400 font-mono">{activeSolutionId === 'social2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'social2' && (
                            <div className="p-5 border-t border-slate-850 bg-slate-950/80 text-xs text-slate-400 leading-relaxed space-y-3">
                              <p className="font-bold text-white">Symptoms: High initial view count but low average retention (under 10 seconds), flatline conversion rate.</p>
                              <p className="font-semibold text-cyan-400 font-mono uppercase tracking-widest text-[9px]">Surgical Hook Optimizations:</p>
                              <ul className="list-disc list-inside space-y-2 pl-1">
                                <li><strong>Linguistic Optimizer Hooks:</strong> Configure your prompt models to use "Negative Contrast" hooks (e.g. "Stop doing this to your content").</li>
                                <li><strong>Inject High-Density Visual Statements:</strong> Pair hooks with descriptive visual cues.</li>
                                <li><strong>Establish Peer Collaboration Auditing:</strong> Utilize the Team Channels Hub to cross-examine scripts with other operators.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Solved 3 */}
                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
                          <button
                            onClick={() => setActiveSolutionId(activeSolutionId === 'app1' ? null : 'app1')}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-all cursor-pointer"
                          >
                            <span className="font-extrabold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                              <span className="text-slate-500">■</span> Slow Generation Output / API Latency Spikes
                            </span>
                            <span className="text-xs text-cyan-400 font-mono">{activeSolutionId === 'app1' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'app1' && (
                            <div className="p-5 border-t border-slate-850 bg-slate-950/80 text-xs text-slate-400 leading-relaxed space-y-3">
                              <p className="font-bold text-white">Symptoms: AI generation requests taking over 15 seconds or timed out with gateway alerts.</p>
                              <p className="font-semibold text-cyan-400 font-mono uppercase tracking-widest text-[9px]">Systemic Troubleshooting Steps:</p>
                              <ol className="list-decimal list-inside space-y-2 pl-1">
                                <li><strong>Refresh Cloud Session:</strong> Log out and sign in using your authenticated Email credentials to re-initialize your session token.</li>
                                <li><strong>Configure Custom API Key:</strong> To bypass global proxy queue limitations, insert your own server-side Google Gemini key in the Workspace settings.</li>
                                <li><strong>Optimize Context Length:</strong> Clear previous memory threads or condense the input prompt size to speed up response streams.</li>
                              </ol>
                            </div>
                          )}
                        </div>

                        {/* Solved 4 */}
                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
                          <button
                            onClick={() => setActiveSolutionId(activeSolutionId === 'app2' ? null : 'app2')}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-all cursor-pointer"
                          >
                            <span className="font-extrabold text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                              <span className="text-slate-500">■</span> Workspace Synchronization & Storage Failures
                            </span>
                            <span className="text-xs text-cyan-400 font-mono">{activeSolutionId === 'app2' ? 'Collapse ▲' : 'Expand ▼'}</span>
                          </button>
                          {activeSolutionId === 'app2' && (
                            <div className="p-5 border-t border-slate-850 bg-slate-950/80 text-xs text-slate-400 leading-relaxed space-y-3">
                              <p className="font-bold text-white">Symptoms: Custom prompts, drafted scripts, and credits count not saving across tabs.</p>
                              <p className="font-semibold text-cyan-400 font-mono uppercase tracking-widest text-[9px]">Database Recovery Steps:</p>
                              <ul className="list-disc list-inside space-y-2 pl-1">
                                <li><strong>Validate Active Connection:</strong> Confirm that the bottom right indicator displays "Uplink Active".</li>
                                <li><strong>Establish Email Auth Identity:</strong> Anonymous sessions are highly prone to clearing due to local browser sweeps. Create a secure Email account to bind all records instantly to our Cloud Firestore database.</li>
                                <li><strong>Clean Cache Sync:</strong> Navigate to user preferences and trigger manual Firestore synchronization.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. RESOURCES */}
                {activeModal === 'resources' && (
                  <div className="space-y-5">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">PREMIUM COGNITIVE HANDBOOKS • RELEASE v4.5.2 (UPDATED JULY 10, 2026):</p>
                    
                    <div className="space-y-4">
                      {/* Res 1 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-800 rounded-2xl bg-slate-900/40 hover:bg-cyan-500/5 hover:border-cyan-500/25 transition-all gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Linguistic Optimizer Core Handbook (v4.5.2)</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-md">240 detailed copywriting frameworks, structure matrices, and hook guides configured specifically to extract maximum performance from LLM tokens. Fully updated today, July 10, 2026.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-1', 'Linguistic_Optimizer_Core_Handbook_v4_5')}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                        >
                          {downloadingResourceId === 'res-1' ? `Downloading ${downloadProgress}%` : <><Download size={14} /> Download</>}
                        </button>
                      </div>

                      {/* Res 2 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-800 rounded-2xl bg-slate-900/40 hover:bg-cyan-500/5 hover:border-cyan-500/25 transition-all gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Organic Video Feed Strategizer Playbook (v4.5.2)</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-md">The definitive guide to bypassing shadowbans, configuring upload windows, and crafting high-retention audio cues. Implemented with inputs from leading content creators on July 10, 2026.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-2', 'Organic_Video_Feed_Strategizer_Playbook')}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                        >
                          {downloadingResourceId === 'res-2' ? `Downloading ${downloadProgress}%` : <><Download size={14} /> Download</>}
                        </button>
                      </div>

                      {/* Res 3 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-800 rounded-2xl bg-slate-900/40 hover:bg-cyan-500/5 hover:border-cyan-500/25 transition-all gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                            <Cpu size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Universal Crawl Indexer Specification Manual</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-md">Technical diagrams detailing custom endpoint routing, secure Firebase authorization rules, and workspace export configurations for developer-level integrations.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadResource('res-3', 'Universal_Crawl_Indexer_Manual')}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                        >
                          {downloadingResourceId === 'res-3' ? `Downloading ${downloadProgress}%` : <><Download size={14} /> Download</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CAREERS */}
                {activeModal === 'careers' && (
                  <div className="space-y-6">
                    {selectedJob === null ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                          <div>
                            <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest font-black">ACTIVE COGNITIVE RECRUITMENT GATEWAYS (v4.5.2):</p>
                            <span className="text-[11px] text-slate-400 font-sans">
                              Fully dynamic cloud-synchronized talent directory. Feel free to publish custom slots or apply to existing ones instantly.
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setShowAddJobForm(!showAddJobForm)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-black transition-all border border-cyan-500/20 cursor-pointer self-start sm:self-auto uppercase font-mono tracking-wider"
                          >
                            {showAddJobForm ? <X size={13} /> : <Plus size={13} />}
                            {showAddJobForm ? "Close Form" : "Publish Career Slot"}
                          </button>
                        </div>

                        {/* Add Job Form */}
                        {showAddJobForm && (
                          <div className="p-5 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl space-y-4">
                            <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                              <Key size={13} className="text-cyan-400 animate-pulse" />
                              <span>Publish a New Dynamic Career Opportunity</span>
                            </h4>
                            
                            {newJobSuccess ? (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-bold text-center">
                                ✓ Dynamic job slot successfully broadcast onto the live Chidon cloud network!
                              </div>
                            ) : (
                              <form onSubmit={handleAddNewJob} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Job Title</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newTitle}
                                      onChange={(e) => setNewTitle(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-cyan-500/50"
                                      placeholder="e.g. Creator Content Manager"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Department Sector</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newDept}
                                      onChange={(e) => setNewDept(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-cyan-500/50"
                                      placeholder="e.g. Cognitive SEO Division"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Location Type</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={newLoc}
                                      onChange={(e) => setNewLoc(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-cyan-500/50"
                                      placeholder="e.g. Silicon Oasis (Hybrid)"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Contract Classification</label>
                                    <select
                                      value={newType}
                                      onChange={(e) => setNewType(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-xs text-white focus:border-cyan-500/50"
                                    >
                                      <option value="Full-time">Full-time</option>
                                      <option value="Contract">Contract</option>
                                      <option value="Part-time">Part-time</option>
                                      <option value="Remote">Remote</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Salary Range / Comp</label>
                                    <input 
                                      type="text" 
                                      value={newSalary}
                                      onChange={(e) => setNewSalary(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-cyan-500/50"
                                      placeholder="e.g. $140k/yr or $80/hr"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Key Targets & Role Description</label>
                                  <textarea 
                                    required
                                    rows={3}
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none text-white resize-none focus:border-cyan-500/50"
                                    placeholder="Briefly describe key performance metrics, necessary skills, and technology stacks expected..."
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={isSubmittingNewJob}
                                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-widest disabled:opacity-50 transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2"
                                >
                                  {isSubmittingNewJob ? "Broadcasting listing..." : "Publish Slot on Network"}
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {loadingJobs ? (
                          <div className="py-12 text-center text-xs text-slate-500 font-mono uppercase tracking-widest animate-pulse">
                            Syncing Recruitment Channels with Database...
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeJobsList.map((job) => (
                              <div key={job.id} className="p-5 border border-slate-800 rounded-2xl bg-slate-900/30 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative group">
                                <div className="space-y-2 flex-1 pr-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded text-[9px] font-black font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 uppercase">{job.type}</span>
                                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                      <MapPin size={11} className="text-cyan-400" /> {job.location}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                      <Users size={11} className="text-cyan-400" /> {job.department}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-sm text-white">{job.title}</h4>
                                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{job.description}</p>
                                  <span className="inline-block text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/5 px-2.5 py-0.5 rounded-full border border-cyan-500/15">Compensation Range: {job.salary}</span>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                                  <button
                                    onClick={() => handleApplyJob(job)}
                                    className="flex-grow sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-black text-slate-950 transition-all cursor-pointer whitespace-nowrap text-center uppercase font-mono tracking-wider"
                                  >
                                    Quick Apply
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteJob(job.id, e)}
                                    className="p-2.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-xl transition-all border border-transparent hover:border-rose-500/15"
                                    title="Delete Career Opening"
                                    aria-label="Delete posting"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-6 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl relative">
                        <button 
                          onClick={() => setSelectedJob(null)}
                          className="absolute top-4 right-4 text-xs font-mono font-bold text-cyan-400 hover:underline"
                        >
                          ← BACK TO RECRUITING BOARD
                        </button>
                        <h4 className="font-extrabold text-base text-white">Apply Slot: {selectedJob.title}</h4>
                        <p className="text-[10px] text-cyan-400 mt-1 uppercase font-mono tracking-wider mb-5">Sector: {selectedJob.department} // Node: {selectedJob.location}</p>

                        {jobSuccess ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-8 text-center space-y-4"
                          >
                            <div className="inline-flex w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-400 mx-auto">
                              <CheckCircle2 size={24} />
                            </div>
                            <h5 className="font-black text-xs uppercase tracking-wider font-mono">Transmission Dispatched</h5>
                            <p className="text-xs font-bold leading-relaxed max-w-sm mx-auto">
                              Your candidate application capsule has been synchronized. Our Human Capital Operations team will contact you shortly if credentials align successfully!
                            </p>
                          </motion.div>
                        ) : (
                          <form onSubmit={submitJobApplication} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">Candidate Full Name</label>
                                <input 
                                  type="text" 
                                  required
                                  value={jobName}
                                  onChange={(e) => setJobName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-cyan-500/50 outline-none font-semibold" 
                                  placeholder="John Doe"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">Verified E-Mail address</label>
                                <input 
                                  type="email" 
                                  required
                                  value={jobEmail}
                                  onChange={(e) => setJobEmail(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-cyan-500/50 outline-none font-semibold" 
                                  placeholder="john@example.com"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">LinkedIn Profile / Portfolio Link</label>
                              <input 
                                type="url"
                                required
                                value={jobResumeName}
                                onChange={(e) => setJobResumeName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-cyan-500/50 outline-none font-mono" 
                                placeholder="https://linkedin.com/in/username or https://github.com/username"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">Aspirational Statement / Why Chidon IQ?</label>
                              <textarea 
                                value={jobCoverLetter}
                                onChange={(e) => setJobCoverLetter(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-cyan-500/50 outline-none h-24 resize-none font-medium leading-relaxed" 
                                placeholder="Explain your alignment targets and how your content strategies elevate cognitive optimization..."
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingJob}
                              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black tracking-wider uppercase transition-colors disabled:opacity-50"
                            >
                              {isSubmittingJob ? 'Synchronizing candidate data...' : 'Transmit Professional Application'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. CONTACT INFORMATION */}
                {activeModal === 'contact' && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      Need direct technical integration support, corporate API licenses, or strategic partnerships? Dispatch a telemetry packet directly to our Silicon Oasis NOC (Network Operations Center). Operational response active.
                    </p>

                    <div className="w-full">
                      <div className="p-6 border border-cyan-500/10 rounded-2xl bg-slate-900/60 space-y-4 shadow-md">
                        <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-wider block">SUPPORT CORE GATEWAYS:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                          <p className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800"><Mail size={14} className="text-cyan-400 shrink-0" /> support@chidon.iq</p>
                          <p className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800"><Users size={14} className="text-cyan-400 shrink-0" /> creators@chidon.iq</p>
                          <p className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800"><Calendar size={14} className="text-cyan-400 shrink-0" /> SLA: under 4 Hours</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/10">
                      <h4 className="font-bold text-xs uppercase font-mono tracking-wider mb-4 text-white">Instant NOC Message Dispatch:</h4>
                      {contactSuccess ? (
                        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center rounded-xl font-bold font-mono">
                          ✓ DISPATCH SUCCESSFUL. SECURE MESSAGE VECTOR REGISTERED.
                        </div>
                      ) : (
                        <form onSubmit={handleSendContact} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">Subject Theme</label>
                            <input 
                              type="text" 
                              required
                              value={contactSubject}
                              onChange={(e) => setContactSubject(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs focus:border-cyan-500/50 outline-none" 
                              placeholder="E.g. API credential issues or custom enterprise integration inquiry"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400 uppercase tracking-wider font-mono">Message Packet</label>
                            <textarea 
                              required
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs h-24 resize-none outline-none focus:border-cyan-500/50 leading-relaxed font-medium" 
                              placeholder="Please thoroughly detail your inquiry or platform feedback..."
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-cyan-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs hover:bg-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider"
                          >
                            <Send size={13} /> Dispatch packet
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. TERMS OF USE */}
                {activeModal === 'terms' && (
                  <div className="space-y-5 text-xs leading-relaxed text-slate-400">
                    <p className="font-extrabold text-white text-sm">Last Revision Audit: July 10, 2026 (Operational Framework v4.5.2)</p>
                    <p>
                      Welcome to <strong>CHIDON IQ</strong>. By logging into this platform, configuring credentials, exporting drafted assets, or calling generative model functions, you acknowledge and agree to comply fully with the terms of use detailed below.
                    </p>
                    
                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">1. Licensing & Sandbox Authorization</h4>
                    <p>
                      Chidon IQ INC grants you a non-exclusive, non-transferable, temporary operating license to use our web dashboard interface, creative tools, and SEO optimization models solely in compliance with standard social media guidelines. You retain full proprietary rights and ownership of any output generated under your active account.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">2. Account Registration, Credentials, & Security</h4>
                    <p>
                      To enjoy the unified cloud synchronization, you are required to establish an identity using your email address and password. You are strictly responsible for maintaining the confidentiality of your security keys. Any action taken under your authenticated email session will be deemed yours.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">3. Prohibited Automation Behaviors</h4>
                    <p>
                      To preserve the high-speed operational bandwidth of the central Aether Core, users are strictly prohibited from writing or deploying automated bot wrappers, aggressive scraping scripts, or injection loops against our server-side proxy routes. Exploitation or rate violations will trigger immediate and permanent account termination.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">4. Absolute Limitation of Liability</h4>
                    <p>
                      CHIDON IQ is provided as a sandbox optimizer "AS-IS" and "AS-AVAILABLE". We accept zero liability for subsequent changes in external platform algorithms, shadowbans, account flags, reduction in reach, loss of drafts, or cloud storage server interruptions. You use these generation models at your own risk.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">5. Governing Jurisdiction</h4>
                    <p>
                      These Terms of Use and all subsequent updates are governed by the laws and regulations of the technological operations registry. Any dispute arising from this agreement will be settled under exclusive arbitrage courts at Silicon Oasis.
                    </p>
                  </div>
                )}

                {/* 7. PRIVACY POLICY */}
                {activeModal === 'privacy' && (
                  <div className="space-y-5 text-xs leading-relaxed text-slate-400">
                    <p className="font-extrabold text-white text-sm">Last Revision Audit: July 10, 2026 (Sovereign Privacy Standards v4.5.2)</p>
                    <p>
                      At <strong>CHIDON IQ</strong>, your privacy and data autonomy are not auxiliary targets; they are baked directly into our system blueprints. This Privacy Policy details how we protect your personal credentials, workspace preferences, and creative assets:
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">1. Local Storage Client Isolation</h4>
                    <p>
                      Your generation settings, visual preferences, custom keywords, and temporary draft scripts are initially recorded inside your device's browser memory (using standard `localStorage` cookies and React state variables). This ensures your workflow data remains isolated and offline unless you choose to sync.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">2. Firebase Core Auth & Database Integrity</h4>
                    <p>
                      When you register or log in using an email address, your experience levels, generation options, and saved scripts are securely synchronized with our Google Cloud Firestore servers. Access rules are rigorously set up so that only you, with verified email/password tokens, can read or write to your personal database nodes.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">3. Secure Prompt Handling</h4>
                    <p>
                      When you send inputs to the Linguistic Optimizer Core, your text inputs are routed through our secure, TLS-encrypted server-side proxy to the Gemini API. Your prompts, personal guidelines, and creative scripts are never sold, compiled for corporate advertising, or used to train secondary public model parameters.
                    </p>

                    <h4 className="font-extrabold text-white uppercase font-mono tracking-wider text-[11px] mt-4">4. Compliance Frameworks (GDPR & CCPA)</h4>
                    <p>
                      Chidon IQ operates in full compliance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). You have the absolute right to request the complete deletion of your synchronized Firestore account data or to export your workspace templates at any point. Contact our primary data officer at privacy@chidon.iq to trigger a hard data purge.
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
