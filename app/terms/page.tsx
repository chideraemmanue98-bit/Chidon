// @ts-nocheck
import React from 'react';

export const metadata = {
  title: 'Terms of Use - Chidon IQ',
  description: 'Understand the legal conditions, account responsibilities, and guidelines governing the Chidon IQ platform services.',
};

/**
 * PRODUCTION-READY TERMS OF USE PAGE (Next.js App Router Syntax)
 * 
 * Target Location: /app/terms/page.tsx
 * Tone: Professional but human. 8th grade reading level. No heavy legal jargon.
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans selection:bg-brand selection:text-white">
      {/* Background radial ambient anchors */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 relative z-10">
        {/* Masthead */}
        <div className="text-center space-y-4 mb-16 border-b border-white/5 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-mono uppercase tracking-widest font-black">
            Platform Legal Standards
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
            CHIDON IQ TERMS OF USE
          </h1>
          <p className="text-slate-450 hover:text-slate-300 transition-colors text-xs font-mono tracking-widest uppercase">
            Last Updated: April 2026
          </p>
        </div>

        {/* Content grid */}
        <div className="space-y-12 bg-[#0E1526]/40 border border-white/5 p-8 sm:p-12 rounded-3xl backdrop-blur">
          
          {/* Section 1: Agreement */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">📝</span> 1. Agreement
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Welcome to Chidon Iq! By accessing and using our web application, tools, or smart generators, you are agreeing to these Terms of Use. Please read them carefully. If you do not agree to everything here, you should not use Chidon Iq.
              </p>
            </div>
          </section>

          {/* Section 2: Accounts */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">👤</span> 2. Accounts
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                To explore our intelligent tools, you must create an account. You agree to give us a real email address that belongs to you. Please only create one account per person. Keep your password safe! If we find out you are using fake profiles or abusing the platform, we reserve the right to suspend or block your account immediately.
              </p>
            </div>
          </section>

          {/* Section 3: Payments & Refunds */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">💳</span> 3. Payments & Refunds
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Payments processed by Paystack. See <a href="https://paystack.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-mono">paystack.com/legal/terms</a>. 
                When you subscribe to Pro Creator tools, premium features activate instantly. Because custom computing power is used right away to generate your content, we do not cover refunds after access is granted, unless a severe, unresolvable technical failure happens on our end. 
                For any billing problems or concerns, please reach out to our dedicated support channels at <strong className="text-white">support@chidoniq.com</strong>.
              </p>
            </div>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">✅</span> 4. Acceptable Use
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We love dynamic content creators, but please use Chidon Iq responsibly. You promise not to use our product for illegal things, create spam networks, or try to decode or reverse engineer the inner workings of Chidon Iq. Please do not overload our servers or run automated bots to scrape content.
              </p>
            </div>
          </section>

          {/* Section 5: Content & IP */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">🧠</span> 5. Content & IP
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                You own all the custom social scripts, descriptions, and ideas you generate using our assistant. However, Chidon Iq owns the app wrapper, entire brand, logo designs, systems, underlying source code, and intellectual property. No copying of our layout or code is allowed!
              </p>
            </div>
          </section>

          {/* Section 6: Termination */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">🚫</span> 6. Termination
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We want our community to remain safe and fair. We reserve the right to block or terminate your access for credit fraud, unauthorized chargebacks, or violations of these Terms of Use. If your account is closed for cause, you will not be issued any refunds for unused subscription periods.
              </p>
            </div>
          </section>

          {/* Section 7: Disclaimers */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">⚠️</span> 7. Disclaimers
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Chidon Iq is provided on an "as is" and "as available" basis. While we work around the clock to build premium engines, we do not guarantee 100% continuous uptime or that our generated ideas will always match your social audience forecasts. We hope they do, but we are not legally responsible if they do not.
              </p>
            </div>
          </section>

          {/* Section 8: Governing Law */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-lg">🌍</span> 8. Governing Law
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                These Terms and any platform disputes will be regulated by the modern laws of Everyone. If you are having issues, please talk to us first! We are dedicated to peace and want to settle all matters through direct support. Send an email to <strong className="text-white">support@chidoniq.com</strong> before initiating any external processes.
              </p>
            </div>
          </section>

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
