import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink,
  HelpCircle,
  Cpu,
  X,
  AlertTriangle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
  color: string;
  borderColor: string;
  badge?: string;
  features: string[];
}

interface ChidonPricingProps {
  user: any;
  onBack?: () => void;
  db: any;
  showTrialEndedModal?: boolean;
  onCloseTrialEndedModal?: () => void;
}

export default function ChidonPricing({ 
  user, 
  onBack, 
  db,
  showTrialEndedModal = false,
  onCloseTrialEndedModal
}: ChidonPricingProps) {
  const [activePlan, setActivePlan] = useState<string>('Free Workspace Tier');
  const [subStatus, setSubStatus] = useState<string>('inactive');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingConfig, setCheckingConfig] = useState<boolean>(true);
  const [paystackConfigured, setPaystackConfigured] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1500);

  // Checkout & verification states
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [payRef, setPayRef] = useState<string>('');
  const [payerEmail, setPayerEmail] = useState<string>(user?.email || '');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');
  const [paySuccess, setPaySuccess] = useState<boolean>(false);
  const [callbackSuccess, setCallbackSuccess] = useState<boolean>(false);
  const [callbackPlanName, setCallbackPlanName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    
    if (reference) {
      const runUrlVerification = async () => {
        setVerifying(true);
        setVerifyError('');
        try {
          console.log('[Pricing Gateway] Capturing reference parameter from URL:', reference);
          const response = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reference })
          });

          const resData = await response.json();
          if (!response.ok || !resData.success) {
            throw new Error(resData.message || 'Verification request failed.');
          }

          const txStatus = resData.data.status;
          if (txStatus === 'success') {
            const metadata = resData.data.metadata || {};
            const planName = metadata.planName || 'Starter Creator Pack';
            const price = metadata.originalAmountUsd || (resData.data.amount / 100);

            const userRef = doc(db, 'users', user.uid);
            const mappedPackage = planName === 'Enterprise Sovereign Pack' ? 'enterprise' : (planName === 'Pro Strategist Pack' ? 'pro' : 'basic');
            const oneMonthLater = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await updateDoc(userRef, {
              subscriptionPlan: planName,
              subscriptionStatus: 'active',
              subscriptionPrice: price,
              paystackSubscriptionRef: reference,
              updatedAt: serverTimestamp(),
              subscription: {
                status: 'active',
                package: mappedPackage,
                currentPeriodEnd: oneMonthLater
              }
            });

            setPaySuccess(true);
            setCallbackSuccess(true);
            setCallbackPlanName(planName);
            
            // Clean up query parameters from URL safely without page reload
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            throw new Error(`Transaction verification status is '${txStatus}'. Please complete payment before verifying.`);
          }
        } catch (err: any) {
          console.error('[Pricing Gateway] Callback verification error:', err);
          setVerifyError(err.message || 'Verification failed. Could not verify payment callback.');
        } finally {
          setVerifying(false);
        }
      };
      
      runUrlVerification();
    }
  }, [user, db]);

  useEffect(() => {
    // Fetch Paystack configuration and live exchange rate
    fetch('/api/paystack/config')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error(`Expected JSON response, but received content-type: ${contentType}`);
      })
      .then(data => {
        if (data && data.success) {
          setPaystackConfigured(data.configured);
          if (data.exchangeRate) {
            setExchangeRate(data.exchangeRate);
          }
        }
        setCheckingConfig(false);
      })
      .catch(err => {
        console.error('[Pricing Gateway] Config check error:', err);
        setPaystackConfigured(false);
        setCheckingConfig(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.subscriptionPlan) {
          setActivePlan(data.subscriptionPlan);
        } else {
          setActivePlan('Free Workspace Tier');
        }
        if (data.subscriptionStatus) {
          setSubStatus(data.subscriptionStatus);
        } else {
          setSubStatus('inactive');
        }
      } else {
        setActivePlan('Free Workspace Tier');
        setSubStatus('inactive');
      }
    }, (error) => {
      console.error("Firestore user sub snapshot error:", error);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user, db]);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Creator Pack',
      price: 12,
      description: 'Unlock entry-level social engines to research video ideas, hashtags, bios, and script drafts.',
      icon: Zap,
      color: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/40 dark:border-cyan-500/10 dark:hover:border-cyan-500/30',
      features: [
        'Video Ideas & Hashtag Engines',
        'Standard social media bio optimizer',
        'Book with Lines & digital script workbook',
        'Access to CHIDON IQ Template Library',
        'Unlimited monthly generation allowance'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Strategist Pack',
      price: 24,
      description: 'High-velocity automation: advanced full-length scripts, thumbnail psychology, competitor labs, and organic SEO tools.',
      icon: Zap,
      color: 'from-purple-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/30 hover:border-indigo-500/60 dark:border-indigo-500/25 dark:hover:border-indigo-500/50',
      badge: 'RECOMMENDED',
      features: [
        'Everything in Starter included',
        'Platform-specific Script Builder with custom length controls',
        'Strategic Competitor Lab & Pillar Charts',
        'Weekly Optimized Posting Calendar Grid',
        'Organic Video Feed SEO Strategizer',
        'Keyword Intel Volume Scans & SEO Scorecards',
        'CHIDON Vault personal cloud archive'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Sovereign Pack',
      price: 30,
      description: 'Premium team suite for trending topics, audience building, hook simulation, and multi-channel repurposing.',
      icon: Crown,
      color: 'from-amber-500/10 to-rose-500/5',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50 dark:border-amber-500/10 dark:hover:border-amber-500/35',
      badge: 'CHIDON IQ MAX',
      features: [
        'Everything in Pro included',
        'Real-time Momentum Trend Tickers',
        'Audience Psychographic Persona Builder',
        'Headline Hook CTR simulator',
        'Omni-channel Repurpose AI converter',
        'Post Scheduler & Command Calendar queue',
        'Instant CSV/Excel report downloads',
        'VIP response support channel'
      ]
    }
  ];

  const handleCheckoutInitiate = async (plan: PricingPlan) => {
    if (!user) return;
    setLoading(true);
    setVerifyError('');
    setPaySuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      const mappedPackage = plan.id === 'enterprise' ? 'enterprise' : (plan.id === 'pro' ? 'pro' : 'basic');
      const foreverDate = Timestamp.fromMillis(Date.now() + 3650 * 24 * 60 * 60 * 1000); // 10 years free
      
      await updateDoc(userRef, {
        subscriptionPlan: plan.name,
        subscriptionStatus: 'active',
        subscriptionPrice: 0,
        paystackSubscriptionRef: 'FREE_UPGRADE_' + plan.id.toUpperCase(),
        updatedAt: serverTimestamp(),
        subscription: {
          status: 'active',
          package: mappedPackage,
          currentPeriodEnd: foreverDate
        }
      });

      setPaySuccess(true);
      setCallbackSuccess(true);
      setCallbackPlanName(plan.name);
      setActivePlan(plan.name);
      setSubStatus('active');
    } catch (err: any) {
      console.error('Plan free activation client error:', err);
      setVerifyError(err.message || 'Failed to activate free plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubscription = async () => {
    if (!payRef || !selectedPlan || !user) return;
    setVerifying(true);
    setVerifyError('');

    try {
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: payRef
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Verification request failed.');
      }

      const txStatus = resData.data.status;
      if (txStatus === 'success') {
        const userRef = doc(db, 'users', user.uid);
        const mappedPackage = selectedPlan.name === 'Enterprise Sovereign Pack' ? 'enterprise' : (selectedPlan.name === 'Pro Strategist Pack' ? 'pro' : 'basic');
        const oneMonthLater = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await updateDoc(userRef, {
          subscriptionPlan: selectedPlan.name,
          subscriptionStatus: 'active',
          subscriptionPrice: selectedPlan.price,
          paystackSubscriptionRef: payRef,
          updatedAt: serverTimestamp(),
          subscription: {
            status: 'active',
            package: mappedPackage,
            currentPeriodEnd: oneMonthLater
          }
        });

        setPaySuccess(true);
        setSelectedPlan(null);
        setCheckoutUrl('');
        setPayRef('');
      } else {
        throw new Error(`Transaction state is currently '${txStatus}'. Please complete payment on the checkout secure tab.`);
      }

    } catch (err: any) {
      console.error('Paystack verification error:', err);
      setVerifyError(err.message || 'Verification failed. Make sure you completed the payment.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12 text-left bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-base)]/60">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] uppercase tracking-wider font-bold">
            <Crown size={12} className="animate-pulse" />
            <span>100% Free Lifetime Sovereign Active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)] leading-none">
            CHIDON IQ: Fully Unlocked & Free
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Enjoy unrestricted, free access to all our premier cognitive social media and SEO engines. Select any premium package below to activate its professional workflows instantly.
          </p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-mono font-bold border border-[var(--border-base)] rounded-xl shadow-sm transition-all"
          >
            ← Back to Sector Terminal
          </button>
        )}
      </div>

      {/* PAYSTACK CALLBACK VERIFICATION STATUS BANNER */}
      {verifying && (
        <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4 text-left shadow-sm">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-500">
            <RefreshCw size={20} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Verifying Payment Transaction...</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-normal mt-0.5">
              Confirming transaction logs with Paystack and synchronizing active workspace privileges. Please do not close this window.
            </p>
          </div>
        </div>
      )}

      {callbackSuccess && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 text-left shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500">
              <CheckCircle size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-emerald-500">Payment Successfully Verified!</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-normal mt-0.5">
                Thank you for subscribing to the <strong className="text-[var(--text-primary)]">{callbackPlanName}</strong>. All premium sector engines have been activated for your user workspace!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCallbackSuccess(false)}
            className="p-1.5 hover:bg-emerald-500/20 rounded-full transition-colors text-emerald-500 cursor-pointer"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {verifyError && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-4 text-left shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-rose-500">Verification Error Detected</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-normal mt-0.5">
                {verifyError}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setVerifyError('')}
            className="p-1.5 hover:bg-rose-500/20 rounded-full transition-colors text-rose-500 cursor-pointer"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* PLANS GRID */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Choose Monthly Subscription Pack
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Activate premium nodes for your workspace instantly. Subscriptions renew monthly.
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelectedPlan = activePlan === plan.name && subStatus === 'active';
            const priceInNgn = plan.price * exchangeRate;
            const isPro = plan.id === 'pro';
            const isEnterprise = plan.id === 'enterprise';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: isPro 
                    ? "0 25px 50px -12px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.25)" 
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className={`flex flex-col bg-[var(--bg-card)] border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 shadow-md ${
                  isSelectedPlan 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : isPro 
                    ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-[0_10px_35px_-5px_rgba(99,102,241,0.2)]' 
                    : plan.borderColor
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-brand to-cyan-500 text-white text-[9px] font-black font-mono px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm shadow-brand/40">
                    🔥 {plan.badge}
                  </div>
                )}
 
                <div className={`absolute -inset-px bg-gradient-to-br ${plan.color} opacity-45 -z-10`} />
                
                {/* Plan Icon and Name */}
                <div className="space-y-4">
                  <div className={`p-3.5 border rounded-2xl w-fit ${
                    isPro 
                      ? 'bg-gradient-to-tr from-brand to-indigo-500 text-white border-brand/20 shadow-md shadow-brand/20' 
                      : 'bg-slate-50 dark:bg-slate-900 border-[var(--border-base)] text-brand'
                  }`}>
                    <PlanIcon size={24} className={isPro ? "text-white" : "text-brand"} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                      {plan.name}
                      {isSelectedPlan && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] rounded-full font-mono font-bold uppercase">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 min-h-[40px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </div>
 
                {/* Pricing indicators */}
                <div className="py-6 border-y border-[var(--border-base)]/40 my-6 space-y-1 text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight text-emerald-500 font-mono">
                      FREE
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono uppercase font-bold">
                      COGNITIVE LIFETIME PLAN
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand font-extrabold font-mono">
                    <Cpu size={14} className="text-brand animate-pulse" />
                    <span className="bg-gradient-to-r from-brand to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider">Unlimited Social Engine Runs</span>
                  </div>
                  <div className="mt-2.5 p-2 bg-indigo-50/40 dark:bg-slate-900/60 border border-[var(--border-base)]/40 rounded-xl inline-flex items-center gap-1.5 w-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold truncate">
                      Secure Instant Provisioning Active
                    </span>
                  </div>
                </div>
 
                {/* Features listing */}
                <div className="flex-1">
                  <h4 className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold mb-3 border-b border-[var(--border-base)]/30 pb-1">Included Engines</h4>
                  <ul className="space-y-3.5 text-left text-xs mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-[var(--text-secondary)] font-semibold leading-relaxed">
                        <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-md shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Checkout Trigger Action */}
                <button
                  onClick={() => handleCheckoutInitiate(plan)}
                  disabled={isSelectedPlan}
                  className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-wider font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer text-center ${
                    isSelectedPlan
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 cursor-not-allowed'
                      : isPro
                      ? 'bg-gradient-to-r from-brand via-indigo-600 to-brand text-white hover:brightness-110 shadow-[0_6px_20px_rgba(99,102,241,0.35)]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-[var(--border-base)] hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--text-primary)]'
                  }`}
                >
                  {isSelectedPlan ? 'Active Plan' : 'Activate Plan for Free'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECURE CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl p-6 relative overflow-hidden text-left shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-cyan-500 to-brand" />
              
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand/10 text-brand rounded-lg">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono uppercase text-[var(--text-secondary)] font-bold">Secure Gateway Console</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium">Verify transaction logs</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)]/40 rounded-2xl space-y-2.5 font-mono text-[11px] mb-5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ORDERED ITEM:</span>
                  <span className="text-[var(--text-primary)] font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ACCESS TYPE:</span>
                  <span className="text-brand font-bold">Monthly Plan Subscription</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">VALUATION IN USD:</span>
                  <span className="text-[var(--text-primary)] font-bold">${selectedPlan.price} USD / month</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border-base)]/40 pt-2 text-xs font-bold text-[var(--text-primary)]">
                  <span>TOTAL PRICE:</span>
                  <span>${selectedPlan.price} USD</span>
                </div>
              </div>

              {checkingConfig ? (
                <div className="flex items-center justify-center gap-2 text-xs font-mono py-4 text-[var(--text-secondary)]">
                  <RefreshCw size={12} className="animate-spin" />
                  Checking workspace gateway config...
                </div>
              ) : (
                <div className="space-y-4">
                  {!paystackConfigured && (
                    <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-sans leading-relaxed">
                      <div className="flex gap-2 items-center font-bold">
                        <AlertTriangle size={15} />
                        <span>Development Sandbox Mode</span>
                      </div>
                      <p className="text-[11px]">
                        Please ensure <code className="bg-black/40 text-yellow-400 px-1 py-0.5 rounded font-mono text-[10px]">PAYSTACK_SECRET_KEY</code> is correctly set in your Google AI Studio Secret tab to unlock real payment processing.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono uppercase text-[var(--text-secondary)] block font-bold">Payer Email Profile</label>
                    <input 
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      placeholder="e.g., recipient@domain.com"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-mono focus:border-brand outline-none transition-colors"
                    />
                  </div>

                  {checkoutUrl && (
                    <div className="space-y-3.5 bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                        🚀 Secure payment tab initiated! If it was blocked, click the link button below to complete the transaction:
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                          href={checkoutUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 font-bold text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink size={12} />
                          Open Checkout Page
                        </a>
                        <button
                          onClick={handleVerifySubscription}
                          disabled={verifying}
                          className="flex-1 py-2.5 bg-brand hover:bg-brand/90 text-white font-bold text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {verifying ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                          <span>Verify Payment Status</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {verifyError && (
                    <p className="text-[10px] font-mono text-red-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 rounded-lg">
                      ⚠️ Verification Log Error: {verifyError}
                    </p>
                  )}

                  {!checkoutUrl && (
                    <button
                      onClick={() => handleCheckoutInitiate(selectedPlan)}
                      disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <RefreshCw size={12} className="animate-spin" /> : <span>Initialize Secure Paystack Payment</span>}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ ACCORDION */}
      <div className="pt-10 border-t border-[var(--border-base)]/50 space-y-6">
        <div className="text-center md:text-left space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Billing FAQ & System Parameters
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Answers to common questions about Chidon pricing packages, billing infrastructure, and secure operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2 font-black">
              <HelpCircle size={14} className="text-brand" />
              What payment options does Paystack support?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Paystack supports real credit/debit cards, bank transfers, mobile wallets, and QR codes across Nigeria, Ghana, Kenya, South Africa, and more. All currency updates are synced in real-time.
            </p>
          </div>

          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2 font-black">
              <HelpCircle size={14} className="text-brand" />
              Can I change or cancel my plan at any time?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Yes, you can upgrade, downgrade, or cancel your active plan at any point inside your cohort cockpit without any penalty. All feature access matches your upgraded tier instantly.
            </p>
          </div>

          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2 font-black">
              <HelpCircle size={14} className="text-brand" />
              Is there any refund or money-back guarantee?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              We offer a complete 14-day zero-risk money-back guarantee on all our pricing tiers. If you are not satisfied, write to our Priority support team for a full refund.
            </p>
          </div>

          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2 font-black">
              <HelpCircle size={14} className="text-brand" />
              Is Paystack secure for transactions?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Paystack is fully PCIDSS Level 1 compliant. Your transaction details are fully encrypted, protected on both client and server layers, and directly processed on official Paystack secure endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* TRIAL EXPIRED MODAL OVERLAY */}
      <AnimatePresence>
        {showTrialEndedModal && (
          <div 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-[6px]"
            onClick={onCloseTrialEndedModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md bg-[#0F172A] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />

              {onCloseTrialEndedModal && (
                <button
                  onClick={onCloseTrialEndedModal}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              )}

              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl shrink-0">
                    <ShieldAlert size={24} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase leading-none">
                      TRIAL HAS EXPIRED
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight pt-1 leading-tight uppercase font-sans">
                      Subscription Required
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Your 24-hour free trial has ended. Choose a package to continue. Upgrade to unlock the full cognitive suite of Chidon IQ including:
                  </p>
                  <ul className="space-y-2 text-[11px] text-slate-400 font-mono font-bold">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> FULL CHIDON IQ AI ENGINES
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> UNRESTRICTED IDEAS & SCRIPTS GENERATION
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> ADVANCED MARKETING & FREELANCE PORTS
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCloseTrialEndedModal}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-brand via-indigo-600 to-purple-600 hover:from-brand/90 hover:to-purple-600/90 active:scale-[0.98] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-1.5"
                  >
                    <span>View Pricing Packages</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
