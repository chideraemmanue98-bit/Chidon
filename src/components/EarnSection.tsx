// Forced fresh-render static options for deep caching evasion
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, DollarSign, Send, User, Check, Activity, Layers, Sparkles, 
  Clock, ArrowRight, Search, AlertCircle, Trash2, Plus, ShoppingBag, 
  TrendingUp, Coins, Shield, HelpCircle, FileText, CheckCircle, ChevronLeft, ChevronRight,
  Mail, Globe, Star, ExternalLink, MessageSquare
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { AutoTranslate } from './AutoTranslate';
import EarnChat from './EarnChat';

interface EarnSectionProps {
  onBack: () => void;
  user: any;
  onSignIn?: () => void;
}

// Interfaces matching Firestore Schemas
interface EarnJob {
  id: string;
  title: string;
  description: string;
  budget: string;
  requirements: string;
  buyerId: string;
  buyerEmail: string;
  sellerId?: string;
  status: 'open' | 'completed' | 'in_progress';
  createdAt: any;
}

interface EarnService {
  id: string;
  title: string;
  description: string;
  price: string;
  sellerId: string;
  sellerEmail: string;
  deliveryTime: string;
  createdAt: any;
}

interface EarnResult {
  id: string;
  jobId: string;
  jobTitle: string;
  buyerId: string;
  sellerId: string;
  sellerEmail: string;
  resultText: string;
  resultUrl?: string;
  proofUrl?: string;
  paymentStatus?: 'awaiting_payment' | 'paid';
  amount?: string;
  status: 'pending' | 'accepted' | 'revision';
  createdAt: any;
}

interface EarnProfile {
  id: string;
  displayName: string;
  bio: string;
  specialty: string;
  hourlyRate: string;
  portfolioUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  email: string;
  createdAt: any;
}

export const EarnSection: React.FC<EarnSectionProps> = ({ onBack, user, onSignIn }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'buyer' | 'seller' | 'messages'>('dashboard');
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [chatPartnerEmail, setChatPartnerEmail] = useState<string | null>(null);
  
  // Synchronized Side Message Type and state for sidebar tracking
  const [sideMessages, setSideMessages] = useState<{
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientName: string;
    text: string;
    createdAt: any;
  }[]>([]);
  
  // Data State
  const [jobs, setJobs] = useState<EarnJob[]>([]);
  const [services, setServices] = useState<EarnService[]>([]);
  const [results, setResults] = useState<EarnResult[]>([]);
  const [profiles, setProfiles] = useState<EarnProfile[]>([]);
  const [myProfile, setMyProfile] = useState<EarnProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Interaction States
  const [selectedProfile, setSelectedProfile] = useState<EarnProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSpecialty, setProfileSpecialty] = useState('Thumbnail Design');
  const [profileRate, setProfileRate] = useState('');
  const [profilePortfolio, setProfilePortfolio] = useState('');
  const [profileYoutube, setProfileYoutube] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileTiktok, setProfileTiktok] = useState('');
  const [profileTwitter, setProfileTwitter] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Form States - Buyer posting a Gig
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobBudget, setJobBudget] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [postingJob, setPostingJob] = useState(false);

  // Form States - Seller posting a Service Offer
  const [svcTitle, setSvcTitle] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDelivery, setSvcDelivery] = useState('24 hours');
  const [postingSvc, setPostingSvc] = useState(false);

  // Interaction States
  const [submittingResultId, setSubmittingResultId] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [sendingResult, setSendingResult] = useState(false);

  // Paystack Billing & Escrow Integration States
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [checkoutService, setCheckoutService] = useState<EarnService | null>(null);
  const [customPayAmount, setCustomPayAmount] = useState('5000'); // Starting value in NGN
  const [checkoutMail, setCheckoutMail] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{
    reference: string;
    amount: number;
    title: string;
    simulated?: boolean;
  } | null>(null);

  // Load Real-time Data from firestore
  useEffect(() => {
    setLoading(true);
    // Subscribe to Jobs
    const qJobs = query(collection(db, 'earn_jobs'), orderBy('createdAt', 'desc'));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      const list: EarnJob[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as EarnJob);
      });
      setJobs(list);
    }, err => console.error("Error loading earn_jobs:", err));

    // Subscribe to Services
    const qSvc = query(collection(db, 'earn_services'), orderBy('createdAt', 'desc'));
    const unsubSvc = onSnapshot(qSvc, (snapshot) => {
      const list: EarnService[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as EarnService);
      });
      setServices(list);
    }, err => console.error("Error loading earn_services:", err));

    // Subscribe to Deliveries / Results
    const qRes = query(collection(db, 'earn_results'), orderBy('createdAt', 'desc'));
    const unsubRes = onSnapshot(qRes, (snapshot) => {
      const list: EarnResult[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as EarnResult);
      });
      setResults(list);
    }, err => console.error("Error loading earn_results:", err));

    // Subscribe to Profiles
    const qProfiles = query(collection(db, 'earn_profiles'), orderBy('createdAt', 'desc'));
    const unsubProfiles = onSnapshot(qProfiles, (snapshot) => {
      const list: EarnProfile[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as EarnProfile);
      });
      setProfiles(list);
      
      if (user) {
        const found = list.find(p => p.id === user.uid);
        if (found) {
          setMyProfile(found);
          setProfileName(found.displayName || '');
          setProfileBio(found.bio || '');
          setProfileSpecialty(found.specialty || 'Thumbnail Design');
          setProfileRate(found.hourlyRate || '');
          setProfilePortfolio(found.portfolioUrl || '');
          setProfileYoutube(found.youtubeUrl || '');
          setProfileInstagram(found.instagramUrl || '');
          setProfileTiktok(found.tiktokUrl || '');
          setProfileTwitter(found.twitterUrl || '');
        } else {
          setMyProfile(null);
          // Pre-fill display name from user email
          setProfileName(user.email ? user.email.split('@')[0] : 'Social Creator');
        }
      } else {
        setMyProfile(null);
      }
    }, err => console.error("Error loading earn_profiles:", err));

    setLoading(false);
    return () => {
      unsubJobs();
      unsubSvc();
      unsubRes();
      unsubProfiles();
    };
  }, [user]);

  // Synchronize recent chats for the side panel navigation
  useEffect(() => {
    if (!user) {
      setSideMessages([]);
      return;
    }

    const q = query(collection(db, 'earn_messages'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: {
        id: string;
        chatId: string;
        senderId: string;
        senderName: string;
        recipientId: string;
        recipientName: string;
        text: string;
        createdAt: any;
      }[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.senderId === user.uid || data.recipientId === user.uid) {
          list.push({ id: docSnap.id, ...data } as any);
        }
      });

      // Sort ascending by time
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (Number(a.createdAt) || 0);
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (Number(b.createdAt) || 0);
        return timeA - timeB;
      });

      setSideMessages(list);
    }, (err) => {
      console.error("error loading side messages:", err);
    });

    return () => unsub();
  }, [user]);

  const getSideConversations = () => {
    if (!user) return [];
    
    const map: Record<string, { id: string; email: string; lastText: string; lastTime: any }> = {};

    sideMessages.forEach((msg) => {
      const partnerId = msg.senderId === user.uid ? msg.recipientId : msg.senderId;
      const partnerEmail = msg.senderId === user.uid ? msg.recipientName : msg.senderName;
      
      const timeMs = msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : (Number(msg.createdAt) || Date.now());

      if (!map[partnerId] || timeMs > map[partnerId].lastTime) {
        map[partnerId] = {
          id: partnerId,
          email: partnerEmail,
          lastText: msg.text,
          lastTime: timeMs,
        };
      }
    });

    return Object.values(map).sort((a, b) => b.lastTime - a.lastTime);
  };

  const sideConversations = getSideConversations();

  // Automatic Paystack payment callback validation and channel sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('paystack_ref');
    
    if (reference) {
      // Clear payment reference query parameters to avoid double-processing on page refreshes
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
      
      const executeVerification = async () => {
        try {
          setPaystackLoading(true);
          const verifyRes = await fetch(`/api/paystack/verify/${reference}`);
          const result = await verifyRes.json();
          
          if (verifyRes.ok && result.status && result.data.status === 'success') {
            const paidAmountKobo = result.data.amount || 500000;
            const finalAmount = paidAmountKobo / 100; // back to base NGN / USD unit
            
            setPaymentSuccessModal({
              reference: reference,
              amount: finalAmount,
              title: "Social Media Service Escrow Confirmed",
              simulated: result.data.simulated || false
            });

            // If metadata was bound during billing, automatically instantiate the workspace contract
            const meta = result.data.metadata || {};
            if (meta.buyerId) {
              await addDoc(collection(db, 'earn_jobs'), {
                title: `Paid Service: ${meta.serviceTitle || 'Social Contract'}`,
                description: `Social Media custom package delivery paid via Paystack gateway. Escrow Reference: ${reference}. Instructions: ${meta.serviceDesc || ''}`,
                budget: finalAmount,
                requirements: `Design/Creation expected. Paid Client Email: ${meta.buyerEmail || 'anonymous'}. Speed: ${meta.deliveryTime || '24 hrs'}`,
                buyerId: meta.buyerId,
                buyerEmail: meta.buyerEmail || 'Paid Client',
                sellerId: meta.sellerId || '',
                paymentStatus: 'paid', // Escrow status secure
                paymentReference: reference,
                status: 'open',
                createdAt: serverTimestamp()
              });
            }
          } else {
            console.warn("Paystack verification state:", result.error || 'Payment not successful yet');
          }
        } catch (error: any) {
          console.error("Paystack verification callback failed:", error);
        } finally {
          setPaystackLoading(false);
        }
      };
      
      executeVerification();
    }
  }, [user]);

  // Actions - Buyer Posts a Job Gig
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (!jobTitle || !jobDesc || !jobBudget) return;
    setPostingJob(true);
    try {
      await addDoc(collection(db, 'earn_jobs'), {
        title: jobTitle,
        description: jobDesc,
        budget: jobBudget,
        requirements: jobReqs || 'Default digital delivery expected.',
        buyerId: user.uid,
        buyerEmail: user.email || 'Anonymous Buyer',
        status: 'open',
        createdAt: serverTimestamp()
      });
      setJobTitle('');
      setJobDesc('');
      setJobBudget('');
      setJobReqs('');
    } catch (err) {
      console.error("Posting job failed:", err);
    } finally {
      setPostingJob(false);
    }
  };

  // Actions - Seller Launches a Service Package
  const handlePostService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (!svcTitle || !svcDesc || !svcPrice) return;
    setPostingSvc(true);
    try {
      await addDoc(collection(db, 'earn_services'), {
        title: svcTitle,
        description: svcDesc,
        price: svcPrice,
        deliveryTime: svcDelivery,
        sellerId: user.uid,
        sellerEmail: user.email || 'Anonymous Seller',
        createdAt: serverTimestamp()
      });
      setSvcTitle('');
      setSvcDesc('');
      setSvcPrice('');
      setSvcDelivery('24 hours');
    } catch (err) {
      console.error("Posting service failed:", err);
    } finally {
      setPostingSvc(false);
    }
  };

  // Helper - Initiate light-coded peer communication
  const handleStartChat = (partnerId: string, partnerEmail: string) => {
    if (!user) {
      if (onSignIn) {
        onSignIn();
      } else {
        alert("Please sign in to message users.");
      }
      return;
    }
    setChatPartnerId(partnerId);
    setChatPartnerEmail(partnerEmail);
    setActiveTab('messages');
  };

  // Actions - Buyer "Buys" of a Seller's Service Offer
  const handleBuyService = async (service: EarnService) => {
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (service.sellerId === user.uid) {
      alert("You cannot purchase your own service offer!");
      return;
    }
    
    // Convert USD prices to a standard conversion rate of 1 USD = ₦1,600 for local Paystack gateways
    const numericPrice = parseFloat(service.price.replace(/[^0-9.]/g, '')) || 25;
    const computedNaira = Math.round(numericPrice * 1600);
    
    setCheckoutService(service);
    setCustomPayAmount(computedNaira.toString());
    setCheckoutMail(user.email || '');
    setShowCheckoutModal(true);
  };

  // Triggers server-side Paystack token initialization and redirects user to secure checkout page
  const handlePaystackCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !checkoutService) return;
    
    setPaystackLoading(true);
    try {
      const metadata = {
        buyerId: user.uid,
        buyerEmail: checkoutMail || user.email || 'Anonymous',
        serviceId: checkoutService.id,
        serviceTitle: checkoutService.title,
        serviceDesc: checkoutService.description,
        sellerId: checkoutService.sellerId,
        deliveryTime: checkoutService.deliveryTime || '24 hours'
      };

      const initParams = {
        email: checkoutMail || user.email || 'payer@chidon.iq',
        amount: parseFloat(customPayAmount),
        metadata: metadata
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
        throw new Error(resData.error || "Failed secure initialization on server side");
      }

      const checkoutUrl = resData.data.authorization_url;
      if (checkoutUrl) {
        // Redirect to Paystack secure checkout
        window.location.href = checkoutUrl;
      } else {
        alert("Secure checkout URL coordinate absent from response payload.");
      }
    } catch (err: any) {
      console.error("Paystack Checkout start failed:", err);
      alert(`Paystack Initialization Error: ${err.message || 'Check your configuration and network server logs.'}`);
    } finally {
      setPaystackLoading(false);
    }
  };

  // Actions - Seller "Claims" and Submits results for a Buyer's Job Gig
  const handleDeliverJobResult = async (job: EarnJob) => {
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (job.buyerId === user.uid) {
      alert("You cannot complete jobs that you of yourself have published.");
      return;
    }
    setSubmittingResultId(job.id);
  };

  const handleSendResult = async (job: EarnJob) => {
    if (!resultText) return;
    setSendingResult(true);
    try {
      // Create result
      await addDoc(collection(db, 'earn_results'), {
        jobId: job.id,
        jobTitle: job.title,
        buyerId: job.buyerId,
        buyerEmail: job.buyerEmail || '',
        sellerId: user.uid,
        sellerEmail: user.email || 'Anonymous Seller',
        resultText: resultText,
        proofUrl: proofUrl || '',
        status: 'pending',
        paymentStatus: 'awaiting_payment',
        amount: job.budget || '0',
        createdAt: serverTimestamp()
      });

      // Update status of actual job
      await updateDoc(doc(db, 'earn_jobs', job.id), {
        status: 'completed'
      });

      setResultText('');
      setProofUrl('');
      setSubmittingResultId(null);
      alert("Completed job delivers to buyer securely! Waiting for client review & payment release.");
    } catch (err) {
      console.error("Failed to post result delivery:", err);
    } finally {
      setSendingResult(false);
    }
  };

  // Actions - Buyer Approves / Accepts job execution & Releases payment
  const handleAcceptResult = async (result: EarnResult) => {
    const confirmRelease = window.confirm(`Release escrow contract payment of $${result.amount || '0.00'} to candidate ${result.sellerEmail}?`);
    if (!confirmRelease) return;
    try {
      await updateDoc(doc(db, 'earn_results', result.id), {
        status: 'accepted',
        paymentStatus: 'paid'
      });
      alert(`Success! Payout of $${result.amount || '0.00'} has been securely disbursed to candidate. Contract completed.`);
    } catch (err) {
      console.error("Action approval failed:", err);
    }
  };

  // Actions - Delete elements easily
  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Permanently delete this Job posting?")) return;
    try { await deleteDoc(doc(db, 'earn_jobs', id)); } catch(e) { console.error(e); }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Permanently archive this Service model?")) return;
    try { await deleteDoc(doc(db, 'earn_services', id)); } catch(e) { console.error(e); }
  };

  // Profile Save action
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (!profileName.trim()) {
      alert("Please provide a valid display name!");
      return;
    }
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'earn_profiles', user.uid), {
        id: user.uid,
        displayName: profileName,
        bio: profileBio,
        specialty: profileSpecialty,
        hourlyRate: profileRate || '$30 / hr',
        portfolioUrl: profilePortfolio || '',
        youtubeUrl: profileYoutube || '',
        instagramUrl: profileInstagram || '',
        tiktokUrl: profileTiktok || '',
        twitterUrl: profileTwitter || '',
        email: user.email || 'Anonymous',
        createdAt: serverTimestamp()
      }, { merge: true });

      setShowProfileModal(false);
      alert("Social gig profile updated successfully on current synchronized block!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Error saving profile to network ledger.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070A13] text-[#F1F5F9] font-sans pb-16 relative overflow-hidden selection:bg-[#22D3EE]/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#1E1B4B]/20 via-[#0C0F1D]/0 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-[10%] w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[5%] w-[450px] h-[450px] bg-[#8B5CF6]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
          <div>
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white mb-4 text-xs font-mono lowercase transition-all"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <AutoTranslate>{t("earn.back_btn", "back_to_command")}</AutoTranslate>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#22D3EE]/20 to-[#8B5CF6]/20 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                <Coins size={24} className="text-[#22D3EE]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-sans leading-none flex items-center gap-2">
                  <AutoTranslate>{t("earn.title", "CHIDON EARN")}</AutoTranslate> <span className="text-[10px] bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest">v1.1</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">
                  <AutoTranslate>{t("earn.subtitle", "Secure Cognitive Gigs & Services Synced to Live Ledger")}</AutoTranslate>
                </p>
              </div>
            </div>
          </div>

          {/* Real Auth Status Indicator */}
          <div className="flex items-center gap-3 bg-[#0F172A] border border-white/10 p-3.5 rounded-2xl md:self-end">
            <div className="h-2 w-2 rounded-full bg-[#22D3EE] animate-ping" />
            <div className="text-xs">
              {user ? (
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase"><AutoTranslate>{t("earn.active_sync", "Active Sync account")}</AutoTranslate></span>
                  <span className="font-bold text-slate-200">{user.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400"><AutoTranslate>{t("earn.offline_state", "Offline state (limited read).")}</AutoTranslate></span>
                  <button 
                    onClick={onSignIn}
                    className="text-xs text-[#22D3EE] hover:underline font-bold"
                  >
                    <AutoTranslate>{t("earn.authenticate_btn", "Authenticate Now")}</AutoTranslate>
                  </button>
                </div>
              )}
            </div>
          </div>
         </div>

        {/* Main Workspace & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Area Column */}
          <div className={cn("space-y-4", activeTab === 'messages' ? "lg:col-span-4" : "lg:col-span-3")}>
            {/* Tab Selection Navigation */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto mb-10 p-1.5 bg-[#0F172A]/80 border border-white/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "py-3 px-2 sm:px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'dashboard'
                ? "bg-cyan-500 text-[#070A13] shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity size={14} />
            <span className="hidden sm:inline"><AutoTranslate>{t("earn.tabs.creator_prefix", "CREATOR")}</AutoTranslate> </span><AutoTranslate>{t("earn.tabs.dashboard", "DASHBOARD")}</AutoTranslate>
          </button>

          <button
            onClick={() => setActiveTab('buyer')}
            className={cn(
              "py-3 px-2 sm:px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'buyer'
                ? "bg-[#22D3EE] text-[#070A13] shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShoppingBag size={14} />
            <AutoTranslate>{t("earn.tabs.buyer_portal", "BUYER PORTAL")}</AutoTranslate>
          </button>
          
          <button
            onClick={() => setActiveTab('seller')}
            className={cn(
              "py-3 px-2 sm:px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'seller'
                ? "bg-[#A78BFA] text-[#070A13] shadow-[0_0_30px_rgba(167,139,250,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Briefcase size={14} />
            <AutoTranslate>{t("earn.tabs.seller_portal", "SELLER PORTAL")}</AutoTranslate>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              "py-3 px-2 sm:px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === 'messages'
                ? "bg-emerald-500 text-[#070A13] shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <MessageSquare size={14} />
            <AutoTranslate>{t("earn.tabs.messages", "MESSAGES")}</AutoTranslate>
          </button>
        </div>

        {/* Layout Partition: Decoupled Pages */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* SPECIAL HIGHLIGHT: Social Media Focused Platform Banner */}
              <div className="relative p-8 rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-[#0B0F1E] to-[#1E1B4B]/80 shadow-[0_0_50px_rgba(6,182,212,0.08)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 bottom-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-mono tracking-widest text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/25 rounded-full uppercase font-extrabold shadow-sm animate-pulse">
                      <Sparkles size={10} /> CRATER HUB: EXCLUSIVELY FOR SOCIAL MEDIA GIG SERVICES
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                      Strictly Social Media Gigs, <span className="text-[#22D3EE]">Video Deliveries</span>, and Creator Operations
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Chidon Earn focuses 100% on accelerating social networks. Discover and trade expert-verified services: YouTube high-CTR thumbnail design, professional video editing (Shorts, Reels, long-form), automatic account creation/setup, copyright optimization, script-writing and strategic growth.
                    </p>
                    
                    {/* Social Media Focus Pills Highlight */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                        🎬 Video Editing
                      </span>
                      <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                        🎨 Thumbnail Design
                      </span>
                      <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                        🔑 Account Creation & Setup
                      </span>
                      <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                        📈 Channel Growth SEO
                      </span>
                    </div>
                  </div>

                  {/* Creator Stats */}
                  <div className="grid grid-cols-2 gap-4 shrink-0 w-full lg:w-auto">
                    <div className="p-5 border border-white/5 bg-slate-900/60 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">Active Experts</span>
                      <span className="text-2xl font-black text-[#22D3EE]">{profiles.length}</span>
                    </div>
                    <div className="p-5 border border-white/5 bg-slate-900/60 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">Social Services</span>
                      <span className="text-2xl font-black text-[#A78BFA]">{services.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Bar / Quick Access Container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left: Your Social Profile Widget */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 rounded-3xl border border-white/10 bg-[#0E1526] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-[#22D3EE]/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                        <User size={13} className="text-[#22D3EE]" /> Your Profile Specs
                      </h4>
                      {myProfile && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded uppercase font-mono font-bold">
                          Listed
                        </span>
                      )}
                    </div>

                    {myProfile ? (
                      <div className="space-y-4">
                        <div 
                          onClick={() => setSelectedProfile(myProfile)}
                          className="space-y-1.5 cursor-pointer block hover:opacity-90 transition-opacity"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#22D3EE] to-[#A78BFA] p-[1.5px] mb-2 flex items-center justify-center font-black text-slate-900 text-lg shadow-[0_4px_15px_rgba(34,211,238,0.2)]">
                            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-white text-base font-bold">
                              {myProfile.displayName?.[0]?.toUpperCase() || 'C'}
                            </div>
                          </div>
                          <h5 className="font-extrabold text-sm text-white hover:text-[#22D3EE] transition-colors flex items-center gap-1">
                            {myProfile.displayName}
                            <ExternalLink size={10} className="text-slate-500 group-hover:text-[#22D3EE] transition-colors" />
                          </h5>
                          <span className="text-[9px] font-mono uppercase text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/25 px-2 py-0.5 rounded w-fit block font-black">
                            {myProfile.specialty}
                          </span>
                          <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed pt-1">
                            {myProfile.bio || 'Modify your professional bio to attract clients...'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                          <span>Cost Rate:</span>
                          <span className="font-bold text-white text-xs">{myProfile.hourlyRate}</span>
                        </div>

                        <button
                          onClick={() => setShowProfileModal(true)}
                          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#22D3EE]/40 text-xs text-slate-200 hover:text-white transition-all rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Update Specs
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-2 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-905 border border-dashed border-white/15 mx-auto flex items-center justify-center text-slate-500 mb-2">
                          <User size={20} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Publish candidate credentials to receive direct orders and list yourself on the live Social Media Directory!
                        </p>
                        <button
                          onClick={() => {
                            if (!user) {
                              if (onSignIn) onSignIn();
                            } else {
                              setShowProfileModal(true);
                            }
                          }}
                          className="w-full py-2.5 bg-[#22D3EE] text-[#070A13] hover:bg-[#06B6D4] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(34,211,238,0.2)]"
                        >
                          Create Specs profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Listed Social Media Experts list */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} /> Active Creator Directory ({profiles.length})
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider hidden sm:inline">Click expert to open portfolio specifications</span>
                  </div>

                  {profiles.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-2 bg-slate-900/10">
                      <User size={24} className="mx-auto text-slate-500 opacity-60" />
                      <p className="text-xs uppercase font-mono font-bold text-slate-400">Directory Empty</p>
                      <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                        Be the first creator listed! Click "Create Specs profile" and claim your status as the premier social specialist.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          onClick={() => setSelectedProfile(profile)}
                          className="p-5 border border-white/5 bg-[#090F1E] rounded-2xl hover:border-cyan-500/30 transition-all cursor-pointer flex items-start gap-4 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-[#22D3EE]/3 via-transparent to-transparent pointer-events-none" />
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center text-white shrink-0 font-extrabold text-sm group-hover:scale-105 transition-transform duration-300">
                            {profile.displayName?.[0]?.toUpperCase() || 'S'}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-sm text-slate-100 group-hover:text-[#22D3EE] transition-colors truncate">
                                {profile.displayName}
                              </h5>
                              <span className="text-[10px] font-black font-mono text-[#22D3EE] shrink-0">
                                {profile.hourlyRate}
                              </span>
                            </div>

                            <span className="inline-block text-[9px] font-mono uppercase text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/20 px-2 py-0.5 rounded">
                              {profile.specialty}
                            </span>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {profile.bio || 'Social media optimization specialist.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ) : activeTab === 'buyer' ? (
            <motion.div 
              key="buyer-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Buyer Header Banner */}
              <div className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E1B4B]/80 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-[#22D3EE] tracking-widest uppercase font-bold px-2 py-0.5 bg-[#22D3EE]/10 rounded border border-[#22D3EE]/25 mb-2 inline-block">
                    PRO-CLIENT WORKFLOW
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white uppercase">
                    Hire Cognitive Talent & Purchase Service Packages
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-1">
                    Deploy standard work contracts (Gigs) or buy pre-packaged services hosted directly by top-class automation specialists in our network.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Active Gigs</span>
                    <span className="text-xl font-black text-white">{jobs.length}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Deliveries</span>
                    <span className="text-xl font-black text-[#22D3EE]">{results.length}</span>
                  </div>
                </div>
              </div>

              {/* Main Content split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Post a Gig Form */}
                <div className="space-y-6">
                  <div className="p-6 bg-[#0E1526] border border-white/10 rounded-3xl shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                      <Plus className="text-[#22D3EE]" size={18} />
                      <h4 className="font-extrabold text-sm uppercase tracking-wider font-sans text-white">Publish a Gig/Job opening</h4>
                    </div>

                    {!user ? (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-center space-y-2">
                        <AlertCircle className="mx-auto text-yellow-500" size={20} />
                        <p className="text-xs font-bold text-slate-300">Identity check required</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          You must be signed in to publish secure job postings.
                        </p>
                        <button 
                          onClick={onSignIn}
                          className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-[#0F172A] font-bold text-xs rounded-xl uppercase transition-all"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Job Title</label>
                          <input 
                            type="text"
                            required
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all"
                            placeholder="e.g. 5x Creator Headline Design Audit"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Gig Budget (Comp)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
                            <input 
                              type="text"
                              required
                              value={jobBudget}
                              onChange={(e) => setJobBudget(e.target.value)}
                              className="w-full bg-[#070A13] pl-8 border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all font-mono"
                              placeholder="e.g. 150 (USD)"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Project Scope / Details</label>
                          <textarea 
                            required
                            rows={3}
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 resize-none transition-all"
                            placeholder="Provide details on target keywords, video goals, or competitor metrics..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold flex items-center gap-1">
                            Technical Requirements <span className="text-[9px] text-slate-500 font-normal lowercase">(optional)</span>
                          </label>
                          <input 
                            type="text"
                            value={jobReqs}
                            onChange={(e) => setJobReqs(e.target.value)}
                            className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all"
                            placeholder="e.g. Must deliver clean markdown or .txt format"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={postingJob}
                          className="w-full py-3 bg-[#22D3EE] text-[#070A13] hover:bg-[#06B6D4] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {postingJob ? "BROADCASTING CONTROLS..." : "LAUNCH GIG CONTRACT"}
                          <Send size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Right Side: Showcase of Custom Services for Buy / Gigs List */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Shop Packages Available to BUY */}
                  <div className="p-6 bg-[#0E1526]/40 border border-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h4 className="font-extrabold text-[#22D3EE] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag size={14} /> Custom Service Packages Available
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">Real-time Node</span>
                    </div>

                    {services.length === 0 ? (
                      <div className="border border-dashed border-white/5 rounded-2xl p-8 text-center space-y-1.5">
                        <Layers size={20} className="mx-auto text-slate-500 opacity-60" />
                        <p className="text-xs uppercase font-mono font-bold text-slate-400">NO SERVICE PACKAGES DETECTED</p>
                        <p className="text-[10px] text-slate-500">Switch to Seller Portal to list your customized service packages!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((svc) => (
                          <div 
                            key={svc.id} 
                            className="p-4 border border-white/5 bg-[#0A0F1D] rounded-2xl hover:border-[#22D3EE]/30 transition-all relative flex flex-col justify-between gap-4 group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 flex items-center gap-1">
                                  <Clock size={8} /> {svc.deliveryTime}
                                </span>
                                <span className="text-sm font-black font-mono text-[#22D3EE]">${svc.price}</span>
                              </div>
                              <h5 className="font-extrabold text-sm text-white group-hover:text-[#22D3EE] transition-colors leading-tight uppercase">
                                {svc.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                                {svc.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                              <div className="truncate shrink-0">
                                <span className="text-[9px] text-slate-500 font-mono block uppercase">Merchant</span>
                                <span className="text-[10px] text-slate-300 font-medium">{svc.sellerEmail.split('@')[0]}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {user && svc.sellerId !== user.uid && (
                                  <button
                                    onClick={() => handleStartChat(svc.sellerId, svc.sellerEmail)}
                                    className="px-2.5 py-1.5 bg-white/5 hover:bg-slate-800 text-slate-300 hover:text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border border-white/5"
                                    title="Message Merchant"
                                  >
                                    <MessageSquare size={11} />
                                    CHAT
                                  </button>
                                )}
                                <button
                                  onClick={() => handleBuyService(svc)}
                                  className="px-3.5 py-1.5 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#070A13] font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  ORDER SERVICE
                                </button>
                                {user && svc.sellerId === user.uid && (
                                  <button
                                    onClick={() => handleDeleteService(svc.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Archive"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Shipments & Contracts Review */}
                  <div className="p-6 bg-[#0E1526]/40 border border-white/5 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-slate-300 text-xs font-mono uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                      <Activity size={14} /> Deliveries & Work Reviews Dashboard
                    </h4>

                    {results.filter(r => !user || r.buyerId === user.uid).length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-slate-500 font-mono">
                        No active work releases dispatched to your account. Orders will spawn records instantly.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.filter(r => !user || r.buyerId === user.uid).map((res) => (
                          <div key={res.id} className="p-5 border border-white/10 bg-[#0F172A]/90 rounded-2xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase block">Contract target workflow</span>
                                <h5 className="text-xs font-bold text-white capitalize">{res.jobTitle}</h5>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded-full font-bold border",
                                  res.status === 'accepted' 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/10 animate-pulse"
                                )}>
                                  {res.status === 'accepted' ? 'Completed' : 'Reviewing'}
                                </span>
                                <span className={cn(
                                  "px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded-full font-bold border",
                                  res.paymentStatus === 'paid'
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/25"
                                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/25 animate-pulse"
                                )}>
                                  {res.paymentStatus === 'paid' ? 'Paid & Released' : 'Held in Escrow'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase">Completed Deliverables:</span>
                              <p className="text-[11px] text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5 font-mono whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                {res.resultText}
                              </p>
                            </div>

                            {res.proofUrl && (
                              <div className="flex items-center gap-2 text-xs bg-cyan-955/20 border border-cyan-500/10 p-3 rounded-xl">
                                <FileText size={14} className="text-cyan-primary text-[#22D3EE]" />
                                <div className="truncate">
                                  <span className="text-[8px] text-slate-500 font-mono block uppercase">Proof Attachment / Delivery URL:</span>
                                  <a 
                                    href={res.proofUrl} 
                                    target="_blank" 
                                    referrerPolicy="no-referrer" 
                                    className="text-[#22D3EE] hover:underline font-bold text-[10px] break-all"
                                  >
                                    {res.proofUrl}
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="text-[11px] flex items-center gap-3">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Assigned Candidate</span>
                                  <span className="font-bold text-slate-200">{res.sellerEmail}</span>
                                </div>
                                {user && res.sellerId !== user.uid && (
                                  <button
                                    onClick={() => handleStartChat(res.sellerId, res.sellerEmail)}
                                    className="p-1 px-2.25 bg-white/5 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg transition-all text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                                    title="Chat with Creator"
                                  >
                                    <MessageSquare size={11} /> MESSAGE
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right shrink-0">
                                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Escrow Value</span>
                                  <span className="text-xs font-black text-white">${res.amount || '0'}</span>
                                </div>
                                {res.status !== 'accepted' ? (
                                  <button
                                    onClick={() => handleAcceptResult(res)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                  >
                                    <CheckCircle size={12} />
                                    Verify Work & Release Payout
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                    <Check className="text-emerald-400" size={14} /> Payout Cleared
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'seller' ? (
            <motion.div 
              key="seller-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Seller Header Banner */}
              <div className="p-6 bg-gradient-to-r from-[#0F172A] to-[#2E1065]/70 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono text-[#A78BFA] tracking-widest uppercase font-bold px-2 py-0.5 bg-[#A78BFA]/10 rounded border border-[#A78BFA]/25 mb-2 inline-block">
                    PRO-ENGINEER WORKFLOW
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white uppercase">
                    Deliver Cognitive Services & Claim Available Gigs
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-1">
                    Design customized service models (packages) so buyers can order them instantly, or search open client Gigs to claim, complete, and write work results.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Open Jobs</span>
                    <span className="text-xl font-black text-[#A78BFA]">{jobs.filter(j => j.status === 'open').length}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Service Packages</span>
                    <span className="text-xl font-black text-white">{services.length}</span>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Create/Sell a Service Package */}
                <div className="space-y-6">
                  <div className="p-6 bg-[#161226] border border-white/10 rounded-3xl shadow-xl space-y-5">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                      <Sparkles className="text-[#A78BFA]" size={18} />
                      <h4 className="font-extrabold text-sm uppercase tracking-wider font-sans text-white">Create service package</h4>
                    </div>

                    {!user ? (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-center space-y-2">
                        <AlertCircle className="mx-auto text-yellow-500" size={20} />
                        <p className="text-xs font-bold text-slate-300">Identity check required</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          You must be signed in to list details of packages your profile sells.
                        </p>
                        <button 
                          onClick={onSignIn}
                          className="w-full py-2 bg-[#A78BFA] hover:bg-[#8B5CF6] text-[#0F172A] font-bold text-xs rounded-xl uppercase transition-all"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePostService} className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Package Name / Title</label>
                          <input 
                            type="text"
                            required
                            value={svcTitle}
                            onChange={(e) => setSvcTitle(e.target.value)}
                            className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-100 transition-all"
                            placeholder="e.g. YouTube Script Copywriter"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Target Price</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={12} />
                              <input 
                                type="text"
                                required
                                value={svcPrice}
                                onChange={(e) => setSvcPrice(e.target.value)}
                                className="w-full bg-[#070A13] pl-6 border border-white/10 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-100 transition-all font-mono"
                                placeholder="e.g. 50"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Delivery Time</label>
                            <select
                              value={svcDelivery}
                              onChange={(e) => setSvcDelivery(e.target.value)}
                              className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-100 transition-all font-sans text-xs"
                            >
                              <option value="Instant">Instant delivery</option>
                              <option value="24 hours">Within 24 hours</option>
                              <option value="2-3 days">2-3 days</option>
                              <option value="1 week">Within 1 week</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Offer Description</label>
                          <textarea 
                            required
                            rows={4}
                            value={svcDesc}
                            onChange={(e) => setSvcDesc(e.target.value)}
                            className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-100 resize-none transition-all"
                            placeholder="Detail what specific templates, guides, script formulas, or SEO steps you offer..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={postingSvc}
                          className="w-full py-3 bg-[#A78BFA] text-[#070A13] hover:bg-[#8B5CF6] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {postingSvc ? "LAUNCHING SPECIALTY..." : "PUBLISH SERVICE OFFER"}
                          <Send size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Right Side: Available open jobs for matching buy request Gigs */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Job Board of Gigs posted by buyers */}
                  <div className="p-6 bg-[#0E1526]/40 border border-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h4 className="font-extrabold text-[#A78BFA] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={14} /> Open Client Gigs Available to Fulfill
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">Real-time Node</span>
                    </div>

                    {(() => {
                      const visibleJobs = jobs.filter(job => !job.sellerId || (user && job.sellerId === user.uid));
                      if (visibleJobs.length === 0) {
                        return (
                          <div className="border border-dashed border-white/5 rounded-2xl p-8 text-center space-y-1.5">
                            <AlertCircle className="mx-auto text-slate-500 opacity-60" size={20} />
                            <p className="text-xs uppercase font-mono font-bold text-slate-400">NO COGNITIVE GIGS LISTED</p>
                            <p className="text-[10px] text-slate-500">Go back to the Buyer Portal and launch a job opening first or purchase a Service!</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-4">
                          {visibleJobs.map((job) => {
                            const isDeliveringThis = submittingResultId === job.id;
                            return (
                              <div 
                                key={job.id} 
                                className="p-5 border border-white/10 bg-[#0F172A]/70 rounded-2xl transition-all hover:border-[#A78BFA]/30 space-y-4"
                              >
                                {job.sellerId && (
                                  <div className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono px-2 py-1 rounded w-fit uppercase font-bold tracking-widest flex items-center gap-1">
                                    <Sparkles size={10} /> DIRECT SERVICE ORDER FOR YOU
                                  </div>
                                )}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Buyer Profile: {job.buyerEmail}</span>
                                    <h4 className="text-sm font-black text-white tracking-tight uppercase leading-tight mt-0.5">
                                      {job.title}
                                    </h4>
                                  </div>
                                  {user && job.buyerId !== user.uid && (
                                    <button
                                      onClick={() => handleStartChat(job.buyerId, job.buyerEmail)}
                                      className="p-1.5 px-2.5 bg-white/5 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg transition-all text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                                      title="Message Client"
                                    >
                                      <MessageSquare size={11} /> CHAT
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2.5 self-start sm:self-center">
                                  <span className="text-xs font-mono font-bold text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/30 px-2.5 py-1 rounded-lg">
                                    Comp: ${job.budget}
                                  </span>
                                  <span className={cn(
                                    "px-2.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase",
                                    job.status === 'open' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                                  )}>
                                    {job.status}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs text-slate-300">
                                <p className="leading-relaxed whitespace-pre-wrap">{job.description}</p>
                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] text-[#A78BFA]">
                                  <strong className="block text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">Delivery Scope Required:</strong>
                                  {job.requirements}
                                </div>
                              </div>

                              {/* Delivery submission area inline! */}
                              {isDeliveringThis ? (
                                <div className="p-4 border border-[#A78BFA]/25 bg-[#A78BFA]/5 rounded-xl space-y-3">
                                  <span className="text-[10px] uppercase font-mono font-bold text-[#A78BFA]">Deliver Workspace Results for Gig</span>
                                  <textarea
                                    required
                                    rows={4}
                                    value={resultText}
                                    onChange={(e) => setResultText(e.target.value)}
                                    className="w-full bg-[#070A13] border border-white/15 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-300 text-xs font-mono"
                                    placeholder="Write or paste your completed deliverables here..."
                                  />
                                  <input
                                    type="url"
                                    value={proofUrl}
                                    onChange={(e) => setProofUrl(e.target.value)}
                                    className="w-full bg-[#070A13] border border-white/15 rounded-xl p-3 outline-none focus:border-[#A78BFA] text-slate-300 text-xs font-mono"
                                    placeholder="Optional Delivery / Proof Link (e.g. GitHub URL, Drive Folder, Demo Link)"
                                  />
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSubmittingResultId(null);
                                        setResultText('');
                                        setProofUrl('');
                                      }}
                                      className="px-3.5 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-white uppercase font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSendResult(job)}
                                      disabled={sendingResult || !resultText}
                                      className="px-4 py-2 bg-[#A78BFA] text-[#070A13] rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                    >
                                      {sendingResult ? "Submitting..." : "Send Release Deliverable"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {job.status === 'open' ? 'Position open' : 'Gig completed'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {job.status === 'open' && (
                                      <button
                                        onClick={() => handleDeliverJobResult(job)}
                                        className="px-4 py-2 bg-[#A78BFA] hover:bg-[#8B5CF6] text-[#0F172A] font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                      >
                                        DELIVER SUBMISSION
                                      </button>
                                    )}
                                    {user && job.buyerId === user.uid && (
                                      <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete Post"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                    })()}
                  </div>

                  {/* Complete Deliveries Ledgers for Seller */}
                  <div className="p-6 bg-[#0E1526]/40 border border-white/5 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-slate-300 text-xs font-mono uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                      <Activity size={14} /> My Submission Releases Logged
                    </h4>

                    {results.filter(r => !user || r.sellerId === user.uid).length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-slate-500 font-mono">
                        No submissions logged from your workspace yet. Fulfill Gigs or complete orders to sync ledger status.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.filter(r => !user || r.sellerId === user.uid).map((res) => (
                          <div key={res.id} className="p-5 border border-white/10 bg-[#0F172A]/90 rounded-2xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
                              <div>
                                <span className="text-[8px] text-slate-500 font-mono block uppercase">Delivery Reference Code</span>
                                <h5 className="text-xs font-bold text-white capitalize">{res.jobTitle}</h5>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded-full font-bold border",
                                  res.status === 'accepted' 
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/10"
                                    : "bg-amber-500/15 text-amber-400 border-amber-500/10 animate-pulse"
                                )}>
                                  {res.status === 'accepted' ? 'Accepted' : 'Awaiting Review'}
                                </span>
                                <span className={cn(
                                  "px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded-full font-bold border",
                                  res.paymentStatus === 'paid'
                                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/20"
                                    : "bg-yellow-500/25 text-yellow-300 border-yellow-500/20 animate-pulse"
                                )}>
                                  {res.paymentStatus === 'paid' ? 'Paid & Released' : 'Waiting on Payment'}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] font-mono text-slate-300 bg-black/30 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                              {res.resultText}
                            </p>

                            {res.proofUrl && (
                              <div className="flex items-center gap-2 text-xs bg-slate-900 border border-white/5 p-3 rounded-xl">
                                <FileText size={13} className="text-slate-400" />
                                <div className="truncate">
                                  <span className="text-[8px] text-slate-500 font-mono block uppercase">Submitted Proof URL:</span>
                                  <a 
                                    href={res.proofUrl} 
                                    target="_blank" 
                                    referrerPolicy="no-referrer" 
                                    className="text-[#22D3EE] hover:underline font-bold text-[10px] break-all"
                                  >
                                    {res.proofUrl}
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="text-[11px] flex items-center gap-3">
                                <div>
                                  <span className="text-[8px] text-slate-500 font-mono block uppercase">Client Profile Logged</span>
                                  <span className="font-bold text-slate-300">{res.buyerId === user?.uid ? 'Your self' : `Buyer Account ID (${res.buyerId.slice(0, 6)}...)`}</span>
                                </div>
                                {user && res.buyerId !== user.uid && (
                                  <button
                                    onClick={() => handleStartChat(res.buyerId, (res as any).buyerEmail || 'client@chidon.com')}
                                    className="p-1 px-2.25 bg-white/5 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg transition-all text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                                    title="Message Client"
                                  >
                                    <MessageSquare size={11} /> MESSAGE
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-[8px] text-slate-500 font-mono block uppercase">Total Comp/Budget</span>
                                  <span className="text-xs font-black text-white">${res.amount || '0'}</span>
                                </div>
                                {res.paymentStatus === 'paid' ? (
                                  <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-lg">
                                    Funds Disbursed
                                  </div>
                                ) : (
                                  <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-[#22D3EE] text-[10px] font-mono uppercase rounded-lg flex items-center gap-1.5 animate-pulse">
                                    <Clock size={11} /> Waiting for Client Payout
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <EarnChat 
                user={user} 
                activePartnerId={chatPartnerId} 
                activePartnerEmail={chatPartnerEmail} 
              />
            </motion.div>
          )}
        </AnimatePresence>
          </div>

          {/* Right Column: Recent Contacts/Conversations Side Panel */}
          {activeTab !== 'messages' && (
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8" id="recent-chats-sidepanel">
              <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-5 shadow-[0_0_50px_rgba(34,211,238,0.02)] backdrop-blur-md space-y-4">
                <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#22D3EE] tracking-widest uppercase flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#22D3EE]" />
                    <AutoTranslate>{t("earn.recent_chats", "PEER NEGOTIATIONS")}</AutoTranslate>
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {!user ? (
                  <div className="text-center py-6 px-4 border border-dashed border-white/10 rounded-2xl bg-slate-950/40 space-y-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                      <User size={20} className="text-slate-500 opacity-60 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#22D3EE] font-mono uppercase font-black tracking-wider">Authentication Required</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        <AutoTranslate>{t("earn.sidebar_auth_explain", "Please sign in to view your ongoing secure chat rooms and trade threads.")}</AutoTranslate>
                      </p>
                    </div>
                    <button 
                      onClick={onSignIn}
                      className="w-full py-2.5 bg-[#22D3EE] text-[#070A13] hover:bg-[#06B6D4] transition-all rounded-xl font-bold font-mono text-[9.5px] uppercase cursor-pointer"
                    >
                      Authenticate
                    </button>
                  </div>
                ) : sideConversations.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-white/5 rounded-2xl bg-slate-950/40 space-y-3">
                    <MessageSquare size={22} className="mx-auto text-slate-600 opacity-30 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-extrabold text-[#22D3EE] uppercase tracking-wider">NO ACTIVE THREADS</p>
                      <p className="text-[9.5px] text-slate-500 leading-relaxed max-w-[160px] mx-auto">
                        <AutoTranslate>{t("earn.sidebar_empty_explain", "Start discussing gigs! Use the 'Chat' button on any active job profile or seller offer.")}</AutoTranslate>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-0.5">
                    {sideConversations.slice(0, 5).map((contact) => {
                      const displayEmail = contact.email.split('@')[0];
                      return (
                        <button
                          key={contact.id}
                          onClick={() => handleStartChat(contact.id, contact.email)}
                          className="w-full p-3 bg-slate-950/45 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all group outline-none cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase select-none group-hover:bg-[#22D3EE] group-hover:text-[#070A13] transition-colors shadow">
                              {displayEmail.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold text-[#F1F5F9] block truncate group-hover:text-[#22D3EE] transition-colors">
                                @{displayEmail}
                              </span>
                              <span className="text-[10px] text-slate-550 truncate block max-w-[120px]">
                                {contact.lastText}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={11} className="text-slate-600 group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                    
                    {sideConversations.length > 5 && (
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="w-full py-2 bg-white/5 hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] text-slate-400 text-[10px] font-mono font-bold rounded-xl transition-all uppercase text-center cursor-pointer border border-transparent hover:border-[#22D3EE]/10"
                      >
                        + {sideConversations.length - 5} More Conversations
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Creation / Editing Modal (Visible Throughout) */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-xl bg-[#0E1526] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#22D3EE]" size={20} />
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Social Media Specs Profile</h3>
                    <p className="text-[10px] text-slate-400 font-mono">List yourself as an active Social Media professional on the ledger</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Display Profile Name</label>
                  <input 
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all font-mono"
                    placeholder="e.g. BeastThumbnails, SetupWizard..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Primary Specialty</label>
                    <select
                      value={profileSpecialty}
                      onChange={(e) => setProfileSpecialty(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all font-sans text-xs"
                    >
                      <option value="Thumbnail Design">🎨 Thumbnail Design</option>
                      <option value="Video Editing">🎬 Video Editing</option>
                      <option value="Social Account Creation">🔑 Account Creation & Setup</option>
                      <option value="Scripting & Storywriting">📝 Scripting & Copywriting</option>
                      <option value="Growth & SEO Strategy">📈 Channel Growth & SEO</option>
                      <option value="Full Social Media Management">📱 Full Media Management</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Hourly cost or Starting Price</label>
                    <input 
                      type="text"
                      required
                      value={profileRate}
                      onChange={(e) => setProfileRate(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all font-mono"
                      placeholder="e.g. $25/hr or $50/video"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">Strategic Portfolio Bio</label>
                  <textarea 
                    required
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 resize-none transition-all"
                    placeholder="Explain your expertise (e.g., 'Have edited 150+ YouTube Shorts with retaining hooks, set up full automated channels with custom branded graphics...')"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold flex items-center gap-1.5">
                    <Globe size={11} className="text-[#22D3EE]" /> Portfolio Website URL <span className="text-[8px] text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input 
                    type="url"
                    value={profilePortfolio}
                    onChange={(e) => setProfilePortfolio(e.target.value)}
                    className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 transition-all font-mono"
                    placeholder="e.g. https://behance.net/myprofile"
                  />
                </div>

                <div className="border-t border-white/5 pt-3 mt-2 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">YouTube Handle (optional)</span>
                    <input 
                      type="text"
                      value={profileYoutube}
                      onChange={(e) => setProfileYoutube(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/5 rounded-xl p-2.5 outline-none focus:border-[#22D3EE] text-slate-100 font-mono text-[11px]"
                      placeholder="@MyChannel"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Instagram Handle (optional)</span>
                    <input 
                      type="text"
                      value={profileInstagram}
                      onChange={(e) => setProfileInstagram(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/5 rounded-xl p-2.5 outline-none focus:border-[#22D3EE] text-slate-100 font-mono text-[11px]"
                      placeholder="@MyInsta"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">TikTok Handle (optional)</span>
                    <input 
                      type="text"
                      value={profileTiktok}
                      onChange={(e) => setProfileTiktok(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/5 rounded-xl p-2.5 outline-none focus:border-[#22D3EE] text-slate-100 font-mono text-[11px]"
                      placeholder="@MyTikTok"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Twitter @ Handle (optional)</span>
                    <input 
                      type="text"
                      value={profileTwitter}
                      onChange={(e) => setProfileTwitter(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/5 rounded-xl p-2.5 outline-none focus:border-[#22D3EE] text-slate-100 font-mono text-[11px]"
                      placeholder="@MyTwitter"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 bg-[#22D3EE] text-[#070A13] hover:bg-[#06B6D4] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(34,211,238,0.2)]"
                >
                  {savingProfile ? "SAVING SPECS TO LEDGER..." : "PUBLISH ME TO DIRECTORY"}
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Detailed Profile View Modal (Visible Throughout) */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#0E1526] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(34,211,238,0.15)]">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[9px] font-mono tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] px-2.5 py-1 rounded-full uppercase font-bold">
                  Verified Creator Specifications
                </span>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="space-y-4">
                {/* Header Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#22D3EE] to-[#A78BFA] p-0.5 flex items-center justify-center font-black text-slate-900 text-xl shadow-lg shadow-cyan-500/10">
                    <div className="w-full h-full rounded-2xl bg-[#070A13] flex items-center justify-center text-white text-base">
                      {selectedProfile.displayName?.[0]?.toUpperCase() || 'S'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedProfile.displayName}</h3>
                    <span className="inline-block text-[10px] font-mono uppercase font-black text-[#A78BFA] tracking-wider mt-0.5">
                      🎯 {selectedProfile.specialty}
                    </span>
                  </div>
                </div>

                {/* Cost & Contact Bar */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#070A13] border border-white/5 rounded-2xl text-xs">
                  <div>
                    <span className="text-[8px] text-slate-500 font-mono block uppercase">Estimated Cost Rate</span>
                    <span className="font-extrabold text-white text-sm">{selectedProfile.hourlyRate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 font-mono block uppercase">Client Channel Sync</span>
                    <span className="font-bold text-slate-300 flex items-center gap-1 mt-0.5 truncate text-[11px]" title={selectedProfile.email}>
                      <Mail size={11} className="text-[#22D3EE]" /> {selectedProfile.email.split('@')[0]}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Creator Bio & Portfolio Statement</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#070A13]/45 p-4 border border-white/5 rounded-2xl whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedProfile.bio || 'This professional creator has not filled out a bio yet, but stands fully verified on the Chidon Earn ledger.'}
                  </p>
                </div>

                {/* Portfolio & Social Handles */}
                <div className="space-y-3 pt-2">
                  {selectedProfile.portfolioUrl && (
                    <div className="flex items-center justify-between text-xs bg-cyan-950/20 border border-cyan-500/10 p-3 rounded-xl">
                      <span className="text-[9px] font-mono uppercase text-slate-400">Main Portfolio Link</span>
                      <a 
                        href={selectedProfile.portfolioUrl} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="text-[#22D3EE] hover:underline font-bold text-[11px] flex items-center gap-1"
                      >
                        Launch Portfolio <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                  {/* Social Handles Badge Array */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedProfile.youtubeUrl && (
                      <span className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/15 text-red-450 text-[10px] rounded-lg">
                        YouTube: {selectedProfile.youtubeUrl}
                      </span>
                    )}
                    {selectedProfile.instagramUrl && (
                      <span className="px-2.5 py-1.5 bg-[#E1306C]/10 border border-[#E1306C]/15 text-[#E1306C]/85 text-[10px] rounded-lg">
                        Instagram: {selectedProfile.instagramUrl}
                      </span>
                    )}
                    {selectedProfile.tiktokUrl && (
                      <span className="px-2.5 py-1.5 bg-teal-500/10 border border-teal-500/15 text-teal-455 text-[10px] rounded-lg">
                        TikTok: {selectedProfile.tiktokUrl}
                      </span>
                    )}
                    {selectedProfile.twitterUrl && (
                      <span className="px-2.5 py-1.5 bg-sky-500/10 border border-sky-500/15 text-sky-455 text-[10px] rounded-lg">
                        X / Twitter: {selectedProfile.twitterUrl}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hire/Call to Action */}
                <div className="border-t border-white/5 pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setActiveTab('buyer');
                    }}
                    className="flex-1 py-3 bg-[#22D3EE] text-[#070A13] hover:bg-[#06B6D4] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
                  >
                    ORDER FROM {selectedProfile.displayName.split(' ')[0].toUpperCase()}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Profile Creation/Editing Access Hub (Visible Throughout) */}
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
          <button
            onClick={() => {
              if (!user) {
                if (onSignIn) onSignIn();
              } else {
                setShowProfileModal(true);
              }
            }}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-full font-black text-[10px] tracking-wider uppercase transition-all shadow-[0_4px_25px_rgba(6,182,212,0.3)] flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-105"
          >
            <User size={13} />
            {myProfile ? `My Specs: ${myProfile.displayName}` : "Create Specs Profile"}
          </button>
        </div>

        {/* PAYSTACK CHECKOUT BILLING MODAL */}
        {showCheckoutModal && checkoutService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md bg-[#0E1526] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="text-[#22D3EE] animate-pulse" size={20} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Paystack Secured Escrow</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Immediate Creator Dispatch & Protection</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="space-y-4">
                {/* Package Card Summary */}
                <div className="p-4 bg-[#070A13] border border-white/5 rounded-2xl space-y-2">
                  <span className="text-[8px] font-mono uppercase text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/25 px-2 py-0.5 rounded w-fit block font-bold">
                    Specialist Deliverable Offer
                  </span>
                  <h4 className="font-extrabold text-sm text-white">{checkoutService.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{checkoutService.description}</p>
                </div>

                <form onSubmit={handlePaystackCheckout} className="space-y-4 text-xs">
                  {/* Amount & Exchange Calculations */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Assessed USD Price</span>
                      <div className="w-full bg-[#070A13]/60 border border-white/5 rounded-xl p-3 font-bold text-white text-sm">
                        ${checkoutService.price}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block">Billing Naira (₦)</span>
                      <input 
                        type="number"
                        required
                        value={customPayAmount}
                        onChange={(e) => setCustomPayAmount(e.target.value)}
                        className="w-full bg-[#070A13] border border-cyan-500/40 rounded-xl p-3 font-mono font-bold text-[#22D3EE] outline-none focus:border-[#22D3EE] text-sm"
                        placeholder="Naira amount"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
                    <Shield size={14} className="text-[#22D3EE] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block mb-0.5">Escrow Protection Active</span>
                      Funds are synchronized on our digital ledger and safely locked via standard African gateway Paystack. The seller will only receive payouts when task deliverables verify 100% on-contract.
                    </div>
                  </div>

                  {/* Billing email */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 tracking-wider uppercase font-bold">Recipient Customer Email</label>
                    <input 
                      type="email"
                      required
                      value={checkoutMail}
                      onChange={(e) => setCheckoutMail(e.target.value)}
                      className="w-full bg-[#070A13] border border-white/10 rounded-xl p-3 outline-none focus:border-[#22D3EE] text-slate-100 font-mono"
                      placeholder="email@example.com"
                    />
                  </div>

                  {/* Submit checkout redirect */}
                  <button
                    type="submit"
                    disabled={paystackLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-450 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#070A13] hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_4px_25px_rgba(16,185,129,0.3)] border border-emerald-500/10"
                  >
                    {paystackLoading ? (
                      <span className="className=animate-pulse">SYNCHRONIZING ESCROW TOKEN...</span>
                    ) : (
                      <>
                        <span>PROPOSE SECURE PAYSTACK ORDER</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-slate-500 text-center font-mono">
                    Supported: Credit/Debit Cards, USSD, Bank Transfer, Apple Pay, & Mobile Money
                  </p>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* PAYSTACK PAYMENT SUCCESS MODAL */}
        {paymentSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md bg-[#0E1526] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center">
              
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono tracking-widest bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase font-bold">
                  TRANSACTION SECURED & LEDGER MUTATED
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Payment Approved</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your secure payment has been processed successfully. Verification reference code is recorded onto the live social system to lock your contract order.
                </p>
              </div>

              <div className="p-4 bg-[#070A13] border border-white/5 rounded-2xl text-xs space-y-2 font-mono text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-white">₦{paymentSuccessModal.amount.toLocaleString()} NGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paystack Gateway:</span>
                  <span className="text-[#22D3EE] font-bold">
                    {paymentSuccessModal.simulated ? "SANDBOX ENVIROMENT" : "PAYSTACK LIVE"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Escrow Code:</span>
                  <span className="text-emerald-400 font-bold truncate text-[10px] max-w-[200px]" title={paymentSuccessModal.reference}>
                    {paymentSuccessModal.reference}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPaymentSuccessModal(null)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-500/10"
              >
                ENTER CONTRACT WORKSPACE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
