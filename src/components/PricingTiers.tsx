import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  XCircle, 
  Crown, 
  Gem, 
  CreditCard, 
  Lock, 
  Unlock, 
  Sparkles, 
  Coins, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Tv,
  Check,
  Zap
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { PaystackButton } from './PaystackButton';
import { AutoTranslate } from './AutoTranslate';

interface PricingTiersProps {
  user: User | null;
  membershipTier: 'free' | 'pro';
  onSignIn: () => void;
  onClose?: () => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({ user, membershipTier, onSignIn, onClose }) => {
  const { t } = useTranslation();
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [customPayAmount, setCustomPayAmount] = useState('4990'); // Monthly PRO price in NGN
  const [billingMail, setBillingMail] = useState(user?.email || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.email && !billingMail) {
      setBillingMail(user.email);
    }
  }, [user]);

  // Handle live/simulated Paystack initialization
  const handlePaystackPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }

    setPaystackLoading(true);
    setErrorMsg(null);
    try {
      const initParams = {
        email: billingMail || user.email || 'customer@chidon.iq',
        amount: parseFloat(customPayAmount) || 4990,
        metadata: {
          buyerId: user.uid,
          buyerEmail: billingMail || user.email || 'Anonymous',
          isPremiumUpgrade: true,
          planName: "Pro Creator Subscription"
        }
      };

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(initParams)
      });

      const resData = await response.json();
      if (!response.ok || !resData.status) {
        throw new Error(resData.error || "Server payment gateway initialization failure");
      }

      const checkoutUrl = resData.data.authorization_url;
      if (checkoutUrl) {
        // Safe redirect to Paystack
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Secure payment link not found inside response payload.");
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setErrorMsg(err.message || "Failed to contact Paystack checkout layer.");
    } finally {
      setPaystackLoading(false);
    }
  };

  // Immediate Sandbox Bypass update to trigger 1-click upgrade
  const handleInstantSandboxUpgrade = async () => {
    if (!user) {
      onSignIn();
      return;
    }

    setPaystackLoading(true);
    setErrorMsg(null);
    try {
      const isSimulated = !auth.currentUser || !!localStorage.getItem('simulated_user') || user.uid === 'simulated-creator-node';
      if (isSimulated) {
        localStorage.setItem('membership_tier', 'pro');
        const simulatedUserRaw = localStorage.getItem('simulated_user');
        if (simulatedUserRaw) {
          const simUser = JSON.parse(simulatedUserRaw);
          simUser.email = 'chideraemmanue98@gmail.com';
          localStorage.setItem('simulated_user', JSON.stringify(simUser));
        }
        setSuccessMsg(t("pricing.upgrade_success_msg", "🎉 Simulation Upgrade Succeeded! Your user profile has been successfully mutated to Pro Creator."));
        setTimeout(() => {
          window.location.reload();
        }, 1200);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        membershipTier: 'pro',
        upgradedAt: serverTimestamp(),
        paymentStatus: 'verified_pro_simulation'
      }, { merge: true });

      setSuccessMsg(t("pricing.upgrade_success_msg", "🎉 Simulation Upgrade Succeeded! Your user profile has been successfully mutated to Pro Creator."));
    } catch (err: any) {
      console.error("Sandbox upgrade error:", err);
      setErrorMsg(t("pricing.upgrade_error_msg", "Failed to update cloud database settings. Please verify security rules."));
    } finally {
      setPaystackLoading(false);
    }
  };

  const freeFeatures = [
    { key: "pricing.features.bio_optimizer", name: "SaaS Bio Optimizer", active: true },
    { key: "pricing.features.hashtag_brain", name: "Hashtag Brain Engine", active: true },
    { key: "pricing.features.competitor_lab", name: "Competitor Strategic Laboratory", active: true },
    { key: "pricing.features.schedule_optimizer", name: "Platform Post Optimizer & Scheduler", active: true },
    { key: "pricing.features.standard_latency", name: "Standard Neural Latency Speed", active: true },
    { key: "pricing.features.limit_creations", name: "Limit of 5 Creations per Day", active: true },
    { key: "pricing.features.viral_planner", name: "Advanced Viral Video Planner", active: false },
    { key: "pricing.features.cross_repurpose", name: "Premium Cross-Platform Repurpose", active: false },
    { key: "pricing.features.ctr_prompts", name: "High-CTR Graphic Thumbnail Prompts", active: false },
    { key: "pricing.features.trend_alerts", name: "Immediate Trend Detection & Alerts", active: false },
    { key: "pricing.features.ai_clusters", name: "Priority High-Speed AI Clusters", active: false },
  ];

  const proFeatures = [
    { key: "pricing.features.bio_optimizer", name: "SaaS Bio Optimizer", active: true },
    { key: "pricing.features.hashtag_brain", name: "Hashtag Brain Engine", active: true },
    { key: "pricing.features.competitor_lab", name: "Competitor Strategic Laboratory", active: true },
    { key: "pricing.features.schedule_optimizer", name: "Platform Post Optimizer & Scheduler", active: true },
    { key: "pricing.features.unlimited_creations", name: "Unlimited Creations (No Daily Limits)", active: true },
    { key: "pricing.features.viral_planner_premium", name: "Advanced Viral Video Planner (Premium)", active: true },
    { key: "pricing.features.cross_repurpose", name: "Premium Cross-Platform Repurpose", active: true },
    { key: "pricing.features.ctr_prompts", name: "High-CTR Graphic Thumbnail Prompts", active: true },
    { key: "pricing.features.trend_alerts", name: "Immediate Trend Detection & Alerts", active: true },
    { key: "pricing.features.ai_clusters", name: "Priority High-Speed AI Clusters", active: true },
    { key: "pricing.features.commercial_license", name: "Commercial Usage Licenses", active: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12 text-left">
      {/* Banner introduction */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Sparkles size={11} className="animate-spin text-brand" />
          <span><AutoTranslate>{t("pricing.badge", "SaaS Plan Configurator")}</AutoTranslate></span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
          <AutoTranslate>{t("pricing.header_prefix", "Select Your")}</AutoTranslate> <span className="text-brand"><AutoTranslate>{t("pricing.header_accent", "Cognitive Level")}</AutoTranslate></span>
        </h1>
        <p className="text-slate-400 text-sm">
          <AutoTranslate>{t("pricing.subtitle", "Unlock standard social growth engines or scale exponentially with priority live neural clusters. Customize and pay in local currency.")}</AutoTranslate>
        </p>
      </div>

      {/* Actual plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* FREE PLAN CARD */}
        <div className={`relative bg-[#070A13]/85 border ${membershipTier === 'free' ? 'border-[#22D3EE]/50 ring-1 ring-[#22D3EE]/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-white/5'} rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all`}>
          {membershipTier === 'free' && (
            <span className="absolute -top-3 left-6 px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest bg-cyan-500 text-[#070A13] rounded-full">
              <AutoTranslate>{t("pricing.current_plan", "CURRENT PLAN")}</AutoTranslate>
            </span>
          )}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-cyan-primary tracking-widest uppercase font-bold"><AutoTranslate>{t("pricing.free.access_type", "Standard Access")}</AutoTranslate></span>
              <h3 className="text-2xl font-black text-white mt-1"><AutoTranslate>{t("pricing.free.title", "FREE FOREVER")}</AutoTranslate></h3>
              <p className="text-xs text-slate-400 mt-2"><AutoTranslate>{t("pricing.free.description", "Perfect for independent creators looking to understand social platform analytics.")}</AutoTranslate></p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-b border-white/5">
              <span className="text-3xl font-extrabold text-white">$0.00</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono"><AutoTranslate>{t("pricing.free.frequency", "USD / Month")}</AutoTranslate></span>
            </div>

            <ul className="space-y-3">
              {freeFeatures.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs">
                  {item.active ? (
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-slate-600 shrink-0" />
                  )}
                  <span className={item.active ? "text-slate-300" : "text-slate-500 line-through"}>
                    <AutoTranslate>{t(item.key, item.name)}</AutoTranslate>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5">
            <button 
              disabled
              className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 font-bold uppercase tracking-wider text-xs rounded-xl"
            >
              {membershipTier === 'free' ? <AutoTranslate>{t("pricing.free.active_btn", "ACTIVE STANDARD")}</AutoTranslate> : <AutoTranslate>{t("pricing.free.demoted_btn", "DEMOTED OPTION")}</AutoTranslate>}
            </button>
          </div>
        </div>

        {/* PRO CREATOR PLAN CARD */}
        <div className={`relative bg-gradient-to-b from-[#0E1526] to-[#070A13] border ${membershipTier === 'pro' ? 'border-emerald-500' : 'border-brand/40 shadow-[0_0_40px_rgba(139,92,246,0.15)] hover:border-brand'} rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group`}>
          {membershipTier === 'pro' && (
            <span className="absolute -top-3 left-6 px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest bg-emerald-500 text-[#070A13] rounded-full">
              <AutoTranslate>{t("pricing.pro.active_badge", "ACTIVE PRO CREATOR")}</AutoTranslate>
            </span>
          )}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-brand tracking-widest uppercase font-black"><AutoTranslate>{t("pricing.pro.access_type", "Velocity Pro")}</AutoTranslate></span>
                <h3 className="text-2xl font-black text-white mt-1"><AutoTranslate>{t("pricing.pro.title", "PRO CREATOR")}</AutoTranslate></h3>
                <p className="text-xs text-slate-400 mt-2"><AutoTranslate>{t("pricing.pro.description", "Complete priority suit of video SEO optimization, viral ideas and automatic alert signals.")}</AutoTranslate></p>
              </div>
              <div className="p-2 bg-brand/10 border border-brand/20 rounded-xl text-brand">
                <Crown size={20} className="animate-pulse" />
              </div>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-b border-white/5">
              <span className="text-3xl font-black text-white">$9.99</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono"><AutoTranslate>{t("pricing.pro.frequency", "USD / Month")}</AutoTranslate></span>
            </div>

            <ul className="space-y-3">
              {proFeatures.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs">
                  <CheckCircle2 size={14} className="text-brand shrink-0" />
                  <span className="text-slate-200 font-medium">
                    <AutoTranslate>{t(item.key, item.name)}</AutoTranslate>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 space-y-4 pt-4 border-t border-white/5">
            {successMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 leading-relaxed font-medium">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-950/45 border border-red-500/20 rounded-xl text-xs text-red-400 leading-relaxed font-mono">
                {errorMsg}
              </div>
            )}

            {membershipTier === 'pro' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs font-mono text-center">
                <AutoTranslate>{t("pricing.pro.secured_msg", "✓ ALL CAPABILITIES SECURED")}</AutoTranslate>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    <AutoTranslate>{t("pricing.pro.billing_label", "Billing Email Address")}</AutoTranslate>
                  </label>
                  <input 
                    type="email"
                    required
                    value={billingMail}
                    onChange={(e) => setBillingMail(e.target.value)}
                    className="w-full bg-[#070A13] border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-xs outline-none focus:border-brand"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <PaystackButton
                    price={9.99}
                    email={billingMail || user?.email || 'customer@chidon.iq'}
                    name={user?.displayName || 'Subscriber'}
                    onSuccess={async (ref) => {
                      if (user) {
                        try {
                          const userRef = doc(db, 'users', user.uid);
                          await setDoc(userRef, {
                            membershipTier: 'pro',
                            upgradedAt: serverTimestamp(),
                            paymentStatus: 'verified_pro_paystack',
                            paymentReference: ref,
                            amountPaid: 9.99
                          }, { merge: true });
                        } catch (err) {
                          console.error("Firestore upgrade reference synchronization failed:", err);
                        }
                      }
                    }}
                  />

                  {/* Sandboxed instant preview update bypass */}
                  <button
                    type="button"
                    onClick={handleInstantSandboxUpgrade}
                    disabled={paystackLoading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold uppercase text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15"
                    title={t("pricing.pro.bypass_title", "Simulate successful payment verified securely in 1 click")}
                  >
                    <span><AutoTranslate>{t("pricing.pro.bypass_btn", "Instant Demo Upgrade Bypass")}</AutoTranslate></span>
                    <Zap size={12} className="fill-slate-950 animate-bounce" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Feature matrix breakdown description */}
      <div className="max-w-4xl mx-auto p-6 bg-[#0E1526]/50 border border-white/5 rounded-3xl space-y-4">
        <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Coins size={14} className="text-yellow-500" />
          <span><AutoTranslate>{t("pricing.agreement_title", "Billing Operations Escrow Agreement")}</AutoTranslate></span>
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          <AutoTranslate>{t("pricing.agreement_text", "The Chidon IQ platform operates standard secure connections. When upgrading to the Pro Creator Tier, transactions are generated via Paystack. After payment is verified, credentials propagate across live neural channels instantly, mutating your authentication profile records in Firestore securely. Your payment secures full unhindered access in perpetuity.")}</AutoTranslate>
        </p>
      </div>

    </div>
  );
};
