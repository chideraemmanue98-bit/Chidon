import React, { useState } from 'react';
import { 
  Briefcase, Zap, Star, LayoutGrid, Users, Lock, ChevronRight, 
  Search, ShieldCheck, Play, ArrowRight, ArrowLeftRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// EXAMPLE 1: RESPONSIVE DASHBOARD HUB
// ==========================================
export const DashboardExample: React.FC = () => {
  const stats = [
    { label: "Total Escrow Locked", value: "$4,850 USD", subtext: "3 pending clearances", active: true },
    { label: "Released Earnings", value: "$12,400 USD", subtext: "Atomic payout cleared", active: false },
    { label: "Trust Score", value: "99.8%", subtext: "Top-tier specialist", active: false },
  ];

  const quickLinks = [
    { title: "SEO Keywords", desc: "Automate deep-scrape queries & trend detection", delay: "0.1s" },
    { title: "Video Scripting", desc: "Formulate ultra-retention hooks and outlines", delay: "0.2s" },
    { title: "Market Analytics", desc: "Audit search density and click-through rates", delay: "0.3s" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Dynamic Header Node */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-base)] pb-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[9px] font-mono font-bold uppercase tracking-widest">
            <Zap size={10} className="animate-pulse" />
            System Status: Connected
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
            Intelligence Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-prose leading-relaxed">
            Configure system states, analyze multi-platform performance indices, and initiate P2P social escrow connections directly.
          </p>
        </div>
        <button className="self-start md:self-auto px-5 py-3 bg-brand hover:bg-brand/90 text-white text-xs font-mono font-bold uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
          Refresh Metrics
        </button>
      </div>

      {/* Grid: 3 metrics on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={cn(
              "p-6 bg-[var(--bg-card)] border rounded-2xl shadow-sm hover:shadow-lg transition-all text-left relative overflow-hidden group",
              stat.active ? "border-brand/35 bg-brand/3" : "border-[var(--border-base)]"
            )}
          >
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider font-bold">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mt-2 font-mono">{stat.value}</p>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] block mt-1">{stat.subtext}</span>
          </div>
        ))}
      </div>

      {/* Grid for actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl hover:border-brand/30 hover:shadow-lg cursor-pointer transition-all space-y-2 text-left"
            >
              <h4 className="text-sm font-bold uppercase text-[var(--text-primary)] flex items-center gap-1">
                {link.title} <ChevronRight size={14} className="text-brand" />
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-prose">
                {link.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// EXAMPLE 2: SPLIT COGNITIVE TOOLS WORKSPACE (Tabs / Multi-Column Grid)
// ==========================================
export const ToolsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'preview' | 'analytics'>('prompt');
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="space-y-1">
        <h2 className="text-xl md:text-3xl font-extrabold uppercase text-[var(--text-primary)]">
          Omni-Channel Content refiner
        </h2>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-prose leading-relaxed">
          Inject a seed topic and refine into comprehensive content sequences. This workspace uses a fully side-by-side layout on desktop and tabbed columns on mobile to ensure no vertical scrolling fatigue.
        </p>
      </div>

      {/* DESKTOP SIDE-BY-SIDE GRID vs MOBILE TABBED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* INPUT FORM: Takes 5 columns on desktop, 100% on mobile */}
        <div className="lg:col-span-5 p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-4 shadow-sm text-left">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand">Configuration Settings</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[var(--text-primary)] block">Seed Keyword / Subject</label>
            <input 
              type="text" 
              placeholder="e.g. AI Workflow Secrets" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-base)] px-4 py-3 rounded-xl outline-none focus:border-brand text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[var(--text-primary)] block">Target Platform</label>
            <select className="w-full bg-[var(--bg-app)] border border-[var(--border-base)] px-4 py-3 rounded-xl outline-none focus:border-brand text-sm">
              <option>YouTube Longform & Scripts</option>
              <option>TikTok/Reels Hook Sequencer</option>
              <option>LinkedIn Narrative Blueprint</option>
            </select>
          </div>

          <button className="w-full py-3.5 bg-brand text-white font-mono text-xs font-bold uppercase rounded-xl transition-all hover:shadow-lg active:scale-95 cursor-pointer">
            Trigger Algorithmic Refinement
          </button>
        </div>

        {/* RESULTS FEED: Takes 7 columns on desktop, 100% on mobile */}
        <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl overflow-hidden flex flex-col shadow-sm text-left">
          
          {/* Header navigation tab row */}
          <div className="flex border-b border-[var(--border-base)] bg-[var(--bg-card)]">
            {(['prompt', 'preview', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                  activeTab === tab 
                    ? "border-brand text-brand bg-brand/5" 
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Render panel */}
          <div className="p-6 min-h-[260px] space-y-4">
            {activeTab === 'prompt' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[var(--text-primary)]">Constructed Ingress Prompt:</h4>
                <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-base)] font-mono text-xs text-[var(--text-secondary)] leading-relaxed max-w-prose">
                  Act as a Content Director. Create high-CTR blueprints for subject: "{inputValue || "AI Workflow Secrets"}" optimized for search discovery models...
                </div>
              </div>
            )}
            {activeTab === 'preview' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[var(--text-primary)]">Refinement Output:</h4>
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-prose">
                    Based on current saturation scans, we have generated this premium high-converting sequence structure for you:
                  </p>
                  <ul className="space-y-2 text-xs font-sans text-[var(--text-primary)]">
                    <li className="flex items-center gap-2">🟢 <strong className="font-bold">0-3s:</strong> The absolute cognitive pattern-interrupt hook</li>
                    <li className="flex items-center gap-2">🟢 <strong className="font-bold">3-15s:</strong> Unveiling the friction gap & systemic flaw</li>
                    <li className="flex items-center gap-2">🟢 <strong className="font-bold">15s+:</strong> The immediate workflow resolution protocol</li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[var(--text-primary)]">Calculated Performance Indicators:</h4>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-base)]">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase">RECONSTITUTE RATIO</span>
                    <p className="text-emerald-500 font-bold mt-1">98.4% Match</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-base)]">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase">ESTIMATED GROWTH BOOST</span>
                    <p className="text-brand font-bold mt-1">x3.4 Ratio</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};


// ==========================================
// EXAMPLE 3: GIGSOCIAL RESPONSIVE CREATOR DIRECTORY
// ==========================================
export const DirectoryExample: React.FC = () => {
  const developers = [
    { name: "John Doe", title: "Video Production Specialist", country: "United Kingdom", price: "$120", rating: 5.0, votes: 42, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
    { name: "Jane Smith", title: "Copywriting Architect", country: "United States", price: "$85", rating: 4.9, votes: 29, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
    { name: "Carlos Ruiz", title: "SEO Strategist & Auditor", country: "Spain", price: "$150", rating: 5.0, votes: 31, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl md:text-3xl font-extrabold uppercase text-[var(--text-primary)]">
            Verified Creator Nodes
          </h3>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-prose">
            Directly exchange services with accredited social specialists globally without payment middlemen.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3.5 top-3.5 text-slate-400"><Search size={14} /></span>
          <input 
            type="text" 
            placeholder="Filter specialists..." 
            className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
          />
        </div>
      </div>

      {/* Grid: 3 per row on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev, idx) => (
          <div 
            key={idx} 
            className="bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between"
          >
            {/* Top Image: Aspect-ratio locked, no-stretch cover */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-[var(--border-base)]">
              <img 
                src={dev.img} 
                alt={dev.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded-lg font-mono text-[9px] text-white tracking-wider uppercase font-black">
                {dev.country}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-[var(--text-primary)] uppercase tracking-tight">{dev.name}</h4>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                    <Star size={12} className="fill-yellow-500" />
                    <span>{dev.rating} ({dev.votes})</span>
                  </div>
                </div>
                <p className="text-xs font-mono text-brand uppercase font-semibold">{dev.title}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-prose">
                  Accredited specialist offering direct commissioning channels with zero platform deductions.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-base)] pt-4 mt-2">
                <div>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase">HOURLY RATE:</span>
                  <p className="text-sm font-mono text-[var(--text-primary)] font-black">{dev.price}/hr</p>
                </div>
                <button className="px-4 py-2 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer">
                  Initiate chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
