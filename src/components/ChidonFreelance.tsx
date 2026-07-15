import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Briefcase, MessageSquare, Shield, User, 
  Layers, ShoppingBag, Plus, RefreshCw, LogIn, Activity,
  HelpCircle, Users, CheckCircle, TrendingUp, Globe, Award, Cpu, CreditCard
} from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FreelanceProfile, Gig, Order } from './chidon-freelance/types';
import { ensureFreelanceProfile, handleFirestoreError, OperationType } from './chidon-freelance/utils';
import { PaystackGatewayModal } from './chidon-freelance/PaystackGatewayModal';

// Import Views
import { ExploreView } from './chidon-freelance/ExploreView';
import { GigDetailView } from './chidon-freelance/GigDetailView';
import { CreateGigView } from './chidon-freelance/CreateGigView';
import { DashboardView } from './chidon-freelance/DashboardView';
import { BuyerDashboardView } from './chidon-freelance/BuyerDashboardView';
import { OrderDetailView } from './chidon-freelance/OrderDetailView';
import { ChatsView } from './chidon-freelance/ChatsView';
import { AdminView } from './chidon-freelance/AdminView';
import { UserProfileView } from './chidon-freelance/UserProfileView';
import { FreelanceProjects } from './chidon-freelance/FreelanceProjects';
import { ClientInteraction } from './chidon-freelance/ClientInteraction';
import { JobBoardView } from './chidon-freelance/JobBoardView';
import { ChidonIqToolsView } from './chidon-freelance/ChidonIqToolsView';
import { PaymentDashboardView } from './chidon-freelance/PaymentDashboardView';

// Import Onboarding & Profile Setup views
import { WelcomeOnboardingView, OnboardingSetupView } from './chidon-freelance/OnboardingComponents';

export interface ChidonFreelanceProps {
  currentUser: any; // Passed from parent App.tsx
  onTriggerAuth: () => void;
  subView?: FreelanceView;
  onSubViewChange?: (newView: FreelanceView) => void;
  onSendToNotepad?: (content: string, title?: string) => void;
}

export type FreelanceView = 
  | 'explore' 
  | 'gig_detail' 
  | 'create_gig' 
  | 'dashboard' 
  | 'buyer_dashboard'
  | 'order_detail' 
  | 'chats' 
  | 'admin' 
  | 'profile'
  | 'projects'
  | 'client_interaction'
  | 'job_board'
  | 'payment_dashboard'
  | 'iq_tools';

export const ChidonFreelance: React.FC<ChidonFreelanceProps> = ({ 
  currentUser,
  onTriggerAuth,
  subView,
  onSubViewChange,
  onSendToNotepad
}) => {
  const [localView, setLocalView] = useState<FreelanceView>('buyer_dashboard');
  const view = subView || localView;
  const setView = (newView: FreelanceView) => {
    if (onSubViewChange) {
      onSubViewChange(newView);
    } else {
      setLocalView(newView);
    }
  };
  
  const [profile, setProfile] = useState<FreelanceProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Portal switch mode ('buyer' or 'seller')
  const [portalMode, setPortalMode] = useState<'buyer' | 'seller'>('buyer');

  // Onboarding visible states
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return localStorage.getItem('chidon_welcome_seen') !== 'true';
  });

  // Nav Selection Holders
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [initialSellerChat, setInitialSellerChat] = useState<{ sellerId: string; sellerName: string } | null>(null);

  // Paystack Gateway Modal state triggers
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [paystackModalData, setPaystackModalData] = useState<{
    packageType: 'basic' | 'standard' | 'premium';
    amount: number;
    reference: string;
    title: string;
    isDirectPayout?: boolean;
    directPayload?: {
      sellerId: string;
      sellerName: string;
      memo: string;
    };
  } | null>(null);

  // Load / Sync Freelance user profile
  const fetchProfile = async () => {
    if (!currentUser?.uid) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const uProfile = await ensureFreelanceProfile(
        currentUser.uid, 
        currentUser.email || '', 
        currentUser.displayName || ''
      );
      setProfile(uProfile || null);
      if (uProfile?.role) {
        setPortalMode(uProfile.role);
        // Force the active view to line up with their selected portal world
        if (uProfile.hasCompletedSetup) {
          setView(uProfile.role === 'buyer' ? 'buyer_dashboard' : 'dashboard');
        }
      }
    } catch (err) {
      console.warn("Profile sync delay:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser?.uid]);

  // Enforce strict separation between Buyer and Seller views
  useEffect(() => {
    if (profile?.hasCompletedSetup && profile?.role) {
      if (profile.role === 'buyer') {
        const sellerOnlyViews: FreelanceView[] = ['dashboard', 'create_gig', 'payment_dashboard'];
        if (sellerOnlyViews.includes(view)) {
          setView('buyer_dashboard');
        }
      } else if (profile.role === 'seller') {
        const buyerOnlyViews: FreelanceView[] = ['buyer_dashboard', 'explore', 'job_board', 'gig_detail'];
        if (buyerOnlyViews.includes(view)) {
          setView('dashboard');
        }
      }
    }
  }, [view, profile?.role, profile?.hasCompletedSetup]);

  // Synchronize view starting point when portalMode switches
  const handlePortalSwitch = (mode: 'buyer' | 'seller') => {
    setPortalMode(mode);
    if (mode === 'buyer') {
      setView('buyer_dashboard');
    } else {
      setView('dashboard');
    }
  };

  // Dynamic Paystack Script Injection for Inline Checkout
  useEffect(() => {
    const existingScript = document.getElementById('paystack-inline-js');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.id = 'paystack-inline-js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Paystack ESCROW Purchase execution
  const handleOrderCheckout = (packageType: 'basic' | 'standard' | 'premium', amount: number) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }
    if (!selectedGig || !profile) return;

    // Build unique reference
    const paystackRef = `CHIDON_ESC_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    setPaystackModalData({
      packageType,
      amount,
      reference: paystackRef,
      title: `${selectedGig.title.slice(0, 32)}...`
    });
    setPaystackModalOpen(true);
  };

  const completeEscrowOrderCreation = async (
    packageType: 'basic' | 'standard' | 'premium', 
    amount: number, 
    reference: string, 
    status: string
  ) => {
    if (!selectedGig || !profile) return;
    
    try {
      const orderData = {
        buyerId: profile.uid,
        buyerName: profile.fullName || profile.username,
        sellerId: selectedGig.userId,
        sellerName: selectedGig.sellerName,
        gigId: selectedGig.id,
        gigTitle: selectedGig.title,
        gigImage: selectedGig.images[0] || '',
        packageType,
        packageTitle: selectedGig.packages[packageType].title || `${packageType.toUpperCase()} package`,
        amount,
        status: 'pending_requirements',
        paystackReference: reference,
        paystackStatus: status,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Post system notification to seller
      await addDoc(collection(db, 'notifications'), {
        userId: selectedGig.userId,
        title: 'New Escrow Order Secured!',
        message: `Client @${profile.username} has purchased your "${selectedGig.title}" ${packageType.toUpperCase()} package for $${amount}. Submit requirements to start.`,
        type: 'order',
        linkId: docRef.id,
        isRead: false,
        createdAt: serverTimestamp()
      });
 
      // Post notification to buyer
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'Order Secured Successfully',
        message: `Your payment of $${amount} is held securely in escrow. Submit requirements to kickoff freelancer.`,
        type: 'order',
        linkId: docRef.id,
        isRead: false,
        createdAt: serverTimestamp()
      });

      // Redirect to Order Detail View
      const finalOrder: Order = { id: docRef.id, ...orderData } as Order;
      setSelectedOrder(finalOrder);
      setView('order_detail');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  const handlePaystackModalSuccess = async (reference: string) => {
    if (!paystackModalData) return;
    const { packageType, amount } = paystackModalData;
    await completeEscrowOrderCreation(packageType, amount, reference, 'success');
    setPaystackModalOpen(false);
    setPaystackModalData(null);
  };

  // Open Chat thread helper
  const handleOpenChatWithSeller = (sellerId: string, sellerName: string) => {
    setInitialSellerChat({ sellerId, sellerName });
    setView('chats');
  };

  // Theme definition mapping to create highly distinct experience worlds!
  const theme = portalMode === 'buyer' ? {
    accent: 'emerald',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    accentBgSolid: 'bg-emerald-500 dark:bg-emerald-600 text-slate-950 dark:text-slate-950 hover:bg-emerald-600',
    accentBorder: 'border-emerald-500/20 dark:border-emerald-500/30',
    tabActive: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    title: 'Buyer Portal',
    desc: 'Hire top specialists, secure milestones, and manage escrow contracts'
  } : {
    accent: 'cyan',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    accentBg: 'bg-cyan-500/10 dark:bg-cyan-500/10',
    accentBgSolid: 'bg-cyan-500 dark:bg-cyan-600 text-slate-950 dark:text-slate-950 hover:bg-cyan-600',
    accentBorder: 'border-cyan-500/20 dark:border-cyan-500/30',
    tabActive: 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    badge: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    title: 'Seller Workspace',
    desc: 'List custom gigs, check active jobs to apply, and receive payments commission-free'
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] space-y-8 font-sans">
      
      {/* 1. EXPERIENCE SWITCHER & SUB-NAV HEADER */}
      {currentUser && !profileLoading && !showWelcome && profile?.hasCompletedSetup && (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-[var(--border-base)]/40 pb-6 gap-6 animate-in fade-in duration-200">
          
          {/* Core App Name Logo */}
          <div className="space-y-1 text-left">
            <h1 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Layers className={portalMode === 'buyer' ? 'text-emerald-500' : 'text-cyan-500'} size={24} />
              <span>ChidonFreelance</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Commission-Free Web3 Freelance Sandbox Mode • <span className={`font-bold ${theme.accentText}`}>{theme.title}</span>
            </p>
          </div>

          {/* The Two Visible Portal Swappers */}
          {!profile?.hasCompletedSetup && (
            <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-350 dark:border-slate-800 self-start xl:self-center">
              <button
                onClick={() => handlePortalSwitch('buyer')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  portalMode === 'buyer' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white font-bold'
                }`}
              >
                <Users size={14} />
                <span>Buyer Portal</span>
              </button>
              
              <button
                onClick={() => handlePortalSwitch('seller')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  portalMode === 'seller' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white font-bold'
                }`}
              >
                <TrendingUp size={14} />
                <span>Seller Portal</span>
              </button>
            </div>
          )}

          {/* Dynamic Nav Tabs Menu depending 100% on Portal Mode */}
          <div className="flex flex-wrap items-center gap-1.5">
            {portalMode === 'buyer' ? (
              <>
                {/* Buyer Tabs */}
                <button
                  onClick={() => setView('buyer_dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'buyer_dashboard' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Briefcase size={13} />
                  <span>Buyer Dashboard</span>
                </button>

                <button
                  onClick={() => setView('explore')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'explore' || view === 'gig_detail' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Compass size={13} />
                  <span>Explore Gigs</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) onTriggerAuth();
                    else setView('projects');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'projects' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Activity size={13} />
                  <span>My Escrow Orders</span>
                </button>
              </>
            ) : (
              <>
                {/* Seller Tabs */}
                <button
                  onClick={() => {
                    if (!currentUser) onTriggerAuth();
                    else setView('dashboard');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'dashboard' || view === 'order_detail'
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Briefcase size={13} />
                  <span>My Workspace</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) onTriggerAuth();
                    else {
                      setEditingGig(null);
                      setView('create_gig');
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'create_gig' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Plus size={13} />
                  <span>List Service</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) onTriggerAuth();
                    else setView('projects');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'projects' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Activity size={13} />
                  <span>Incoming Contracts</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) onTriggerAuth();
                    else setView('payment_dashboard');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    view === 'payment_dashboard' 
                      ? theme.tabActive 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Earned Funds & Receipts</span>
                </button>
              </>
            )}

            {/* Shared Messenger, Profile, Admin tabs */}
            <button
              onClick={() => {
                if (!currentUser) onTriggerAuth();
                else {
                  setView('chats');
                  setInitialSellerChat(null);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                view === 'chats' 
                  ? 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white' 
                  : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MessageSquare size={13} />
              <span>Messenger</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) onTriggerAuth();
                else setView('iq_tools');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'iq_tools' 
                  ? 'bg-cyan-primary/10 border border-cyan-primary text-cyan-primary shadow-[0_0_12px_rgba(34,211,238,0.15)]' 
                  : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Cpu size={13} />
              <span>Chidon IQ AI Tools</span>
            </button>

            {profile && (
              <button
                onClick={() => setView('profile')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  view === 'profile' 
                    ? 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white' 
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <User size={13} />
                <span>Well-Connected Profile</span>
              </button>
            )}

            <button
              onClick={() => setView('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                view === 'admin' 
                  ? 'bg-red-600/15 text-red-500 border border-red-500/20' 
                  : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              <Shield size={13} />
              <span>Admin</span>
            </button>
          </div>

        </div>
      )}

      {/* 2. MAIN ACTIVE LAYOUT WORKSPACE CANVAS */}
      <div className="w-full">
        {profileLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-brand mx-auto" />
            <p className="text-xs font-mono text-slate-500">Decrypting creative profiles...</p>
          </div>
        ) : !currentUser ? (
          <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
            <LogIn size={40} className="text-slate-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-black dark:text-white">Authentication Required</h3>
              <p className="text-xs text-slate-500">Sign in with Email/Password or Google Auth to unlock escrow contracts, list gigs, and open chats.</p>
            </div>
            <button
              onClick={onTriggerAuth}
              className="px-6 py-2.5 bg-brand text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              Authenticate Now
            </button>
          </div>
        ) : showWelcome ? (
          // ONE-TIME PROFESSIONALLY WELCOME POPUP
          <WelcomeOnboardingView 
            onSkip={() => {
              setShowWelcome(false);
              localStorage.setItem('chidon_welcome_seen', 'true');
            }}
          />
        ) : !profile?.hasCompletedSetup ? (
          // SEPARATE JOIN BUYER / JOIN SELLER PATHWAYS + AUTO-LOADED BIO & PORTFOLIO BUILDER
          <OnboardingSetupView 
            profile={profile!}
            currentUser={currentUser}
            onComplete={(updatedProfile) => {
              setProfile(updatedProfile);
              setPortalMode(updatedProfile.role);
              setView(updatedProfile.role === 'buyer' ? 'explore' : 'dashboard');
            }}
          />
        ) : (
          // MAIN ACTIVE WORKSPACE WORLDS
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Ambient Welcoming Headline for distinct portals */}
            <div className="mb-6 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${theme.badge}`}>
                    {portalMode.toUpperCase()} REALM
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {profile.username}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {portalMode === 'buyer' ? 'Discover Elite Sandbox Services' : 'Your Professional Freelance Workspace'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{theme.desc}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0">
                  {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">{profile.fullName}</div>
                  <button 
                    onClick={() => setView('profile')}
                    className={`text-[10px] font-bold ${theme.accentText} hover:underline`}
                  >
                    Edit Sandbox Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Buyer views */}
            {view === 'buyer_dashboard' && (
              <BuyerDashboardView
                profile={profile!}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setView('order_detail');
                }}
                onNavigateToExplore={() => setView('explore')}
                onRefreshProfile={fetchProfile}
              />
            )}

            {view === 'explore' && (
              <ExploreView 
                profile={profile!} 
                onSelectGig={(gig) => {
                  setSelectedGig(gig);
                  setView('gig_detail');
                }} 
              />
            )}

            {view === 'job_board' && (
              <JobBoardView
                profile={profile!}
                onOpenChat={handleOpenChatWithSeller}
              />
            )}

            {view === 'gig_detail' && selectedGig && (
              <GigDetailView
                gig={selectedGig}
                onOrderCheckout={handleOrderCheckout}
                onOpenChat={handleOpenChatWithSeller}
                onBack={() => setView('explore')}
              />
            )}

            {/* Seller views */}
            {view === 'dashboard' && (
              <DashboardView
                profile={profile!}
                onCreateGig={() => {
                  setEditingGig(null);
                  setView('create_gig');
                }}
                onEditGig={(gig) => {
                  setEditingGig(gig);
                  setView('create_gig');
                }}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setView('order_detail');
                }}
                onRefreshProfile={fetchProfile}
              />
            )}

            {view === 'create_gig' && (
              <CreateGigView
                profile={profile!}
                editingGig={editingGig || undefined}
                onSuccess={() => {
                  setEditingGig(null);
                  setView('dashboard');
                }}
                onCancel={() => {
                  setEditingGig(null);
                  setView('dashboard');
                }}
              />
            )}

            {view === 'order_detail' && selectedOrder && (
              <OrderDetailView
                order={selectedOrder}
                profile={profile!}
                onBack={() => {
                  if (portalMode === 'buyer') {
                    setView('projects');
                  } else {
                    setView('dashboard');
                  }
                }}
                onRefreshProfile={fetchProfile}
              />
            )}

            {view === 'chats' && (
              <ChatsView
                profile={profile!}
                initialSellerContact={initialSellerChat}
              />
            )}

            {view === 'projects' && (
              <FreelanceProjects
                profile={profile!}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setView('order_detail');
                }}
                onNavigateToChats={() => setView('chats')}
              />
            )}

            {view === 'client_interaction' && (
              <ClientInteraction
                profile={profile!}
                initialOrder={selectedOrder || undefined}
                onBack={() => setView('explore')}
              />
            )}

            {view === 'profile' && (
              <UserProfileView
                profile={profile!}
                onProfileUpdate={(updated) => {
                  setProfile(updated);
                  setPortalMode(updated.role);
                }}
                onBack={() => {
                  if (portalMode === 'buyer') {
                    setView('explore');
                  } else {
                    setView('dashboard');
                  }
                }}
              />
            )}

            {view === 'payment_dashboard' && (
              <PaymentDashboardView 
                profile={profile!}
                onRefreshProfile={fetchProfile}
              />
            )}

            {view === 'admin' && (
              <AdminView profile={profile!} />
            )}

            {view === 'iq_tools' && (
              <ChidonIqToolsView 
                onBack={() => setView(portalMode === 'buyer' ? 'explore' : 'dashboard')} 
                onSendToNotepad={onSendToNotepad}
              />
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {paystackModalOpen && paystackModalData && (
          <PaystackGatewayModal
            isOpen={paystackModalOpen}
            onClose={() => { setPaystackModalOpen(false); setPaystackModalData(null); }}
            onSuccess={handlePaystackModalSuccess}
            email={currentUser?.email || 'buyer@chidoniq.com'}
            amountUsd={paystackModalData.amount}
            reference={paystackModalData.reference}
            title={paystackModalData.title}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
