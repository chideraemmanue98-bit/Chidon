import React, { useState } from 'react';
import { ChidonLogo } from './ChidonLogo';
import { 
  Zap, ArrowRight, CheckCircle, CircleDot, 
  Terminal, Activity, Network, Cpu, Layers, Globe, Sparkles, TrendingUp
} from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'strategy'>('dashboard');

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  const tabsInfo = {
    dashboard: {
      tag: "ALGORITHMIC DISRUPTION",
      title: "Neural Feed Ingress & Trend Scanning",
      desc: "Chidon IQ scans organic noise, bypasses recommendation loops, and filters content signals before saturation occurs. It acts as an active intelligence buffer for real-time social metrics.",
      stats: [
        { label: "Data Nodes Swept", value: "24,800/min" },
        { label: "Signal Precision", value: "98.4%" },
        { label: "Latency", value: "12ms" }
      ],
      points: [
        "Anti-shadowban signature verification",
        "Deep-scrape competitor algorithmic tracking",
        "Autonomous multi-platform trend identification"
      ],
      color: "from-cyan-500/10 to-blue-500/5",
      accent: "text-cyan-400 border-cyan-500/30",
      buttonBg: "bg-cyan-500/10 text-cyan-300"
    },
    engine: {
      tag: "DYNAMIC GENERATION",
      title: "Omni-Channel Content Refiner",
      desc: "Chidon IQ turns a single seed concept into optimized, hyper-converting content streams tailored specifically for YouTube SEO, TikTok hooks, and LinkedIn growth loops simultaneously.",
      stats: [
        { label: "Hook Optimization", value: "x3.4 Ratio" },
        { label: "Text Compression", value: "Dynamic" },
        { label: "Token Response", value: "Instant" }
      ],
      points: [
        "Structured psychological copywriting grids",
        "Dynamic tag, hashtag, and script optimization",
        "High-contrast formatting tailored for feed-scrolling"
      ],
      color: "from-purple-500/10 to-pink-500/5",
      accent: "text-purple-400 border-purple-500/30",
      buttonBg: "bg-purple-500/10 text-purple-300"
    },
    strategy: {
      tag: "EXPONENTIAL REACH",
      title: "Strategic Growth Acceleration",
      desc: "Move past standard recommendation algorithms. Chidon IQ's strategy matrices provide calculated psychological hooks and growth-hacking patterns to scale organic viewer retention past the 3-second attention gate.",
      stats: [
        { label: "Reach Multiplier", value: "240% Boost" },
        { label: "Retention Index", value: "92.8%" },
        { label: "Conversion Rate", value: "4.8x" }
      ],
      points: [
        "Calculated viral hook triggers",
        "Structured scheduling templates and pacing",
        "Audience psychological retention engineering"
      ],
      color: "from-emerald-500/10 to-teal-500/5",
      accent: "text-emerald-400 border-emerald-500/30",
      buttonBg: "bg-emerald-500/10 text-emerald-300"
    }
  };

  const currentTab = tabsInfo[activeTab];

  return (
    <div className="fixed inset-0 z-[1000] w-full h-full bg-[#030307] flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto select-none selection:bg-cyan-500/30 scroll-smooth">
      {/* Immersive Cyber Ambient Backgrounds - Made Static & Non-Moving */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/5 filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/5 filter blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(to_right,#09090e_1px,transparent_1px),linear-gradient(to_bottom,#09090e_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-25 pointer-events-none" />

      {/* Main Structural Frame - Removed my-auto to prevent layout shifting on small screens */}
      <div className="w-full max-w-5xl py-12 md:py-20 flex flex-col items-center gap-10 relative z-10">
        
        {/* Top Header Section */}
        <div className="flex flex-col items-center space-y-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <CircleDot size={10} className="text-cyan-400" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">CHIDON IQ SOCIAL PARADOX V4</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <ChidonLogo size="lg" iconOnly />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              Chidon<span className="text-cyan-400 font-black ml-1">IQ</span>
            </h1>
          </div>

          <p className="text-xs md:text-sm font-mono text-slate-400 tracking-wide uppercase font-bold">
            Empowering Modern Social Creators through Neural Strategy, Copywriting Intelligence & Algorithmic Optimization
          </p>
        </div>

        {/* Interactive Tabs Selection Grid */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xl bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {(['dashboard', 'engine', 'strategy'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              dashboard: { title: "Neural Ingress", sub: "Scan Trends" },
              engine: { title: "AI Processor", sub: "Refine Media" },
              strategy: { title: "Reach Matrix", sub: "Harness Growth" }
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 rounded-xl transition-colors duration-200 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer ${
                  isActive 
                    ? "bg-slate-800 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 pointer-events-none" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider block font-sans">{labels[tab].title}</span>
                <span className="text-[9px] font-mono opacity-65 uppercase block tracking-tight mt-0.5">{labels[tab].sub}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Rebuild - Replaced high-motion/animate-presence layout with a stable solid design */}
        <div className={`w-full bg-gradient-to-b ${currentTab.color} border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-2xl shadow-3xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}>
          {/* Subtle static overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.05),transparent_70%)] pointer-events-none" />

          {/* Left Block: Narrative / Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 relative z-10">
            <div className="space-y-4 text-left">
              <span className={`text-[10px] font-mono font-black border px-2.5 py-1 rounded-md inline-block uppercase tracking-wider ${currentTab.accent}`}>
                {currentTab.tag}
              </span>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight font-sans tracking-tight uppercase">
                {currentTab.title}
              </h2>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                {currentTab.desc}
              </p>

              {/* Bullet Points */}
              <ul className="space-y-2.5 pt-2">
                {currentTab.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 font-sans">
                    <CheckCircle size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/5">
              {currentTab.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1 bg-[#05050a]/60 border border-white/5 p-2.5 rounded-xl text-center">
                  <span className="text-sm md:text-base font-mono font-bold text-cyan-300 block">{stat.value}</span>
                  <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Interactive CSS Mock Interfaces */}
          <div className="lg:col-span-7 w-full h-full flex items-center justify-center relative z-10">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)] bg-slate-950 flex flex-col p-4 font-mono text-[10px] text-slate-300">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              {activeTab === 'dashboard' && (
                <div className="flex-1 flex flex-col justify-between h-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full filter blur-2xl animate-pulse" />
                  
                  {/* Mock Trend Chart */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider">NEURAL FEED INGRESS STATE</span>
                    <span className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">SWEEPING FORWARD_NODES...</span>
                  </div>
                  
                  <div className="flex-1 flex items-end gap-1.5 py-4 border-b border-white/5 relative h-32">
                    {/* Animated chart bars */}
                    {[40, 65, 45, 80, 55, 95, 70, 85, 60, 75, 50, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-900 rounded-t overflow-hidden relative" style={{ height: '100%' }}>
                        <div 
                          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-300 rounded-t transition-all duration-1000 ease-in-out" 
                          style={{ height: `${h}%`, animation: `pulse 2s infinite ${i * 150}ms` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[9px] text-slate-400">
                    <div className="flex justify-between border-r border-white/5 pr-2">
                      <span>CTR SIGNATURES</span>
                      <span className="text-emerald-400 font-bold">VERIFIED</span>
                    </div>
                    <div className="flex justify-between pl-1">
                      <span>BYPASS SIGNALS</span>
                      <span className="text-cyan-400 font-bold">STABILIZED</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'engine' && (
                <div className="flex-1 flex flex-col justify-between h-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full filter blur-2xl animate-pulse" />

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-purple-400 font-bold uppercase tracking-wider">OMNI-CHANNEL CONTENT REFINER</span>
                    <span className="text-[9px] text-emerald-400 font-bold">LIVE_COMPRESSION</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 py-3 justify-center text-left text-[9px]">
                    <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-300 font-bold uppercase">[YOUTUBE SEO]</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-slate-400 truncate font-mono">Title: I analyzed 400 creators before discovering this 12-word bio layout modification...</p>
                    </div>

                    <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-pink-300 font-bold uppercase">[TIKTOK HOOK]</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-slate-400 truncate font-mono">Hook: "They burn $10,000 trying to scale, but bypass recommendation loops with this..."</p>
                    </div>

                    <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-300 font-bold uppercase">[LINKEDIN PROTOCOL]</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-slate-400 truncate font-mono">Body: "The follow graph is dead. Interest recommendation is the new neuromorphic core..."</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="flex-1 flex flex-col justify-between h-full relative text-left">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl animate-pulse" />

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">STRATEGIC ACCELERATION PIPELINE</span>
                    <span className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">FLOWCHECK: ACTIVE</span>
                  </div>

                  <div className="flex-1 flex items-center justify-between gap-2 px-4 py-6 relative z-10">
                    <div className="flex flex-col items-center gap-1.5 bg-slate-900/80 border border-white/10 p-2 rounded-xl w-[28%] text-center shadow-lg">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase">Attention Gate</span>
                      <span className="text-[12px] font-bold text-white font-mono">0.0s - 3.0s</span>
                      <span className="text-[7px] text-slate-400 uppercase font-bold">Negative Hook</span>
                    </div>

                    <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                    </div>

                    <div className="flex flex-col items-center gap-1.5 bg-slate-900/80 border border-white/10 p-2 rounded-xl w-[28%] text-center shadow-lg">
                      <span className="text-[8px] font-bold text-teal-400 uppercase">Retention Ramp</span>
                      <span className="text-[12px] font-bold text-white font-mono">12s - 24s</span>
                      <span className="text-[7px] text-slate-400 uppercase font-bold">Pattern Interrupt</span>
                    </div>

                    <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-40 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-teal-400 rounded-full animate-ping" />
                    </div>

                    <div className="flex flex-col items-center gap-1.5 bg-slate-900/80 border border-white/10 p-2 rounded-xl w-[28%] text-center shadow-lg">
                      <span className="text-[8px] font-bold text-cyan-400 uppercase">CTA Gateway</span>
                      <span className="text-[12px] font-bold text-white font-mono">End-of-Loop</span>
                      <span className="text-[7px] text-slate-400 uppercase font-bold">Single-Link</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Micro tech terminal label layer */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Terminal size={11} className="text-cyan-400" />
                <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest font-black">CHIDON_SYS_ACTIVE</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Activity size={11} className="text-purple-400" />
                <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest font-black">DYNAMIC_SYS_RENDER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action and Disclaimer block */}
        <div className="flex flex-col items-center gap-5 w-full mt-2">
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl px-6 py-3.5 text-center max-w-sm w-full shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="flex flex-col gap-1 items-center justify-center text-cyan-300 font-bold text-[11px] font-mono tracking-wider">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-cyan-400 animate-pulse" />
                <span>+3 WELCOME CREDITS GRANTED</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-black tracking-widest">+1 FREE DAILY CREDIT ENROLLED</span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-1.5 uppercase tracking-tight font-semibold">
              Get started with 3 one-time welcome credits, plus 1 free credit daily!
            </p>
          </div>

          <button
            onClick={onEnter}
            id="launch-chidon-btn"
            className="w-full max-w-sm group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold font-sans text-sm shadow-[0_10px_30px_rgba(6,182,212,0.25)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.4)] transition-all duration-300 cursor-pointer border border-cyan-400/25"
          >
            <span>Activate Intellectual Workspace</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-tight justify-center font-semibold">
            <CheckCircle size={11} className="text-emerald-500" />
            <span>Encapsulated Local Environment Matrix Activated Successfully</span>
          </div>
        </div>

      </div>
    </div>
  );
};
