import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Clock, X, CheckSquare, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaywallGateProps {
  children: React.ReactNode;
  hasAccess: boolean;
  isTrialing: boolean;
  trialEndsIn: string;
  loading: boolean;
  user: any;
  onRedirectToPricing: () => void;
  onShowExpiredModal: () => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({
  children,
  hasAccess,
  isTrialing,
  trialEndsIn,
  loading,
  user,
  onRedirectToPricing,
  onShowExpiredModal
}) => {
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    // If the user is logged in, loading is done, and they don't have access, redirect them immediately to pricing
    if (user && !loading && !hasAccess) {
      onShowExpiredModal();
      onRedirectToPricing();
    }
  }, [user, loading, hasAccess, onRedirectToPricing, onShowExpiredModal]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[var(--bg-app)] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full"
        />
        <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Securing session access...
        </p>
      </div>
    );
  }

  // If user has no access (and we haven't completed the redirect yet), render blank or placeholder to prevent flash of content
  if (user && !hasAccess) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] bg-[var(--bg-app)] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Access Restricted</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your free trial has expired. Redirecting you to our secure subscription console...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Trial banner */}
      <AnimatePresence>
        {user && hasAccess && isTrialing && !dismissBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="sticky top-0 z-[110] w-full bg-gradient-to-r from-brand via-indigo-600 to-purple-600 text-white shadow-lg border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Clock size={14} className="animate-pulse" />
                </div>
                <span className="font-bold tracking-tight">
                  FREE TRIAL ACTIVE: <span className="font-black text-yellow-300 underline underline-offset-2">{trialEndsIn} remaining</span>.
                </span>
                <span className="hidden md:inline text-[10px] text-white/80 font-medium">
                  Enjoy unrestricted full access to all AI intelligence features!
                </span>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onRedirectToPricing}
                  className="px-3 py-1.5 bg-white text-brand hover:bg-slate-50 font-black rounded-lg text-[10px] tracking-wider uppercase transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>UPGRADE NOW</span>
                  <ArrowRight size={10} />
                </button>
                <button
                  onClick={() => setDismissBanner(true)}
                  className="p-1 hover:bg-white/10 text-white/80 hover:text-white rounded-md transition-all shrink-0"
                  aria-label="Dismiss trial banner"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual feature content */}
      {children}
    </div>
  );
};
