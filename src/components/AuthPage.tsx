import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Shield, 
  Cpu,
  Clock,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // Show/Hide Password
  const [showPassword, setShowPassword] = useState(false);

  const getFriendlyError = (code: string, message: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Try logging in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/operation-not-allowed':
        return 'Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Access to this account has been temporarily disabled. Please reset your password or try again later.';
      default:
        return message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!email) {
      setError('Email address is required.');
      return;
    }

    if (isForgotPassword) {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccess('A password reset link has been dispatched to your email address. Please check your inbox.');
        setEmail('');
        setIsForgotPassword(false);
      } catch (err: any) {
        console.error('Password reset error:', err);
        setError(getFriendlyError(err.code, err.message));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        setError('Full Name is required.');
        return;
      }
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: fullName });

        // Save user details to Firestore
        const cleanUsername = username.trim() || email.split('@')[0];
        const userDocRef = doc(db, 'users', user.uid);
        
        const now = Timestamp.now();
        const trialEndAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

        await setDoc(userDocRef, {
          email: user.email,
          fullName: fullName,
          username: cleanUsername,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          trialStartAt: now,
          trialEndAt: trialEndAt,
          subscription: {
            status: "trialing",
            package: "pro",
            currentPeriodEnd: trialEndAt
          },
          // Backward compatibility for existing fields
          subscriptionPlan: "Pro Strategist Pack",
          subscriptionStatus: "active"
        }, { merge: true });

        setSuccess('Welcome! You have 24h full access.');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        } else {
          setTimeout(() => onBack(), 1500);
        }
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(getFriendlyError(err.code, err.message));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Welcome back! Initializing secure workspace session...');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1200);
        } else {
          setTimeout(() => onBack(), 1200);
        }
      } catch (err: any) {
        console.error('Login error:', err);
        setError(getFriendlyError(err.code, err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="auth-page-container" className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        
        {/* Left Side: Brand Accent Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-brand/20 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border-base)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider mb-8 group transition-colors"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Systems</span>
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <Cpu size={12} className="text-brand animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">Workspace Gate</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
                Chidon IQ <br />
                <span className="text-brand">Artificial Intelligence</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Unlock the full capacity of your strategic AI assistant. Synchronize your notes, track subscription plans, and secure your content drafts across all active systems.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-6 mt-12 lg:mt-0">
            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg text-brand mt-0.5">
                  <Shield size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Zero-Trust Security</h4>
                  <p className="text-[11px] text-slate-400">All data transfers and sessions are locked behind industry-grade encryption keys.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg text-brand mt-0.5">
                  <Zap size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">3-Day Free Trial</h4>
                  <p className="text-[11px] text-slate-400">New operators immediately receive a 3-day free trial of Simple Features to test their workspace.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg text-brand mt-0.5">
                  <Clock size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Real-time Cloud Sync</h4>
                  <p className="text-[11px] text-slate-400">Access your saved drafts, schedules, and analytics instantly on any desktop or mobile client.</p>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pt-4 border-t border-white/5">
              Secure Auth Version v3.5.2
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Authentication Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[var(--bg-app)]">
          <div className="w-full max-w-md mx-auto">
            
            {/* Header Form Toggles */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                  {isForgotPassword 
                    ? 'Reset Access' 
                    : isSignUp 
                      ? 'Operator Registration' 
                      : 'Workspace Authorization'
                  }
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {isForgotPassword 
                    ? 'Enter email to receive instructions' 
                    : isSignUp 
                      ? 'Register your official intelligence profile' 
                      : 'Provide system credentials to continue'
                  }
                </p>
              </div>
            </div>

            {/* Error and Success Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-500 text-xs"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">System Warning</span>
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-500 text-xs"
                >
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Auth Protocol Success</span>
                    <span className="leading-relaxed">{success}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuthAction} className="space-y-4">
              
              {/* Reset Password State or Signup States */}
              <AnimatePresence mode="popLayout">
                {isSignUp && !isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="Chidera Emmanuel"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                        Username (Optional)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                        <input
                          type="text"
                          placeholder="chidon_operator"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Operator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="operator@chidon.iq"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                  />
                </div>
              </div>

              {/* Password */}
              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Secret Key / Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                        }}
                        className="text-[10px] font-mono text-brand hover:underline"
                      >
                        Forgot Key?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Authorization Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                <span>
                  {loading 
                    ? 'Processing Network Request...' 
                    : isForgotPassword 
                      ? 'Submit Reset Request' 
                      : isSignUp 
                        ? 'Authorize & Register' 
                        : 'Access Secure Workspace'
                  }
                </span>
                {!loading && <ArrowRight size={14} />}
              </button>

              {/* Back to login if forgot password */}
              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs text-[var(--text-secondary)] hover:text-brand transition-colors font-mono uppercase tracking-wider"
                >
                  Return to login
                </button>
              )}

              {/* Bottom Switch Link */}
              {!isForgotPassword && (
                <div className="text-center pt-4">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isSignUp ? 'Already registered operator?' : 'Need a new intelligence profile?'}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-brand font-bold hover:underline ml-1 cursor-pointer"
                    >
                      {isSignUp ? 'Login to system' : 'Create profile'}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
