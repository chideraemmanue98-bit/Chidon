// @ts-nocheck
import React from 'react';

export const metadata = {
  title: 'Refund Policy - Chidon IQ',
  description: 'Understand the terms of refund, billing standards, and digital ledger subscriptions under the Chidon IQ platform.',
};

/**
 * PRODUCTION-READY REFUND POLICY PAGE (Next.js App Router Syntax)
 * 
 * Target Location: /app/refund-policy/page.tsx
 * Tone: Clear, fair, firm but friendly. Users should understand in 30 seconds.
 */
export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans selection:bg-brand selection:text-white">
      {/* Background radial ambient anchors */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 relative z-10">
        {/* Masthead */}
        <div className="text-center space-y-4 mb-16 border-b border-white/5 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-mono uppercase tracking-widest font-black">
            Billing & Protection Rules
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
            REFUND POLICY
          </h1>
          <p className="text-slate-450 hover:text-slate-300 transition-colors text-xs font-mono tracking-widest uppercase">
            Chidon Iq SaaS Standards • Read time: 30 Seconds
          </p>
        </div>

        {/* Content grid */}
        <div className="space-y-10 bg-[#0E1526]/40 border border-white/5 p-8 sm:p-12 rounded-3xl backdrop-blur">
          
          {/* Section 1: General Policy */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">💰</span> General Policy
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed">
              <p className="font-semibold text-slate-200">
                All payments for Chidon Iq premium are final. We do not offer refunds after premium access is activated.
              </p>
              <p className="mt-2 text-slate-400">
                Because our AI features use expensive, real-time custom computing power instantly to generate your scripts, SEO blueprints, and schedules, we are charged immediately for these runs. Therefore, once the Pro features are in your hands, we cannot undo the search or content parameters that were compiled.
              </p>
            </div>
          </section>

          {/* Section 2: Eligible for Refund */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">✅</span> Eligible for Refund
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We always want to be fair! You can ask for a full refund in only two specific cases:
              </p>
              <ul className="list-decimal pl-5 space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">Double charge:</strong> You were accidentally charged twice for a single payment due to a glitch or connection delay.
                </li>
                <li>
                  <strong className="text-white">Deducted but failed:</strong> Your subscription payment failed on our system, but money was successfully deducted from your bank/card, and Paystack database locks confirm a failed status.
                </li>
              </ul>
              <p className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-mono font-medium">
                👉 How to claim: Send your request within 7 days of the charge to <a href="mailto:support@chidoniq.com" className="underline font-bold">support@chidoniq.com</a> with your transaction reference.
              </p>
            </div>
          </section>

          {/* Section 3: Not Eligible */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">❌</span> Not Eligible
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed">
              <p>
                We cannot issue refunds for reasons that fall outside technical error. Examples include:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-400">
                <li>You changed your mind after inspecting the Pro tools.</li>
                <li>You didn't use the features or tools as much as you planned to.</li>
                <li>You forgot to cancel your subscription before the next renewal period.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Refund Process */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">⏱️</span> Refund Process
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-2">
              <p>
                Once we investigate and approve your claim, your refund is processed directly on the backend.
              </p>
              <p className="font-semibold text-white">
                All refunds are processed through Paystack. Chidon Iq cannot refund directly. Refund timeline depends on your bank/card issuer.
              </p>
              <p className="text-slate-400">
                The reversed amount will travel through Paystack pipelines and arrive back in your original payment card/method within <span className="text-brand font-bold font-mono">5-10 business days</span>.
              </p>
            </div>
          </section>

          {/* Section 5: Cancel Subscriptions Anytime */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">🔄</span> Subscriptions
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed">
              <p>
                Cancel anytime from your profile/dashboard. Cancellation stops future automated billings instantly. You will enjoy premium access until the end of your billing cycle, but we do not offer partial refunds for the remaining days of your active billing period.
              </p>
            </div>
          </section>

          {/* Section 6: Contact for Support */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
              <span className="text-lg">📧</span> Contact Us
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed">
              <p>
                To secure a refund evaluation, send an email to <a href="mailto:support@chidoniq.com" className="text-brand hover:underline font-bold">support@chidoniq.com</a>.
              </p>
              <p className="mt-2 text-slate-400">
                Please include <code className="bg-[#070A13] px-2 py-1 rounded text-slate-300 text-xs font-mono">"Refund Request"</code> in the subject line, along with your transaction reference number and account email coordinates so we can trace your transaction quickly.
              </p>
            </div>
          </section>

          <div className="pt-6 border-t border-white/5 text-right">
            <p className="text-xs font-mono text-slate-450">
              Last updated: June 4, 2026
            </p>
          </div>

        </div>

        {/* Home navigation anchor */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-450 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-6 py-3 rounded-xl hover:bg-brand/10 hover:border-brand/35"
          >
            ← Back to Intelligence Hub
          </a>
        </div>
      </main>
    </div>
  );
}
