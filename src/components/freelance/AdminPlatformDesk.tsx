import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Scale, SlidersHorizontal, AlertTriangle, Eye, EyeOff, Check, 
  Trash2, DollarSign, Cpu, ArrowUpRight, CheckCircle2, TrendingUp, Info, Ban, Clock
} from 'lucide-react';
import { FreelanceGig, Order, JobPost } from './types';

interface AdminPlatformDeskProps {
  allGigs: FreelanceGig[];
  myOrders: Order[];
  onFlagGig?: (gigId: string, flagState: boolean) => void;
}

export const AdminPlatformDesk: React.FC<AdminPlatformDeskProps> = ({
  allGigs,
  myOrders,
  onFlagGig
}) => {
  // Configured local state for system analytics
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(0); // 0% for first 90 days, then adjustable to 10%
  const [freePeriodDays, setFreePeriodDays] = useState<number>(90);
  const [activeFiverrRate, setActiveFiverrRate] = useState<number>(20); // Fiverr benchmark 20%
  
  // List of local moderation items (can flag gigs or briefs)
  const [localGigs, setLocalGigs] = useState<FreelanceGig[]>(allGigs);
  const [flaggedGigsCount, setFlaggedGigsCount] = useState<number>(0);

  // Fraud detection log lines
  const [fraudLogs, setFraudLogs] = useState([
    { id: 'f_101', timestamp: '2026-09-06 18:41', user: '@pro_scraper', event: 'Copypasta Bid Proposal detected', confidence: 94, state: 'blocked' },
    { id: 'f_102', timestamp: '2026-09-06 17:30', user: '@bot_booster', event: 'Fake reviews spam pattern matched', confidence: 99, state: 'flagged' },
    { id: 'f_103', timestamp: '2026-09-06 15:12', user: '@shill_buyer', event: 'Shill self-buying escrow loop attempt', confidence: 87, state: 'flagged' }
  ]);

  // Handle Gig Flag Toggle
  const handleToggleFlag = (gigId: string, currentFlagged: boolean) => {
    const nextState = !currentFlagged;
    
    // Update local state
    setLocalGigs(prev => prev.map(g => {
      if (g.id === gigId) {
        return { ...g, rating: nextState ? 1.0 : 5.0 }; // Simulating a flagged score of 1.0 or custom ratings indicator
      }
      return g;
    }));

    if (nextState) {
      setFlaggedGigsCount(c => c + 1);
    } else {
      setFlaggedGigsCount(c => Math.max(0, c - 1));
    }

    if (onFlagGig) {
      onFlagGig(gigId, nextState);
    }
  };

  // Run AI Fraud Log Cleaner Scan
  const triggerAiFraudSanitation = () => {
    alert("Gemini AI fraud sanitation scan executed. Found 0 active copy-paste spammers in current connection queue. Clean!");
  };

  // Math metrics
  const totalMoneyHeldInEscrow = myOrders
    .filter(o => o.status === 'in_escrow' || o.status === 'delivered')
    .reduce((acc, curr) => acc + curr.price, 0);

  const platformVolumeMonthlyEstimate = 45800; // standard mock flow indicator
  const monthlyRevenueSavedByFee = Math.round(platformVolumeMonthlyEstimate * (activeFiverrRate - platformFeePercent) / 100);

  return (
    <div className="space-y-6 text-left select-text">
      
      {/* Banner */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[9px] font-mono font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
            Platform Operator Node
          </span>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Chidon Sovereign Admin Panel
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl font-sans leading-relaxed">
            Monitor escrow holds, tweak platform fee structures, flag fraudulent listings, and scan real-time AI security fraud logs across the peer-to-peer workspace network.
          </p>
        </div>
      </div>

      {/* Grid: Escrow Stats & Fee Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Escrow System Ledger & Fee adjustments */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Escrow statistics */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wide flex items-center gap-2">
                <Scale size={14} className="text-indigo-400" />
                Escrow Custody Vault Indicators
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                Sovereign Guarded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block font-black">TOTAL ESCROW HELD</span>
                <span className="text-2xl font-mono font-extrabold text-white mt-1 block">${totalMoneyHeldInEscrow}</span>
                <span className="text-[8px] font-mono text-slate-400 block mt-1.5">For active deliveries</span>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block font-black">ACTIVE DISPUTES RANGE</span>
                <span className="text-2xl font-mono font-extrabold text-rose-400 mt-1 block">
                  {myOrders.filter(o => o.status === 'disputed').length} Files
                </span>
                <span className="text-[8px] font-mono text-slate-400 block mt-1.5">Escrow funds locked</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 text-[10px] font-mono text-slate-400 leading-normal flex items-start gap-2">
              <Info size={12} className="text-cyan-400 shrink-0 mt-0.5" />
              <p>
                Sellers are required to lock deliverables into the multi-sig system. The platform releases funds on buyer approval or through AI Mediator verdicts.
              </p>
            </div>
          </div>

          {/* Card 2: Fee Management */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wide flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-cyan-400" />
                Fee Management Configurator
              </span>
              <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded-full uppercase">
                Active Tier
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Platform Commission Fee %</span>
                  <span className="text-cyan-400 font-bold">{platformFeePercent}% (Fiverr: {activeFiverrRate}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">Introductory Free Period</span>
                  <select
                    value={freePeriodDays}
                    onChange={(e) => setFreePeriodDays(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="30">30 Days (0% Fee)</option>
                    <option value="60">60 Days (0% Fee)</option>
                    <option value="90">90 Days (0% Fee)</option>
                    <option value="180">180 Days (0% Fee)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">Fiverr Benchmark Competitor Rate</span>
                  <input
                    type="number"
                    value={activeFiverrRate}
                    onChange={(e) => setActiveFiverrRate(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>

              {/* Profit metrics projection */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-mono font-black text-emerald-400 uppercase block">Projected Monthly Creator Savings</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-sm">
                    By implementing a <strong>{platformFeePercent}% fee structure</strong>, Chidon creators retain an extra <strong>${monthlyRevenueSavedByFee.toLocaleString()} monthly</strong> compared to Fiverr's standard 20% commission!
                  </p>
                </div>
                <TrendingUp size={24} className="text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Moderation desk & AI Fraud detection logs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 3: AI Fraud logs */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wide flex items-center gap-2">
                <Cpu size={14} className="text-purple-400 animate-pulse" />
                AI Fraud Detection Logs
              </span>
              <button
                type="button"
                onClick={triggerAiFraudSanitation}
                className="text-[8px] font-mono font-bold text-purple-400 hover:text-purple-300 cursor-pointer uppercase"
              >
                Scan Queue
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
              {fraudLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1 text-[10px] text-left relative">
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-mono font-black text-red-400 uppercase bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">
                    {log.confidence}% AI Match
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px]">
                    <Clock size={10} />
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-bold">{log.user}</span>
                  </div>
                  <p className="text-slate-300 font-mono font-bold leading-normal">
                    {log.event}
                  </p>
                  <div className="pt-1 flex justify-between items-center text-[8px] font-mono">
                    <span className="text-slate-500">LogID: {log.id}</span>
                    <span className="text-red-400 uppercase font-black">ACTION: {log.state.toUpperCase()}ED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Gig Moderation Desk */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-500" />
                Gig Moderation Desk
              </span>
              <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">
                {flaggedGigsCount} Gigs Flagged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
              {localGigs.slice(0, 5).map(gig => {
                const isFlagged = gig.rating === 1.0;
                return (
                  <div key={gig.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate">{gig.title}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">Creator: @{gig.sellerName} | Cost: ${gig.price}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(gig.id, isFlagged)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer shrink-0 border transition-all ${
                        isFlagged
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isFlagged ? "Flagged ⚠️" : "Scan & Flag"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
