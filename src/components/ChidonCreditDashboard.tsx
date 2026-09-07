import React, { useEffect, useState } from 'react';
import { 
  Coins, 
  Plus, 
  Minus, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'deduction';
  reason: string;
  createdAt: any;
}

interface ChidonCreditDashboardProps {
  balance: number | null;
  isLoading?: boolean;
  onBuyCredits: () => void;
  onSpendCredits: () => void;
  transactions: Transaction[];
  onBack: () => void;
}

export default function ChidonCreditDashboard({
  balance,
  isLoading = false,
  onBuyCredits,
  onSpendCredits,
  transactions = [],
  onBack
}: ChidonCreditDashboardProps) {
  const [animatedCredits, setAnimatedCredits] = useState(0);

  // Number counting up animation from 0 to the balance when loaded
  useEffect(() => {
    if (balance === null || balance === undefined || isLoading) {
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = balance;
    const duration = 1200; // 1.2s smooth count-up duration

    let animFrameId: number;

    function step(timestamp: number) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing: Cubic easeOut
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + easeProgress * (endValue - startValue));
      setAnimatedCredits(currentVal);

      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      }
    }

    animFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
      }
    };
  }, [balance, isLoading]);

  const formatTimestamp = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    try {
      if (createdAt.toDate && typeof createdAt.toDate === 'function') {
        return createdAt.toDate().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // SVG Gauge specifications
  const circleSize = 260;
  const strokeWidth = 14;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Progress ratio capped at 100% relative to a baseline threshold of 1000 credits
  const targetScale = 1000;
  const progressPercent = balance ? Math.min(100, (balance / targetScale) * 100) : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div id="chidon-credit-dashboard" className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-brand/30">
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between border-b border-[var(--border-base)] shrink-0">
        <button 
          onClick={onBack} 
          className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-app)] active:scale-95 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 text-xs font-mono font-bold border border-[var(--border-base)] shadow-sm cursor-pointer"
          id="wallet-back-btn"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-base)] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <ShieldCheck size={14} className="text-emerald-500" /> SECURED WALLET
        </span>
      </header>

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* 1. LARGE CIRCULAR BALANCE SCREEN (Top 40% of page content area) */}
        <section className="min-h-[300px] flex flex-col items-center justify-center relative py-6">
          
          <AnimatePresence mode="wait">
            {isLoading || balance === null ? (
              /* Circular Skeleton Loader */
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex items-center justify-center"
              >
                <div className="w-[260px] h-[260px] rounded-full border-4 border-dashed border-[var(--border-base)] animate-spin-slow" />
                <div className="absolute flex flex-col items-center">
                  <div className="w-24 h-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-lg animate-pulse shadow-sm" />
                  <div className="w-16 h-3 bg-[var(--bg-card)] border border-[var(--border-base)] rounded mt-2 animate-pulse shadow-sm" />
                </div>
              </motion.div>
            ) : (
              /* High-Fidelity Animated Credit Wheel */
              <motion.div 
                key="wheel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative flex items-center justify-center"
              >
                {/* Visual Ambient Glows */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />

                <svg width={circleSize} height={circleSize} className="transform -rotate-90 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <defs>
                    <linearGradient id="glowBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer track */}
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    className="stroke-slate-200/50 dark:stroke-white/[0.03]"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  
                  {/* Dynamic Progress indicator */}
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    stroke="url(#glowBorderGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Central Value Indicators */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-mono font-black tracking-tight text-[var(--text-primary)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                    {animatedCredits.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] mt-2 font-bold flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-base)] px-2.5 py-1 rounded-full shadow-sm">
                    <Coins size={12} className="text-emerald-500" /> Available Credits
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

        {/* 2. ACTION BUTTONS (Rounded, Side by Side) */}
        <section className="w-full max-w-md mx-auto grid grid-cols-2 gap-4">
          <button
            onClick={onBuyCredits}
            className="h-13 bg-brand hover:bg-brand/90 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:shadow-brand/20 hover:-translate-y-0.5 cursor-pointer"
            id="btn-buy-credits"
          >
            <Plus size={16} /> Buy Credits
          </button>
          
          <button
            onClick={onSpendCredits}
            className="h-13 bg-[var(--bg-card)] hover:bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono font-black text-xs uppercase tracking-wider rounded-xl border border-[var(--border-base)] transition-all flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5 shadow-sm cursor-pointer"
            id="btn-spend-credits"
          >
            <Minus size={16} /> Spend Credits
          </button>
        </section>

        {/* 3. TRANSACTION HISTORY */}
        <section className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-[24px] p-6 space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
              <Clock size={15} className="text-emerald-500" /> Recent Transactions
            </h3>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-app)] px-2.5 py-1 rounded border border-[var(--border-base)] font-bold uppercase shadow-sm">
              {transactions.length} Event Logs
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="tx-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-[var(--text-secondary)] text-xs font-mono flex flex-col items-center gap-3"
              >
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <span>Decrypting transaction logs...</span>
              </motion.div>
            ) : transactions.length === 0 ? (
              <motion.div 
                key="tx-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-[var(--text-secondary)] text-xs font-mono flex flex-col items-center gap-2"
              >
                <Coins size={28} className="text-[var(--text-secondary)] opacity-50 mb-1" />
                No transactions recorded on this profile yet.
              </motion.div>
            ) : (
              <motion.div 
                key="tx-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar"
              >
                {transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-3.5 bg-[var(--bg-app)]/30 hover:bg-[var(--bg-app)] border border-[var(--border-base)]/60 rounded-xl flex items-center justify-between gap-4 transition-all duration-150 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      {/* Positive/Negative Indicator Icon */}
                      <div className={cn(
                        "p-2 rounded-lg shrink-0 border flex items-center justify-center",
                        tx.type === 'credit' 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" 
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400"
                      )}>
                        {tx.type === 'credit' ? <Plus size={14} /> : <Minus size={14} />}
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide truncate">
                          {tx.reason}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-base)] shadow-sm">
                            ID: {tx.id.startsWith('local_') || tx.id.length < 10 ? tx.id : `${tx.id.slice(0, 10)}`}
                          </span>
                          <span className="text-[9px] text-[var(--text-secondary)] opacity-80">
                            {formatTimestamp(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      "text-xs font-mono font-black shrink-0 tracking-tight",
                      tx.type === 'credit' ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                    )}>
                      {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

    </div>
  );
}
