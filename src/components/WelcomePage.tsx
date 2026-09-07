import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChidonLogo } from './ChidonLogo';
import { 
  Zap, ArrowRight, CheckCircle, Cpu, Globe2, Users, 
  Menu, X, TrendingUp, Wallet, ShieldAlert,
  Terminal, ShieldCheck, Layers, HelpCircle, ChevronRight
} from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateToPricing: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ 
  onEnter, 
  user, 
  onSignIn, 
  onSignOut, 
  onNavigateToPricing 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'content' | 'security' | 'ops'>('all');

  const coreInfluenceFactors = [
    {
      id: 'shadowban',
      category: 'security',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      tag: "ALGORITHMIC DISRUPTION",
      title: "Algorithmic Ingress Strategy",
      desc: "Chidon IQ filters organic noise, bypasses algorithmic shadow bans, and crafts optimized scripts that capture attention before standard recommendation systems decay."
    },
    {
      id: 'omnichannel',
      category: 'content',
      icon: <Globe2 className="w-5 h-5 text-emerald-400" />,
      tag: "OMNI-CHANNEL DOMINANCE",
      title: "The Multi-Platform Epoch",
      desc: "In an era of hyper-saturated feeds, Chidon IQ operates as an intelligence buffer, transforming a single content idea into cross-platform hooks tuned for Instagram, TikTok, and YouTube."
    },
    {
      id: 'retention',
      category: 'content',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      tag: "BEHAVIORAL PSYCHOLOGY",
      title: "Psychological Retention Loops",
      desc: "By infusing advanced behavioral hooks and structured copywriting grids, Chidon IQ helps creators maintain a 2.4x higher viewer retention rate past the critical 3-second attention gate."
    },
    {
      id: 'neural',
      category: 'ops',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      tag: "NEURAL OPTIMIZER",
      title: "Real-time Cognitive Engine",
      desc: "Powered by deep strategical models, our pipeline processes raw drafts into viral hooks, custom tags, and dynamic metadata structures tailored for instant impact."
    }
  ];

  const operationalStats = [
    { label: "Reach Acceleration", value: "+240%" },
    { label: "Viewer Hook Index", value: "92.8%" },
    { label: "Neural Ops Synced", value: "48 / Sec" }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? coreInfluenceFactors 
    : coreInfluenceFactors.filter(f => f.category === activeTab);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-sans overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-white pb-16">
      {/* Abstract Glowing Aura Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/10 filter blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full bg-blue-600/5 filter blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      {/* STICKY LUXURY NAVBAR */}
      <header className="sticky top-0 z-[1050] w-full bg-[#030712]/80 backdrop-blur-xl border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <ChidonLogo size="sm" iconOnly />
            <span className="text-xl font-display font-black tracking-tight text-white">
              Chidon<span className="text-cyan-400 font-extrabold ml-0.5">IQ</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-mono font-medium text-slate-300">
            <button onClick={() => scrollToSection('hero')} className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Features</button>
            <button onClick={onNavigateToPricing} className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Pricing Plan</button>
            <button onClick={onEnter} className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-900/40 transition-all font-bold uppercase tracking-wider text-xs">
              <Terminal size={12} />
              <span>Launch Terminal</span>
            </button>
            <button 
              onClick={onEnter} 
              className="text-slate-500 hover:text-cyan-400 transition-all font-bold uppercase tracking-wider text-xs pl-2 border-l border-slate-800"
            >
              Skip
            </button>
          </nav>

          {/* Right Header Controls (Auth & Mobile Toggle) */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-full px-3.5 py-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-[9px] font-black text-white uppercase">
                  {user.email ? user.email.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-mono text-slate-300 truncate max-w-[120px]">
                  {user.displayName || user.email}
                </span>
                <button 
                  onClick={onSignOut}
                  className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 transition-colors pl-2 border-l border-slate-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
              >
                Sign In
              </button>
            )}

            {/* Direct Skip Pill */}
            <button 
              onClick={onEnter}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Skip Intro and Go to Dashboard"
            >
              <span>Skip Intro</span>
              <X size={12} className="text-slate-500 hover:text-cyan-400" />
            </button>

            {/* Little menu Button (Hamburger) */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-slate-300 hover:text-white transition-all focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DROPDOWN MENU SLIDE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[73px] inset-x-0 z-[1000] bg-[#030712] border-b border-slate-900 px-6 py-6 space-y-6 shadow-2xl block md:hidden"
          >
            <div className="space-y-4">
              <button 
                onClick={() => { scrollToSection('hero'); }}
                className="w-full text-left font-mono text-sm text-slate-300 hover:text-cyan-400 py-2 border-b border-slate-950 block uppercase tracking-wider"
              >
                🏠 Home Dashboard
              </button>
              <button 
                onClick={() => { scrollToSection('features'); }}
                className="w-full text-left font-mono text-sm text-slate-300 hover:text-cyan-400 py-2 border-b border-slate-950 block uppercase tracking-wider"
              >
                ✨ Features Showcase
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigateToPricing(); }}
                className="w-full text-left font-mono text-sm text-slate-300 hover:text-cyan-400 py-2 border-b border-slate-950 block uppercase tracking-wider"
              >
                💳 Pricing Plan
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onEnter(); }}
                className="w-full text-left font-mono text-sm text-cyan-400 py-2 border-b border-slate-950 flex items-center gap-2 uppercase tracking-wider"
              >
                🚀 Launch Terminal directly
              </button>
            </div>

            {/* Mobile Auth Button */}
            <div className="pt-2">
              {user ? (
                <div className="space-y-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-black text-white">
                      {user.email ? user.email.charAt(0) : 'U'}
                    </div>
                    <span className="text-xs font-mono text-slate-300 truncate">{user.email}</span>
                  </div>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onSignOut(); }}
                    className="w-full py-2.5 bg-rose-950/30 text-rose-400 border border-rose-900/20 rounded-xl text-xs font-bold font-mono text-center hover:bg-rose-900/30 transition-all"
                  >
                    Sign Out Session
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black font-mono text-center shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
                >
                  Sign In Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION / SECURE TERMINAL INGRESS */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Slogan & Copywriting text */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] mx-auto lg:mx-0">
            <Cpu size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-300 uppercase">CHIDON IQ v4.5.0 ONLINE</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight">
              Sovereign Intelligence <br />
              For The <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Creator Epoch</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Bypass recommendation decay channels, diagnose shadowban blockades, and synthesize high-retention copy formats instantly using structured behavioral psychology.
            </p>
          </div>

          {/* Quick Active Stats Panel */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
            {operationalStats.map((stat, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-900 p-3 rounded-2xl text-center">
                <span className="text-lg sm:text-xl font-mono font-black text-amber-500 block">{stat.value}</span>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-2xl font-bold text-sm shadow-[0_8px_25px_rgba(245,158,11,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer border border-amber-400/25"
            >
              <span>Activate Intellectual Interface</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl font-semibold text-sm transition-all text-center"
            >
              Explore Features List
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tracking-tight justify-center lg:justify-start">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>Encapsulated Environment Matrix Activated</span>
          </div>
        </div>

        {/* INTERACTIVE HIGH-FI CYBERNETIC PREVIEW PANEL */}
        <div className="lg:col-span-5 relative">
          <div className="w-full bg-[#070b14] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-2xl pointer-events-none" />
            
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">CHIDON_SECURE_PROTOCOL.sh</span>
            </div>

            {/* Commencing Protocol Animation Screen */}
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black shrink-0">&gt;</span>
                <p className="text-slate-300">Initializing cognitive handshake with Gemini pipelines...</p>
              </div>
              
              <div className="flex items-start gap-2.5">
                <span className="text-amber-500 font-black shrink-0">&gt;</span>
                <div className="space-y-1">
                  <p className="text-amber-500">CHIDON IQ: COMMENCING SECURE PROTOCOLS.</p>
                  <p className="text-[10px] text-slate-500">Security signature verified. Encryption tunnel ready.</p>
                </div>
              </div>

              {/* Status checklist block */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">NEURAL ENGINE UPLINK</span>
                  <span className="text-[9px] bg-amber-950/50 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-black">STABLE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">DAILY CREDIT ENGINES</span>
                  <span className="text-[9px] bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">+2 DAILY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">PAYSTACK TRANSACTION CORE</span>
                  <span className="text-[9px] bg-blue-950/50 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-black">ACTIVE</span>
                </div>
              </div>

              {/* Wallet Progress Indicator */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Wallet size={10} className="text-amber-500" /> Neural Wallet Balance</span>
                  <span className="text-white font-bold">100% SECURED</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full w-[85%]" />
                </div>
              </div>
            </div>

            {/* Quick Promo Prompt Button */}
            <button 
              onClick={onEnter}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 rounded-xl transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-mono text-amber-500 font-extrabold uppercase tracking-wider">Access Main Terminal Console</span>
              <ChevronRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SHOWCASE SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 pt-24 md:pt-32">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono font-black tracking-[0.25em] text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-900/60 px-3 py-1 rounded-full inline-block">THE TECHNICAL MATRIX</span>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
            Showcase Collection: Custom Features
          </h2>
          <p className="text-slate-400 text-sm">
            Explore the bespoke neural instruments built directly inside the Chidon IQ interface. Unify your digital workspace metrics under one secure sovereign frame.
          </p>

          {/* Filtering Tabs */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {(['all', 'content', 'security', 'ops'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full font-mono text-xs border transition-all uppercase tracking-wider ${
                  activeTab === tab 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold' 
                    : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeatures.map((factor, idx) => (
            <motion.div
              layout
              key={factor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#070b14] border border-slate-900 text-cyan-400 group-hover:border-cyan-500/20 transition-colors">
                    {factor.icon}
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-full font-black">
                    {factor.category} sector
                  </span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[8px] font-mono text-cyan-400 font-black uppercase tracking-widest block">{factor.tag}</span>
                  <h4 className="text-lg font-display font-black text-slate-100 uppercase group-hover:text-cyan-400 transition-colors">{factor.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans font-medium">
                    {factor.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-cyan-500" /> Fully operational</span>
                <button onClick={onEnter} className="text-cyan-400 hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-bold text-[10px] uppercase">
                  Launch {factor.id === 'shadowban' ? 'Diagnostic' : 'Tool'} &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION / REDIRECTION GATES */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 text-center">
        <div className="bg-gradient-to-b from-[#070b14] to-slate-950 border border-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden space-y-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-44 h-44 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-violet-500/5 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-900/60 px-3 py-1 rounded-full inline-block">PREMIUM PACKAGES</span>
            <h3 className="text-3xl md:text-4xl font-display font-black text-white uppercase leading-tight">
              Ready to Upgrade? <br />
              Secure Unlimited Cognitive Power
            </h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans leading-relaxed">
              Take complete command of the social algorithm. Click the Pricing button below to redirect instantly to the active Chidon IQ packages & checkout ledger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4">
            <button 
              onClick={onNavigateToPricing}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Redirect To Pricing Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={onEnter}
              className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl font-semibold text-sm transition-all text-center"
            >
              Explore Free Tier First
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
