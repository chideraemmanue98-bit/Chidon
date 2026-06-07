"use client";

import React, { useEffect, useState } from 'react';
import { Bookmark, ChevronRight } from 'lucide-react';

interface ProgressData {
  slug: string;
  title: string;
  y: number;
  timestamp: number;
}

interface ResumeReadingBridgeProps {
  onResume?: (slug: string) => void;
}

export function ResumeReadingBridge({ onResume }: ResumeReadingBridgeProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('chidoniq_progress');
      if (data) {
        const parsed = JSON.parse(data) as ProgressData;
        if (parsed && parsed.slug && parsed.timestamp) {
          const daysElapsed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
          if (daysElapsed < 7) {
            setProgress(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Failed parsing progress data:", e);
    }
  }, []);

  const handleResume = () => {
    if (!progress) return;
    if (onResume) {
      onResume(progress.slug);
    } else {
      window.location.href = `/blog/${progress.slug}?resume=true`;
    }
  };

  const handleStartFresh = () => {
    try {
      localStorage.removeItem('chidoniq_progress');
      setProgress(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (!progress) return null;

  return (
    <div className="w-full animate-fade-in relative z-50">
      <div className="bg-gradient-to-r from-[#0E1526]/90 via-[#151D33]/90 to-[#0E1526]/90 border border-brand/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-brand/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
            <Bookmark size={18} className="animate-pulse" />
          </div>
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="block text-[9px] font-mono tracking-widest text-[#a855f7] uppercase font-black">
              Resume Your Intelligence Briefing
            </span>
            <p className="text-xs sm:text-sm text-slate-100 font-bold leading-normal">
              Continue reading <span className="text-cyan-primary">“{progress.title}”</span>?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={handleStartFresh}
            className="w-1/2 sm:w-auto px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-mono font-bold text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all uppercase tracking-wider cursor-pointer"
          >
            Start Fresh
          </button>
          <button
            onClick={handleResume}
            className="w-1/2 sm:w-auto px-5 py-2 bg-brand hover:bg-brand/90 text-white text-[10px] font-mono font-bold rounded-xl shadow-lg hover:shadow-brand/20 transition-all uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Resume</span>
            <ChevronRight size={12} className="text-cyan-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
