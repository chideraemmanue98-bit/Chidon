import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, ShieldCheck, Zap, Sparkles, Check, ArrowRight } from 'lucide-react';

interface JoinSellerProps {
  onProceed: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const JoinSeller: React.FC<JoinSellerProps> = ({ onProceed, onSkip, onBack }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Navigation Controls */}
      <button
        onClick={onBack}
        id="btn-joinseller-back"
        className="absolute top-6 left-6 text-xs font-mono font-bold text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-full cursor-pointer"
      >
        <span>← Change Role</span>
      </button>

      <button
        onClick={onSkip}
        id="btn-joinseller-skip"
        className="absolute top-6 right-6 text-xs font-mono font-bold tracking-widest text-gray-600 dark:text-slate-400 bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300"
      >
        Skip ⚡
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center space-y-8 z-10"
      >
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} />
          </div>
          <span className="text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            Creative Node Gateway
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 dark:text-white">
            Sell Social Growth Gigs. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Keep 100% of Earnings.
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Unleash your social media talent. Showcase your verified proof-of-work, list custom social growth services, and earn secured payouts on a globally connected system.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl text-left space-y-4">
          <h3 className="text-xs font-mono font-black uppercase text-gray-900 dark:text-white tracking-widest border-b border-gray-200 dark:border-slate-850 pb-2">
            Creator Privilege Protocol
          </h3>
          <div className="space-y-3.5">
            {[
              { title: "Direct Escrow Clearance", desc: "No middleman taking massive platform commissions. Earnings clear instantly upon client verification of raw milestone files." },
              { title: "AI-Optimized Portfolios", desc: "Use our tailored Google Gemini wizard to immediately translate your manual experience into a highly structured proof-of-work card." },
              { title: "Secured Wallet Ledgers", desc: "All funds are validated at the smart backend, preventing arbitrary cancellations or unpaid service requests." }
            ].map((f, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{f.title}</h4>
                  <p className="text-[10px] text-gray-600 dark:text-slate-400 leading-normal">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onProceed}
            id="btn-seller-proceed-ai"
            className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>Proceed to AI Profile Creator</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
