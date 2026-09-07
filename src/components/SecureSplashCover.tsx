import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SecureSplashCoverProps {
  onComplete: () => void;
}

export const SecureSplashCover: React.FC<SecureSplashCoverProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    'Decrypting user node...',
    'Establishing cognitive uplink with Gemini pipelines...',
    'Syncing sovereign database matrices...',
    'Bypassing recommendation decay blocks...',
    'Verifying security credentials...',
    'Initializing Neural Wallet protocols...',
    'Synchronizing user secure modules...',
    'Decryption complete. Access granted.'
  ];

  // Increment progress smoothly over 8 seconds (8000ms)
  useEffect(() => {
    const duration = 8000; 
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Cycle status texts based on loading progress across 8 seconds
  useEffect(() => {
    if (progress < 12.5) setStatusIndex(0);
    else if (progress < 25) setStatusIndex(1);
    else if (progress < 37.5) setStatusIndex(2);
    else if (progress < 50) setStatusIndex(3);
    else if (progress < 62.5) setStatusIndex(4);
    else if (progress < 75) setStatusIndex(5);
    else if (progress < 87.5) setStatusIndex(6);
    else setStatusIndex(7);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#18191d] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      {/* Background Matrix Radial Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#2d3139_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-slate-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center justify-center text-center space-y-8 relative z-10">
        
        {/* BRAND ACCURATE GEOMETRIC LOGO (Reduced in size) */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: [0.98, 1.02, 0.98], opacity: 1 }}
            transition={{ 
              scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              opacity: { duration: 1 }
            }}
            className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-b from-[#1e1e2d]/10 to-transparent shadow-[0_0_40px_rgba(59,130,246,0.08)]"
          >
            <svg className="w-18 h-18 text-cyan-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="logoLetterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="trendLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Outer C shape - Thick geometric curve */}
              <path
                d="M 66,28 
                   A 25,25 0 1,0 66,72 
                   L 55,62.5 
                   A 12,12 0 1,1 55,37.5 
                   Z"
                fill="url(#logoLetterGrad)"
              />

              {/* Connected Trend Line */}
              <path
                d="M 43,53 
                   L 50,47 
                   L 59,44 
                   L 71,34 
                   L 84,23"
                stroke="url(#trendLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Node 1 - Inside C */}
              <circle cx="59" cy="44" r="3.5" fill="#22D3EE" filter="url(#cyanGlow)" />
              <circle cx="59" cy="44" r="2.5" fill="#22D3EE" />

              {/* Node 2 - Middle section */}
              <circle cx="71" cy="34" r="3.5" fill="#22D3EE" filter="url(#cyanGlow)" />
              <circle cx="71" cy="34" r="2.5" fill="#22D3EE" />

              {/* Node 3 - Terminal dot at the top-right apex */}
              <circle cx="84" cy="23" r="4" fill="#38BDF8" filter="url(#cyanGlow)" />
              <circle cx="84" cy="23" r="2.8" fill="#38BDF8" />
            </svg>
          </motion.div>
        </div>

        {/* TYPOGRAPHY BLOCK: High Contrast Elegant Display */}
        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold tracking-[0.22em] text-white font-mono uppercase"
          >
            CHIDON IQ
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="text-[10px] font-mono font-black tracking-[0.32em] text-[#06B6D4] uppercase"
          >
            COMMENCING SECURE PROTOCOL
          </motion.div>
        </div>

        {/* Sleek Minimalist Separator Divider Line with loading expansion (Reduced width) */}
        <div className="w-44 h-[1.5px] bg-[#2d3139] relative overflow-hidden rounded-full">
          <motion.div 
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          />
        </div>

        {/* DYNAMIC MONOSPACE DECRYPTION MESSAGES (Reduced size) */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-[10px] font-mono text-slate-500 font-bold tracking-wider text-center px-4"
            >
              {statuses[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
