import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ShieldCheck, Zap, Check, ArrowRight } from 'lucide-react';

interface JoinBuyerProps {
  onProceed: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const JoinBuyer: React.FC<JoinBuyerProps> = ({ onProceed, onSkip, onBack }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Navigation Controls */}
      <button
        onClick={onBack}
        id="btn-joinbuyer-back"
        className="absolute top-6 left-6 text-xs font-mono font-bold text-gray-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-full cursor-pointer"
      >
        <span>← Change Role</span>
      </button>

      <button
        onClick={onSkip}
        id="btn-joinbuyer-skip"
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
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} />
          </div>
          <span className="text-[10px] font-mono font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            Client Portal Gateway
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 dark:text-white">
            Hire Creators to Grow <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400">
              Your Social Influence.
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Connect instantly with verified Instagram, TikTok, and YouTube specialists. Build your brand profile with our integrated Chidon AI wizard and list tasks in seconds.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl text-left space-y-4">
          <h3 className="text-xs font-mono font-black uppercase text-gray-900 dark:text-white tracking-widest border-b border-gray-200 dark:border-slate-850 pb-2">
            Buyer Privilege Protocol
          </h3>
          <div className="space-y-3.5">
            {[
              { title: "Sovereign Escrow Protection", desc: "Your hired budget stays locked securely in our system until you verify the delivered social video, post, or layout." },
              { title: "Starter Test Funds Included", desc: "Enjoy a default grant of 250 test dollars immediately to simulate gig orders and platform test posts." },
              { title: "Direct Realtime Encrypted Chat", desc: "Align on custom deliverables, formats, and milestones using the built-in creator messaging thread." }
            ].map((f, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
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
            id="btn-buyer-proceed-ai"
            className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>Proceed to AI Profile Creator</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
