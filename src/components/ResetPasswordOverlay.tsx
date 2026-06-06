import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { executeConfirmPasswordReset } from '../lib/firebase/auth';

interface ResetPasswordOverlayProps {
  oobCode: string;
  onClose: () => void;
}

const sanitizeError = (msg: string): string => {
  if (!msg) return "";
  let clean = msg;
  if (msg.includes('auth/weak-password')) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes('auth/expired-action-code')) {
    return "The password reset link has expired. Please request a new one.";
  }
  if (msg.includes('auth/invalid-action-code')) {
    return "The password reset link is invalid. Please request a new one.";
  }
  clean = clean.replace(/firebase/gi, 'Chidon IQ');
  clean = clean.replace(/[a-zA-Z0-9-]+\.firebaseapp\.com/gi, 'chidoniq.com');
  return clean;
};

export const ResetPasswordOverlay: React.FC<ResetPasswordOverlayProps> = ({ oobCode, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify entries match exactly.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await executeConfirmPasswordReset(oobCode, password);
      setSuccess("Your password was updated successfully! You can now log into your Chidon IQ account.");
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(sanitizeError(err.message || "Failed to update security code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-default"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full overflow-hidden text-left"
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand/10 blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-6 pr-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center text-white">
                <Sparkles size={11} className="animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-black text-brand tracking-widest uppercase">
                SECURITY OVERRIDE
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              Create New Password
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Feedback banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-rose-950/20 dark:text-rose-400 border border-red-200 dark:border-rose-950/40 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed animate-none"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-green-200 dark:border-emerald-950/40 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-none"
            >
              <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 pl-1" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand-active focus:ring-1 focus:ring-brand/15 text-slate-900 dark:text-zinc-100 font-bold placeholder:text-slate-400 placeholder:font-normal"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 pl-1" htmlFor="confirmNewPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand-active focus:ring-1 focus:ring-brand/15 text-slate-900 dark:text-zinc-100 font-bold placeholder:text-slate-400 placeholder:font-normal"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand text-white hover:bg-brand/90 hover:shadow-lg disabled:bg-neutral-350 dark:disabled:bg-zinc-800 disabled:text-slate-400 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer text-center"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Updating Security Signature...
              </>
            ) : (
              <>
                <span>Commit New Password</span>
                <ChevronRight size={13} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
