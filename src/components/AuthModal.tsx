import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { 
  signUpWithEmail, 
  loginWithEmail, 
  resetPassword, 
  sendVerificationEmail,
  signInAsAnonymous
} from '../lib/firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Intercepts and filters any error strings that might reference Firebase, firebase, or Google project-ids.
 */
const sanitizeError = (msg: string): string => {
  if (!msg) return "";
  let clean = msg;
  
  // Map common auth error codes to beautiful human-readable explanations
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
    return "Invalid email or password credentials.";
  }
  if (msg.includes('auth/email-already-in-use')) {
    return "This email is already registered. Please login instead.";
  }
  if (msg.includes('auth/weak-password')) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes('auth/operation-not-allowed')) {
    return "Email/Password node connections are temporarily disabled.";
  }
  if (msg.includes('Please verify your email first')) {
    return "Verification node signature is incomplete. Please confirm your email before connecting.";
  }
  if (msg.includes('popup-closed-by-user') || msg.includes('popup_closed_by_user')) {
    return "The synchronization window was closed before completion. Please try connecting again.";
  }
  
  clean = clean.replace(/firebase/gi, 'Chidon IQ');
  clean = clean.replace(/[a-zA-Z0-9-]+\.firebaseapp\.com/gi, 'chidoniq.com');
  clean = clean.replace(/project-?\d+/gi, 'system');
  return clean;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [canResendVerification, setCanResendVerification] = useState<boolean>(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccess(null);
    setCanResendVerification(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Initialize or sync user document
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || 'CHIDON Creator',
          createdAt: serverTimestamp()
        }, { merge: true });
      }
      setSuccess("Successfully synchronized neural node via Google.");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(sanitizeError(err.message || "Failed Google Authentication."));
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await signInAsAnonymous();
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          email: result.user.email || 'anonymous@chidoniq.com',
          displayName: result.user.displayName || 'Guest Scribe',
          isAnonymous: true,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
      setSuccess("Successfully connected as Guest Channel.");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(sanitizeError(err.message || "Failed Guest Sign In."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (auth.currentUser) {
        await sendVerificationEmail(auth.currentUser);
        setSuccess("A verification link was resent. Please verify your inbox node!");
      } else {
        throw new Error("No active credentials found to issue resend action.");
      }
    } catch (err: any) {
      setError(sanitizeError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCanResendVerification(false);

    try {
      if (activeTab === 'signup') {
        if (!displayName.trim()) {
          throw new Error("Please enter your Display Name.");
        }
        
        // Use custom wrapper signUpWithEmail which automatically sets display name and sends action verifications
        const userCredential = await signUpWithEmail(email, password);

        // Initialize user document in firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          email: email,
          displayName: displayName || 'Chidon IQ User',
          createdAt: serverTimestamp()
        });

        setSuccess("Creator Node established. Verification email sent! Please check your inbox.");
        setCanResendVerification(true);
      } else if (activeTab === 'login') {
        // Use custom wrapper loginWithEmail which verifies active verified claims
        await loginWithEmail(email, password);
        setSuccess("Successfully connected to CHIDON network.");
        
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else if (activeTab === 'forgot') {
        if (!email.trim()) {
          throw new Error("Please issue a valid entry on Email field.");
        }
        await resetPassword(email);
        setSuccess("Safe password instruction matrix delivered to email address!");
      }
    } catch (err: any) {
      console.error("Auth helper error:", err);
      const errString = err.message || "Action halted.";
      setError(sanitizeError(errString));
      
      // If user requires verifying, activate resend options
      if (errString.includes('verify') || errString.includes('verifyEmail')) {
        setCanResendVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md cursor-default"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full overflow-hidden text-left"
        >
          {/* Decorative futuristic glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-brand/5 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex justify-between items-start mb-6 pr-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center text-white">
                  <Sparkles size={11} className="animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-black text-brand tracking-widest uppercase">
                  CHIDON AUTH GATEWAY
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
                {activeTab === 'login' && 'Connect Channel Node'}
                {activeTab === 'signup' && 'Initialize Creator Identity'}
                {activeTab === 'forgot' && 'Reset Channel Password'}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Custom Tabs */}
          <div className="flex border-b border-neutral-150 dark:border-zinc-800 mb-6 font-bold text-xs">
            <button
              onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }}
              className={cn(
                "flex-1 pb-3 text-center border-b-2 transition-all outline-none cursor-pointer",
                activeTab === 'login' 
                  ? "border-brand text-brand font-black" 
                  : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-350"
              )}
            >
              Login Node
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); setSuccess(null); }}
              className={cn(
                "flex-1 pb-3 text-center border-b-2 transition-all outline-none cursor-pointer",
                activeTab === 'signup' 
                  ? "border-brand text-brand font-black" 
                  : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-350"
              )}
            >
              Establishing Register
            </button>
          </div>

          {/* Errors & Success Feedback banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-105 text-red-700 dark:bg-rose-950/20 dark:text-rose-400 border border-red-200 dark:border-rose-950/40 rounded-xl text-xs flex flex-col gap-2 font-medium leading-relaxed"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {canResendVerification && (
                  <button 
                    type="button"
                    onClick={handleResendLink}
                    className="self-start text-xs font-bold text-brand hover:underline mt-1 cursor-pointer"
                  >
                    Resend verification link
                  </button>
                )}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-green-200 dark:border-emerald-950/40 rounded-xl text-xs flex flex-col gap-2 font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  <span>{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 pl-1" htmlFor="authDisplayName">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    id="authDisplayName"
                    type="text"
                    required
                    placeholder="e.g. Chido Creator"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand-active focus:ring-1 focus:ring-brand/15 text-slate-900 dark:text-zinc-100 font-bold placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 pl-1" htmlFor="authEmail">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="authEmail"
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand-active focus:ring-1 focus:ring-brand/15 text-slate-900 dark:text-zinc-100 font-bold placeholder:text-slate-400 placeholder:font-normal"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              </div>
            </div>

            {activeTab !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 pl-1" htmlFor="authPassword">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => { setActiveTab('forgot'); setError(null); setSuccess(null); }} 
                      className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="authPassword"
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand text-white hover:bg-brand/90 hover:shadow-lg disabled:bg-neutral-350 dark:disabled:bg-zinc-800 disabled:text-slate-400 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer text-center"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Synchronizing Neural Node...
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'login' && 'Synchronize Login'}
                    {activeTab === 'signup' && 'Register Creator Signature'}
                    {activeTab === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <ChevronRight size={13} />
                </>
              )}
            </button>

            {activeTab === 'forgot' && (
              <button 
                type="button" 
                onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }} 
                className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:underline cursor-pointer block mt-2"
              >
                Back to Login
              </button>
            )}
          </form>

          {/* Google SSO divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-neutral-150 dark:bg-zinc-800" />
            <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest z-10">
              OR SYNC SECURE KEYS
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-slate-800 dark:text-zinc-200 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full mt-3 py-2.5 bg-neutral-50 border border-dashed border-neutral-200 dark:bg-zinc-950 dark:border-zinc-850 dark:border-dashed hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 text-slate-650 dark:text-zinc-300 cursor-pointer"
          >
            <User size={13} className="text-slate-400 dark:text-zinc-500 animate-pulse" />
            <span>Try Anonymously (Guest access)</span>
          </button>

          <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-5 leading-normal">
            By connecting, you authorize secure end-to-end credential sync on the Chidon IQ Matrix protocol.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
