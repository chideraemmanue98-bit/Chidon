import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, User, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldCheck, RefreshCw, KeyRound, LogOut, Cpu, CloudLightning
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Lazy initialized ChidonSync (formerly Supabase) client helper to prevent boot-time crashes if variables aren't set yet
let cachedChidonSyncClient: any = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseAuthClient() {
  const url = import.meta.env.VITE_CHIDONSYNC_URL || import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sync_chidonsync_url') || localStorage.getItem('sync_supabase_url') || '';
  const key = import.meta.env.VITE_CHIDONSYNC_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sync_chidonsync_key') || localStorage.getItem('sync_supabase_key') || '';
  if (!url || !key) return null;
  
  if (cachedChidonSyncClient && url === cachedUrl && key === cachedKey) {
    return cachedChidonSyncClient;
  }
  
  try {
    cachedChidonSyncClient = createClient(url, key);
    cachedUrl = url;
    cachedKey = key;
    return cachedChidonSyncClient;
  } catch (err) {
    console.error("ChidonSync Init Error inside Auth module:", err);
    return null;
  }
}

interface ChidonAuthProps {
  onAuthSuccess: (user: { uid: string; email: string; displayName?: string; isSupabase: boolean } | null) => void;
  onClose?: () => void;
  currentUser: any;
}

export const ChidonAuth: React.FC<ChidonAuthProps> = ({ onAuthSuccess, onClose, currentUser }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const chidonSyncClient = getSupabaseAuthClient();

  // Helper to sync user experience level to Firestore
  const syncExperienceLevel = async (uid: string, userEmail: string) => {
    try {
      const exp = localStorage.getItem('experience_level') || 'Adept';
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        experienceLevel: exp,
        email: userEmail,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("Successfully synced experience level:", exp, "to Firestore for:", userEmail);
    } catch (err) {
      console.error("Failed to sync experience level to cloud Firestore:", err);
    }
  };

  // If there's an active ChidonSync session, sync it back to parent
  useEffect(() => {
    if (!chidonSyncClient) return;

    chidonSyncClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;
        const uEmail = session.user.email || '';
        onAuthSuccess({
          uid,
          email: uEmail,
          displayName: session.user.user_metadata?.full_name || uEmail.split('@')[0],
          isSupabase: true
        });
        syncExperienceLevel(uid, uEmail);
      }
    });

    const { data: { subscription } } = chidonSyncClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        const uEmail = session.user.email || '';
        onAuthSuccess({
          uid,
          email: uEmail,
          displayName: session.user.user_metadata?.full_name || uEmail.split('@')[0],
          isSupabase: true
        });
        syncExperienceLevel(uid, uEmail);
      } else if (!session) {
        // Do not force logout firebase user if it was set
        if (currentUser && !currentUser.isSupabase) {
          // Keep active firebase
        } else {
          onAuthSuccess(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [chidonSyncClient]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!chidonSyncClient) {
      setErrorMsg("ChidonSync is not configured yet. Please configure VITE_CHIDONSYNC_URL and VITE_CHIDONSYNC_ANON_KEY inside your Settings / Environment Variables first.");
      return;
    }

    if (!email) {
      setErrorMsg("Email address is required.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!password) throw new Error("Password field is required.");
        
        const { data, error } = await chidonSyncClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg("Welcome back to Chidon IQ! Secure cloud session authenticated.");
          const uid = data.user.id;
          const uEmail = data.user.email || '';
          onAuthSuccess({
            uid,
            email: uEmail,
            displayName: data.user.user_metadata?.full_name || uEmail.split('@')[0],
            isSupabase: true
          });
          
          // Force experience level persistence
          await syncExperienceLevel(uid, uEmail);

          if (onClose) setTimeout(onClose, 1000);
        }
      } 
      else if (mode === 'signup') {
        if (!password) throw new Error("Password is required for registration.");
        if (password.length < 6) throw new Error("Security policy: password must be at least 6 characters.");
        
        const { data, error } = await chidonSyncClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          const uid = data.user.id;
          const uEmail = data.user.email || '';
          
          if (data.session) {
            setSuccessMsg("Success! Security profile established and logged in automatically.");
            onAuthSuccess({
              uid,
              email: uEmail,
              displayName: data.user.user_metadata?.full_name || uEmail.split('@')[0],
              isSupabase: true
            });
            
            // Force experience level persistence
            await syncExperienceLevel(uid, uEmail);

            if (onClose) setTimeout(onClose, 1200);
          } else {
            setSuccessMsg("Registration initiated! Please check your email inbox to verify and activate your ChidonSync account.");
            await syncExperienceLevel(uid, uEmail);
          }
        }
      } 
      else if (mode === 'reset') {
        const { error } = await chidonSyncClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });

        if (error) throw error;
        setSuccessMsg("Password recalibration transmission dispatched. Check your email for the reset instructions.");
      }
    } catch (err: any) {
      console.error("ChidonSync Auth Operation Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during intelligence sync.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!chidonSyncClient) return;
    setLoading(true);
    try {
      await chidonSyncClient.auth.signOut();
      onAuthSuccess(null);
      setSuccessMsg("Session terminated securely.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasConfig = !!chidonSyncClient;

  // Active User Profile Panel
  if (currentUser?.isSupabase) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500" />
        
        <div className="mx-auto w-16 h-16 bg-cyan-500/10 text-cyan-400 flex items-center justify-center rounded-2xl relative">
          <ShieldCheck className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-mono tracking-widest font-bold uppercase inline-block">CHIDONSYNC SECURE ACCESS</span>
          <h3 className="text-xl font-bold text-white mt-2">{currentUser.displayName || "Cognitive Agent"}</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">{currentUser.email}</p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-left space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Sync Provider:</span>
            <span className="text-white font-bold">ChidonSync Cloud</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Local Token Sync:</span>
            <span className="text-emerald-500 font-bold">Active/Secure</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database Engine:</span>
            <span className="text-slate-300">Firestore + Relational PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Unique ID:</span>
            <span className="text-slate-400 text-[10px] truncate max-w-[180px]" title={currentUser.uid}>
              {currentUser.uid}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Close Console
            </button>
          )}
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-500 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-slate-950 border border-slate-800/80 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 text-left">
      {/* Decorative ambient flare */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500" />
      <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-cyan-500/5 filter blur-[40px] pointer-events-none" />

      {/* Header section with brand accent */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-mono tracking-widest font-black uppercase">
          <KeyRound size={10} className="text-cyan-400 animate-pulse" />
          <span>CHIDONSYNC CLOUD NODE</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          {mode === 'signin' ? 'Cognitive Login' : mode === 'signup' ? 'Create Agency Profile' : 'Retrieve Credentials'}
        </h2>
        <p className="text-slate-400 text-xs leading-relaxed max-w-[320px] mx-auto">
          {mode === 'signin' ? 'Verify your credentials to unlock cross-sector cloud synchronization.' : mode === 'signup' ? 'Establish your Chidon IQ account credentials securely via ChidonSync.' : 'Dispatch a credentials recalibration link to your verified email inbox.'}
        </p>
      </div>

      {/* Warning if no env credentials found */}
      {!hasConfig && (
        <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-2xl flex gap-3 items-start text-xs text-red-500 font-medium leading-relaxed">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">ChidonSync Keys Required</p>
            <p className="text-[10px] text-red-400 mt-0.5">Please add <code className="font-mono bg-slate-900 px-1 rounded">VITE_CHIDONSYNC_URL</code> and <code className="font-mono bg-slate-900 px-1 rounded">VITE_CHIDONSYNC_ANON_KEY</code> (or your existing Supabase configurations) to your Environment Variables first to activate secure database synchronization.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {hasConfig && mode !== 'reset' && (
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button 
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${mode === 'signin' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${mode === 'signup' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            Create Account
          </button>
        </div>
      )}

      {/* Feedback elements */}
      {errorMsg && (
        <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-2xl flex gap-2.5 items-start text-xs text-red-400 font-medium leading-relaxed animate-in fade-in duration-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex gap-2.5 items-start text-xs text-emerald-400 font-medium leading-relaxed animate-in fade-in duration-300">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuthAction} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">Display / Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/35 focus:border-cyan-500/40 transition-all placeholder:text-slate-600 font-semibold" 
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="email" 
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/35 focus:border-cyan-500/40 transition-all placeholder:text-slate-600 font-semibold" 
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Security Password</label>
              {mode === 'signin' && (
                <button 
                  type="button" 
                  onClick={() => setMode('reset')}
                  className="text-[10px] text-cyan-400 hover:underline font-mono"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/35 focus:border-cyan-500/40 transition-all placeholder:text-slate-600 font-semibold" 
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !hasConfig}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-55"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>{mode === 'signin' ? 'Verify Credentials' : mode === 'signup' ? 'Deploy Access Keys' : 'Dispatch Recovery Code'}</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>

      {/* Bottom Option Switcher */}
      <div className="pt-4 border-t border-slate-800 text-center flex justify-between items-center text-[11px] font-medium">
        {mode === 'reset' ? (
          <button 
            type="button" 
            onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            className="text-cyan-400 hover:underline"
          >
            Back to Cognitive Login
          </button>
        ) : (
          <span className="text-slate-500 flex items-center gap-1"><Cpu size={12} className="text-cyan-500" /> Secure via ChidonSync Core</span>
        )}
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:underline ml-auto"
          >
            Dismiss Console
          </button>
        )}
      </div>
    </div>
  );
};
