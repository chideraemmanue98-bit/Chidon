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
  ArrowRight,
  Wallet,
  DollarSign,
  History,
  Sparkles,
  Coins,
  Lightbulb,
  Hash,
  PenTool,
  UserCircle,
  ImageIcon,
  BarChart3,
  Calendar,
  Calculator,
  TrendingUp,
  Users,
  BookOpen,
  Book,
  Clock,
  Trophy,
  Activity,
  Microscope,
  Video,
  Tag,
  Globe,
  Bell,
  FilePlus2,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot, Timestamp, collection, addDoc, query, orderBy, limit, increment } from 'firebase/firestore';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
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
  onNavigate?: (view: any, feature?: any) => void;
}

export default function ChidonPricing({ 
  user, 
  onBack, 
  db,
  showTrialEndedModal = false,
  onCloseTrialEndedModal,
  onNavigate
}: ChidonPricingProps) {
  const [activePlan, setActivePlan] = useState<string>('Free Workspace Tier');
  const [subStatus, setSubStatus] = useState<string>('inactive');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingConfig, setCheckingConfig] = useState<boolean>(true);
  const [paystackConfigured, setPaystackConfigured] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1500);

  // Credit balance and transactions state
  const [userCredits, setUserCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);

  // Checkout & verification states
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'mini' | 'big' | 'pro'>('all');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
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
            
            // Map credits for url callbacks
            const creditsGranted = planName === 'Enterprise Sovereign Pack' ? 500 : (planName === 'Pro Strategist Pack' ? 300 : 120);

            // Check if transaction has already been processed (e.g. by webhook) to prevent double-crediting
            const receiptDocRef = doc(db, 'users', user.uid, 'receipts', reference);
            const receiptSnap = await getDoc(receiptDocRef);
            
            if (receiptSnap.exists()) {
              console.log('[Pricing Gateway] Transaction reference already processed via webhook. Transitioning UI smoothly.');
            } else {
              await updateDoc(userRef, {
                subscriptionPlan: planName,
                subscriptionStatus: 'active',
                subscriptionPrice: price,
                paystackSubscriptionRef: reference,
                updatedAt: serverTimestamp(),
                credits: increment(creditsGranted),
                subscription: {
                  status: 'active',
                  package: mappedPackage,
                  currentPeriodEnd: oneMonthLater
                }
              });

              // Log a transaction history entry
              await addDoc(collection(db, 'users', user.uid, 'transactions'), {
                type: 'credit',
                amount: creditsGranted,
                description: `Purchased ${planName} (+${creditsGranted} credits)`,
                createdAt: serverTimestamp()
              });

              // Also create the receipt document
              await addDoc(collection(db, 'users', user.uid, 'receipts'), {
                reference: reference,
                amountUsd: price,
                bundleName: planName,
                status: 'paid',
                createdAt: serverTimestamp()
              });
            }

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
        if (data.credits !== undefined) {
          setUserCredits(data.credits);
        } else {
          setUserCredits(0);
        }
      } else {
        setActivePlan('Free Workspace Tier');
        setSubStatus('inactive');
        setUserCredits(0);
      }
    }, (error) => {
      console.error("Firestore user sub snapshot error:", error);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user, db]);

  // 4. Real-time Transaction Ledger sync
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(items);
      setLoadingTransactions(false);
    }, (error) => {
      console.error("Failed to sync transactions history:", error);
      setLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Creator Pack',
      price: 9,
      credits: 120,
      description: 'Acquire 120 credits fuel to research content topics, run video tag optimizations, and draft social bio details.',
      icon: Zap,
      color: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/40 dark:border-cyan-500/10 dark:hover:border-cyan-500/30',
      features: [
        '120 high-fidelity credits fuel',
        'Standard Mini Features (2 cr/run)',
        'Weekly Calendars & Hashtag Engines',
        'Book with Lines & digital drafts',
        'Save generations directly to Vault',
        '24/7 client-side ledger synchronization'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Strategist Pack',
      price: 12,
      credits: 300,
      description: 'Best-value mid-tier: 300 credits. Unlocks platform-specific Script builders, Competitor Analysis, and Post scheduling.',
      icon: Zap,
      color: 'from-purple-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/30 hover:border-indigo-500/60 dark:border-indigo-500/25 dark:hover:border-indigo-500/50',
      badge: 'RECOMMENDED',
      features: [
        '300 premium credits fuel',
        'Unlocks Big Features (3 cr/run)',
        'Full-length Script builder runs',
        'Strategic Competitor Lab & Pillar Charts',
        'Organic Video Feed SEO analytics',
        'Weekly Optimized Post calendars',
        'CHIDON Vault personal cloud backups'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Sovereign Pack',
      price: 24,
      credits: 500,
      description: 'Maximum volume bulk tier: 500 credits. Formulated for agency workflows, psychographic builds, and omni-channel converts.',
      icon: Crown,
      color: 'from-amber-500/10 to-rose-500/5',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50 dark:border-amber-500/10 dark:hover:border-amber-500/35',
      badge: 'CHIDON IQ MAX',
      features: [
        '500 high-capacity credits fuel',
        'Unlocks Elite Pro Features (5 cr/run)',
        'Advanced Script Blueprints',
        'Shadowban & Policy Audit solutions',
        'Audience Psychographic Persona builders',
        'Omni-channel Repurpose AI converters',
        'Priority VIP response support queue'
      ]
    }
  ];

  const handleCheckoutInitiate = async (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setLoading(true);
    setVerifyError('');
    setCheckoutUrl('');
    setPayRef('');
    setPaySuccess(false);

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: payerEmail || user?.email || 'subscriber@chidon.iq',
          amount: plan.price,
          currency: 'USD',
          orderId: `credits_${plan.id}_${Date.now()}`,
          metadata: {
            planId: plan.id,
            planName: plan.name,
            userId: user?.uid,
            isSubscription: false
          }
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Initialization request failed.');
      }

      const { authorization_url, reference } = resData.data;
      setCheckoutUrl(authorization_url);
      setPayRef(reference);

      // Open secure window
      window.open(authorization_url, '_blank', 'noopener,noreferrer');

    } catch (err: any) {
      console.error('Paystack initialization client error:', err);
      setVerifyError(err.message || 'Failed to initialize Paystack checkout.');
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
        
        const creditsGranted = selectedPlan.credits;

        await updateDoc(userRef, {
          subscriptionPlan: selectedPlan.name,
          subscriptionStatus: 'active',
          subscriptionPrice: selectedPlan.price,
          paystackSubscriptionRef: payRef,
          updatedAt: serverTimestamp(),
          credits: increment(creditsGranted),
          subscription: {
            status: 'active',
            package: mappedPackage,
            currentPeriodEnd: oneMonthLater
          }
        });

        // Log transaction history
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          type: 'credit',
          amount: creditsGranted,
          description: `Purchased ${selectedPlan.name} (+${creditsGranted} credits)`,
          createdAt: serverTimestamp()
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-[10px] uppercase tracking-wider font-bold">
            <Crown size={12} className="animate-pulse" />
            <span>Workspace Upgrades</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)] leading-none">
            Chidon Pricing Matrix
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Unlock premium cognitive social media engines. Choose a monthly subscription pack to activate professional workflows. Connected securely to Paystack.
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

      {/* NEW: PROFESSIONAL CREDITS WALLET & AVAILABLE BALANCE DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Dynamic Balance Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl text-white shadow-xl min-h-[300px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <Wallet size={18} />
                </div>
                <span className="text-xs font-mono tracking-widest text-indigo-300 font-bold uppercase">CHIDON SECURE WALLET</span>
              </div>
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] font-mono font-bold uppercase">
                Active Ledger
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                  <Coins className="text-brand animate-bounce" size={40} />
                  {userCredits}
                </span>
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest font-bold">Credits</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                This balance fuels your Chidon IQ cognitive runs. Standard analyses burn 1–2 credits; high-volume script designs and competitor sweeps burn 3–5.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Real-time Transaction history log */}
        <div className="lg:col-span-7 flex flex-col p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-base)]/50">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <History size={16} className="text-brand" />
              <h3 className="text-sm font-bold uppercase tracking-tight">Real-time Transaction History</h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">Recent 10 operations</span>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto max-h-[220px] pr-2 space-y-3 custom-scrollbar">
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center h-full py-12 space-y-2">
                <RefreshCw size={20} className="animate-spin text-brand" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">Syncing ledger records...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="p-3 bg-[var(--bg-app)] rounded-full text-[var(--text-secondary)] mb-2">
                  <Coins size={20} />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-primary)]">Transaction Ledger Empty</h4>
                <p className="text-[10px] text-[var(--text-secondary)] max-w-xs mt-1">
                  Once you purchase a package or perform cognitive runs, your history ledger will sync here.
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isDebit = tx.type === 'debit';
                const date = tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : new Date().toLocaleString();
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-base)]/50 rounded-xl hover:bg-[var(--border-base)]/10 transition-colors">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">
                        {tx.description}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-secondary)]">
                        {date}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-black ${isDebit ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {isDebit ? '-' : '+'}{tx.amount} cr
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PLANS GRID / CREDIT RECHARGE PACKAGES */}
      <div className="space-y-6 pt-4 border-t border-[var(--border-base)]/40">
        <div className="text-center md:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-full text-brand text-[9px] font-mono font-black uppercase tracking-wider">
            Payments Pack
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Acquire Credit Fuel Packages
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Buy high-fidelity credit recharges securely using Paystack. Refill credits instantly.
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
                <div className="py-6 border-y border-[var(--border-base)]/40 my-6 space-y-2 text-left">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black tracking-tight text-[var(--text-primary)] font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-indigo-400 to-[var(--text-primary)]">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-brand font-mono uppercase font-black tracking-wider px-2 py-0.5 bg-brand/5 border border-brand/20 rounded-md">
                      {plan.credits} CREDITS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-extrabold font-mono">
                    <Cpu size={14} className="text-brand animate-pulse" />
                    <span className="uppercase tracking-wider text-[11px]">One-Time Refill Purchase</span>
                  </div>
                  <div className="mt-2.5 p-2 bg-indigo-50/40 dark:bg-slate-900/60 border border-[var(--border-base)]/40 rounded-xl inline-flex items-center gap-1.5 w-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold truncate">
                      Instant Wallet Allocation Active
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
                  className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-wider font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer text-center ${
                    isPro
                      ? 'bg-gradient-to-r from-brand via-indigo-600 to-brand text-white hover:brightness-110 shadow-[0_6px_20px_rgba(99,102,241,0.35)]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-[var(--border-base)] hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--text-primary)]'
                  }`}
                >
                  Purchase Credits Package
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
                  <span className="text-[var(--text-secondary)]">ORDERED PACK:</span>
                  <span className="text-[var(--text-primary)] font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">CREDITS TO GRANT:</span>
                  <span className="text-brand font-bold">+{selectedPlan.credits} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">BILLING TYPE:</span>
                  <span className="text-[var(--text-primary)] font-bold">One-Time Refill Purchase</span>
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
                        <span>Merchant Integration Advisory</span>
                      </div>
                      <p className="text-[11px]">
                        Please configure <code className="bg-black/40 text-yellow-400 px-1 py-0.5 rounded font-mono text-[10px]">PAYSTACK_SECRET_KEY</code> in your environment variables or Developer Secrets Panel to activate the live billing gateway.
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

      {/* COGNITIVE DIRECTORY & FEATURE COST COMPASS */}
      <div className="pt-12 border-t border-[var(--border-base)]/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[9px] font-mono font-bold uppercase rounded-full">
              <Cpu size={10} className="animate-pulse" />
              Sizing Engine Powered by Google Gemini AI
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
              AI Cognitive Directory & Feature Costs
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Every system operation is sized based on processing complexity. Mini features consume 2 credits, Big features consume 3 credits, and Pro features consume 5 credits.
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex flex-wrap items-center justify-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-[var(--border-base)]/40 w-fit self-center">
            {(['all', 'mini', 'big', 'pro'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategoryTab(tab)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategoryTab === tab
                    ? 'bg-brand text-white shadow-sm shadow-brand/20 scale-[1.02]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'all' ? 'All' : `${tab} (${tab === 'mini' ? '2 cr' : tab === 'big' ? '3 cr' : '5 cr'})`}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar and counts */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search cognitive tools..."
              value={featureSearchQuery}
              onChange={(e) => setFeatureSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl pl-3 pr-8 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-brand transition-colors font-mono"
            />
            {featureSearchQuery && (
              <button
                onClick={() => setFeatureSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-[var(--border-base)]/30">
            SHOWING {
              [
                // Pro (5 cr)
                { id: 'ai-script-outline', label: 'Script Blueprint', description: 'Full narrative architecture from seed keywords.', tier: 'Pro', cost: 5, icon: FilePlus2 },
                { id: 'shadowban-solutions', label: 'Shadowban Solutions', description: 'Audit channel health, check sensitive policy risk indicators and trace 30-day view recovery action steps.', tier: 'Pro', cost: 5, icon: AlertCircle },

                // Big (3 cr)
                { id: 'content-ideas', label: 'Video Ideas', description: 'Viral video formats, hooks, and script protocols.', tier: 'Big', cost: 3, icon: Lightbulb },
                { id: 'scripts', label: 'Script Writer', description: 'Platform-specific scripts with length controls.', tier: 'Big', cost: 3, icon: PenTool },
                { id: 'thumbnails', label: 'Thumbnail Designer', description: 'Visual concept briefs and psychology.', tier: 'Big', cost: 3, icon: ImageIcon },
                { id: 'competitor-analysis', label: 'Competitor Lab', description: 'Strategic intelligence and pillar charts.', tier: 'Big', cost: 3, icon: BarChart3 },
                { id: 'trending', label: 'Trend Detector', description: '20 momentum-scored trending topics.', tier: 'Big', cost: 3, icon: TrendingUp },
                { id: 'personas', label: 'Audience Builder', description: 'Fictional audience profiles and psychological triggers.', tier: 'Big', cost: 3, icon: Users },
                { id: 'repurposing', label: 'Repurpose AI', description: 'Tactical content conversion for multi-platform ops.', tier: 'Big', cost: 3, icon: Sparkles },
                { id: 'template-library', label: 'CHIDON IQ Template Library', description: 'Populate professional social posts, bios, and competitor maps with CHIDON Intelligence Engine.', tier: 'Big', cost: 3, icon: Zap },
                { id: 'youtube-seo', label: 'Organic Video Feed Strategizer', description: 'Viral metadata optimization and ranking strategy.', tier: 'Big', cost: 3, icon: Trophy },
                { id: 'seo-scorecard', label: 'SEO Scorecard', description: 'Real-time neural content audit and score.', tier: 'Big', cost: 3, icon: Activity },
                { id: 'keyword-research', label: 'Keyword Intel', description: 'Deep volume, competition, and difficulty scan.', tier: 'Big', cost: 3, icon: Microscope },
                { id: 'vseo-title-desc', label: 'Title + Description Generator', description: 'High-CTR titles and descriptions optimized for growth.', tier: 'Big', cost: 3, icon: Video },
                { id: 'vseo-scorecard', label: 'Video Auditor', description: '1-100 score based on title, tags, and keywords.', tier: 'Big', cost: 3, icon: Trophy },
                { id: 'vseo-keywords', label: 'Keyword Research', description: 'Data-driven search volume, competition tiers, and related video terms.', tier: 'Big', cost: 3, icon: Microscope },
                { id: 'trending-topics', label: 'Trending Topics', description: 'Real-time niche trending topics updated daily with momentum scores.', tier: 'Big', cost: 3, icon: Globe },

                // Mini (2 cr)
                { id: 'hashtags', label: 'Hashtag Engine', description: 'Ranked hashtag research with reach tiers.', tier: 'Mini', cost: 2, icon: Hash },
                { id: 'bio', label: 'Bio Optimizer', description: 'Three optimized bio versions with strategy.', tier: 'Mini', cost: 2, icon: UserCircle },
                { id: 'posting-schedule', label: 'Schedule Lab', description: 'Styled weekly optimized calendar grid.', tier: 'Mini', cost: 2, icon: Calendar },
                { id: 'engagement-calc', label: 'Engagement Advisor', description: 'Computing rates and 30-day growth plans.', tier: 'Mini', cost: 2, icon: Calculator },
                { id: 'headlines', label: 'Headline Hook', description: '10 hook formulas with predicted CTR markers.', tier: 'Mini', cost: 2, icon: Zap },
                { id: 'post-scheduler', label: 'Command Calendar', description: 'Tactical content scheduling and queue management.', tier: 'Mini', cost: 2, icon: Calendar },
                { id: 'drafts', label: 'CHIDON Vault', description: 'Specialized index of saved scripts, social bios, and intelligence reports.', tier: 'Mini', cost: 2, icon: BookOpen },
                { id: 'ruled-book', label: 'Book with Lines', description: 'Digital journal and script book structured over authentic ruled sheets.', tier: 'Mini', cost: 2, icon: Book },
                { id: 'post-optimizer', label: 'Time Optimizer', description: 'Global posting windows optimized by local data.', tier: 'Mini', cost: 2, icon: Clock },
                { id: 'vseo-tags', label: 'Tag Architect', description: 'Neural tag extraction for high-volume ranking.', tier: 'Mini', cost: 2, icon: Tag },
                { id: 'vseo-best-time', label: 'Post Optimizer', description: 'Data-driven timing for maximum reach.', tier: 'Mini', cost: 2, icon: Clock },
                { id: 'daily-ideas', label: 'Daily Video Ideas', description: 'Neural content suggestions based on current niche heatmaps.', tier: 'Mini', cost: 2, icon: Lightbulb },
                { id: 'trend-alerts', label: 'Trend Alerts', description: 'Neural notification protocols for sudden keyword spikes.', tier: 'Mini', cost: 2, icon: Bell }
              ].filter(f => {
                const matchesTab = selectedCategoryTab === 'all' || f.tier.toLowerCase() === selectedCategoryTab;
                const matchesSearch = f.label.toLowerCase().includes(featureSearchQuery.toLowerCase()) || f.description.toLowerCase().includes(featureSearchQuery.toLowerCase());
                return matchesTab && matchesSearch;
              }).length
            } ENGINES
          </div>
        </div>

        {/* Features list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            // Pro (5 cr)
            { id: 'ai-script-outline', label: 'Script Blueprint', description: 'Full narrative architecture from seed keywords.', tier: 'Pro', cost: 5, icon: FilePlus2 },
            { id: 'shadowban-solutions', label: 'Shadowban Solutions', description: 'Audit channel health, check sensitive policy risk indicators and trace 30-day view recovery action steps.', tier: 'Pro', cost: 5, icon: AlertCircle },

            // Big (3 cr)
            { id: 'content-ideas', label: 'Video Ideas', description: 'Viral video formats, hooks, and script protocols.', tier: 'Big', cost: 3, icon: Lightbulb },
            { id: 'scripts', label: 'Script Writer', description: 'Platform-specific scripts with length controls.', tier: 'Big', cost: 3, icon: PenTool },
            { id: 'thumbnails', label: 'Thumbnail Designer', description: 'Visual concept briefs and psychology.', tier: 'Big', cost: 3, icon: ImageIcon },
            { id: 'competitor-analysis', label: 'Competitor Lab', description: 'Strategic intelligence and pillar charts.', tier: 'Big', cost: 3, icon: BarChart3 },
            { id: 'trending', label: 'Trend Detector', description: '20 momentum-scored trending topics.', tier: 'Big', cost: 3, icon: TrendingUp },
            { id: 'personas', label: 'Audience Builder', description: 'Fictional audience profiles and psychological triggers.', tier: 'Big', cost: 3, icon: Users },
            { id: 'repurposing', label: 'Repurpose AI', description: 'Tactical content conversion for multi-platform ops.', tier: 'Big', cost: 3, icon: Sparkles },
            { id: 'template-library', label: 'CHIDON IQ Template Library', description: 'Populate professional social posts, bios, and competitor maps with CHIDON Intelligence Engine.', tier: 'Big', cost: 3, icon: Zap },
            { id: 'youtube-seo', label: 'Organic Video Feed Strategizer', description: 'Viral metadata optimization and ranking strategy.', tier: 'Big', cost: 3, icon: Trophy },
            { id: 'seo-scorecard', label: 'SEO Scorecard', description: 'Real-time neural content audit and score.', tier: 'Big', cost: 3, icon: Activity },
            { id: 'keyword-research', label: 'Keyword Intel', description: 'Deep volume, competition, and difficulty scan.', tier: 'Big', cost: 3, icon: Microscope },
            { id: 'vseo-title-desc', label: 'Title + Description Generator', description: 'High-CTR titles and descriptions optimized for growth.', tier: 'Big', cost: 3, icon: Video },
            { id: 'vseo-scorecard', label: 'Video Auditor', description: '1-100 score based on title, tags, and keywords.', tier: 'Big', cost: 3, icon: Trophy },
            { id: 'vseo-keywords', label: 'Keyword Research', description: 'Data-driven search volume, competition tiers, and related video terms.', tier: 'Big', cost: 3, icon: Microscope },
            { id: 'trending-topics', label: 'Trending Topics', description: 'Real-time niche trending topics updated daily with momentum scores.', tier: 'Big', cost: 3, icon: Globe },

            // Mini (2 cr)
            { id: 'hashtags', label: 'Hashtag Engine', description: 'Ranked hashtag research with reach tiers.', tier: 'Mini', cost: 2, icon: Hash },
            { id: 'bio', label: 'Bio Optimizer', description: 'Three optimized bio versions with strategy.', tier: 'Mini', cost: 2, icon: UserCircle },
            { id: 'posting-schedule', label: 'Schedule Lab', description: 'Styled weekly optimized calendar grid.', tier: 'Mini', cost: 2, icon: Calendar },
            { id: 'engagement-calc', label: 'Engagement Advisor', description: 'Computing rates and 30-day growth plans.', tier: 'Mini', cost: 2, icon: Calculator },
            { id: 'headlines', label: 'Headline Hook', description: '10 hook formulas with predicted CTR markers.', tier: 'Mini', cost: 2, icon: Zap },
            { id: 'post-scheduler', label: 'Command Calendar', description: 'Tactical content scheduling and queue management.', tier: 'Mini', cost: 2, icon: Calendar },
            { id: 'drafts', label: 'CHIDON Vault', description: 'Specialized index of saved scripts, social bios, and intelligence reports.', tier: 'Mini', cost: 2, icon: BookOpen },
            { id: 'ruled-book', label: 'Book with Lines', description: 'Digital journal and script book structured over authentic ruled sheets.', tier: 'Mini', cost: 2, icon: Book },
            { id: 'post-optimizer', label: 'Time Optimizer', description: 'Global posting windows optimized by local data.', tier: 'Mini', cost: 2, icon: Clock },
            { id: 'vseo-tags', label: 'Tag Architect', description: 'Neural tag extraction for high-volume ranking.', tier: 'Mini', cost: 2, icon: Tag },
            { id: 'vseo-best-time', label: 'Post Optimizer', description: 'Data-driven timing for maximum reach.', tier: 'Mini', cost: 2, icon: Clock },
            { id: 'daily-ideas', label: 'Daily Video Ideas', description: 'Neural content suggestions based on current niche heatmaps.', tier: 'Mini', cost: 2, icon: Lightbulb },
            { id: 'trend-alerts', label: 'Trend Alerts', description: 'Neural notification protocols for sudden keyword spikes.', tier: 'Mini', cost: 2, icon: Bell }
          ]
            .filter(f => {
              const matchesTab = selectedCategoryTab === 'all' || f.tier.toLowerCase() === selectedCategoryTab;
              const matchesSearch = f.label.toLowerCase().includes(featureSearchQuery.toLowerCase()) || f.description.toLowerCase().includes(featureSearchQuery.toLowerCase());
              return matchesTab && matchesSearch;
            })
            .map((feature) => {
              const FeatureIcon = feature.icon || Sparkles;
              const isMini = feature.tier === 'Mini';
              const isPro = feature.tier === 'Pro';
              
              return (
                <motion.div
                  key={feature.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="p-4 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isPro 
                          ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                          : isMini 
                          ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        <FeatureIcon size={16} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                          isPro 
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                            : isMini 
                            ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {feature.tier}
                        </span>
                        <span className="text-[10px] font-mono font-extrabold text-brand bg-brand/5 border border-brand/20 px-2 py-0.5 rounded">
                          {feature.cost} cr
                        </span>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                        {feature.label}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-semibold min-h-[30px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => {
                        if (feature.id === 'blog') {
                          onNavigate('blog');
                        } else if (feature.id === 'earn') {
                          onNavigate('earn');
                        } else {
                          onNavigate('tools', feature.id);
                        }
                      }}
                      className="w-full py-1.5 bg-slate-50 dark:bg-slate-800 border border-[var(--border-base)]/60 hover:border-brand/40 hover:bg-brand hover:text-white rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Launch Engine</span>
                      <ArrowRight size={10} />
                    </button>
                  )}
                </motion.div>
              );
            })}
        </div>
      </div>

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
              Do purchased credits ever expire?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              No, all credit packs bought via Paystack sit securely in your active wallet ledger forever. They do not expire and can be burned at your own pace.
            </p>
          </div>

          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2 font-black">
              <HelpCircle size={14} className="text-brand" />
              How are credits deducted?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Credits are deducted in real-time each time you initiate a Chidon IQ cognitive feature run. If a generation fails, credits are not deducted, and you can monitor every operation securely inside your real-time transaction history panel.
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
