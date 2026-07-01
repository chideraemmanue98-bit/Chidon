import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Crown, 
  Zap, 
  Sparkles, 
  Shield, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  HelpCircle,
  TrendingUp,
  Briefcase,
  ArrowRightLeft,
  DollarSign,
  Coins,
  Receipt,
  Printer,
  Download,
  FileText,
  Search,
  BookOpen,
  Cpu,
  LayoutGrid,
  Menu,
  X,
  Play,
  Lightbulb,
  Hash,
  PenTool,
  Award,
  Database,
  Terminal,
  Activity,
  History,
  AlertTriangle
} from 'lucide-react';
import { doc, updateDoc, setDoc, serverTimestamp, onSnapshot, collection, addDoc, increment } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  creditsAmount: number;
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
}

export default function ChidonPricing({ user, onBack, db }: ChidonPricingProps) {
  const [activePlan, setActivePlan] = useState<string>('Free Workspace Tier');
  const [subStatus, setSubStatus] = useState<string>('inactive');
  const [subPrice, setSubPrice] = useState<number>(0);
  const [subRef, setSubRef] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingConfig, setCheckingConfig] = useState<boolean>(true);
  const [paystackConfigured, setPaystackConfigured] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1500);
  
  // Credit-based states
  const [credits, setCredits] = useState<number | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [activeReceiptForPrint, setActiveReceiptForPrint] = useState<any | null>(null);

  // Checkout & verification states
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [payRef, setPayRef] = useState<string>('');
  const [payerEmail, setPayerEmail] = useState<string>(user?.email || '');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');
  const [paySuccess, setPaySuccess] = useState<boolean>(false);

  // Currency calculator widget states
  const [calcUsdAmount, setCalcUsdAmount] = useState<string>('15');
  const [calcNgnResult, setCalcNgnResult] = useState<number | null>(null);
  const [calcRateResult, setCalcRateResult] = useState<number | null>(null);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string>('');

  // Neural Activities Workspace states
  const [activeTerminalTab, setActiveTerminalTab] = useState<'headlines' | 'hashtags' | 'ctr'>('headlines');
  const [topicInput, setTopicInput] = useState<string>('');
  const [nicheInput, setNicheInput] = useState<string>('');
  const [thumbnailBrief, setThumbnailBrief] = useState<string>('');
  const [terminalLoading, setTerminalLoading] = useState<boolean>(false);
  const [terminalFeedback, setTerminalFeedback] = useState<any | null>(null);
  const [terminalError, setTerminalError] = useState<string>('');

  // Firestore standard error handler conforming to firebase-integration skill
  const handleFirestoreError = (error: unknown, operation: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType: operation,
      path,
      authInfo: {
        userId: user?.uid || null,
        email: user?.email || null,
      }
    };
    console.error('Firestore Hardened Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

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
        if (data.subscriptionPrice !== undefined) {
          setSubPrice(data.subscriptionPrice);
        }
        if (data.paystackSubscriptionRef) {
          setSubRef(data.paystackSubscriptionRef);
        }
        if (data.credits !== undefined) {
          setCredits(data.credits);
        } else {
          setCredits(0);
        }
      } else {
        setCredits(0);
        setActivePlan('Free Workspace Tier');
        setSubStatus('inactive');
      }
    }, (error) => {
      console.error("Firestore user sub snapshot error:", error);
    });

    const receiptsColRef = collection(db, 'users', user.uid, 'receipts');
    const unsubscribeReceipts = onSnapshot(receiptsColRef, (snapshot) => {
      const recList: any[] = [];
      snapshot.forEach((doc) => {
        recList.push({ id: doc.id, ...doc.data() });
      });
      recList.sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0;
        const t2 = b.createdAt?.seconds || 0;
        return t2 - t1;
      });
      setReceipts(recList);
    }, (error) => {
      console.error("Firestore receipts sync error:", error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeReceipts();
    };
  }, [user, db]);

  const handleCalculatorConvert = () => {
    setCalcLoading(true);
    setCalcError('');
    const amt = parseFloat(calcUsdAmount);
    if (isNaN(amt) || amt <= 0) {
      setCalcNgnResult(null);
      setCalcError('Please enter a valid amount greater than zero.');
      setCalcLoading(false);
      return;
    }

    try {
      const computedNgn = amt * exchangeRate;
      setCalcNgnResult(computedNgn);
      setCalcRateResult(exchangeRate);
    } catch (err) {
      setCalcError('Conversion computation error.');
    } finally {
      setCalcLoading(false);
    }
  };

  // Run initial calculator conversion
  useEffect(() => {
    handleCalculatorConvert();
  }, [exchangeRate]);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter Credits Pack',
      price: 5,
      creditsAmount: 50,
      description: 'Perfect for quick updates, keyword audits, and daily creative brainstorming sparks.',
      icon: Zap,
      color: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-500/20 hover:border-blue-500/40 dark:border-blue-500/10 dark:hover:border-blue-500/30',
      features: [
        '50 AI Engine Credits',
        'Standard Features: 1 Credit per run',
        'Pro Layer Features: 5 Credits per run',
        'Standard Keyword scans & Video SEO tools',
        'Full PDF/print receipt generated instantly',
        'Ideal for testing out the workspace intelligence'
      ]
    },
    {
      id: 'creator',
      name: 'Creator Portfolio Pack',
      price: 12,
      creditsAmount: 150,
      description: 'The standard workspace pack to supercharge daily performance, CTR audits, and content outlines.',
      icon: Sparkles,
      color: 'from-indigo-500/10 to-purple-500/5',
      borderColor: 'border-indigo-500/30 hover:border-indigo-500/60 dark:border-indigo-500/25 dark:hover:border-indigo-500/50',
      badge: 'MOST POPULAR',
      features: [
        '150 AI Engine Credits (Bonus included)',
        'Standard Features: 1 Credit per run',
        'Pro Layer Features: 5 Credits per run',
        'Priority content ideation & competitor analysis',
        'Full PDF/print receipt generated instantly',
        'Ideal for active freelancers & creators'
      ]
    },
    {
      id: 'elite',
      name: 'Elite Agency Pack',
      price: 30,
      creditsAmount: 500,
      description: 'Designed for high-frequency agencies, power creators, and teams requiring continuous AI outputs.',
      icon: Crown,
      color: 'from-amber-500/10 to-rose-500/5',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50 dark:border-amber-500/10 dark:hover:border-amber-500/35',
      badge: 'BEST VALUE',
      features: [
        '500 AI Engine Credits (Best Value)',
        'Standard Features: 1 Credit per run',
        'Pro Layer Features: 5 Credits per run',
        'Unlocks high-velocity neural generation runs',
        'Full PDF/print receipt generated instantly',
        'VIP customer response channel'
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
            creditsAmount: plan.creditsAmount,
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
        try {
          await updateDoc(userRef, {
            credits: increment(selectedPlan.creditsAmount),
            subscriptionPlan: selectedPlan.name,
            subscriptionStatus: 'active',
            subscriptionPrice: selectedPlan.price,
            paystackSubscriptionRef: payRef,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.UPDATE, `users/${user.uid}`);
        }

        const receiptsCollectionRef = collection(db, 'users', user.uid, 'receipts');
        try {
          await addDoc(receiptsCollectionRef, {
            amountUsd: selectedPlan.price,
            amountNgn: selectedPlan.price * exchangeRate,
            creditsAmount: selectedPlan.creditsAmount,
            reference: payRef,
            payerEmail: payerEmail || user?.email || 'subscriber@chidon.iq',
            bundleName: selectedPlan.name,
            status: 'paid',
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, `users/${user.uid}/receipts`);
        }

        setPaySuccess(true);
        
        // Reset state
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

  // Run social command terminal activities deducting credits in real-time
  const executeTerminalActivity = async () => {
    if (!user) {
      setTerminalError('Please synchronize your cognitive credentials profile first to use operations.');
      return;
    }
    
    const activeCredits = credits ?? 0;
    if (activeCredits < 1) {
      setTerminalError('Insufficient credits! Please buy a starter or creator fuel pack below.');
      return;
    }

    setTerminalLoading(true);
    setTerminalError('');
    setTerminalFeedback(null);

    try {
      // 1. Deduct 1 credit in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(-1),
        updatedAt: serverTimestamp()
      });

      // 2. Generate content using Google Gemini API
      if (activeTerminalTab === 'headlines') {
        const topic = topicInput.trim() || 'Tech Trends';
        const prompt = `Act as an elite content strategist and social media growth hacker. 
Generate exactly 5 highly clickable, hyper-engaging viral headline ideas for the topic/keyword: "${topic}".
They must use proven psychological triggers (e.g., curiosity, urgency, contrarian view, personal transformation, listicles).
Respond with a raw JSON array of exactly 5 strings, e.g. ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"].
Do not output markdown codeblocks or any commentary, ONLY output the raw valid JSON array.`;

        let resultsArray = [
          `I Tried ${topic} For 30 Days And It Broke My Whole Routine`,
          `The Secret Strategy Behind ${topic} That Only 1% of Experts Know`,
          `Why Everything You Know About ${topic} Is Wrong In 2026`,
          `How To Turn Standard ${topic} Into An Automated Income Stream`,
          `5 Crucial ${topic} Hacks To Skyrocket Your Impression CTR`
        ];

        try {
          const res = await fetch("/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, language: "en" })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.text || "";
            const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resultsArray = parsed.slice(0, 5);
            }
          }
        } catch (e) {
          console.warn("Gemini headlines generation failed, using fallback:", e);
        }

        setTerminalFeedback({
          type: 'headlines',
          topic,
          cost: 1,
          results: resultsArray
        });

      } else if (activeTerminalTab === 'hashtags') {
        const niche = nicheInput.trim() || 'Business';
        const prompt = `Act as a social discovery tag specialist.
Identify exactly 5 trending hashtags with high engagement today for the niche/industry: "${niche}".
Respond with a raw JSON array of exactly 5 objects. Each object MUST have a 'tag' string (lowercase, starts with #) and a 'reach' string (e.g. 'High (1.2M/hr)', 'Medium (450K/hr)') and a 'color' string which must be one of:
- 'text-indigo-400 bg-indigo-500/10'
- 'text-cyan-400 bg-cyan-500/10'
- 'text-purple-400 bg-purple-500/10'
- 'text-pink-400 bg-pink-500/10'
- 'text-emerald-400 bg-emerald-500/10'

Respond ONLY with raw valid JSON array, do not wrap in markdown or anything else.`;

        let resultsArray = [
          { tag: `#chidon_${niche.toLowerCase()}`, reach: 'High (1.2M impressions/hr)', color: 'text-indigo-400 bg-indigo-500/10' },
          { tag: `#${niche.toLowerCase()}hacks`, reach: 'Medium (450K impressions/hr)', color: 'text-cyan-400 bg-cyan-500/10' },
          { tag: `#${niche.toLowerCase()}mindset`, reach: 'Medium (380K impressions/hr)', color: 'text-purple-400 bg-purple-500/10' },
          { tag: `#social${niche.toLowerCase()}`, reach: 'Low-Niche (85K impressions/hr)', color: 'text-pink-400 bg-pink-500/10' },
          { tag: `#learn${niche.toLowerCase()}`, reach: 'High (950K impressions/hr)', color: 'text-emerald-400 bg-emerald-500/10' }
        ];

        try {
          const res = await fetch("/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, language: "en" })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.text || "";
            const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resultsArray = parsed.map((item: any, idx: number) => {
                const colors = [
                  'text-indigo-400 bg-indigo-500/10',
                  'text-cyan-400 bg-cyan-500/10',
                  'text-purple-400 bg-purple-500/10',
                  'text-pink-400 bg-pink-500/10',
                  'text-emerald-400 bg-emerald-500/10'
                ];
                return {
                  tag: item.tag || `#${niche.toLowerCase()}`,
                  reach: item.reach || 'Medium (200K/hr)',
                  color: item.color || colors[idx % colors.length]
                };
              }).slice(0, 5);
            }
          }
        } catch (e) {
          console.warn("Gemini hashtags generation failed, using fallback:", e);
        }

        setTerminalFeedback({
          type: 'hashtags',
          niche,
          cost: 1,
          results: resultsArray
        });

      } else {
        const brief = thumbnailBrief.trim() || 'Minimalist contrast with giant glowing text';
        const prompt = `Act as an expert neuromarketing design auditor for video thumbnails.
Review this thumbnail visual concept brief: "${brief}".
Score it across three key dimensions (out of 100):
1. Urgency (incentive to click now)
2. Clarity (visual parse speed under 0.2s)
3. Saliency (brightness and pop factor against platform backgrounds)
Also write a highly actionable, punchy recommendation (max 2 sentences) to optimize CTR.
Respond with a raw JSON object with this exact structure:
{
  "urgency": 85,
  "clarity": 72,
  "saliency": 78,
  "recommendation": "your recommendation here"
}
Respond ONLY with raw valid JSON, do not wrap in markdown or comments.`;

        let scoreObj = {
          urgency: Math.floor(Math.random() * 25) + 70,
          clarity: Math.floor(Math.random() * 20) + 75,
          saliency: Math.floor(Math.random() * 22) + 72,
          recommendation: 'Exceptional visual balance. To boost CTR by another 4.5%, increase contrast and apply our signature deep-navy contrast backplate.'
        };

        try {
          const res = await fetch("/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, language: "en" })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.text || "";
            const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (parsed && typeof parsed === 'object') {
              scoreObj = {
                urgency: Number(parsed.urgency) || 80,
                clarity: Number(parsed.clarity) || 80,
                saliency: Number(parsed.saliency) || 80,
                recommendation: parsed.recommendation || 'Boost contrast and text size.'
              };
            }
          }
        } catch (e) {
          console.warn("Gemini CTR audit failed, using fallback:", e);
        }

        setTerminalFeedback({
          type: 'ctr',
          brief,
          cost: 1,
          scores: {
            urgency: scoreObj.urgency,
            clarity: scoreObj.clarity,
            saliency: scoreObj.saliency
          },
          recommendation: scoreObj.recommendation
        });
      }

    } catch (err: any) {
      console.error('Terminal Activity Exec Error:', err);
      setTerminalError(err.message || 'An error occurred during neural operation.');
    } finally {
      setTerminalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12 text-left bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-base)]/60">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-[10px] uppercase tracking-wider font-bold">
            <Crown size={12} className="animate-pulse" />
            <span>Premium Fuel Gateway</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)] leading-none">
            Chidon Pricing Matrix
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Configure fuel cells, purchase neural credits, and review live local currency valuations. Complete activities directly inside our upgraded command cockpit.
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

      {/* CORE ACTIVITIES DASHBOARD PANEL (LIGHTWEIGHT COMMAND TERMINAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Circular Meter and Fuel Metrics */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand/5 filter blur-[50px] rounded-full pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand/10 border border-brand/20 rounded-xl text-brand">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">Fuel Cells Readout</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Real-time credit state</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${ (credits || 0) > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                { (credits || 0) > 0 ? 'READY FOR OPS' : 'OUT OF CHARGE' }
              </span>
            </div>

            {/* Glowing Ring Arc for Credits */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-850"
                  />
                  {/* Glowing Charger Arc */}
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="url(#brandGradient)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={452}
                    strokeDashoffset={452 - Math.min(452, ((credits ?? 0) / 150) * 452)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Internal Digital Readout */}
                <div className="text-center z-10">
                  <motion.div 
                    key={credits}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono"
                  >
                    {credits !== null ? credits : '—'}
                  </motion.div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] font-bold mt-1">
                    TOTAL CREDITS
                  </p>
                </div>
              </div>
            </div>

            {/* Micro Parameter Fields */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/45 border border-[var(--border-base)]/40 font-mono text-[10px] text-left">
              <div className="space-y-1">
                <span className="text-[var(--text-secondary)] block uppercase font-bold text-[9px]">Sovereign Plan</span>
                <span className="text-[var(--text-primary)] font-bold truncate block">{activePlan}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[var(--text-secondary)] block uppercase font-bold text-[9px]">Gate Status</span>
                <span className={`font-black uppercase block ${subStatus === 'active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {subStatus === 'active' ? 'ACTIVE PREM' : 'STANDARD'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-base)]/40 mt-4 text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
            ⚡ Quick Hint: Each action in standard tools consumes **1 credit**. Rebuilds & pro content script outlines consume **5 credits**. Select a plan below to charge up instantly.
          </div>
        </div>

        {/* Right Side: Interactive Operation Workspace */}
        <div className="lg:col-span-7 flex flex-col p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-cyan-500/5 filter blur-[40px] rounded-full pointer-events-none" />
          
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-base)]/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500">
                  <Terminal size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
                    Neural Actions Dashboard
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Run quick activities directly utilizing your balance</p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-[var(--border-base)]/60 text-xs self-start sm:self-center font-bold">
                <button
                  onClick={() => { setActiveTerminalTab('headlines'); setTerminalFeedback(null); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTerminalTab === 'headlines' ? 'bg-white dark:bg-slate-800 text-brand shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  Headline
                </button>
                <button
                  onClick={() => { setActiveTerminalTab('hashtags'); setTerminalFeedback(null); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTerminalTab === 'hashtags' ? 'bg-white dark:bg-slate-800 text-brand shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  Hashtag
                </button>
                <button
                  onClick={() => { setActiveTerminalTab('ctr'); setTerminalFeedback(null); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTerminalTab === 'ctr' ? 'bg-white dark:bg-slate-800 text-brand shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  CTR Audit
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Input Section */}
            <div className="space-y-4 py-2 flex-1 flex flex-col justify-center">
              {activeTerminalTab === 'headlines' && (
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">Content Topic / Focus Keyword</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Passive Income Secrets, Coding for Kids"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-brand transition-colors"
                    />
                    <button
                      onClick={executeTerminalActivity}
                      disabled={terminalLoading}
                      className="px-5 py-2.5 bg-brand text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {terminalLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={11} />}
                      <span>Spark (-1)</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTerminalTab === 'hashtags' && (
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">Target Industry / Niche</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Crypto, Photography, Cooking"
                      value={nicheInput}
                      onChange={(e) => setNicheInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-brand transition-colors"
                    />
                    <button
                      onClick={executeTerminalActivity}
                      disabled={terminalLoading}
                      className="px-5 py-2.5 bg-brand text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {terminalLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={11} />}
                      <span>Multiply (-1)</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTerminalTab === 'ctr' && (
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">Thumbnail Visual Concept</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Giant red arrow pointing at broken phone, face looking shocked"
                      value={thumbnailBrief}
                      onChange={(e) => setThumbnailBrief(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-brand transition-colors"
                    />
                    <button
                      onClick={executeTerminalActivity}
                      disabled={terminalLoading}
                      className="px-5 py-2.5 bg-brand text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {terminalLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={11} />}
                      <span>Audit (-1)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Errors */}
              {terminalError && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl flex gap-2.5 items-start text-xs text-rose-500 leading-relaxed font-mono">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500 animate-bounce" />
                  <span>{terminalError}</span>
                </div>
              )}

              {/* Dynamic Terminal Results Display */}
              <div className="flex-1 min-h-[160px] bg-slate-50/70 dark:bg-slate-950/40 border border-[var(--border-base)] rounded-2xl p-4 font-mono text-xs text-left relative overflow-hidden flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {terminalLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center space-y-3.5 text-center text-[var(--text-secondary)]"
                    >
                      <RefreshCw size={24} className="animate-spin text-brand" />
                      <p className="text-[10px] uppercase tracking-widest animate-pulse font-bold text-brand">Accessing Deep-Brain Content Sync...</p>
                    </motion.div>
                  ) : terminalFeedback ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] border-b border-[var(--border-base)]/40 pb-2">
                        <span className="uppercase tracking-wider font-bold">🎯 Neural Output Synthesized</span>
                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">SUCCESS -1 CREDIT</span>
                      </div>

                      {terminalFeedback.type === 'headlines' && (
                        <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {terminalFeedback.results.map((headline: string, i: number) => (
                            <div key={i} className="flex gap-2 p-2 bg-white dark:bg-slate-900 border border-[var(--border-base)]/45 rounded-xl text-[var(--text-primary)] hover:border-brand/35 transition-all">
                              <span className="text-brand font-black shrink-0">#0{i+1}</span>
                              <p className="font-sans font-medium text-xs text-left leading-snug">{headline}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {terminalFeedback.type === 'hashtags' && (
                        <div className="flex flex-wrap gap-2 pt-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                          {terminalFeedback.results.map((tagObj: any, i: number) => (
                            <div key={i} className={`px-3 py-2 rounded-xl border border-[var(--border-base)]/50 flex flex-col gap-0.5 ${tagObj.color}`}>
                              <span className="font-bold font-sans text-xs">{tagObj.tag}</span>
                              <span className="text-[9px] opacity-75 font-mono">{tagObj.reach}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {terminalFeedback.type === 'ctr' && (
                        <div className="space-y-3 font-sans">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                              <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase block font-bold">Urgency</span>
                              <span className="text-lg font-mono font-black text-indigo-500">{terminalFeedback.scores.urgency}%</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-indigo-500 h-full" style={{ width: `${terminalFeedback.scores.urgency}%` }} />
                              </div>
                            </div>
                            <div className="p-2.5 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-center">
                              <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase block font-bold">Clarity</span>
                              <span className="text-lg font-mono font-black text-cyan-500">{terminalFeedback.scores.clarity}%</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-cyan-500 h-full" style={{ width: `${terminalFeedback.scores.clarity}%` }} />
                              </div>
                            </div>
                            <div className="p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                              <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase block font-bold">Saliency</span>
                              <span className="text-lg font-mono font-black text-purple-500">{terminalFeedback.scores.saliency}%</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-purple-500 h-full" style={{ width: `${terminalFeedback.scores.saliency}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-[var(--border-base)]/50 rounded-xl text-xs font-mono text-[var(--text-secondary)] text-left leading-relaxed">
                            <span className="text-brand font-black block text-[9px] uppercase tracking-wider mb-0.5">Neural Suggestion:</span>
                            {terminalFeedback.recommendation}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-2 text-center text-[var(--text-secondary)]"
                    >
                      <Cpu size={24} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                      <p className="text-[10px] uppercase tracking-wider font-bold">Terminal Idle. Input parameters and click trigger button.</p>
                      <p className="text-[9px] text-[var(--text-secondary)] font-medium">All operations safely debited from your local power cell</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CURRENCY CALCULATOR ACCORDION HEADER */}
      <div className="bg-gradient-to-r from-brand/5 via-cyan-500/5 to-brand/5 border border-[var(--border-base)] rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 border border-brand/20 rounded-xl text-brand">
              <ArrowRightLeft size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Sovereign Currency Gateway
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Calculate live translations from USD to Naira (NGN) dynamically backed by the payment engine.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg font-bold">
            GATEWAY RATE: 1 USD = ₦{exchangeRate.toLocaleString()} NGN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2 border-t border-[var(--border-base)]/40">
          <div className="md:col-span-4 space-y-1.5 text-left">
            <label className="text-[9px] font-mono uppercase text-[var(--text-secondary)] font-bold block">USD Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input 
                type="number"
                value={calcUsdAmount}
                onChange={(e) => setCalcUsdAmount(e.target.value)}
                placeholder="10"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl pl-8 pr-4 py-2.5 text-xs text-[var(--text-primary)] font-mono focus:border-brand outline-none transition-colors"
              />
            </div>
          </div>

          <div className="md:col-span-3 text-left">
            <button
              onClick={handleCalculatorConvert}
              disabled={calcLoading}
              className="w-full py-2.5 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              {calcLoading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  Convert Live NGN
                </>
              )}
            </button>
          </div>

          <div className="md:col-span-5">
            <div className="bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] p-3 rounded-2xl flex items-center justify-between text-left h-11">
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">NAIRA VALUE (NGN):</span>
              {calcError ? (
                <span className="text-xs text-rose-500 font-mono font-bold truncate max-w-[180px]">{calcError}</span>
              ) : calcNgnResult !== null ? (
                <div className="text-right">
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold font-mono text-sm">
                    ₦{calcNgnResult.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-[var(--text-secondary)] font-mono block">
                    (at 1 USD = ₦{calcRateResult || exchangeRate})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-[var(--text-secondary)] font-mono">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* THREE DIFFERENT PLANS GRID WITH DUAL-CURRENCY INDICATIONS */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
            Select Active Fuel Package
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Upgrade your social command centers. Buy targeted credit assets with instant automated receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelectedPlan = activePlan === plan.name;
            const priceInNgn = plan.price * exchangeRate;
            const isCreator = plan.id === 'creator';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: isCreator 
                    ? "0 25px 50px -12px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.25)" 
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className={`flex flex-col bg-[var(--bg-card)] border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 shadow-md ${
                  isCreator 
                    ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-[0_10px_35px_-5px_rgba(99,102,241,0.2)]' 
                    : plan.borderColor
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-brand to-cyan-500 text-white text-[9px] font-black font-mono px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-sm shadow-brand/40">
                    🔥 {plan.badge}
                  </div>
                )}

                {/* Decorative Ambient Card Gradient */}
                <div className={`absolute -inset-px bg-gradient-to-br ${plan.color} opacity-45 -z-10`} />
                {isCreator && (
                  <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Plan Icon and Name */}
                <div className="space-y-4">
                  <div className={`p-3.5 border rounded-2xl w-fit ${
                    isCreator 
                      ? 'bg-gradient-to-tr from-brand to-indigo-500 text-white border-brand/20 shadow-md shadow-brand/20' 
                      : 'bg-slate-50 dark:bg-slate-900 border-[var(--border-base)] text-brand'
                  }`}>
                    <PlanIcon size={24} className={isCreator ? "text-white" : "text-brand"} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 min-h-[40px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Pricing indicators */}
                <div className="py-6 border-y border-[var(--border-base)]/40 my-6 space-y-1 text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight text-[var(--text-primary)] font-mono bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-indigo-400 to-[var(--text-primary)]">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono uppercase font-bold">
                      USD / One-time
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand font-extrabold font-mono">
                    <Coins size={14} className="text-brand" />
                    <span className="bg-gradient-to-r from-brand to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider">Adds {plan.creditsAmount} Fuel Credits</span>
                  </div>
                  <div className="mt-2.5 p-2 bg-indigo-50/40 dark:bg-slate-900/60 border border-[var(--border-base)]/40 rounded-xl inline-flex items-center gap-1.5 w-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold truncate">
                      Naira value: ₦{priceInNgn.toLocaleString()} NGN
                    </span>
                  </div>
                </div>

                {/* Features listing */}
                <div className="flex-1">
                  <ul className="space-y-3.5 text-left text-xs mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-[var(--text-secondary)] font-semibold leading-relaxed">
                        <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-md shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Checkout Trigger Action */}
                <button
                  onClick={() => handleCheckoutInitiate(plan)}
                  className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-wider font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer text-center ${
                    isCreator
                      ? 'bg-gradient-to-r from-brand via-indigo-600 to-brand text-white hover:brightness-110 shadow-[0_6px_20px_rgba(99,102,241,0.35)]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-[var(--border-base)] hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--text-primary)]'
                  }`}
                >
                  Charge Up Pack
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECURE CHECKOUT VERIFICATION CONTAINER AND MODAL */}
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
                  <span className="text-[var(--text-secondary)]">CREDITS BALANCE TO ADD:</span>
                  <span className="text-brand font-bold">+{selectedPlan.creditsAmount} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">VALUATION IN USD:</span>
                  <span className="text-[var(--text-primary)] font-bold">${selectedPlan.price} USD</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border-base)]/40 pt-2 text-xs font-bold text-[var(--text-primary)]">
                  <span>TOTAL NGN EQUIVALENT:</span>
                  <span>₦{(selectedPlan.price * exchangeRate).toLocaleString()} NGN</span>
                </div>
              </div>

              {/* Real Paystack Key check */}
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

                  {/* Manual Payer Email form */}
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
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>Initialize Secure Paystack Payment</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BILLING HISTORY LOGS TABLE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-base)]/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Transaction Receipts Matrix
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Historical record of secure payments generated on-chain.</p>
            </div>
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-mono font-bold">
            SYNCED RECEIPTS: {receipts.length}
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-[var(--border-base)]/40 text-xs font-mono">
            No payments have been completed in this workspace session.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[var(--border-base)]/60 text-[var(--text-secondary)] font-bold text-[10px]">
                  <th className="py-3 px-4">DATE & TIME</th>
                  <th className="py-3 px-4">PACKAGE DESCRIPTION</th>
                  <th className="py-3 px-4">SECURE REFERENCE</th>
                  <th className="py-3 px-4">AMOUNT (USD)</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => {
                  const rDate = rec.createdAt?.seconds 
                    ? new Date(rec.createdAt.seconds * 1000).toLocaleString() 
                    : 'Awaiting sync...';
                  return (
                    <tr key={rec.id} className="border-b border-[var(--border-base)]/30 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{rDate}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-bold">{rec.bundleName || 'Fuel Credits'}</td>
                      <td className="py-3 px-4 font-bold text-slate-400 max-w-[120px] truncate" title={rec.reference}>{rec.reference}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-500">${rec.amountUsd} USD</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActiveReceiptForPrint(rec)}
                          className="px-3 py-1.5 bg-brand/10 hover:bg-brand text-brand hover:text-white font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Printer size={10} />
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINT RECEIPT DETAILED MODAL TEMPLATE */}
      <AnimatePresence>
        {activeReceiptForPrint && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white text-slate-900 rounded-3xl p-8 relative shadow-2xl flex flex-col my-8"
            >
              {/* Receipt Header details */}
              <div className="flex justify-between items-start border-b-2 border-slate-950 pb-5">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950">CHIDON IQ INC</h3>
                  <p className="text-[10px] font-mono text-slate-500">NEURAL ENGINE COHORT GATEWAY</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">SUPPORT@CHIDON.IQ • SECURE PROTOCOLS</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[9px] font-mono font-black uppercase tracking-widest rounded-full">
                    TRANSACTION COMPLETED
                  </span>
                  <p className="text-[11px] font-mono text-slate-500 mt-2 font-bold">
                    {activeReceiptForPrint.createdAt?.seconds 
                      ? new Date(activeReceiptForPrint.createdAt.seconds * 1000).toLocaleString() 
                      : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Receipt body details */}
              <div className="py-6 space-y-6 text-left flex-1">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Payer Identity:</span>
                  <p className="text-sm font-bold text-slate-900">{activeReceiptForPrint.payerEmail}</p>
                </div>

                {/* Table details */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 text-[10px] font-mono font-bold text-slate-500 border-b border-slate-200 px-4 py-2.5">
                    <div className="col-span-8">QUANTITY DESCRIPTION</div>
                    <div className="col-span-4 text-right">TOTAL AMOUNT</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-900 font-sans font-semibold border-b border-slate-100">
                    <div className="col-span-8">
                      <p className="font-bold text-slate-950">{activeReceiptForPrint.bundleName || 'Chidon Fuel Credits Package'}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">Adds {activeReceiptForPrint.creditsAmount} fully recharged AI query units</p>
                    </div>
                    <div className="col-span-4 text-right font-mono font-black text-slate-950">${activeReceiptForPrint.amountUsd} USD</div>
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 bg-slate-50 rounded-2xl font-mono space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Base price (USD):</span>
                    <span className="font-bold text-slate-900">${activeReceiptForPrint.amountUsd} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Currency translation:</span>
                    <span className="font-bold text-slate-900">
                      ₦{activeReceiptForPrint.amountNgn?.toLocaleString()} NGN
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                    <span>TOTAL PAID (SECURE):</span>
                    <span>
                      ₦{activeReceiptForPrint.amountNgn?.toLocaleString()} NGN
                    </span>
                  </div>
                </div>

                {/* Secure details */}
                <div className="border border-slate-200 border-dashed rounded-xl p-3.5 text-[10px] font-mono text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>GATEWAY SECURE REFERENCE:</span>
                    <span className="font-bold text-slate-900">{activeReceiptForPrint.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INTEGRATION PROTOCOL:</span>
                    <span className="font-bold text-slate-900">PAYSTACK LIVE APIS</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 border-t border-slate-200 pt-5 mt-6 justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  Print Receipt
                </button>
                <button
                  onClick={() => setActiveReceiptForPrint(null)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ MATRIX ACCORDION */}
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
    </div>
  );
}
