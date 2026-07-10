import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Briefcase, MessageSquare, Shield, User, Camera, Upload, 
  Trash, Save, CheckCircle, ArrowRight, Sparkles, Check, Globe, 
  Cpu, Award, BookOpen, Layers, X, Star, Zap, ShieldAlert
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FreelanceProfile, PortfolioProject, UserRole } from './types';
import { convertFileToBase64, handleFirestoreError, OperationType } from './utils';

// ----------------------------------------------------
// WELCOME ONBOARDING VIEW
// ----------------------------------------------------
interface WelcomeOnboardingViewProps {
  onSkip: () => void;
}

export const WelcomeOnboardingView: React.FC<WelcomeOnboardingViewProps> = ({ onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Chidon Freelance",
      subtitle: "The Next-Generation Commission-Free Sandbox Marketplace",
      description: "Chidon Freelance is a high-fidelity Web3 sandbox ecosystem designed for elite talent and hiring managers. Unlike legacy platforms like Fiverr or Upwork, we charge 0% platform fees—meaning freelancers keep 100% of their earnings and buyers save big.",
      icon: <Zap className="w-14 h-14 text-brand animate-pulse" />,
      badge: "Introducing Web3 Freelance"
    },
    {
      title: "Double-Sided Milestone Escrow",
      subtitle: "Safe, Secure, and Fully Autonomous Contracts",
      description: "Every contract order is backed by a secure multi-state escrow ledger. Buyers pay securely into escrow, and funds are held under complete milestone protection. Freelancers work with absolute peace of mind, knowing that funds are fully locked and guaranteed.",
      icon: <Shield className="w-14 h-14 text-emerald-500" />,
      badge: "Secure Escrow Protection"
    },
    {
      title: "Two Tailored Portals, One Sandbox",
      subtitle: "Dedicated Experiences Crafted For Your Needs",
      description: "Whether you want to post contract briefs and hire top developers, or list specialized services and build interactive software portfolios, our separate Buyer and Seller Experience Worlds customize the entire app interface to your distinct business workflows.",
      icon: <Layers className="w-14 h-14 text-cyan-500" />,
      badge: "Separate Experience Worlds"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSkip();
    }
  };

  const activeStep = steps[currentStep];

  return (
    <div id="welcome-onboarding-popup" className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-350">
      <div className="grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Visual Banner (Ambient gradient matching active step) */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between text-left relative min-h-[250px] md:min-h-[450px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />
          
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-black">
              Chidon Sandbox
            </span>
            <h4 className="text-lg font-black text-white leading-tight">Elite Freelance Ecosystem</h4>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center py-6">
            <div className="p-5 bg-slate-800/40 border border-slate-700/30 rounded-3xl backdrop-blur-md shadow-xl mb-4">
              {activeStep.icon}
            </div>
            <span className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-mono font-black uppercase">
              {activeStep.badge}
            </span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">v2.0 Stable</span>
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === idx ? 'w-5 bg-brand' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-8 p-8 md:p-12 flex flex-col justify-between space-y-8 text-left">
          
          {/* Main Onboarding Carousel Content */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeStep.title}
              </h2>
              <p className="text-xs font-bold text-brand dark:text-cyan-400">
                {activeStep.subtitle}
              </p>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {activeStep.description}
            </p>

            {/* Quick Benefits Checkmarks list on first step */}
            {currentStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="text-brand shrink-0" size={14} />
                  <span>0% Platform Commission Fees</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="text-brand shrink-0" size={14} />
                  <span>Double-Sided Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="text-brand shrink-0" size={14} />
                  <span>Live Professional Portfolios</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="text-brand shrink-0" size={14} />
                  <span>Real-Time Job Boards & Chats</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-6">
            <button 
              onClick={onSkip}
              className="text-xs font-mono font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Skip Onboarding
            </button>

            <button 
              onClick={handleNext}
              className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shadow-lg dark:shadow-white/5"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};


// ----------------------------------------------------
// ONBOARDING SETUP FLOW (ROLE SELECTOR + PROFILE CREATION)
// ----------------------------------------------------
interface OnboardingSetupViewProps {
  profile: FreelanceProfile;
  currentUser: any;
  onComplete: (updatedProfile: FreelanceProfile) => void;
}

export const OnboardingSetupView: React.FC<OnboardingSetupViewProps> = ({ 
  profile, 
  currentUser,
  onComplete 
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Profile Form state
  const [fullName, setFullName] = useState(profile.fullName || currentUser?.displayName || '');
  const [username, setUsername] = useState(profile.username || currentUser?.email?.split('@')[0] || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarURL, setAvatarURL] = useState(profile.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser?.uid || 'guest'}`);
  const [coverURL, setCoverURL] = useState(profile.coverURL || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=60');
  
  // Tag fields
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const [languages, setLanguages] = useState<string[]>(profile.languages || ['English']);
  const [newLang, setNewLang] = useState('');

  // Portfolio items
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(profile.portfolio || []);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projVideo, setProjVideo] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const [saving, setSaving] = useState(false);

  // File to Base64 loaders
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      setAvatarURL(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      setCoverURL(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      setProjImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item array helpers
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addLang = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const removeLang = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  // Portfolio items helper
  const handleAddProject = () => {
    if (!projTitle.trim() || !projDesc.trim() || !projImage) return;
    
    const newProj: PortfolioProject = {
      id: Date.now().toString(),
      title: projTitle.trim(),
      description: projDesc.trim(),
      imageUrl: projImage,
      videoUrl: projVideo.trim() || undefined
    };

    setPortfolio([...portfolio, newProj]);
    setProjTitle('');
    setProjDesc('');
    setProjImage('');
    setProjVideo('');
    setIsAddingProject(false);
  };

  const removeProject = (id: string) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  // Submit profile setup
  const handleSaveProfile = async () => {
    if (!selectedRole) return;
    if (!fullName.trim() || !username.trim()) {
      alert("Full Name and Username are required to launch.");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const updatedProfileData = {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, ''),
        bio: bio.trim() || "Creative freelance sandbox explorer.",
        skills,
        languages,
        portfolio,
        role: selectedRole,
        avatarURL,
        coverURL,
        hasCompletedSetup: true,
        isVerified: true // verify sandbox participants
      };

      await setDoc(userRef, updatedProfileData, { merge: true });
      onComplete({ ...profile, ...updatedProfileData });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setSaving(false);
    }
  };

  // Skip profile setup with defaults
  const handleSkip = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const defaultRole = selectedRole || 'seller';
      const updatedProfileData = {
        fullName: fullName.trim() || profile.fullName || currentUser?.displayName || "Sandbox Creator",
        username: username.trim().toLowerCase().replace(/\s+/g, '') || profile.username || currentUser?.email?.split('@')[0] || `creator_${Math.floor(1000 + Math.random() * 9000)}`,
        bio: bio.trim() || "Creative freelance sandbox explorer.",
        skills: skills.length > 0 ? skills : ["Design", "SEO", "Copywriting", "Video Editing"],
        languages: languages,
        portfolio: portfolio,
        role: defaultRole,
        avatarURL,
        coverURL,
        hasCompletedSetup: true,
        isVerified: true
      };

      await setDoc(userRef, updatedProfileData, { merge: true });
      onComplete({ ...profile, ...updatedProfileData });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* PHASE 1: CHOOSE YOUR WORLD / PORTAL PATH */}
      {!selectedRole ? (
        <div className="space-y-8 py-4">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-black uppercase tracking-wider">
              Path Selection
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose Your Workspace Portal
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you here to commission top talents and purchase secure services, or are you looking to list services and complete milestone escrow projects? Choose your customized path below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            
            {/* BUYER PORTAL PATHWAY CARD (Themed Emerald) */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-500/60 p-8 text-left space-y-6 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
                  <Compass size={28} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Join as a Buyer</span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Emerald World
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Post custom projects on our Active Jobs Board, browse premium service catalogs, hire elite freelancers, and pay securely via Paystack double-sided Escrow.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Browse & hire premium Service Gigs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Post unlimited open contracts & briefs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Secure fund hold in double-sided escrow</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRole('buyer')}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <span>Select Buyer Pathway</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>

            {/* SELLER PORTAL PATHWAY CARD (Themed Cyan) */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800/80 hover:border-cyan-500 dark:hover:border-cyan-500/60 p-8 text-left space-y-6 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl w-fit">
                  <Briefcase size={28} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Join as a Seller</span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Cyan World
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    List high-converting Service Gigs, showcase custom portfolios, pitch live project briefs, complete secure milestones, and keep 100% of your payout commission-free.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-cyan-500" />
                    <span>Create & monetize Service Gigs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-cyan-500" />
                    <span>Bid on open client contract briefs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-cyan-500" />
                    <span>Earn 100% with zero platform commission</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRole('seller')}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
              >
                <span>Select Seller Pathway</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>

          </div>

          <div className="flex flex-col items-center justify-center gap-2 pt-6 max-w-xs mx-auto border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={handleSkip}
              disabled={saving}
              className="w-full py-2.5 px-4 border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 hover:text-brand dark:hover:text-brand hover:border-brand/40 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Skip & Use Default Profile</span>
              <ArrowRight size={12} />
            </button>
            <p className="text-[10px] text-slate-400 font-mono text-center">Bypasses initial setup screens with pre-filled details</p>
          </div>
        </div>
      ) : (
        
        // PHASE 2: AUTO-LOADED PROFESSIONAL PROFILE CREATION FORM
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="text-left space-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                selectedRole === 'buyer' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
              }`}>
                Role: Joining as {selectedRole.toUpperCase()}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                Complete Your Professional Identity
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                disabled={saving}
                className="px-3.5 py-1.5 border border-dashed border-slate-300 dark:border-slate-800 hover:border-brand/40 text-slate-500 hover:text-brand dark:hover:text-brand rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Skip Setup</span>
                <ArrowRight size={12} />
              </button>
              <button 
                onClick={() => setSelectedRole(null)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition-all border border-transparent dark:border-slate-700/60 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                ← Change Role
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Left Column: Avatars & Core Info */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Media Card (Cover & Avatar Uploads) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
                <div className="h-28 w-full relative group bg-slate-100 dark:bg-slate-950">
                  <img src={coverURL} alt="Cover Preview" className="w-full h-full object-cover" />
                  <label className="absolute right-3 bottom-3 p-1.5 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-all cursor-pointer">
                    <Camera size={13} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                  <span className="absolute left-3 top-3 px-1.5 py-0.5 bg-slate-950/60 rounded text-[9px] text-white font-mono uppercase">
                    Banner Banner
                  </span>
                </div>

                <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-950 border-4 border-white dark:border-slate-900 relative overflow-hidden -mt-10 shadow-lg group">
                    <img src={avatarURL} alt="Avatar Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer">
                      <Camera size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {fullName || "Your Full Name"}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      @{username || "username"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Information fields */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Profile Base Info
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Unique Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter unique username..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Bio, Skills, Portfolio */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Bio area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-3 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Biography / Summary Introduction
                </h3>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={selectedRole === 'seller' ? "E.g. Full stack blockchain engineer with 5+ years building secure decentralized apps and React dashboards. Specialized in web applications..." : "E.g. Web3 product manager and hiring lead looking for expert React developers, content writers, and UX specialists for long-term contract roles."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand placeholder:text-slate-400"
                />
              </div>

              {/* Skills and Languages tagging */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tag Skills (or Hiring focus tags for Buyer) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {selectedRole === 'seller' ? 'Specialized Skills' : 'Hiring Focus Areas'}
                  </h3>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder={selectedRole === 'seller' ? "E.g. TypeScript" : "E.g. Frontend Dev"} 
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    />
                    <button 
                      onClick={addSkill}
                      className={`px-3 bg-slate-900 dark:bg-slate-850 text-white hover:bg-brand transition-all rounded-xl text-xs font-bold`}
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                    {skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500 font-mono font-bold">
                          ×
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <div className="text-[11px] text-slate-400 font-mono italic">No tags specified yet. Enter tags above.</div>
                    )}
                  </div>
                </div>

                {/* Tag Languages */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Spoken Languages
                  </h3>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      placeholder="E.g. French, Spanish" 
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }}
                    />
                    <button 
                      onClick={addLang}
                      className="px-3 bg-slate-900 dark:bg-slate-850 text-white hover:bg-brand transition-all rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                    {languages.map((lang) => (
                      <span 
                        key={lang} 
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        {lang}
                        <button onClick={() => removeLang(lang)} className="text-slate-400 hover:text-red-500 font-mono font-bold">
                          ×
                        </button>
                      </span>
                    ))}
                    {languages.length === 0 && (
                      <div className="text-[11px] text-slate-400 font-mono italic">No languages added yet.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Portfolio Project Creator (Highly recommended by user!) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Portfolio Projects
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">Showcase actual files or images representing past works.</p>
                  </div>
                  
                  {!isAddingProject && (
                    <button
                      onClick={() => setIsAddingProject(true)}
                      className={`px-3 py-1.5 ${
                        selectedRole === 'buyer' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20'
                      } text-[10px] font-mono font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer`}
                    >
                      + Add Work Item
                    </button>
                  )}
                </div>

                {/* Portfolio Adder Form inside setup! */}
                {isAddingProject && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-4">
                    <div className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">New Portfolio Item</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Project Title</label>
                        <input 
                          type="text" 
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="E.g. Web3 Dashboard MVP"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Video URL (Optional)</label>
                        <input 
                          type="text" 
                          value={projVideo}
                          onChange={(e) => setProjVideo(e.target.value)}
                          placeholder="Loom or Youtube link..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">Project Description</label>
                      <textarea 
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="Describe key features, deliverables, or hiring parameters..."
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">Screenshot or Deliverable Image</label>
                      <div className="flex items-center gap-4">
                        {projImage ? (
                          <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                            <img src={projImage} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setProjImage('')}
                              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                            <Upload size={16} className="text-slate-400 mb-1" />
                            <span className="text-[8px] font-mono text-slate-400 uppercase">Upload file</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleProjectImageUpload} 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsAddingProject(false)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddProject}
                        disabled={!projTitle || !projDesc || !projImage}
                        className={`px-4 py-1.5 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-40 cursor-pointer ${
                          selectedRole === 'buyer' ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                {/* Portfolio List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.map((project) => (
                    <div 
                      key={project.id} 
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden group flex flex-col justify-between"
                    >
                      <div className="h-28 w-full relative">
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeProject(project.id)}
                          className="absolute right-2 top-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer shadow"
                        >
                          <Trash size={10} />
                        </button>
                      </div>
                      
                      <div className="p-3 space-y-1">
                        <div className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{project.title}</div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  ))}

                  {portfolio.length === 0 && !isAddingProject && (
                    <div className="col-span-2 text-center py-6 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
                      <Layers size={18} className="text-slate-400 mx-auto" />
                      <div className="text-[10px] text-slate-500 font-mono italic">No portfolio work items listed yet.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* SAVE PROFILE & ENTER APP BUTTON */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !fullName.trim() || !username.trim()}
                  className={`px-8 py-4 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                    selectedRole === 'buyer' 
                      ? 'bg-emerald-400 shadow-emerald-500/10 hover:bg-emerald-500' 
                      : 'bg-cyan-400 shadow-cyan-500/10 hover:bg-cyan-500'
                  }`}
                >
                  {saving ? (
                    <span>Saving Sandbox Profile...</span>
                  ) : (
                    <>
                      <span>Save Profile & Launch {selectedRole === 'buyer' ? 'Buyer World' : 'Seller World'}</span>
                      <CheckCircle size={14} />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>

      )}

    </div>
  );
};
