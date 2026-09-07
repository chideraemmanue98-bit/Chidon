import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Cpu, 
  Activity, 
  LineChart, 
  Layers, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  FileText,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types for interactive sandbox
interface HeadlineFormula {
  id: string;
  category: string;
  name: string;
  template: string;
  multiplier: number;
  tips: string;
}

const STATIC_FORMULAS: HeadlineFormula[] = [
  { 
    id: 'curiosity', 
    category: 'Curiosity Loop', 
    name: 'The Closed Loop', 
    template: 'This simple trick changed my workspace forever...', 
    multiplier: 1.45, 
    tips: 'Ensure the thumbnail creates the visual open loop to double conversion.' 
  },
  { 
    id: 'academic', 
    category: 'Analytical Framework', 
    name: 'The Structural Proof', 
    template: 'How we scaled our contract revenue by 342% using math.', 
    multiplier: 1.25, 
    tips: 'Pair with high contrast monochrome visuals for premium readability.' 
  },
  { 
    id: 'antagonist', 
    category: 'Contrarian Contrast', 
    name: 'The Myth Buster', 
    template: 'Why everything you were told about freelance is completely false.', 
    multiplier: 1.62, 
    tips: 'Use warm neutral accents on keywords to stimulate cognitive friction.' 
  },
  { 
    id: 'urgency', 
    category: 'Tactical Urgency', 
    name: 'The Temporal Shield', 
    template: 'Stop doing this before the new algorithms update next week.', 
    multiplier: 1.50, 
    tips: 'Highlight the temporal deadline in high contrast amber backgrounds.' 
  }
];

export const LightDesignAnalytics = () => {
  // Theme state check (inherits Tailwind .dark or normal light mode beautifully)
  const [selectedTab, setSelectedTab] = useState<'reach' | 'engagement' | 'retention'>('reach');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [optimizationScore, setOptimizationScore] = useState(88);
  
  // Metric Sliders
  const [ctr, setCtr] = useState(6.4);
  const [retention, setRetention] = useState(48);
  const [viralWeight, setViralWeight] = useState(72);

  // Interactive Sandbox
  const [headlineQuery, setHeadlineQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<HeadlineFormula>(STATIC_FORMULAS[0]);
  const [customMultiplier, setCustomMultiplier] = useState(1.0);

  // Dynamic calculations for predicted reach
  const predictedMetrics = useMemo(() => {
    const rawReach = Math.round((ctr * 15000) * (retention / 25) * (viralWeight / 50));
    const rawScore = Math.min(100, Math.round((ctr * 6) + (retention * 0.8) + (viralWeight * 0.4)));
    const predictedRevenue = Math.round(rawReach * 0.0042 * (selectedTab === 'engagement' ? 1.4 : 1.0));
    
    return {
      reach: rawReach,
      score: rawScore,
      revenue: predictedRevenue
    };
  }, [ctr, retention, viralWeight, selectedTab]);

  // Handle active optimization trigger
  const runOptimization = () => {
    setIsOptimizing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsOptimizing(false);
            setOptimizationScore(97);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Preset Headline Select
  const handlePresetSelect = (preset: HeadlineFormula) => {
    setSelectedPreset(preset);
    setHeadlineQuery(preset.template);
    setCustomMultiplier(preset.multiplier);
  };

  // Custom Headline multi score calculation
  const customScore = useMemo(() => {
    let score = 50;
    if (headlineQuery.length > 10) score += 10;
    if (headlineQuery.length > 30) score += 12;
    if (headlineQuery.includes('...')) score += 8;
    if (headlineQuery.match(/\d%/)) score += 15;
    if (headlineQuery.toLowerCase().includes('how') || headlineQuery.toLowerCase().includes('why')) score += 8;
    
    // Scale by selected multiplier
    return Math.min(100, Math.round(score * customMultiplier));
  }, [headlineQuery, customMultiplier]);

  return (
    <div className="space-y-8 w-full">
      {/* Visual Header Banner */}
      <div className="card-base p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-950 dark:via-[#0E1321] dark:to-slate-900 border border-slate-200/60 dark:border-indigo-500/10 rounded-3xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand/5 to-cyan-500/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] uppercase tracking-wider font-extrabold">
              <Zap size={11} className="animate-spin" />
              <span>Light-Coded Design System</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] tracking-tight">
              NEURAL DIAGNOSTICS & SYNC CENTER
            </h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-xl leading-relaxed">
              Explore custom high-performance visual parameters, audit direct algorithmic multipliers, and orchestrate synchronization states with sub-millisecond precision.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm">
            <div className="text-left pr-4 pl-2 font-mono">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Global Integrity</span>
              <span className="text-base font-black text-brand">{optimizationScore}% Sync</span>
            </div>
            <button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold font-mono text-[11px] uppercase tracking-wide flex items-center gap-2 cursor-pointer transition-all active:scale-95",
                isOptimizing 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                  : "bg-brand text-white hover:bg-brand/90 shadow-sm"
              )}
            >
              <RefreshCw size={12} className={cn(isOptimizing && "animate-spin")} />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize Node Sync'}</span>
            </button>
          </div>
        </div>

        {/* Sync Progress Loader bar */}
        {isOptimizing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <motion.div 
              className="h-full bg-brand"
              initial={{ width: '0%' }}
              animate={{ width: `${syncProgress}%` }}
              transition={{ ease: 'easeInOut' }}
            />
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Interactive Algorithm Parameters */}
        <div className="lg:col-span-1 card-base p-6 bg-white dark:bg-[#0F1424] border border-slate-200/60 dark:border-indigo-500/10 rounded-3xl space-y-6 text-left shadow-sm">
          <div className="border-b border-slate-100 dark:border-white/5 pb-4">
            <span className="text-[10px] font-mono font-bold text-brand bg-brand/10 px-2.5 py-1 rounded border border-brand/20 uppercase tracking-widest">DIAGNOSTIC METRIC WEIGHT</span>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-1 uppercase">Algorithmic Projector</h3>
          </div>

          <div className="space-y-5">
            {/* Click-Through Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-bold text-[var(--text-secondary)]">Estimated CTR</span>
                <span className="text-brand font-extrabold">{ctr.toFixed(1)}%</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="20.0" 
                step="0.1"
                value={ctr} 
                onChange={(e) => setCtr(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand"
              />
            </div>

            {/* Retention Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-bold text-[var(--text-secondary)]">Average Retention</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">{retention}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={retention} 
                onChange={(e) => setRetention(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Viral Coefficient Weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-bold text-[var(--text-secondary)]">Viral Distribution Weight</span>
                <span className="text-amber-500 dark:text-amber-400 font-extrabold">{viralWeight}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={viralWeight} 
                onChange={(e) => setViralWeight(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Metric Projections Display */}
          <div className="p-4 bg-slate-50 dark:bg-[#070912] rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
            <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Estimated Operational Outlook</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Predicted Reach</span>
                <span className="text-lg font-black text-[var(--text-primary)]">{predictedMetrics.reach.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Organic Income Pool</span>
                <span className="text-lg font-black text-brand">${predictedMetrics.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-[var(--text-secondary)] block font-mono">NEURAL MULTIPLIER INDEX</span>
              <span className="text-[10px] font-mono font-black text-brand bg-brand/10 px-2.5 py-0.5 rounded border border-brand/20">
                SCORE: {predictedMetrics.score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Custom SVG Chart */}
        <div className="lg:col-span-2 card-base p-6 bg-white dark:bg-[#0F1424] border border-slate-200/60 dark:border-indigo-500/10 rounded-3xl space-y-6 text-left shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">TACTICAL PROJECTION PATH</span>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1 uppercase">Content Vector Projection</h3>
            </div>

            {/* Projection Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
              {(['reach', 'engagement', 'retention'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer",
                    selectedTab === tab
                      ? "bg-white dark:bg-slate-800 text-brand shadow-sm font-black"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Vector Chart */}
          <div className="relative h-60 w-full flex items-center justify-center bg-slate-50/50 dark:bg-[#070912]/50 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden p-4">
            {/* Static Grid lines */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-40">
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-b border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-slate-200/50 dark:border-white/5" />
              <div className="border-r border-slate-200/50 dark:border-white/5" />
              <div className="border-slate-200/50 dark:border-white/5" />
            </div>

            {/* Render vector path based on selection */}
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible z-10 drop-shadow-[0_4px_12px_rgba(79,70,229,0.15)]">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {selectedTab === 'reach' && (
                <>
                  <path 
                    d={`M 0,160 Q 125,${160 - ctr * 3} 250,${140 - ctr * 5} T 500,${180 - predictedMetrics.reach / 3000}`}
                    fill="none" 
                    stroke="#4F46E5" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d={`M 0,160 Q 125,${160 - ctr * 3} 250,${140 - ctr * 5} T 500,${180 - predictedMetrics.reach / 3000} L 500,200 L 0,200 Z`}
                    fill="url(#chart-grad)" 
                  />
                </>
              )}

              {selectedTab === 'engagement' && (
                <>
                  <path 
                    d={`M 0,140 C 100,${150 - viralWeight * 0.5} 200,${100 - viralWeight * 0.8} 350,${130 - viralWeight * 0.6} T 500,${190 - viralWeight}`}
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d={`M 0,140 C 100,${150 - viralWeight * 0.5} 200,${100 - viralWeight * 0.8} 350,${130 - viralWeight * 0.6} T 500,${190 - viralWeight} L 500,200 L 0,200 Z`}
                    fill="none" 
                  />
                </>
              )}

              {selectedTab === 'retention' && (
                <>
                  <path 
                    d={`M 0,120 Q 150,${120 - retention * 0.4} 300,${110 - retention * 0.6} T 500,${150 - retention * 0.8}`}
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                </>
              )}

              {/* Data points */}
              <circle cx="250" cy="110" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="80" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Custom overlay stats */}
            <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-[#070912]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-white/5 text-[9px] font-mono z-20">
              <span className="text-emerald-500 font-bold">● LIVE ALGORITHMIC DYNAMICS ACTIVE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-grid: Nodes Health & Headline Sandbox */}
      <div className="w-full">
        
        {/* Card 4: Headline Sandbox Optimizer */}
        <div className="card-base p-6 bg-white dark:bg-[#0F1424] border border-slate-200/60 dark:border-indigo-500/10 rounded-3xl space-y-4 text-left shadow-sm w-full">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-widest">AI COGNITIVE SANDBOX</span>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-1 uppercase">Headline Quality Console</h3>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap gap-2 pt-1">
            {STATIC_FORMULAS.map(f => (
              <button
                key={f.id}
                onClick={() => handlePresetSelect(f)}
                className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-bold border cursor-pointer transition-all",
                  selectedPreset.id === f.id
                    ? "bg-amber-500 text-black border-amber-500 font-black"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {f.category}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-1">
            {/* Input sandbox field */}
            <div className="space-y-1 text-xs">
              <label className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">Test Headline Structure</label>
              <textarea
                value={headlineQuery}
                onChange={(e) => setHeadlineQuery(e.target.value)}
                placeholder="Draft your raw post titles, hooks or bio outlines here to optimize instant click velocity..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 text-sm font-sans font-medium text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            {/* Sandbox Evaluation Output */}
            <div className="p-4 bg-slate-50 dark:bg-[#070912] border border-slate-150 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase font-extrabold block">Algorithmic Conversion Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--text-primary)]">{customScore}</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">Velocity Score</span>
                </div>
              </div>

              <div className="space-y-1 flex-1 sm:max-w-[240px]">
                <span className="text-[9px] font-mono text-amber-500 dark:text-amber-400 font-black uppercase block">Operational Advice</span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {selectedPreset.tips}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
