import React from 'react';
import { motion } from 'motion/react';
import { ChidonLogo } from './ChidonLogo';
import { 
  Zap, ArrowRight, CheckCircle, ShieldAlert, Cpu, 
  Globe2, TrendingUp, Users, Target, CircleDot 
} from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const coreInfluenceFactors = [
    {
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      tag: "ALGORITHMIC DISRUPTION",
      title: "Algorithmic Ingress Strategy",
      desc: "Chidon IQ filters organic noise, bypasses algorithmic shadow bans, and crafts optimized scripts that capture attention before standard recomendation systems decay."
    },
    {
      icon: <Globe2 className="w-5 h-5 text-emerald-400" />,
      tag: "OMNI-CHANNEL DOMINANCE",
      title: "The Multi-Platform Epoch",
      desc: "In an era of hyper-saturated feeds, Chidon IQ operates as an intelligence buffer, transforming a single content idea into cross-platform hooks tuned for Instagram, TikTok, and YouTube."
    },
    {
      icon: <Users className="w-5 h-5 text-purple-400" />,
      tag: "BEHAVIORAL PSYCHOLOGY",
      title: "Psychological Retention Loops",
      desc: "By infusing advanced behavioral hooks and structured copywriting grids, Chidon IQ helps creators maintain a 2.4x higher viewer retention rate past the critical 3-second attention gate."
    }
  ];

  const operationalStats = [
    { label: "Reach Acceleration", value: "+240%" },
    { label: "Viewer Hook Index", value: "92.8%" },
    { label: "Neural Ops Synced", value: "48 / Sec" }
  ];

  return (
    <div className="fixed inset-0 z-[1000] w-full h-full bg-slate-950 flex items-center justify-center p-4 select-none selection:bg-cyan-500/30 overflow-hidden">
      {/* Immersive Cyber Ambient Backgrounds (Stagnant) */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-600/10 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-violet-600/10 filter blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* 9:16 Professional Device Frame Container */}
      <div className="w-[390px] max-w-full h-[693px] max-h-full aspect-[9/16] rounded-[36px] bg-slate-900 border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex flex-col relative shrink-0">
        
        {/* Notch / Speaker Simulator for Desktop Device Mockup */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-900 rounded-full" />
        </div>

        {/* Dynamic Header Overlay inside 9:16 frame for luxury feel */}
        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none z-10" />

        {/* Scrollable Content Inside Device Frame */}
        <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8 space-y-8 scrollbar-thin relative z-0">
          
          {/* Header Badge */}
          <div className="flex flex-col items-center text-center pt-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <CircleDot size={8} className="text-cyan-400" />
              <span className="text-[8px] font-mono font-black tracking-[0.2em] text-cyan-300 uppercase">CHIDON IQ V4</span>
            </div>

            {/* Logo and Branding */}
            <div className="flex items-center gap-2 mt-4">
              <ChidonLogo size="sm" iconOnly />
              <h1 className="text-3xl font-display font-black tracking-tight text-white">
                Chidon<span className="text-cyan-400 font-extrabold ml-0.5">IQ</span>
              </h1>
            </div>

            <p className="text-[10px] font-sans font-semibold text-slate-400 tracking-wide uppercase mt-2 max-w-xs leading-relaxed">
              Neural Strategy & Cognitive Curation
            </p>
          </div>

          {/* Central Narrative Block */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden space-y-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_60%)] pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <span className="text-[8px] font-mono font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-900/60 px-2 py-0.5 rounded inline-block">THE POWER GAP</span>
              <h2 className="text-lg font-display font-extrabold text-white leading-tight">
                How Chidon IQ Influences Social Media Today
              </h2>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
                Standard feeds are locked in recommendation loops.
                <strong className="text-cyan-400 font-semibold"> Chidon IQ breaks these barriers.</strong> By utilizing high-contrast psychological hook guides, it turns unpredictable algorithms into consistent growth flywheels.
              </p>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 relative z-10">
              {operationalStats.map((stat, idx) => (
                <div key={idx} className="space-y-0.5 bg-slate-950/60 border border-white/5 p-1.5 rounded-lg text-center">
                  <span className="text-xs font-mono font-black text-cyan-400 block">{stat.value}</span>
                  <span className="text-[7px] font-mono text-slate-400 font-bold uppercase tracking-wider block leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Influence factors */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">TECHNICAL MATRIX INGRESS</h3>
            <div className="space-y-3">
              {coreInfluenceFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 hover:border-cyan-500/15 transition-all"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-cyan-400 shrink-0">
                      {factor.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[7px] font-mono text-cyan-500 font-bold uppercase tracking-widest block">{factor.tag}</span>
                      <h4 className="text-[10px] font-mono font-black text-slate-200 uppercase">{factor.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                        {factor.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-4 pt-2">
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-center shadow-[0_0_10px_rgba(6,182,212,0.05)]">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-extrabold text-[10px] font-mono tracking-wider">
                <Zap size={11} className="animate-pulse text-cyan-400" />
                <span>UNLIMITED WORKSPACE POWERED</span>
              </div>
              <p className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase tracking-tight">
                Full unlimited access to all advanced tools and features
              </p>
            </div>

            <button
              onClick={onEnter}
              id="launch-chidon-btn"
              className="w-full group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold font-sans text-xs shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer border border-cyan-400/20"
            >
              <span>Activate Intellectual Interface</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono tracking-tight justify-center">
              <CheckCircle size={10} className="text-emerald-500" />
              <span>Encapsulated Environment Matrix Activated</span>
            </div>
          </div>

        </div>

        {/* Dynamic Footer Overlay inside 9:16 frame for luxury feel */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-10" />

      </div>
    </div>
  );
};
