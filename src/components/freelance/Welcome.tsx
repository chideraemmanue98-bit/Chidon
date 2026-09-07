import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Video, Youtube, Instagram, Twitter, Shield, Zap } from 'lucide-react';

interface WelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNext, onSkip }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top right Skip button */}
      <button
        onClick={onSkip}
        id="btn-welcome-skip"
        className="absolute top-6 right-6 text-xs font-mono font-bold tracking-widest text-gray-600 dark:text-slate-400 bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300"
      >
        Skip ⚡
      </button>

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl space-y-8 z-10"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/5 via-gray-50 dark:via-slate-900/80 to-cyan-500/5 border border-gray-200 dark:border-slate-800 shadow-lg shadow-purple-500/5"
        >
          <Zap size={14} className="text-indigo-600 dark:text-purple-400 animate-pulse" />
          <span className="text-[10px] font-mono font-black text-gray-600 dark:text-slate-300 tracking-widest uppercase">
            CHIDON SOCIAL GIG ENGINE v2.0
          </span>
        </motion.div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-none text-gray-900 dark:text-white">
            Hire Top Social Media <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-500">
              Experts. Or Get Hired.
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
            Instagram, TikTok, YouTube, Twitter. All in one place. Experience decentralized escrow-locked payments, verified portfolios, and instant social asset deployment.
          </p>
        </div>

        {/* Visual Social Channels Display */}
        <div className="flex justify-center gap-6 py-4">
          {[
            { icon: Instagram, label: "Instagram", color: "text-pink-500" },
            { icon: Video, label: "TikTok", color: "text-emerald-500 dark:text-emerald-400" },
            { icon: Youtube, label: "YouTube", color: "text-red-500" },
            { icon: Twitter, label: "Twitter", color: "text-sky-500 dark:text-sky-400" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-500 dark:group-hover:border-cyan-400/40 transition-all duration-300 shadow-md">
                <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className="text-[10px] font-mono text-gray-500 dark:text-slate-500 group-hover:text-gray-800 dark:group-hover:text-slate-300 transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Value Props Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="p-4 bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800/80 rounded-2xl space-y-1">
            <span className="text-xs font-mono font-black text-indigo-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Shield size={12} className="text-indigo-600 dark:text-cyan-400" /> Secure Escrow
            </span>
            <p className="text-[10px] text-gray-600 dark:text-slate-400 leading-normal">
              Funds stay safely in escrow until you verify the social media assets.
            </p>
          </div>
          <div className="p-4 bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800/80 rounded-2xl space-y-1">
            <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Zap size={12} className="text-purple-600 dark:text-purple-400" /> 10x Velocity
            </span>
            <p className="text-[10px] text-gray-600 dark:text-slate-400 leading-normal">
              Instantly draft briefings and reviews with our fully integrated Chidon AI models.
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="pt-4">
          <button
            onClick={onNext}
            id="btn-welcome-get-started"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 active:scale-95 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/30 flex items-center gap-2.5 mx-auto cursor-pointer transition-all border border-transparent dark:border-white/10"
          >
            <span>Get Started</span>
            <ArrowRight size={14} strokeWidth={3} className="text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
