import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Upload, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Instagram, 
  Youtube, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  Bookmark,
  Video,
  ShoppingBag,
  Calendar,
  ShieldAlert,
  Flame,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { ChidonLogo } from './ChidonLogo';

interface OnboardingFlowProps {
  user: any;
  onComplete: (profileData?: { displayName: string; avatarUrl: string | null; platform: string }) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'setup'>('welcome');
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [platform, setPlatform] = useState('instagram');
  const [bio, setBio] = useState('Social Media Strategist & Content Creator');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const userId = user?.uid || user?.id || 'guest';

  // Load existing profile avatar on mount if available
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem(`chidon_profile_photo_${userId}`);
      if (savedPhoto) {
        setAvatarUrl(savedPhoto);
      }
    } catch (e) {
      console.warn("Failed to load saved onboarding photo:", e);
    }
  }, [userId]);

  // Handle local photo gallery upload & FileReader parsing
  const handlePhotoUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file from your gallery.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      if (base64String) {
        setAvatarUrl(base64String);
        try {
          localStorage.setItem(`chidon_profile_photo_${userId}`, base64String);
          window.dispatchEvent(new CustomEvent('chidon_profile_photo_updated', { 
            detail: { userId, avatarUrl: base64String } 
          }));
        } catch (err) {
          console.warn("Local storage capacity limit reached for large profile photo.", err);
          alert("Profile image selected successfully! Note: image is kept in active session state due to local quota limits.");
        }
      }
      setUploading(false);
    };
    reader.onerror = () => {
      alert("Error reading file. Please try another image.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeletePhoto = () => {
    setAvatarUrl(null);
    try {
      localStorage.removeItem(`chidon_profile_photo_${userId}`);
      window.dispatchEvent(new CustomEvent('chidon_profile_photo_updated', { 
        detail: { userId, avatarUrl: null } 
      }));
    } catch (e) {
      console.warn("Failed to delete profile photo from storage:", e);
    }
  };

  const handleSaveProfile = () => {
    try {
      localStorage.setItem(`chidon_profile_name_${userId}`, displayName);
      localStorage.setItem(`chidon_profile_platform_${userId}`, platform);
      localStorage.setItem(`chidon_profile_bio_${userId}`, bio);
      localStorage.setItem(`chidon_onboarding_completed_${userId}`, 'true');
    } catch (e) {
      console.warn("Failed to persist custom profile data:", e);
    }
    
    onComplete({
      displayName,
      avatarUrl,
      platform
    });
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(`chidon_onboarding_completed_${userId}`, 'true');
    } catch (e) {
      console.warn("Failed to save skip state:", e);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-zinc-900 font-sans flex flex-col items-center py-10 px-4 md:px-8 selection:bg-brand/20 selection:text-zinc-900">
      {/* Absolute clean geometric elements for aesthetic touch */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-50 filter blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-emerald-50/80 filter blur-[80px] pointer-events-none -z-10" />

      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl bg-white border border-zinc-200 shadow-xl rounded-[2.5rem] p-6 md:p-12 space-y-12 text-left"
          >
            {/* Header / Active Authentication Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3">
                <ChidonLogo size="md" />
                <div>
                  <h2 className="text-zinc-950 font-black text-lg uppercase tracking-tight">ChidonIQ</h2>
                  <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">System Initialization</p>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-lg">
                  <ShieldCheck size={11} className="text-emerald-600 animate-pulse" /> Connection Secure
                </span>
              </div>
            </div>

            {/* Title & Introduction Hero Block */}
            <div className="space-y-4 max-w-4xl">
              <span className="text-brand font-mono text-[10px] uppercase tracking-[0.3em] font-black block">Phase 01 // Global Protocol</span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-zinc-950 tracking-tighter leading-[1.05]">
                Unlock Supreme Reach & Earning Power with <span className="text-brand font-extrabold">Chidon IQ</span>
              </h1>
              <p className="text-zinc-600 text-base md:text-lg leading-relaxed max-w-3xl">
                Congratulations! You've successfully navigated the security gateway. Chidon IQ is a highly advanced, full-spectrum AI-powered ecosystem designed specifically for creators, social managers, and freelance professionals to dominate search algorithms, generate high-converting social assets, and find global earning contracts.
              </p>
            </div>

            {/* Core Issues Solved Section (Problem vs Solution) */}
            <div className="grid md:grid-cols-2 gap-8 bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200/60">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 border border-red-200 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-lg">
                  <ShieldAlert size={11} className="text-red-500" /> The Problem Creators Face
                </div>
                <h3 className="text-xl font-bold text-zinc-950 tracking-tight font-display uppercase">Why Growing on Social Media is Hard</h3>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Declining Organic Reach:</strong> Major networks continuously choke post impressions to force you to buy premium ads.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Writer's Fatigue & Burnout:</strong> Creating high-quality hooks, descriptions, and video scripts every single day is exhausting.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Invisible Shadowbans:</strong> Using restricted hashtags or words can silently flag your channel, completely stopping distribution.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Monetization Deserts:</strong> Talented creators write premium content but don't know where to meet paying clients or secure contracts.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 md:border-l md:border-zinc-200 md:pl-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-lg">
                  <CheckCircle2 size={11} className="text-emerald-600" /> The Chidon IQ Solution
                </div>
                <h3 className="text-xl font-bold text-zinc-950 tracking-tight font-display uppercase">How We Help You Dominate & Earn</h3>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Deep Cognitive AI Writers:</strong> Automatically write thousands of viral copies, hooks, and script templates backed by Gemini models.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Granular SEO Optimizer:</strong> Inject robots configuration schemas, index-boosting tags, and canonical metadata automatically.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Proactive Reach Scanning:</strong> Safeguard your channels by scanning text drafts against shadowban list limits beforehand.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                    <span><strong>Direct Freelance Marketplace:</strong> Seamlessly post, browse, and hire experts. Keep 100% of your earnings.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Extensive Feature Highlights aspect */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-indigo-600 font-mono text-[10px] uppercase tracking-[0.3em] font-black block">SYSTEM UTILITIES</span>
                <h3 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">EXPLORE ALL COGNITIVE MODULES</h3>
                <p className="text-zinc-500 text-xs">A comprehensive suite engineered to build authority, boost conversions, and maximize audience growth.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Module 1: AI COPYWRITER */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">AI Neural Copywriter</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Deploy our Gemini-powered smart script writer. Instantly generate hooks, caption lists, story boards, and fully timed cinematic structures.
                    </p>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-mono uppercase font-black tracking-wider pt-2">
                    ⚡ Latency: ~0.4s
                  </div>
                </div>

                {/* Module 2: SEO VIRALITY */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">Search Engine Virality</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Equipped with robot schemas, dynamic site configurations, and automatic SEO tag updates to ensure your page captures search trends.
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-mono uppercase font-black tracking-wider pt-2">
                    ✓ Google Crawl Ready
                  </div>
                </div>

                {/* Module 3: GLOBAL FREELANCE */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">Freelance Earn Module</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Build an elegant creator profile, upload portfolio snaps directly, browse active manager contracts, and claim global payout opportunities.
                    </p>
                  </div>
                  <div className="text-[10px] text-amber-600 font-mono uppercase font-black tracking-wider pt-2">
                    $ 100% Commission-Free
                  </div>
                </div>

                {/* Module 4: VAULT STORAGE */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Bookmark size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">Encrypted Storage Vault</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Save, catalog, and archive script drafts, client invoices, competitor analysis profiles, and scheduler logs inside your secure browser sandbox.
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-600 font-mono uppercase font-black tracking-wider pt-2">
                    🔒 Protected Local Sandbox
                  </div>
                </div>

                {/* Module 5: PUBLISHER SCHEDULE */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">Active Post Scheduler</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Coordinate your publish cadence. Set, view, and organize content calendar templates and daily creation benchmarks systematically.
                    </p>
                  </div>
                  <div className="text-[10px] text-rose-600 font-mono uppercase font-black tracking-wider pt-2">
                    📅 Multi-platform calendar
                  </div>
                </div>

                {/* Module 6: SHADOWBAN SOLUTIONS */}
                <div className="border border-zinc-200 hover:border-zinc-300 p-6 rounded-3xl bg-white shadow-sm space-y-4 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm font-mono uppercase tracking-tight">Shadowban Scanner</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Analyze captions and descriptions before posting to flag restricted words or harmful tags, ensuring your reach is preserved.
                    </p>
                  </div>
                  <div className="text-[10px] text-purple-600 font-mono uppercase font-black tracking-wider pt-2">
                    🛡️ Safety Compliance Checked
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Progression Steps */}
            <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200/60 space-y-6">
              <h4 className="font-display font-black text-zinc-950 uppercase tracking-tight text-lg">Your Activation Roadmap</h4>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-2xl font-black font-mono text-brand">01</div>
                  <h5 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Sync Identity</h5>
                  <p className="text-xs text-zinc-500 leading-relaxed">Create a display card, declare your core niche, and upload an avatar photo from your library.</p>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-black font-mono text-indigo-500">02</div>
                  <h5 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Draft & Perfect</h5>
                  <p className="text-xs text-zinc-500 leading-relaxed">Input keywords into the generator to construct highly professional copies and verify reach safety index.</p>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-black font-mono text-emerald-500">03</div>
                  <h5 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Launch & Earn</h5>
                  <p className="text-xs text-zinc-500 leading-relaxed">Promote your freelance social portfolio page, connect with paying gigs, and track follower analytics velocity.</p>
                </div>
              </div>
            </div>

            {/* Bottom Proceed Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100">
              <div className="text-left">
                <p className="text-zinc-900 font-extrabold text-sm uppercase tracking-tight">Ready to Initialize?</p>
                <p className="text-zinc-500 text-xs">Let's proceed to personalize your global creator workspace.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setStep('setup')}
                  className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand/90 text-white font-mono text-[10px] uppercase tracking-widest font-black rounded-xl hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
                >
                  <span>Begin Profile Configuration</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl border border-zinc-200 transition-all cursor-pointer text-center"
                >
                  <span>Skip Setup</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl bg-white border border-zinc-200 shadow-xl rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden grid md:grid-cols-12 gap-8"
          >
            {/* Top gradient highlight strip */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-indigo-500 to-cyan-400" />

            {/* Left Column: Interactive Form and Photo Uploader (7 cols) */}
            <div className="md:col-span-7 space-y-6 text-left">
              <div>
                <span className="text-brand font-mono text-[9px] uppercase tracking-[0.4em] block mb-1">Step 02 // Identity Sync</span>
                <h2 className="text-3xl font-display font-black text-zinc-950 uppercase tracking-tighter">
                  Creator Profile Setup
                </h2>
                <p className="text-zinc-500 text-xs mt-1">
                  Configure your primary workspace metadata. Rest assured, you can change these properties anytime inside your settings panel.
                </p>
              </div>

              {/* Photo Upload Zone (Gallery Connection) */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">
                  Profile Photo (Upload from Gallery)
                </label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-brand bg-brand/5' 
                      : avatarUrl 
                        ? 'border-zinc-300 bg-zinc-50/50' 
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/20'
                  }`}
                >
                  <input
                    type="file"
                    id="onboarding-avatar-file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {uploading ? (
                    <div className="space-y-2 py-4">
                      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] font-mono text-zinc-400">Processing custom metadata...</p>
                    </div>
                  ) : avatarUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                      <div className="relative">
                        <img 
                          src={avatarUrl} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 bg-white shadow-inner" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
                          <CheckCircle2 size={11} className="text-white" />
                        </div>
                      </div>

                      <div className="text-center sm:text-left space-y-1">
                        <p className="text-xs font-bold text-zinc-950 uppercase font-mono tracking-wider">Photo Linked Successfully</p>
                        <p className="text-[10px] text-zinc-400">Stored inside your device's browser sandbox.</p>
                        <button
                          type="button"
                          onClick={handleDeletePhoto}
                          className="text-[10px] text-red-500 hover:text-red-600 font-mono font-bold flex items-center gap-1 mt-1 mx-auto sm:mx-0 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete image</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="onboarding-avatar-file" className="block cursor-pointer py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto border border-zinc-200">
                        <Upload size={16} className="text-zinc-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-950">
                          Click to browse phone gallery
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Supports PNG, JPG, or WEBP formats.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                    Profile Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="E.g., Chidera Creator"
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                    Primary Social Arena
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none font-mono"
                  >
                    <option value="instagram">Instagram (Reels / Stories)</option>
                    <option value="tiktok">TikTok (Short Form Content)</option>
                    <option value="youtube">YouTube (Shorts / Long Form)</option>
                    <option value="twitter">Twitter / X (Threads / Insights)</option>
                    <option value="freelance">Freelance Marketplace Gigs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  Professional Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about your content style..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none resize-none font-sans"
                />
              </div>

              {/* Action Buttons: Skip & Finish */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-100 mt-4">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="w-full sm:flex-1 py-3 bg-brand hover:bg-brand/90 text-white font-mono text-[10px] uppercase tracking-widest font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
                >
                  <UserCheck size={14} />
                  <span>Launch Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl border border-zinc-200 transition-all cursor-pointer text-center"
                >
                  <span>Skip Setup</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Mockup (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-center">
              <div className="border border-zinc-200 rounded-3xl bg-zinc-50/50 p-6 space-y-6 relative overflow-hidden text-left h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-brand">
                  <Bookmark size={80} />
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    CRITICAL WORKSPACE PASS CARD
                  </span>
                  <div className="h-0.5 bg-zinc-200" />
                </div>

                {/* Profile Avatar & Info Card Mockup */}
                <div className="flex flex-col items-center py-6 space-y-4">
                  <div className="relative">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Workspace Preview" 
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full object-cover border-4 border-zinc-200 bg-white shadow-xl" 
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-zinc-100 border-4 border-zinc-200 flex items-center justify-center shadow-xl">
                        <User size={36} className="text-zinc-400" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight font-mono">
                      {displayName || 'Anonymous Operator'}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {platform === 'instagram' && <Instagram size={11} className="text-pink-600" />}
                      {platform === 'youtube' && <Youtube size={11} className="text-red-600" />}
                      {platform === 'tiktok' && <Globe size={11} className="text-teal-600" />}
                      {platform === 'twitter' && <Globe size={11} className="text-sky-600" />}
                      {platform === 'freelance' && <Globe size={11} className="text-emerald-600" />}
                      <span>{platform.toUpperCase()} SPECTRUM</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed text-center italic max-w-xs font-sans px-2">
                    "{bio}"
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                    <span>SECTOR CLEARANCE</span>
                    <span className="text-brand font-bold uppercase">LEVEL 01 ACCESS</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
