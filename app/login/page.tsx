/**
 * =========================================================================
 * CHIDON IQ - EMAIL-ONLY PASSWORDLESS AUTHENTICATION
 * Next.js 14 App Router + Supabase Auth
 * =========================================================================
 * 
 * SUPABASE DASHBOARD SETUP INSTRUCTIONS:
 * 1. Navigate to: https://database.supabase.com/project/_/auth/settings
 * 2. Set "Site URL" to your production domain or local dev URL:
 *    - Dev: http://localhost:3000
 * 3. Add to "Redirect URLs":
 *    - http://localhost:3000/dashboard
 *    - http://localhost:3000/auth/callback
 * 4. Under Auth Providers -> Email Provider settings:
 *    - Disable "Confirm email" (optional for easier testing, but recommended to leave enabled in prod for secure verify)
 *    - ENABLE "Double Opt-In"
 *    - For strict Email-Only passwordless logic: You can disable password login or 
 *      simply use only passwordless sign-in methods in your frontend code (as built below).
 * 
 * ENVIRONMENT VARIABLES REQUIRED (.env.local):
 * NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../src/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  Mail, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'magic-link' | 'password'>('magic-link');
  const [passwordAction, setPasswordAction] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<{title: string, desc: string} | null>(null);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email) {
      setErrorMsg('Please input a valid email address to request access.');
      setLoading(false);
      return;
    }

    try {
      const actionCodeSettings = {
        url: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email.trim());
      }

      setSuccessMsg({
        title: 'Link Dispatched Successfully!',
        desc: `A magic entry key has been sent to your educational inbox at: `
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Firebase OTP Request Failed:', err);
      setErrorMsg(err.message || 'An error occurred while sending the magic link. Please check your network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (passwordAction === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

        setSuccessMsg({
          title: 'Account Created Successfully!',
          desc: `Your Chidon IQ academic account is ready. Redirecting you to your workspace...`
        });
        setIsSuccess(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/dashboard';
        }, 2000);
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

        setSuccessMsg({
          title: 'Welcome Back!',
          desc: `Authentication successful. Accessing premium learning materials...`
        });
        setIsSuccess(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err: any) {
      console.error('Firebase Password Auth Failed:', err);
      
      let friendlyError = 'Authentication failed. Please verify your credentials and try again.';
      if (err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid login credentials. Please double check your email and password.';
      } else if (err.code === 'auth/user-not-found') {
        friendlyError = 'No account found with this email address. Please register first.';
      } else if (err.code === 'auth/wrong-password') {
        friendlyError = 'Incorrect password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email address is already registered.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'The email address is invalid.';
      } else if (err.message) {
        friendlyError = err.message;
      }
      
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        setSuccessMsg({
          title: 'Welcome Back!',
          desc: `Authentication successful via Google. Welcome, ${user.displayName || 'Scholar'}!`
        });
        setIsSuccess(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/dashboard';
        }, 1500);
      } else {
        throw new Error("Unable to retrieve email address from Google Account.");
      }
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      let friendlyError = err.message || "Google Authentication failed.";
      if (err.code === 'auth/popup-blocked') {
        friendlyError = "The authentication popup was blocked by your browser. Please allow popups and try again.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        friendlyError = "The verification window was closed before completion.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative Scholar Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 dark:bg-blue-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 dark:bg-indigo-950/10 blur-[120px] pointer-events-none" />
      
      {/* Centered Academic Card Deck */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-blue-900/[0.03] dark:shadow-black/40 overflow-hidden relative transition-all duration-300">
        
        {/* Subtle top academic indicator bar */}
        <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
        
        <div className="p-8 space-y-7">
          
          {/* Brand Logo & Presentation Area */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap size={22} className="stroke-[2]" />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white uppercase">
                Chidon <span className="text-blue-600 dark:text-blue-500">IQ</span>
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-slate-800 dark:text-slate-100 font-bold text-lg">
                Nigerian Students Study Portal
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-[280px] mx-auto">
                Access premium study notes instantly
              </p>
            </div>
          </div>

          {/* Tab Selection (only visible if not success state) */}
          {!isSuccess && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl relative">
              <button 
                type="button"
                onClick={() => {
                  setAuthMode('magic-link');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all relative z-10 cursor-pointer ${authMode === 'magic-link' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {authMode === 'magic-link' && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/40 dark:border-slate-850/40 -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span>✨ Magic Link</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all relative z-10 cursor-pointer ${authMode === 'password' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {authMode === 'password' && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/40 dark:border-slate-850/40 -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span>🔑 Password</span>
              </button>
            </div>
          )}

          {/* Conditional Screen Rendering */}
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              /* STATE 1: Enter Credentials form flow (Magic-link vs Password) */
              <motion.div
                key={authMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Information Callout Banner based on authMode */}
                {authMode === 'magic-link' ? (
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/40 rounded-2xl p-4 flex gap-3 text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                    <BookOpen size={16} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span>
                      <strong>Passwordless Entry:</strong> Enter your email. We will instantly dispatch a secure one-click magic sign-in link directly to your inbox.
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">
                      {passwordAction === 'signin' ? 'Have no login credentials yet?' : 'Already have an account?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPasswordAction(prev => prev === 'signin' ? 'signup' : 'signin')}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {passwordAction === 'signin' ? (
                        <>
                          <UserPlus size={13} />
                          <span>Register</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={13} />
                          <span>Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Shared Error UI */}
                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200/55 dark:border-red-900/50 rounded-2xl flex gap-3 text-xs text-red-600 dark:text-red-400 font-medium">
                    <XCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Conditional Form Render based on authMode */}
                {authMode === 'magic-link' ? (
                  <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left font-mono">
                      <label htmlFor="magic-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Your Student Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                          id="magic-email"
                          type="email"
                          value={email}
                          required
                          placeholder="e.g. adewale@unilag.edu.ng"
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-white" />
                          <span>Transmitting Access Link...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Magic Link</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* Email field */}
                    <div className="space-y-1.5 text-left font-mono">
                      <label htmlFor="password-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                          id="password-email"
                          type="email"
                          value={email}
                          required
                          placeholder="e.g. adewale@unilag.edu.ng"
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5 text-left font-mono">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Password Key
                        </label>
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          required
                          placeholder="••••••••"
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Button with Loading State */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-white" />
                          <span>Processing Auth Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>{passwordAction === 'signup' ? 'Create Account & Start' : 'Sign In Now'}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Google Sign-In Divider & Button */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-mono font-bold tracking-wider">Validated Authentication</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.93h6.59c-.28 1.5-1.11 2.76-2.36 3.6v3h3.8c2.22-2.04 3.51-5.05 3.51-8.51z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.8-3c-1.05.7-2.4 1.13-4.13 1.13-3.18 0-5.88-2.15-6.84-5.07H1.32v3.1A12 12 0 0 0 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.16 14.15a7.21 7.21 0 0 1 0-4.3v-3.1H1.32a12 12 0 0 0 0 10.5l3.84-3.1z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A12 12 0 0 0 1.32 6.75l3.84 3.1c.96-2.92 3.66-5.1 6.84-5.1z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            ) : (
              /* STATE 2: Success states with generic rendering */
              <motion.div
                key="success-outcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={32} className="animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-slate-800 dark:text-slate-100 font-bold text-lg">
                    {successMsg?.title || 'Action Success!'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[320px] mx-auto">
                    {successMsg?.desc}
                    {successMsg?.desc.includes('inbox') && (
                      <strong className="text-blue-600 dark:text-blue-400 font-mono text-xs block mt-1">{email}</strong>
                    )}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850/60 text-left text-xs text-slate-500 dark:text-slate-450 space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-blue-500" />
                    <span>Next Steps:</span>
                  </p>
                  <ol className="list-decimal pl-4.5 space-y-1">
                    <li>Open or click any incoming educational verification requests.</li>
                    <li>Verify details and wait to be routed into the platform dashboard.</li>
                    <li>Secure private access has been validated on your local device.</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setSuccessMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-450 hover:text-blue-600 dark:hover:text-blue-400 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Go Back</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* Footer Branding Label */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Protected & Authored by Firebase Identity Framework &bull; Chidon IQ v1.4
          </div>
        </div>
      </div>
    </div>
  );
}
