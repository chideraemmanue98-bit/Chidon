import React from 'react';
import { motion } from 'motion/react';
import { ChidonLogo } from './ChidonLogo';
import { 
  Zap, ArrowRight, CheckCircle, ShieldAlert, Cpu, 
  Globe2, Sparkles, TrendingUp, Users, Target, CircleDot 
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
    <div className="fixed inset-0 z-[1000] w-full h-full bg-slate-950 flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto select-none selection:bg-cyan-500/30">
      {/* Immersive Cyber Ambient Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-600/10 filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* Main Structural Frame */}
      <div className="w-full max-w-4xl my-auto py-12 flex flex-col items-center gap-10">
        
        {/* Top Header Section */}
        <div className="flex flex-col items-center space-y-4 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 to-slate-900 border-2 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <CircleDot size={10} className="text-cyan-400 animate-ping" />
            <span className="text-[9px] font-mono font-black tracking-[0.25em] text-cyan-300 uppercase">CHIDON IQ SOCIAL PARADOX V4</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-3 mt-2"
          >
            <ChidonLogo size="lg" iconOnly />
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white">
              Chidon<span className="text-cyan-400 font-extrabold ml-1">IQ</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xs md:text-sm font-sans font-medium text-slate-400 tracking-wide uppercase leading-relaxed font-semibold"
          >
            Shaping Modern Social Media Through Neural Strategy & Cognitive Curation
          </motion.p>
        </div>

        {/* Central Overview: Influence and Narrative Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full bg-slate-900/40 border-2 border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden"
        >
          {/* Subtle grid accent inside card */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.12),transparent_60%)] pointer-events-none" />

          {/* Left Block: Narrative of Influence */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 relative z-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-900/60 px-2.5 py-1 rounded-md inline-block">THE POWER GAP</span>
              <h2 className="text-2xl font-display font-extrabold text-white leading-tight">
                How Chidon IQ Influences Social Media Today
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                Standard feeds are locked behind recommendation loops designed to trap both creators and audiences. 
                <strong className="text-cyan-400"> Chidon IQ actively breaks these parameters.</strong> By leveraging calculated, high-contrast psychological hook guides and search-grounded text, it turns unpredictable algorithms into consistent, high-conversion growth flywheels.
              </p>
            </div>

            {/* Core Live Stats Widget panel */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
              {operationalStats.map((stat, idx) => (
                <div key={idx} className="space-y-1 bg-slate-950/40 border border-white/5 p-2 rounded-xl text-center">
                  <span className="text-base md:text-lg font-mono font-black text-cyan-400 block">{stat.value}</span>
                  <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider For desktop */}
          <div className="hidden lg:block lg:col-span-1 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent my-4" />

          {/* Right Block: Technical Influence Matrix points */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4 relative z-10">
            {coreInfluenceFactors.map((factor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                className="p-4 rounded-2xl border border-white/5 bg-slate-950/30 hover:bg-slate-950/50 transition-all hover:border-cyan-500/20 group"
              >
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                    {factor.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-cyan-500 font-bold uppercase tracking-widest block">{factor.tag}</span>
                    <h3 className="text-xs font-mono font-black text-slate-100 uppercase">{factor.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                      {factor.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action and Disclaimer block */}
        <div className="flex flex-col items-center gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={onEnter}
            id="launch-chidon-btn"
            className="w-full max-w-sm group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold font-sans text-sm shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] transition-all duration-300 cursor-pointer border border-cyan-400/25"
          >
            <span>Activate Intellectual Interface</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </motion.button>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-tight justify-center">
            <CheckCircle size={11} className="text-emerald-500" />
            <span>Encapsulated Local Environment Matrix Activated Successfully</span>
          </div>
        </div>

      </div>
    </div>
  );
};
