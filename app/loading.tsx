// @ts-nocheck
import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center text-slate-150 p-6">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-brand/10 border-t-brand animate-spin" />
        <span className="text-xs font-black text-brand tracking-widest font-mono uppercase">IQ</span>
      </div>
      <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase animate-pulse">
        Initializing Neural OS Node...
      </p>
    </div>
  );
}
