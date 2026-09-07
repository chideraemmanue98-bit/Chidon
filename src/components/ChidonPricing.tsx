import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  HelpCircle,
  Cpu,
  X,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Wallet,
  History,
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
  AlertCircle,
  Mail,
  Printer
} from 'lucide-react';
import { 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  serverTimestamp, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  increment 
} from 'firebase/firestore';
import { triggerNotification } from '../hooks/useNotifications';
import toast from 'react-hot-toast';

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

const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [userCredits, setUserCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState<boolean>(true);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'usage' | 'invoices'>('usage');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'mini' | 'big' | 'pro'>('all');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [claimedFreeCredits, setClaimedFreeCredits] = useState<boolean>(false);
  const [claimingFree, setClaimingFree] = useState<boolean>(false);

  // Paystack transaction state definitions
  const [paystackConfigured, setPaystackConfigured] = useState<boolean>(false);
  const [paystackCheckingConfig, setPaystackCheckingConfig] = useState<boolean>(true);
  const [paystackLoading, setPaystackLoading] = useState<boolean>(false);
  const [paystackCheckoutUrl, setPaystackCheckoutUrl] = useState<string>('');
  const [paystackRef, setPaystackRef] = useState<string>('');
  const [paystackVerifyError, setPaystackVerifyError] = useState<string>('');
  const [paystackVerifying, setPaystackVerifying] = useState<boolean>(false);
  const [paystackSuccess, setPaystackSuccess] = useState<boolean>(false);
  const [showPaystackModal, setShowPaystackModal] = useState<PricingPlan | null>(null);
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1500); // default fallback

  // Set default email on user load
  useEffect(() => {
    if (user && user.email) {
      setPayerEmail(user.email);
    }
  }, [user]);

  // Check if Paystack is configured on backend
  useEffect(() => {
    fetch('/api/paystack/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaystackConfigured(data.configured);
          if (data.exchangeRate) {
            setExchangeRate(data.exchangeRate);
          }
        }
        setPaystackCheckingConfig(false);
      })
      .catch(err => {
        console.error('Error checking Paystack config:', err);
        setPaystackCheckingConfig(false);
      });
  }, []);

  // Claim Free Promo Credits Promo
  const handleClaimFreeCredits = async () => {
    if (!user) {
      toast.error("Please authenticate to claim free credits.");
      return;
    }
    setClaimingFree(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        credits: increment(300),
        claimedFreeCredits: true
      });

      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        type: 'credit',
        amount: 300,
        description: `Claimed Welcome Promo Credits (+300 credits)`,
        createdAt: serverTimestamp()
      });

      // Automatic system notification dispatch
      triggerNotification(user.uid, {
        type: 'credit',
        title: 'Claimed 300 Free Credits!',
        body: 'Your Welcome Promo Credits (+300 credits) have been credited to your balance.',
        link: '/pricing'
      }).catch(err => console.error("Claim notification failed", err));

      toast.success("Successfully claimed 300 free credits!");
    } catch (err: any) {
      console.error("Failed to claim free credits:", err);
      toast.error("Error claiming credits: " + err.message);
    } finally {
      setClaimingFree(false);
    }
  };

  // Real-time Credit Balance Sync
  useEffect(() => {
    if (!user) return;
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      setActivePlan('Enterprise Sovereign Pack');
      setSubStatus('active');
      const localCredits = localStorage.getItem("chidon_local_credits");
      setUserCredits(localCredits !== null ? Number(localCredits) : 7);
      setClaimedFreeCredits(true);
      return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setActivePlan(data.subscriptionPlan || 'Free Workspace Tier');
        setSubStatus(data.subscriptionStatus || 'inactive');
        setUserCredits(data.credits !== undefined ? data.credits : 0);
        setClaimedFreeCredits(!!data.claimedFreeCredits);
      } else {
        setActivePlan('Free Workspace Tier');
        setSubStatus('inactive');
        setUserCredits(0);
        setClaimedFreeCredits(false);
      }
    }, (error) => {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('CANCELLED') || errMsg.includes('Disconnecting idle stream')) {
        console.debug("Firestore user sub snapshot connection idle (self-healing).");
      } else {
        console.error("Firestore user sub snapshot error:", error);
      }
    });

    return () => unsubscribeUser();
  }, [user, db]);

  // Real-time Transaction history log
  useEffect(() => {
    if (!user) return;
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }
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
      const errMsg = error?.message || String(error);
      if (errMsg.includes('CANCELLED') || errMsg.includes('Disconnecting idle stream')) {
        console.debug("Firestore transactions idle (self-healing).");
      } else {
        console.error("Failed to sync transactions history:", error);
      }
      setLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  // Real-time Receipts / Invoices list loader
  useEffect(() => {
    if (!user) return;
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      setReceipts([]);
      setLoadingReceipts(false);
      return;
    }
    const q = query(
      collection(db, 'users', user.uid, 'receipts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setReceipts(items);
      setLoadingReceipts(false);
    }, (error) => {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('CANCELLED') || errMsg.includes('Disconnecting idle stream')) {
        console.debug("Firestore receipts idle (self-healing).");
      } else {
        console.error("Failed to sync receipts list:", error);
      }
      setLoadingReceipts(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Creator Pack',
      price: 5,
      credits: 50,
      description: 'Acquire 50 premium credits instantly to research content topics, run video tag optimizations, and draft social bios.',
      icon: Zap,
      color: 'bg-cyan-500/5',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
      features: [
        '50 high-fidelity credits fuel',
        'Standard Mini Features (Free)',
        'Weekly Calendars & Hashtag Engines',
        'NOTEPAD SAVE & digital drafts',
        'Save generations directly to Vault',
        '24/7 client-side ledger synchronization'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Strategist Pack',
      price: 12,
      credits: 150,
      description: 'Unlock 150 premium credits. Access platform-specific Script builders, Competitor Analysis, and custom Post scheduling.',
      icon: Crown,
      color: 'bg-indigo-500/5',
      borderColor: 'border-indigo-500/40 hover:border-indigo-500/70',
      badge: 'RECOMMENDED',
      features: [
        '150 premium credits fuel',
        'Unlocks Big Features (Free)',
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
      credits: 320,
      description: 'High-capacity bulk tier: 320 credits. Formulated for agency workflows, psychographic builds, and omni-channel campaigns.',
      icon: Cpu,
      color: 'bg-amber-500/5',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
      badge: 'CHIDON IQ MAX',
      features: [
        '320 high-capacity credits fuel',
        'Unlocks Elite Pro Features (Free)',
        'Advanced Script Blueprints',
        'Shadowban & Policy Audit solutions',
        'Audience Psychographic Persona builders',
        'Omni-channel Repurpose AI converters',
        'Priority VIP response support queue'
      ]
    }
  ];

  const handleCheckoutInitiate = (plan: PricingPlan) => {
    if (!user) {
      toast.error("Please login to purchase credits.");
      return;
    }
    setPaystackVerifyError('');
    setPaystackCheckoutUrl('');
    setPaystackRef('');
    setPaystackSuccess(false);
    setShowPaystackModal(plan);
  };

  const handleInitializePaystack = async () => {
    if (!user || !showPaystackModal) {
      toast.error("Invalid purchase context.");
      return;
    }
    setPaystackLoading(true);
    setPaystackVerifyError('');
    setPaystackCheckoutUrl('');
    setPaystackRef('');
    setPaystackSuccess(false);

    try {
      // 1. Fetch public key configuration
      const configRes = await fetch('/api/paystack/config');
      const configData = await configRes.json();
      const resolvedPublicKey = configData.publicKey || "";

      // 2. Initialize checkout on backend
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: payerEmail || user.email || 'customer@chidon.iq',
          amount: showPaystackModal.price,
          metadata: {
            userId: user.uid,
            planName: showPaystackModal.name,
            creditsGranted: showPaystackModal.credits
          }
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Initialization request failed.');
      }

      const { authorization_url, reference, access_code } = resData.data;
      setPaystackCheckoutUrl(authorization_url);
      setPaystackRef(reference);

      // Try loading Paystack Pop Inline SDK for direct in-page iframe popups to avoid popup blockers!
      const scriptLoaded = await loadPaystackScript();
      if (scriptLoaded && (window as any).PaystackPop && resolvedPublicKey) {
        console.log("[Paystack Engine] Script loaded successfully. Launching Inline Popup...");
        try {
          const handler = (window as any).PaystackPop.setup({
            key: resolvedPublicKey,
            email: payerEmail || user.email || 'customer@chidon.iq',
            amount: Math.round(showPaystackModal.price * exchangeRate * 100),
            currency: "NGN",
            ref: reference,
            access_code: access_code,
            callback: async (response: any) => {
              console.log("[Paystack Inline] Success callback response:", response);
              toast.success("Transaction approved by Paystack! Verifying & allocating credits...");
              await handleVerifyPaystack(reference);
            },
            onSuccess: async (response: any) => {
              console.log("[Paystack Inline] Success onSuccess response:", response);
              toast.success("Transaction approved by Paystack! Verifying & allocating credits...");
              await handleVerifyPaystack(reference);
            },
            onClose: () => {
              toast("Payment session closed.");
            }
          });
          handler.openIframe();
          toast.success("Paystack Popup Opened. Complete your payment inside the secure modal.");
        } catch (popupErr: any) {
          console.warn("[Paystack Inline] Popup launch failed, falling back to tab redirection:", popupErr);
          window.open(authorization_url, '_blank', 'noopener,noreferrer');
          toast.success("Paystack payment channel initialized! Complete checkout in the new tab.");
        }
      } else {
        // Fallback: Open checkout link in a new tab safely
        window.open(authorization_url, '_blank', 'noopener,noreferrer');
        toast.success("Paystack payment channel initialized! Complete checkout in the new tab.");
      }

    } catch (err: any) {
      console.error('Paystack initialization client error:', err);
      setPaystackVerifyError(err.message || 'Failed to initialize Paystack checkout.');
      toast.error(err.message || 'Failed to initialize Paystack checkout.');
    } finally {
      setPaystackLoading(false);
    }
  };

  const handleVerifyPaystack = async (forcedRef?: string) => {
    const referenceToVerify = forcedRef || paystackRef;
    if (!referenceToVerify || !showPaystackModal) return;
    setPaystackVerifying(true);
    setPaystackVerifyError('');

    try {
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: referenceToVerify
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Verification request failed.');
      }

      const txStatus = resData.data.status;
      if (txStatus === 'success') {
        const creditsGranted = showPaystackModal.credits;

        if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
          const currentCredits = Number(localStorage.getItem("chidon_local_credits") || "7");
          const newCredits = currentCredits + creditsGranted;
          localStorage.setItem("chidon_local_credits", String(newCredits));
          setUserCredits(newCredits);
          
          // Log simulated purchase transaction locally for guest/sandbox users
          const localTransactionsStr = localStorage.getItem("chidon_local_transactions") || "[]";
          try {
            const txs = JSON.parse(localTransactionsStr);
            txs.unshift({
              id: `tx_${referenceToVerify || Date.now()}`,
              type: 'credit',
              amount: creditsGranted,
              description: `Purchased ${showPaystackModal.name}: +${creditsGranted} Credits`,
              createdAt: new Date().toISOString()
            });
            localStorage.setItem("chidon_local_transactions", JSON.stringify(txs.slice(0, 50)));
          } catch (e) {
            console.error("Local purchase transaction log error:", e);
          }
          
          // Dispatch custom event to notify all application views to refresh their local credit state
          window.dispatchEvent(new Event("chidon_local_credits_updated"));
          
          setPaystackSuccess(true);
          toast.success(`💳 Balance Credited! Successfully allocated +${creditsGranted} cognitive credits. Your new balance is ${newCredits} credits.`);
          
          setTimeout(() => {
            setShowPaystackModal(null);
            setPaystackCheckoutUrl('');
            setPaystackRef('');
            setPaystackSuccess(false);
          }, 1500);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        
        // Anti-Double Spend Idempotency: Check if receipt already exists in Firestore (webhook may have handled it)
        const receiptDocRef = doc(db, 'users', user.uid, 'receipts', referenceToVerify);
        const receiptSnap = await getDoc(receiptDocRef);
        
        const newCount = (userCredits || 0) + creditsGranted;

        if (receiptSnap.exists()) {
          console.log('[Paystack Settle] Payment already processed via Webhook.');
          setPaystackSuccess(true);
          toast.success(`💳 Balance Credited! Successfully synchronized payment. Your current balance is ${userCredits} credits.`);
          
          setTimeout(() => {
            setShowPaystackModal(null);
            setPaystackCheckoutUrl('');
            setPaystackRef('');
            setPaystackSuccess(false);
          }, 1500);
          return;
        }

        // Settle state directly for instantaneous UX
        await updateDoc(userRef, {
          credits: increment(creditsGranted),
          subscriptionPlan: showPaystackModal.name,
          subscriptionStatus: 'active',
          updatedAt: serverTimestamp()
        });

        // Log transaction
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          type: 'credit',
          amount: creditsGranted,
          description: `Purchased ${showPaystackModal.name} (+${creditsGranted} credits)`,
          createdAt: serverTimestamp()
        });

        // Trigger automatic system notification
        triggerNotification(user.uid, {
          type: 'credit',
          title: `Acquired +${creditsGranted} Credits`,
          body: `Successfully purchased ${showPaystackModal.name} package. Balance updated!`,
          link: '/credits'
        }).catch(err => console.error("Purchase notification failed", err));

        // Add receipt
        await setDoc(doc(db, 'users', user.uid, 'receipts', referenceToVerify), {
          amountUsd: showPaystackModal.price,
          amountNgn: showPaystackModal.price * exchangeRate,
          reference: referenceToVerify,
          payerEmail: payerEmail || user.email || "subscriber@chidon.iq",
          bundleName: showPaystackModal.name,
          status: "paid",
          createdAt: serverTimestamp()
        });

        setPaystackSuccess(true);
        toast.success(`💳 Balance Credited! Successfully allocated +${creditsGranted} cognitive credits. Your new balance is ${newCount} credits.`);
        
        setTimeout(() => {
          setShowPaystackModal(null);
          setPaystackCheckoutUrl('');
          setPaystackRef('');
          setPaystackSuccess(false);
        }, 1500);
      } else {
        throw new Error(`Transaction status is currently '${txStatus}'. Complete the payment on the Paystack page first.`);
      }

    } catch (err: any) {
      console.error('Paystack verification error:', err);
      setPaystackVerifyError(err.message || 'Verification failed. Please check that your payment has finished.');
      toast.error(err.message || 'Verification failed.');
    } finally {
      setPaystackVerifying(false);
    }
  };

  const cognitiveFeatures = [
    { id: 'ai-script-outline', label: 'Script Blueprint', description: 'Full narrative architecture from seed keywords.', tier: 'Pro', cost: 5, icon: FilePlus2 },
    { id: 'shadowban-solutions', label: 'Shadowban Solutions', description: 'Audit channel health, check sensitive policy risk indicators and trace view recovery action steps.', tier: 'Pro', cost: 5, icon: AlertCircle },
    { id: 'content-ideas', label: 'Video Ideas', description: 'Viral video formats, hooks, and script protocols.', tier: 'Mini', cost: 2, icon: Lightbulb },
    { id: 'scripts', label: 'Script Writer', description: 'Platform-specific scripts with length controls.', tier: 'Big', cost: 3, icon: PenTool },
    { id: 'thumbnails', label: 'Thumbnail Designer', description: 'Visual concept briefs and psychology.', tier: 'Big', cost: 3, icon: ImageIcon },
    { id: 'competitor-analysis', label: 'Competitor Lab', description: 'Strategic intelligence and pillar charts.', tier: 'Big', cost: 3, icon: BarChart3 },
    { id: 'trending', label: 'Trend Detector', description: '20 momentum-scored trending topics.', tier: 'Big', cost: 3, icon: TrendingUp },
    { id: 'personas', label: 'Audience Builder', description: 'Fictional audience profiles and psychological triggers.', tier: 'Big', cost: 3, icon: Users },
    { id: 'repurposing', label: 'Repurpose AI', description: 'Tactical content conversion for multi-platform ops.', tier: 'Big', cost: 3, icon: Cpu },
    { id: 'template-library', label: 'Template Library', description: 'Populate professional social posts, bios, and competitor maps.', tier: 'Big', cost: 3, icon: Zap },
    { id: 'youtube-seo', label: 'Video Feed Strategizer', description: 'Viral metadata optimization and ranking strategy.', tier: 'Big', cost: 3, icon: Trophy },
    { id: 'seo-scorecard', label: 'SEO Scorecard', description: 'Real-time neural content audit and score.', tier: 'Big', cost: 3, icon: Activity },
    { id: 'hashtags', label: 'Hashtag Engine', description: 'Ranked hashtag research with reach tiers.', tier: 'Mini', cost: 2, icon: Hash },
    { id: 'bio', label: 'Bio Optimizer', description: 'Three optimized bio versions with strategy.', tier: 'Mini', cost: 2, icon: UserCircle },
    { id: 'posting-schedule', label: 'Schedule Lab', description: 'Styled weekly optimized calendar grid.', tier: 'Mini', cost: 2, icon: Calendar },
    { id: 'engagement-calc', label: 'Engagement Advisor', description: 'Computing rates and 30-day growth plans.', tier: 'Mini', cost: 2, icon: Calculator },
    { id: 'headlines', label: 'Headline Hook', description: '10 hook formulas with predicted CTR markers.', tier: 'Mini', cost: 2, icon: Zap },
    { id: 'post-scheduler', label: 'Command Calendar', description: 'Tactical content scheduling and queue management.', tier: 'Mini', cost: 2, icon: Calendar },
    { id: 'drafts', label: 'CHIDON Vault', description: 'Specialized index of saved scripts and reports.', tier: 'Mini', cost: 2, icon: BookOpen },
    { id: 'ruled-book', label: 'NOTEPAD SAVE', description: 'Digital journal structured over authentic ruled sheets.', tier: 'Mini', cost: 2, icon: Book }
  ];

  const filteredFeatures = cognitiveFeatures.filter(f => {
    const matchesTab = selectedCategoryTab === 'all' || f.tier.toLowerCase() === selectedCategoryTab;
    const matchesSearch = f.label.toLowerCase().includes(featureSearchQuery.toLowerCase()) || f.description.toLowerCase().includes(featureSearchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-base)]/50">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-[10px] uppercase tracking-wider font-bold">
            <Crown size={12} className="animate-pulse text-brand" />
            <span>Workspace Credit System</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[var(--text-primary)] leading-none">
            Chidon Pricing Matrix
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Acquire credits to run cognitive social media engines. Manage your balance, track transaction logs, and fuel your daily posts instantly.
          </p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold border border-[var(--border-base)] rounded-xl shadow-sm transition-all cursor-pointer"
          >
            ← Back to Sector Terminal
          </button>
        )}
      </div>

      {/* TRANSACTION HISTORY LEDGER & BILLING PORTAL */}
      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border-base)]/50 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveLedgerTab('usage')}
                className={`flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-tight font-mono border-b-2 transition-all cursor-pointer ${
                  activeLedgerTab === 'usage' 
                    ? 'border-brand text-brand' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <History size={14} />
                Usage History
              </button>
              <button 
                onClick={() => setActiveLedgerTab('invoices')}
                className={`flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-tight font-mono border-b-2 transition-all cursor-pointer ${
                  activeLedgerTab === 'invoices' 
                    ? 'border-brand text-brand' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Mail size={14} />
                Invoices & Receipts
              </button>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {activeLedgerTab === 'usage' ? 'Recent 10 operations' : 'Recent purchases & subscriptions'}
            </span>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto max-h-[220px] pr-2 space-y-2 custom-scrollbar">
            {activeLedgerTab === 'usage' ? (
              loadingTransactions ? (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-2">
                  <RefreshCw size={16} className="animate-spin text-brand" />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Syncing ledger records...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="p-2.5 bg-[var(--bg-app)] rounded-full text-[var(--text-secondary)] mb-2">
                    <Coins size={16} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-primary)]">Ledger Empty</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] max-w-xs mt-1">
                    Once you purchase credits or generate templates, your transaction history will sync here.
                  </p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isDebit = tx.type === 'debit';
                  const date = tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : new Date().toLocaleString();
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-base)]/50 rounded-xl">
                      <div className="space-y-0.5 animate-fade-in">
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
              )
            ) : (
              loadingReceipts ? (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-2">
                  <RefreshCw size={16} className="animate-spin text-brand" />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Loading dynamic invoice repository...</span>
                </div>
              ) : receipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="p-2.5 bg-[var(--bg-app)] rounded-full text-[var(--text-secondary)] mb-2">
                    <Mail size={16} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-tight text-[var(--text-primary)]">No Invoices Found</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] max-w-xs mt-1">
                    Complete a payment on Paystack to generate real-time printable tax receipts.
                  </p>
                </div>
              ) : (
                receipts.map((rcpt) => {
                  const date = rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
                  return (
                    <div 
                      key={rcpt.id} 
                      onClick={() => setSelectedReceipt(rcpt)}
                      className="flex items-center justify-between p-3 bg-[var(--bg-app)] hover:bg-slate-50 dark:hover:bg-slate-800 border border-[var(--border-base)]/50 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {rcpt.bundleName || 'Credit Top-Up'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-bold">
                            PAID
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--text-secondary)]">
                          <span>Ref: {rcpt.reference}</span>
                          <span>•</span>
                          <span>{date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-500 block leading-none">
                          {rcpt.amountNgn ? `₦${rcpt.amountNgn.toLocaleString()}` : `$${rcpt.amountUsd?.toFixed(2) || '0.00'}`}
                        </span>
                        <span className="text-[8px] font-mono text-[var(--text-secondary)] underline hover:text-brand">
                          View Invoice
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>

      {/* CREDIT RECHARGE PLANS */}
      <div className="space-y-6 pt-4 border-t border-[var(--border-base)]/40">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-full text-brand text-[9px] font-mono font-black uppercase tracking-wider">
            Packages
          </div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Acquire Credit Fuel Packages
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Select a pricing plan below to allocate credits directly to your workspace.
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelectedPlan = activePlan === plan.name && subStatus === 'active';
            const isPro = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`flex flex-col bg-[var(--bg-card)] border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 shadow-sm ${
                  isSelectedPlan 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : isPro 
                    ? 'border-indigo-500/50 shadow-md' 
                    : plan.borderColor
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[8px] font-black font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}
 
                <div className={`absolute -inset-px bg-gradient-to-br ${plan.color} opacity-30 -z-10`} />
                
                {/* Plan Header */}
                <div className="space-y-3">
                  <div className="p-2.5 border rounded-xl w-fit bg-[var(--bg-app)] text-brand border-[var(--border-base)]/50">
                    <PlanIcon size={20} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 min-h-[40px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </div>
 
                {/* Pricing indicators */}
                <div className="py-4 border-y border-[var(--border-base)]/30 my-4 space-y-1 text-left">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-mono">
                      ${plan.price}
                    </span>
                    <span className="text-[10px] text-brand font-mono uppercase font-black tracking-wider px-2 py-0.5 bg-brand/5 border border-brand/20 rounded-md">
                      {plan.credits} CREDITS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-extrabold font-mono">
                    <Cpu size={12} className="text-brand" />
                    <span className="uppercase tracking-wider">Instant Allocation Active</span>
                  </div>
                </div>
 
                {/* Features listing */}
                <div className="flex-1">
                  <ul className="space-y-2.5 text-left text-xs mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-[var(--text-secondary)] font-medium">
                        <div className="p-0.5 text-emerald-500 shrink-0 mt-0.5">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Checkout Trigger Action */}
                <button
                  onClick={() => handleCheckoutInitiate(plan)}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer text-center bg-brand hover:brightness-110 active:scale-[0.98] text-white disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Purchase Credits Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* COGNITIVE DIRECTORY & FEATURE COST COMPASS */}
      <div className="pt-10 border-t border-[var(--border-base)]/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[9px] font-mono font-bold uppercase rounded-full">
              <Cpu size={10} className="animate-pulse" />
              Sizing Engine Powered by Chidon AI
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
              AI Cognitive Directory & Feature Costs
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Every system operation is sized based on processing complexity. Mini features consume 2 credits, Big features consume 3 credits, and Pro features consume 5 credits.
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex flex-wrap items-center justify-start gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-[var(--border-base)]/40 w-fit">
            {(['all', 'mini', 'big', 'pro'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategoryTab(tab)}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategoryTab === tab
                    ? 'bg-brand text-white'
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
            SHOWING {filteredFeatures.length} ENGINES
          </div>
        </div>

        {/* Features list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((feature) => {
            const FeatureIcon = feature.icon || Cpu;
            const isMini = feature.tier === 'Mini';
            const isPro = feature.tier === 'Pro';
            
            return (
              <div
                key={feature.id}
                className="p-4 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl flex flex-col justify-between gap-4 transition-all hover:shadow shadow-sm"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ ACCORDION */}
      <div className="pt-8 border-t border-[var(--border-base)]/40 space-y-6">
        <div className="text-left space-y-2">
          <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Billing FAQ & System Parameters
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Answers to common questions about Chidon pricing packages and secure operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl text-left">
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2">
              <HelpCircle size={14} className="text-indigo-500" />
              What are cognitive credits?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Credits fuel every automated text and analytics task. High-fidelity runs consume up to 5 credits, while smaller checks consume only 2 credits.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono flex items-center gap-2">
              <HelpCircle size={14} className="text-indigo-500" />
              Do my credits expire?
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              No. Credits remain securely logged inside your wallet balance and never expire. You can consume them at your own pace.
            </p>
          </div>
        </div>
      </div>

      {/* TRIAL EXPIRED MODAL OVERLAY */}
      <AnimatePresence>
        {showTrialEndedModal && (
          <div 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onCloseTrialEndedModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F172A] border border-red-500/20 rounded-2xl overflow-hidden relative shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-red-500" />

              {onCloseTrialEndedModal && (
                <button
                  onClick={onCloseTrialEndedModal}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}

              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl shrink-0">
                    <ShieldAlert size={20} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-red-500 uppercase leading-none">
                      TRIAL HAS EXPIRED
                    </span>
                    <h3 className="text-base font-black text-white tracking-tight uppercase">
                      Subscription Required
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your 24-hour free trial has ended. Select a package above to continue enjoying full access to the absolute best cognitive marketing engines in your workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCloseTrialEndedModal}
                  className="w-full py-3 px-4 bg-indigo-600 hover:brightness-110 active:scale-[0.98] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Pricing Packages</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPaystackModal && (
          <div 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (!paystackLoading && !paystackVerifying) {
                setShowPaystackModal(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl overflow-hidden relative shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full bg-emerald-500" />

              <button
                onClick={() => setShowPaystackModal(null)}
                disabled={paystackLoading || paystackVerifying}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-base)]/10 transition-all outline-none cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl shrink-0">
                    <Wallet size={20} className={paystackLoading ? "animate-pulse" : ""} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-black tracking-widest text-emerald-500 uppercase leading-none block">
                      Paystack Escrow Gateway
                    </span>
                    <h3 className="text-base font-black tracking-tight text-[var(--text-primary)] uppercase">
                      Authorize Workspace Credits
                    </h3>
                  </div>
                </div>

                {/* Plan Invoice Summary */}
                <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-base)]/50 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-base)]/30">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Selected Package</span>
                    <span className="text-xs font-mono font-black text-brand uppercase">{showPaystackModal.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-base)]/30">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Fuel Allocated</span>
                    <span className="text-xs font-mono font-black text-emerald-500">+{showPaystackModal.credits} CREDITS</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] block">Subtotal</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">Rate: ₦{exchangeRate.toLocaleString()}/$</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-[var(--text-primary)] block">${showPaystackModal.price}.00 USD</span>
                      <span className="text-xs font-mono font-bold text-slate-400">≈ ₦{(showPaystackModal.price * exchangeRate).toLocaleString()} NGN</span>
                    </div>
                  </div>
                </div>

                {/* Config warning check */}
                {paystackCheckingConfig ? (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] justify-center font-mono py-2">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Checking terminal configurations...</span>
                  </div>
                ) : !paystackConfigured ? (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider leading-none">
                      <AlertTriangle size={12} />
                      Terminal Secret Missing
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      You have not yet configured <code className="bg-black/20 px-1 py-0.5 rounded font-mono font-bold text-amber-500">PAYSTACK_SECRET_KEY</code> in AI Studio's Secrets. The transaction will run in demo allocation.
                    </p>
                  </div>
                ) : null}

                {/* Email Billing input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                    <Mail size={10} />
                    Billing Notification Email
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="operator@chidon.iq"
                    disabled={paystackLoading || paystackVerifying || paystackSuccess}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors font-mono disabled:opacity-50"
                  />
                </div>

                {/* Checkout Trigger Actions */}
                <div className="space-y-3 pt-2">
                  {!paystackCheckoutUrl ? (
                    <button
                      type="button"
                      onClick={handleInitializePaystack}
                      disabled={paystackLoading || paystackVerifying || paystackSuccess || !payerEmail.trim()}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-mono font-black tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {paystackLoading ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>CONNECTING TO PAYSTACK GATEWAY...</span>
                        </>
                      ) : (
                        <>
                          <span>INITIALIZE PAYSTACK CHECKOUT</span>
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Active reference display */}
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                        <span>REFERENCE KEY:</span>
                        <span className="font-bold text-emerald-500">{paystackRef}</span>
                      </div>

                      {/* Manual checkout link */}
                      <a
                        href={paystackCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl text-[10px] font-mono font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>OPEN SECURE PAYSTACK TAB</span>
                        <Cpu size={11} className="text-yellow-400" />
                      </a>

                      {/* Verify button */}
                      <button
                        type="button"
                        onClick={() => handleVerifyPaystack()}
                        disabled={paystackVerifying || paystackSuccess}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-mono font-black tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {paystackVerifying ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>VERIFYING WITH PAYSTACK...</span>
                          </>
                        ) : paystackSuccess ? (
                          <>
                            <CheckCircle size={12} className="text-emerald-400 animate-bounce" />
                            <span>VERIFIED & CREDITED SUCCESSFULLY!</span>
                          </>
                        ) : (
                          <>
                            <span>VERIFY PAYMENT STATUS</span>
                            <CheckCircle size={12} />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {paystackVerifyError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2 text-[10px] leading-relaxed font-semibold">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>{paystackVerifyError}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVOICE DETAIL VIEW MODAL */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl shadow-xl overflow-hidden text-left"
            >
              {/* Receipt Header */}
              <div className="p-6 pb-4 border-b border-[var(--border-base)]/50 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight font-mono text-[var(--text-primary)]">CHIDON IQ Official Invoice</h3>
                    <p className="text-[10px] font-mono text-[var(--text-secondary)]">Sovereign Billing Platform</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-[var(--text-secondary)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-6 font-mono text-xs">
                {/* Visual Seal */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-wider">Payer Address</div>
                    <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{selectedReceipt.payerEmail || 'subscriber@chidon.iq'}</div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-xl font-bold uppercase text-[9px] tracking-wider">
                    PAID IN FULL
                  </div>
                </div>

                {/* Billing Summary Table */}
                <div className="border border-[var(--border-base)]/50 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/30 px-3 py-2 border-b border-[var(--border-base)]/40 text-[9px] uppercase font-black text-[var(--text-secondary)]">
                    <span>Description</span>
                    <span className="text-center">Rate</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text-primary)] border-b border-[var(--border-base)]/30">
                    <span>{selectedReceipt.bundleName || 'Chidon Credit Fill'}</span>
                    <span className="text-center">1x</span>
                    <span className="text-right">
                      {selectedReceipt.amountNgn ? `₦${selectedReceipt.amountNgn.toLocaleString()}` : `$${selectedReceipt.amountUsd?.toFixed(2) || '0.00'}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/20 text-[10px] text-[var(--text-secondary)]">
                    <span className="col-span-2 font-semibold">Exchange Rate Applied:</span>
                    <span className="text-right">
                      {selectedReceipt.amountNgn && selectedReceipt.amountUsd 
                        ? `₦${(selectedReceipt.amountNgn / selectedReceipt.amountUsd).toFixed(0)}/USD`
                        : `₦${exchangeRate.toLocaleString()}/USD`
                      }
                    </span>
                  </div>
                </div>

                {/* System Specs List */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-base)]/40 text-[10px] text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>TRANSACTION KEY:</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedReceipt.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAYMENT GATEWAY:</span>
                    <span className="font-bold text-[var(--text-primary)]">PAYSTACK SYSTEM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE AUTHORIZED:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {selectedReceipt.createdAt?.toDate 
                        ? selectedReceipt.createdAt.toDate().toLocaleString() 
                        : new Date().toLocaleString()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS RECORD:</span>
                    <span className="font-bold text-emerald-500 uppercase">SETTLED IN CLOUD</span>
                  </div>
                </div>

                {/* Printable Action Footer */}
                <div className="pt-4 border-t border-[var(--border-base)]/40 flex items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      const printContents = document.getElementById('chidon-printable-invoice')?.innerHTML;
                      const originalContents = document.body.innerHTML;
                      if (printContents) {
                        const style = document.createElement('style');
                        style.innerHTML = `@media print { body { background: white; color: black; font-family: monospace; } .no-print { display: none; } }`;
                        document.head.appendChild(style);
                        window.print();
                        style.remove();
                      }
                    }}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-[10px] font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={12} />
                    <span>PRINT / DOWNLOAD PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="flex-1 py-2 px-3 bg-[var(--bg-app)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-base)] rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>CLOSE RECEIPT</span>
                  </button>
                </div>
              </div>

              {/* Hidden printable layout strictly formatted */}
              <div id="chidon-printable-invoice" className="hidden">
                <div style={{ padding: '40px', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff', fontSize: '12px', lineHeight: '1.5' }}>
                  <h1 style={{ textTransform: 'uppercase', fontSize: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>CHIDON IQ INVOICE RECEIPT</h1>
                  <p><strong>TRANSACTION KEY:</strong> {selectedReceipt.reference}</p>
                  <p><strong>DATE:</strong> {selectedReceipt.createdAt?.toDate ? selectedReceipt.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}</p>
                  <p><strong>PAYER EMAIL:</strong> {selectedReceipt.payerEmail || 'subscriber@chidon.iq'}</p>
                  <p><strong>STATUS:</strong> PAID / SETTLED SUCCESSFUL</p>
                  <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '20px 0' }} />
                  <table style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ borderBottom: '1px solid #000' }}>Item Description</th>
                        <th style={{ borderBottom: '1px solid #000', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{selectedReceipt.bundleName || 'Chidon Credit Fill'}</td>
                        <td style={{ textAlign: 'right' }}>
                          {selectedReceipt.amountNgn ? `₦${selectedReceipt.amountNgn.toLocaleString()}` : `$${selectedReceipt.amountUsd?.toFixed(2) || '0.00'}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '20px 0' }} />
                  <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '40px' }}>Thank you for subscribing to Chidon IQ - Neural Operating System</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
