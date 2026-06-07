"use client";

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../src/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus('error');
      setErrorMessage('Please enter a correct email format.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // ID derived from the email to prevent double subscriptions and keep IDs clean
    const subscriberId = trimmedEmail.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
    const path = `subscribers/${subscriberId}`;

    try {
      await setDoc(doc(db, 'subscribers', subscriberId), {
        email: trimmedEmail,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Subscription submission failed:", error);
      setStatus('error');
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch (logErr: any) {
        // Human graceful error fallback
        setErrorMessage('Could not complete subscription. The security gate rejected the write form payload.');
      }
    }
  };

  return (
    <div className="bg-[#0E1526]/55 border border-brand/15 p-6 sm:p-8 rounded-3xl relative overflow-hidden mt-6 shadow-lg shadow-brand/1" id="newsletter-subscription-box">
      {/* Visual background ambient details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-primary/5 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
          <Mail size={16} />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-mono tracking-widest text-emerald-400 uppercase font-black">
            Newsletter Intelligence
          </h4>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
            Subscribe to Chidon IQ Briefings
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Get elite AI content optimization strategies, automated video workflow hacks, and algorithmic monetization tips direct to your inbox.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-center max-w-md mx-auto animate-fade-in">
            <CheckCircle2 size={24} className="text-emerald-400" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white uppercase tracking-wide">Subscription Active!</p>
              <p className="text-[11px] text-slate-350">You have successfully been placed inside our high-priority distribution network list.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto relative z-20 w-full">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your expert email address..."
                className="w-full bg-[#070A13]/90 border border-white/5 rounded-xl px-4 py-2.5 pl-10 text-xs outline-none focus:border-brand/40 text-slate-200 transition-all placeholder:text-slate-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                required
              />
              <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={13} />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white text-xs font-mono font-bold rounded-xl shadow-lg hover:shadow-brand/20 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={13} className="animate-spin text-white" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Join Intel</span>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-[11px] text-rose-450 bg-rose-500/5 px-4 py-2.5 border border-rose-500/10 rounded-xl justify-center max-w-md mx-auto animate-fade-in">
            <AlertCircle size={13} className="shrink-0" />
            <span>{errorMessage || "An error occurred. Try again."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
