import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, LogOut, CheckCircle, AlertCircle, RefreshCw, 
  KeyRound, User, Sparkles, ShieldAlert, ArrowRight, CornerDownRight,
  Eye, EyeOff
} from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

interface ChidonAuthProps {
  onAuthSuccess: (user: any) => void;
  onClose?: () => void;
  currentUser: any;
}

export const ChidonAuth: React.FC<ChidonAuthProps> = ({ onAuthSuccess, onClose, currentUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Is the current session a Guest? (either null, anonymous, or offline guest ID)
  const isGuestSession = !currentUser || currentUser.isAnonymous || currentUser.uid === 'offline_sandbox_user_id';

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please input your email address first, then click 'Forgot Password?' to receive a reset link.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("A password reset email has been successfully dispatched! Check your inbox.");
    } catch (err: any) {
      console.error(err);
      let message = err.message || "Failed to dispatch password reset email.";
      if (err.code === 'auth/user-not-found') {
        message = "No registered operator account exists with this email address.";
      } else if (err.code === 'auth/invalid-email') {
        message = "The provided email address is invalid.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        setSuccess("Account successfully created and linked!");
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Successfully logged into your secure account!");
        onAuthSuccess(userCredential.user);
      }
      if (onClose) {
        setTimeout(onClose, 1200);
      }
    } catch (err: any) {
      console.error(err);
      let message = err.message || "Authentication failed. Please verify your connection & credentials.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Incorrect email or password. Please verify and try again.";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "This email address is already linked to another account.";
      } else if (err.code === 'auth/weak-password') {
        message = "Password security requires a minimum of 6 characters.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
      setSuccess("Successfully terminated session!");
      onAuthSuccess(null);
    } catch (err: any) {
      setError(err.message || "Failed to terminate active session.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoUser = () => {
    setEmail('operator@chidoniq.com');
    setPassword('password123');
    setName('Chidon IQ Operator');
    setError(null);
  };

  // 1. Authorized Cloud Session (Only if logged in with a REAL non-anonymous account)
  if (currentUser && !isGuestSession) {
    return (
      <div 
        id="auth-authorized-container" 
        className="w-full max-w-md mx-auto p-8 bg-slate-950 border border-emerald-500/20 rounded-2xl text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.05)] text-slate-200"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest font-bold uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Secure Cloud Session Active</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Operator Profile</h3>
        </div>

        {/* User Info Card */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
              {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 truncate">
                {currentUser.displayName || 'Authorized Agent'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser.email}
              </p>
            </div>
          </div>


        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onClose && (
            <button
              id="btn-auth-close-dashboard"
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Back to Control Terminal</span>
            </button>
          )}
          <button
            id="btn-auth-signout-cloud"
            onClick={handleSignOut}
            disabled={loading}
            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>Terminate Active Session</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Guest / SignIn / Register form
  return (
    <div 
      id="auth-redesigned-form" 
      className="w-full max-w-md mx-auto p-8 bg-slate-950 border border-cyan-500/10 rounded-2xl space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.04)] text-left relative"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest font-bold uppercase">
          <KeyRound size={11} />
          <span>Security Authentication</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Chidon IQ Portal</h2>
        <p className="text-xs text-slate-400">
          Unlock the premium suite, synchronize freelance escrows, and persist your custom workspace state.
        </p>
      </div>

      {/* Guest Mode Indicator Banner */}
      {currentUser && (
        <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 rounded-xl text-[10px] leading-relaxed flex items-start gap-2.5">
          <Sparkles size={14} className="shrink-0 mt-0.5 text-cyan-300" />
          <div className="space-y-0.5">
            <span className="font-bold uppercase block text-[9px] tracking-wider text-cyan-300">⚡ Temporary Guest Active</span>
            <p className="text-slate-400">You are browsing using a sandbox guest session. Log in or create a full account below to persist your freelance contracts.</p>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isSignUp ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isSignUp ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl flex items-start gap-2.5 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isSignUp && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-1"
            >
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chidon IQ Operator"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-sans font-medium"
                  required
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@chidoniq.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-sans font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
              required={!isSignUp}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer flex items-center justify-center"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono pt-1">
            <span className="text-slate-500">Must be 6+ characters</span>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-cyan-400 hover:underline hover:text-cyan-300 font-bold cursor-pointer"
              >
                Forgot Password?
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Create Cloud Account' : 'Sign In To Terminal'}</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>

      {/* Sandbox test credentials helper */}
      <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldAlert size={12} className="text-amber-500" />
          <span>Demo Operator Info</span>
        </span>
        <button
          type="button"
          onClick={autofillDemoUser}
          className="text-cyan-400 hover:underline hover:text-cyan-300 font-bold cursor-pointer"
        >
          ⚡ Autofill Tester Creds
        </button>
      </div>
    </div>
  );
};
