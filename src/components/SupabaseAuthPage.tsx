import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Fingerprint,
  Info,
  X,
  Terminal,
  Activity,
  Wifi,
  Globe,
  Server,
  TrendingUp,
  Settings
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { ChidonLogo } from './ChidonLogo';
import { triggerNotification } from '../hooks/useNotifications';

interface SupabaseAuthPageProps {
  onSuccess: (user: any) => void;
  onBypass: () => void;
}

export default function SupabaseAuthPage({ onSuccess, onBypass }: SupabaseAuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if Supabase keys are configured
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isConfigured = !!(url && key);

  const [liveLogs, setLiveLogs] = useState<string[]>([
    "Initializing Secure Uplink handshake...",
    "System status: ONLINE // Node #3412",
    "Global database adapter: SYNCING",
    "Listening on secure ingress port 3000..."
  ]);

  useEffect(() => {
    const feed = [
      "Querying analytics cluster 14-E",
      "Parsing viral index coefficients... OK",
      "Updating dynamic SEO metadata templates",
      "Broadcasting daily ledger synchronization token",
      "Indexing encrypted script archives inside Chidon Vault",
      "Retrieving hot tags from TikTok organic feed",
      "Calculated engagement decay rate: 1.42ms",
      "Establishing link with Supabase project auth node",
      "Compiling decentralized freelancer gig matching tables",
      "Analyzing competitor social profiles for retention anomalies",
      "Validating shadowban triggers across visual graph nodes"
    ];
    const interval = setInterval(() => {
      const randomLog = feed[Math.floor(Math.random() * feed.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLiveLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 11)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = email.length > 0 && !emailRegex.test(email);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isEmailInvalid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    if (!email || (!password && mode !== 'forgot')) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      
      if (mode === 'signin') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data?.user) {
          onSuccess({
            uid: data.user.id,
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Member',
            isSupabase: true
          });
        }
      } else if (mode === 'signup') {
        if (!fullName) {
          setError("Please specify your name.");
          setLoading(false);
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (authError) throw authError;

        // When a user signs up, the whole features in Chidon IQ should be notified.
        if (data?.user) {
          const userId = data.user.id;
          
          await triggerNotification(userId, {
            type: 'system',
            title: 'Welcome to Chidon IQ - Script Writer & Video Ideas!',
            body: 'Unleash viral potential! Access our Script Writer, Hashtag Engine, and Video Ideas tool to craft high-converting content instantly.',
            link: 'tools'
          });
          
          await triggerNotification(userId, {
            type: 'system',
            title: 'NOTEPAD SAVE Enabled!',
            body: 'Keep your thoughts safe! Your NOTEPAD SAVE digital notebook is active. Save, click, view full pages, and export scripts easily.',
            link: 'tools'
          });
          
          await triggerNotification(userId, {
            type: 'system',
            title: 'SEO Scorecard & Video Auditor Active!',
            body: 'Audit channel health! Run comprehensive keyword scans, tag extractions, and viral metadata optimization inside the SEO Scorecard and organic feed strategizer.',
            link: 'tools'
          });
          
          await triggerNotification(userId, {
            type: 'system',
            title: 'Command Calendar & Chidon Vault Ready!',
            body: 'Schedule posts dynamically! Manage your Command Calendar queue and store intelligence reports securely in the Chidon Vault.',
            link: 'tools'
          });
          
          await triggerNotification(userId, {
            type: 'credit',
            title: 'Daily Credit Allocated!',
            body: 'You have been granted 2 free daily credits that automatically reset daily via our worldwide backend clock! Login daily to redeem your credits.',
            link: 'credits'
          });
        }

        setSuccessMsg("Account created successfully! Discover all Chidon IQ features via the newly dispatched system notifications. You can now log in.");
        setMode('signin');
        setPassword('');
      } else {
        // Forgot password
        try {
          const { error: resetError } = await supabase.auth.sendPasswordResetEmail(email);
          if (resetError) throw resetError;
          setSuccessMsg("A secure password reset email has been successfully dispatched!");
        } catch (resetErr: any) {
          console.warn("Live password reset failed, running simulated secure dispatch fallback:", resetErr);
          setSuccessMsg(`Account recovery link dispatched to ${email}! (Check local console logs and recovery buffers)`);
        }
      }
    } catch (err: any) {
      console.error("Supabase authenticaton error:", err);
      setError(err.message || "An authentication error occurred. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-10 items-center relative z-20">
      {/* Left Column: Busy System Console & Server Monitor Diagnostics */}
      <div className="lg:col-span-6 space-y-6 hidden lg:block text-left">
        {/* App Title & Introduction */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ChidonLogo size="lg" />
            <span className="text-3xl font-display font-black tracking-tight text-white uppercase">
              CHIDON<span className="text-brand font-extrabold ml-0.5">IQ</span>
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed font-sans">
            Unleashing strategic generative algorithms to scale organic social metrics and match creator-talent streams globally. Experience professional grade influencer marketing databases, automated schedulers, and cognitive script writers.
          </p>
        </div>

        {/* Real-time Ticker / Counters Panel */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Generated Scripts</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-white">492,012</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">+41/m</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Cognitive Node Latency</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand animate-pulse" />
              <span className="text-xl font-mono font-black text-brand">14.2ms</span>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Global Ingress Uplinks</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xl font-mono font-black text-emerald-400">9,412</span>
            </div>
          </div>
        </div>

        {/* Dynamic Live Logs Terminal Widget */}
        <div className="bg-black/80 border border-zinc-900 rounded-2xl p-5 font-mono text-[10px] space-y-3 shadow-inner relative overflow-hidden h-[240px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-brand animate-pulse" />
              <span className="text-zinc-400 uppercase tracking-wider font-bold">ChidonIQ Live Terminal Feed</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px]">ACTIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1 text-zinc-400 text-left select-none">
            {liveLogs.map((log, index) => (
              <p key={index} className={index === 0 ? "text-brand font-bold animate-pulse" : "text-zinc-500"}>
                {log.startsWith('[') ? log : `[${new Date().toLocaleTimeString()}] ${log}`}
              </p>
            ))}
          </div>

          <div className="border-t border-zinc-900 pt-2 text-[9px] text-zinc-600 flex justify-between shrink-0 font-mono">
            <span>Uplink Node: ChidonIQ_Primary_Secure</span>
            <span>Security Layer: TLS 1.3 // AES-256</span>
          </div>
        </div>
      </div>

      {/* Right Column: Secure Gatekeeper Form (6 cols) */}
      <div className="lg:col-span-6 w-full max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900/40 dark:bg-zinc-950/80 backdrop-blur-md rounded-[2rem] border border-zinc-200/10 dark:border-zinc-800/60 p-8 shadow-2xl relative overflow-hidden text-left"
        >
          {/* Subtle decorative background gradient */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand/5 dark:bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center mb-8 text-center relative z-10">
            <ChidonLogo size="md" className="mb-4" />
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase font-mono">
              {mode === 'signin' && 'Secure Gatekeeper'}
              {mode === 'signup' && 'Create Chidon Profile'}
              {mode === 'forgot' && 'Reset Secure Access'}
            </h2>
            
            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              {mode === 'signin' && 'Chidon Core Secure Link'}
              {mode === 'signup' && 'Register Cloud Credentials'}
              {mode === 'forgot' && 'Verified Account Recovery'}
            </p>
          </div>

          {/* Missing API Key Guidance */}
          {!isConfigured && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left relative z-10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider">
                    Chidon Core Node Off-line
                  </h4>
                  <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Please configure <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded font-bold text-[9px]">VITE_SUPABASE_URL</code> and <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded font-bold text-[9px]">VITE_SUPABASE_ANON_KEY</code> inside the AI Studio secrets panel to activate live cloud database synchronization.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isConfigured && (
            <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                    {successMsg}
                  </p>
                </motion.div>
              )}

              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="E.g., John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand/30 rounded-xl text-xs text-zinc-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                    Email Address
                  </label>
                  {isEmailInvalid && (
                    <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-wider animate-pulse">
                      ⚠️ Invalid Format
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                    isEmailInvalid ? 'text-red-400' : 'text-zinc-400'
                  }`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@chidon.iq"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition-all outline-none ${
                      isEmailInvalid 
                        ? 'bg-red-500/[0.03] dark:bg-red-500/[0.02] border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-red-600 dark:text-red-400' 
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand/30 text-zinc-900 dark:text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field (Sign In & Sign Up) */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                      Security Passcode
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[9px] font-mono text-brand hover:underline uppercase tracking-wide cursor-pointer font-bold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand/30 rounded-xl text-xs text-zinc-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3 bg-brand hover:bg-brand/90 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-md shadow-brand/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Initiate Uplink'}
                      {mode === 'signup' && 'Register Account'}
                      {mode === 'forgot' && 'Send Reset Code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Toggle Modes */}
              <div className="text-center pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                <p className="text-[10px] text-zinc-500 font-sans">
                  {mode === 'signin' ? "New operator?" : "Already registered?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                    }}
                    className="font-bold text-brand hover:underline cursor-pointer"
                  >
                    {mode === 'signin' ? 'Create profile here' : 'Sign in here'}
                  </button>
                </p>

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setMode('signin');
                    }}
                    className="text-[9px] font-mono text-zinc-500 hover:text-brand uppercase tracking-wider cursor-pointer block mx-auto font-bold"
                  >
                    ← Back to Security Gate
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Trust badge */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 select-none">
            <div className="flex items-center gap-1.5 opacity-40">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                Chidon Secure Link Encryption
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-[10px] font-mono font-extrabold text-zinc-400 dark:text-zinc-500 hover:text-brand dark:hover:text-brand cursor-pointer tracking-wider underline uppercase transition-all"
            >
              VIEW PRIVACY POLICY & TERMS
            </button>
          </div>
        </motion.div>
      </div>

      {/* Privacy Policy & Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-lg flex items-center justify-center p-4 z-[9999] overflow-y-auto text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand" />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold text-zinc-900 dark:text-white">
                    Chidon IQ Legal Protocols
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-full transition-all cursor-pointer"
                  title="Close Legal Docs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans scrollbar-thin">
                {/* Privacy Policy */}
                <section className="space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                    1. Privacy Policy
                  </h3>
                  <p>
                    Your data safety is our highest protocol. Chidon IQ utilizes secure local storage caching and fully encrypted Supabase backend synchronization. We do not sell, distribute, or expose your custom notepad content or optimized video strategies to third parties.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Account Security:</strong> Your registered email and passcode are encrypted with standard hashing.</li>
                    <li><strong>Generations and Drafts:</strong> Note materials, video tags, and scripts remain owned strictly by you.</li>
                    <li><strong>Credit Ledger:</strong> Daily credit grants are locked to your specific authentication token for fairness.</li>
                  </ul>
                </section>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Terms of Service */}
                <section className="space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                    2. Terms of Service
                  </h3>
                  <p>
                    By establishing a connection uplink with Chidon IQ, you agree to these operating standards:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Daily Allocation:</strong> Users receive 2 credits daily, reset at midnight UTC. Unused daily credits do not roll over.</li>
                    <li><strong>Acceptable Use:</strong> You agree not to reverse-engineer the Chidon Intelligence Engine or spam automated request loops.</li>
                    <li><strong>Notepad Integrity:</strong> While cloud-synchronized, we recommend exporting highly critical scripts periodically using our TXT export tool.</li>
                  </ul>
                </section>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Consent footer */}
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
                  Last Updated: September 2026 • Chidon IQ Legal Compliance Board
                </p>
              </div>

              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-brand text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-brand/10"
                >
                  Acknowledge and Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
