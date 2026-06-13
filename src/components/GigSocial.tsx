import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, DollarSign, Send, User, Check, Activity, Sparkles, 
  Clock, ArrowRight, Search, AlertCircle, Trash2, Plus, ShoppingBag, 
  Coins, Shield, HelpCircle, Star, ExternalLink, MessageSquare, 
  UserPlus, UserMinus, FileText, Image, ChevronLeft, Globe, ArrowUpRight,
  Filter, CheckCircle, Smile, RefreshCw
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  deleteDoc, doc, serverTimestamp, updateDoc, setDoc, 
  getDoc, getDocs, where
} from 'firebase/firestore';
import { cn } from '../lib/utils';

interface GigSocialProps {
  onBack: () => void;
  user: any;
  onSignIn?: () => void;
}

// Data Type Definitions
export interface UserProfile {
  id: string; // matches userId
  username: string;
  fullName: string;
  avatarURL: string;
  bio: string;
  skills: string[];
  country: string;
  rating: number;
  createdAt: any;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  deliveryDays: number;
}

export interface FreelanceGig {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  priceFrom: number;
  portfolioId: string;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: any;
  type: 'text' | 'image' | 'video' | 'offer';
}

export interface ActiveChat {
  chatId: string;
  receiverId: string;
  receiverProfile?: UserProfile;
}

export interface OrderContract {
  id: string;
  buyerId: string;
  sellerId: string;
  gigId: string;
  status: 'pending' | 'in_progress' | 'dispatched' | 'completed' | 'cancelled';
  amount: number;
  createdAt: any;
  // helper details loaded reactively
  gigTitle?: string;
  buyerEmail?: string;
  sellerEmail?: string;
}

export interface FollowRecord {
  id: string; // followerId_follows_followingId
  followerId: string;
  followingId: string;
  createdAt: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const GigSocial: React.FC<GigSocialProps> = ({ onBack, user, onSignIn }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'market' | 'messages' | 'orders' | 'profile'>('feed');
  const [loading, setLoading] = useState(true);

  // Firestore DB state collections
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [gigs, setGigs] = useState<FreelanceGig[]>([]);
  const [orders, setOrders] = useState<OrderContract[]>([]);
  const [follows, setFollows] = useState<FollowRecord[]>([]);
  
  // Realtime Chat active variables
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Search & Filter state
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [feedSearch, setFeedSearch] = useState('');

  // Editing / Form states
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileCountry, setProfileCountry] = useState('United States');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Gig/Portfolio Creation states
  const [showGigForm, setShowGigForm] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDesc, setGigDesc] = useState('');
  const [gigCategory, setGigCategory] = useState('Thumbnail Design');
  const [gigTags, setGigTags] = useState('');
  const [gigPrice, setGigPrice] = useState('');
  const [gigPortfolioId, setGigPortfolioId] = useState('');
  const [submittingGig, setSubmittingGig] = useState(false);

  // Portfolio addition state
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portImage, setPortImage] = useState('');
  const [portCategory, setPortCategory] = useState('Thumbnail Design');
  const [portPrice, setPortPrice] = useState('');
  const [portDelivery, setPortDelivery] = useState('3');
  const [submittingPortfolio, setSubmittingPortfolio] = useState(false);

  // Stripe Sandbox Simulation state
  const [showStripeSim, setShowStripeSim] = useState<OrderContract | null>(null);
  const [stripeProcessing, setStripeProcessing] = useState(false);

  // Error logging helper conforming to Firebase skill specifications
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error Captured:', JSON.stringify(errInfo));
  };

  // 1. Live Subscriptions & Real-time Sync of all critical collections
  useEffect(() => {
    setLoading(true);

    // Users public profiles
    const qProfiles = collection(db, 'users');
    const unsubProfiles = onSnapshot(qProfiles, (snap) => {
      const list: UserProfile[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      setProfiles(list);

      if (user) {
        const found = list.find(p => p.id === user.uid);
        if (found) {
          setMyProfile(found);
          // Auto-fill states
          setProfileUsername(found.username || '');
          setProfileFullName(found.fullName || '');
          setProfileAvatar(found.avatarURL || '');
          setProfileBio(found.bio || '');
          setProfileSkills(found.skills?.join(', ') || '');
          setProfileCountry(found.country || 'United States');
        } else {
          setMyProfile(null);
          // Pre-fill email name
          setProfileUsername(user.email ? user.email.split('@')[0] : 'creator_alpha');
          setProfileFullName(user.displayName || 'Social Media Specialist');
        }
      } else {
        setMyProfile(null);
      }
    }, err => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    // Portfolios
    const qPortfolios = collection(db, 'portfolios');
    const unsubPortfolios = onSnapshot(qPortfolios, (snap) => {
      const list: PortfolioItem[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as PortfolioItem);
      });
      setPortfolios(list);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, 'portfolios');
    });

    // Gigs
    const qGigs = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'));
    const unsubGigs = onSnapshot(qGigs, (snap) => {
      const list: FreelanceGig[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FreelanceGig);
      });
      setGigs(list);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, 'gigs');
    });

    // Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const list: OrderContract[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderContract);
      });
      setOrders(list);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    // Follows
    const qFollows = collection(db, 'follows');
    const unsubFollows = onSnapshot(qFollows, (snap) => {
      const list: FollowRecord[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FollowRecord);
      });
      setFollows(list);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, 'follows');
    });

    setLoading(false);

    return () => {
      unsubProfiles();
      unsubPortfolios();
      unsubGigs();
      unsubOrders();
      unsubFollows();
    };
  }, [user]);

  // Real-time listener for current active chat
  useEffect(() => {
    if (!activeChat || !user) return;

    const chatPath = `messages/${activeChat.chatId}/messages`;
    const qMessages = query(collection(db, chatPath), orderBy('createdAt', 'asc'));

    const unsubMessages = onSnapshot(qMessages, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });
      setChatMessages(list);
      // Scroll to bottom
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }, err => {
      handleFirestoreError(err, OperationType.LIST, chatPath);
    });

    return () => unsubMessages();
  }, [activeChat, user]);

  // 2. SOCIAL ACTIONS
  // Toggle following status for other creators
  const handleToggleFollow = async (targetUserId: string) => {
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (user.uid === targetUserId) {
      alert("You cannot follow your own professional node.");
      return;
    }

    const followId = `${user.uid}_follows_${targetUserId}`;
    const followDocRef = doc(db, 'follows', followId);

    try {
      const existSnap = await getDoc(followDocRef);
      if (existSnap.exists()) {
        await deleteDoc(followDocRef);
      } else {
        await setDoc(followDocRef, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `follows/${followId}`);
    }
  };

  // 3. SECURE MESSAGE CHANNEL INITIALIZATION
  const handleInitiateChat = async (targetUserId: string) => {
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (user.uid === targetUserId) {
      alert("Cannot launch workspace conversation with yourself.");
      return;
    }

    // Direct deterministic Chat ID based on sorting both IDs
    const sortedIds = [user.uid, targetUserId].sort();
    const chatId = `${sortedIds[0]}_chat_${sortedIds[1]}`;
    
    // Find target user information
    const targetProf = profiles.find(p => p.id === targetUserId);

    setActiveChat({
      chatId,
      receiverId: targetUserId,
      receiverProfile: targetProf
    });
    setActiveTab('messages');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChat || !msgInput.trim()) return;

    const messagePayload = {
      senderId: user.uid,
      receiverId: activeChat.receiverId,
      content: msgInput.trim(),
      read: false,
      createdAt: serverTimestamp(),
      type: 'text'
    };

    const chatPath = `messages/${activeChat.chatId}/messages`;
    
    try {
      // Clear input instantly for snappy feel
      setMsgInput('');
      await addDoc(collection(db, chatPath), messagePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, chatPath);
    }
  };

  // 4. PORTFOLIO & GIG PUBLISHING
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!profileUsername.trim() || !profileFullName.trim()) {
      alert("Provide a valid username and legal full name.");
      return;
    }

    setSubmittingProfile(true);
    const profileDoc = doc(db, 'users', user.uid);

    try {
      const payload: Partial<UserProfile> = {
        username: profileUsername.trim().toLowerCase().replace(/\s+/g, '_'),
        fullName: profileFullName.trim(),
        avatarURL: profileAvatar.trim() || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profileUsername}`,
        bio: profileBio.trim(),
        skills: profileSkills.split(',').map(s => s.trim()).filter(Boolean),
        country: profileCountry,
        rating: myProfile?.rating || 5.0,
        createdAt: myProfile?.createdAt || serverTimestamp(),
      };

      await setDoc(profileDoc, payload, { merge: true });
      setShowProfileSetup(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePostPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!portTitle || !portDesc || !portPrice) {
      alert("Define portfolio item parameters completely.");
      return;
    }

    setSubmittingPortfolio(true);
    try {
      await addDoc(collection(db, 'portfolios'), {
        userId: user.uid,
        title: portTitle,
        description: portDesc,
        images: portImage ? [portImage] : [`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop`],
        category: portCategory,
        price: Number(portPrice),
        deliveryDays: Number(portDelivery)
      });

      // Reset
      setPortTitle('');
      setPortDesc('');
      setPortImage('');
      setPortPrice('');
      setPortDelivery('3');
      setShowPortfolioForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'portfolios');
    } finally {
      setSubmittingPortfolio(false);
    }
  };

  const handlePostGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!gigTitle || !gigDesc || !gigPrice) {
      alert("Please provide title, details and starting pricing.");
      return;
    }

    setSubmittingGig(true);
    try {
      await addDoc(collection(db, 'gigs'), {
        userId: user.uid,
        title: gigTitle,
        description: gigDesc,
        category: gigCategory,
        tags: gigTags.split(',').map(t => t.trim()).filter(Boolean),
        priceFrom: Number(gigPrice),
        portfolioId: gigPortfolioId || 'default',
        createdAt: serverTimestamp()
      });

      // Reset
      setGigTitle('');
      setGigDesc('');
      setGigTags('');
      setGigPrice('');
      setGigPortfolioId('');
      setShowGigForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'gigs');
    } finally {
      setSubmittingGig(false);
    }
  };

  // 5. ESCROW CLIENT SYSTEM
  const handleInitiateOrder = async (gig: FreelanceGig) => {
    if (!user) {
      if (onSignIn) onSignIn();
      return;
    }
    if (gig.userId === user.uid) {
      alert("You cannot purchase your own active listing.");
      return;
    }

    const confirmOrder = window.confirm(`Initiate absolute escrow contract order for "${gig.title}" at $${gig.priceFrom}?`);
    if (!confirmOrder) return;

    try {
      const orderPayload = {
        buyerId: user.uid,
        sellerId: gig.userId,
        gigId: gig.id,
        status: 'pending',
        amount: gig.priceFrom,
        createdAt: serverTimestamp()
      };

      const newOrderRef = await addDoc(collection(db, 'orders'), orderPayload);
      
      // Auto transition to Stripe Sandbox for simulated payment
      const checkoutRef: OrderContract = {
        id: newOrderRef.id,
        buyerId: user.uid,
        sellerId: gig.userId,
        gigId: gig.id,
        status: 'pending',
        amount: gig.priceFrom,
        createdAt: serverTimestamp(),
        gigTitle: gig.title
      };
      setShowStripeSim(checkoutRef);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  // Simulating the secure credit-card processing under 2026 Sandbox Connect framework
  const handleSimulateStripePayment = async () => {
    if (!showStripeSim) return;
    setStripeProcessing(true);

    try {
      const orderDoc = doc(db, 'orders', showStripeSim.id);
      // Update DB to secure in_progress / paid status
      await updateDoc(orderDoc, {
        status: 'in_progress'
      });

      alert("Escrow funds settled and initialized inside Stripe Connect sub-ledger! Job is now marked 'In Progress'.");
      setShowStripeSim(null);
      setActiveTab('orders');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${showStripeSim.id}`);
    } finally {
      setStripeProcessing(false);
    }
  };

  const handleUpdateOrderStatus = async (order: OrderContract, nextStatus: 'dispatched' | 'completed' | 'cancelled') => {
    const orderDoc = doc(db, 'orders', order.id);
    try {
      await updateDoc(orderDoc, {
        status: nextStatus
      });
      alert(`Order updated to status: ${nextStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    }
  };

  // Archive inactive items
  const handleDeleteGig = async (id: string) => {
    if (!window.confirm("Archive this public listing?")) return;
    try {
      await deleteDoc(doc(db, 'gigs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gigs/${id}`);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm("Archive this showcase work?")) return;
    try {
      await deleteDoc(doc(db, 'portfolios', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `portfolios/${id}`);
    }
  };

  // Utility calculations
  const myGigs = gigs.filter(g => g.userId === user?.uid);
  const myPortfolios = portfolios.filter(p => p.userId === user?.uid);
  const boughtContracts = orders.filter(o => o.buyerId === user?.uid);
  const soldContracts = orders.filter(o => o.sellerId === user?.uid);

  // Chat helper
  const uniqueMessageUsers = () => {
    if (!user) return [];
    // Accumulate other participants and active threads
    const map = new Map<string, string>(); // userId -> lastMessage
    return profiles.filter(p => p.id !== user.uid);
  };

  // Filters
  const filteredGigs = gigs.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(marketSearch.toLowerCase()) || 
                          g.description.toLowerCase().includes(marketSearch.toLowerCase()) ||
                          g.tags.some(t => t.toLowerCase().includes(marketSearch.toLowerCase()));
    const matchesCat = marketCategory === 'all' || g.category === marketCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
    'Thumbnail Design',
    'Video Editing',
    'Channel Setup',
    'Growth SEO',
    'Copywriting',
    'Cognitive Flows'
  ];

  return (
    <div className="w-full min-h-screen bg-[#070709] text-[#E4E6EB] font-sans pb-24 relative overflow-hidden selection:bg-[#6366F1]/40">
      
      {/* Immersive Dark Cyber Background Assets */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#2E1E5E]/15 via-[#070709]/0 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#22D3EE]/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-15%] w-[600px] h-[600px] bg-[#6366F1]/4 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Framework Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Modern 2026 Header Node */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white mb-2 text-xs font-mono transition-all duration-300"
            >
              <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              Chidon IQ Main Console
            </button>
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-gradient-to-tr from-[#6366F1] to-[#22D3EE] rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                <Briefcase size={22} className="text-[#070709]" />
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#6366F1] to-[#22D3EE] rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-sans flex items-center gap-2">
                  GigSocial <span className="text-[9px] bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white font-mono px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]">2026 MVP</span>
                </h1>
                <p className="text-[10px] text-[#A78BFA] font-mono tracking-wider uppercase font-semibold">
                  Hyper-Accelerated Social Media Marketing & Freelance Ledger
                </p>
              </div>
            </div>
          </div>

          {/* Secure 2026 Auth Status indicator */}
          <div className="flex items-center gap-3 bg-[#0D0D11]/90 border border-white/5 p-3 rounded-2xl glass-panel md:self-end">
            <div className={`h-2 w-2 rounded-full ${user ? 'bg-[#22D3EE] animate-pulse-glow' : 'bg-red-500'}`} />
            <div className="text-xs">
              {user ? (
                <div>
                  <span className="text-[9px] text-[#6366F1] font-mono block uppercase font-bold">Ledger Auth State</span>
                  <span className="font-semibold text-slate-200">{user.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">Guest Node (ReadOnly)</span>
                  <button 
                    onClick={onSignIn}
                    className="text-xs text-[#22D3EE] hover:text-[#6366F1] font-bold underline transition-colors"
                  >
                    Set Identity
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2026 Glassmorphism Action Setup Alert for Active Profiling */}
        {user && !myProfile && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 mb-8 rounded-2xl border border-[#6366F1]/30 bg-[#0F0F1A] bg-opacity-70 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative"
          >
            <div className="space-y-1">
              <span className="text-[9px] font-mono bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#A78BFA] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                Action Mandated
              </span>
              <h4 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#22D3EE]" /> Build your GigSocial Professional Persona
              </h4>
              <p className="text-xs text-slate-400">
                You are currently offline on the GigSocial directory. Setup user details to list skills, follow content, and unlock live orders.
              </p>
            </div>
            <button
              onClick={() => setShowProfileSetup(true)}
              className="py-2.5 px-5 bg-gradient-to-r from-[#6366F1] to-[#A78BFA] text-[#070709] hover:brightness-110 active:scale-95 transition-all text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_5px_15px_rgba(99,102,241,0.3)] cursor-pointer shrink-0"
            >
              Setup Persona Now
            </button>
          </motion.div>
        )}

        {/* Core Layout Tabs Container and View Switching */}
        <AnimatePresence mode="wait">
          
          {/* PROFILE CREATION DIALOG OVERLAY */}
          {showProfileSetup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#000]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-[#0F0F14] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-extrabold uppercase text-[#22D3EE] text-sm tracking-wider font-mono">
                    Professional Persona Interface
                  </h3>
                  <button 
                    onClick={() => setShowProfileSetup(false)}
                    className="text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-11">
                      <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Username</label>
                      <input 
                        type="text"
                        required
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100 font-mono"
                        placeholder="creator_handle"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Full/Legal Name</label>
                      <input 
                        type="text"
                        required
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Custom Avatar URL</label>
                    <input 
                      type="text"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100 font-mono"
                      placeholder="https://api.dicebear.com/7.x/pixel-art/svg?seed=creator"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Personal Bio (Showcase)</label>
                    <textarea 
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100 resize-none"
                      placeholder="Hi! I am a high CTR video marketer and thumbnail strategist..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-11">
                      <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Skills (comma-separated)</label>
                      <input 
                        type="text"
                        value={profileSkills}
                        onChange={(e) => setProfileSkills(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100"
                        placeholder="SEO, Photoshop, Copywriting"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-[#A78BFA] uppercase block font-bold">Country</label>
                      <input 
                        type="text"
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 outline-none focus:border-[#6366F1] text-slate-100"
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-[#070709] hover:brightness-110 font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {submittingProfile ? "Registering Blockchain Node..." : "Lock Persona to Firestore"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* CHECKOUT STRIPE CONNECT SIMULATION */}
          {showStripeSim && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#000]/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                scroll-behavior="smooth"
                className="w-full max-w-md bg-[#0D0D11] border border-[#22D3EE]/30 rounded-3xl p-6 relative"
              >
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#22D3EE]/10 rounded-2xl border border-[#22D3EE]/30 w-fit">
                    <Shield className="text-[#22D3EE] animate-pulse-glow" size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Stripe Connect Enabled
                    </span>
                    <h3 className="text-base font-black uppercase tracking-tight text-white font-sans">
                      Secure Escrow Settlement
                    </h3>
                    <p className="text-xs text-slate-400">
                      Chidon IQ is validating secure transaction endpoints via Firebase Stripe Extensions API.
                    </p>
                  </div>

                  <div className="p-4 bg-[#050507] border border-white/5 rounded-2xl space-y-2.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">CONTRACT ORDER:</span>
                      <span className="text-white truncate max-w-[150px]">{showStripeSim.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">LISTING:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{showStripeSim.gigTitle || "Freencer Gig Listing"}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5">
                      <span className="text-slate-500">TOTAL COST (USD):</span>
                      <span className="text-[#22D3EE] font-bold">${showStripeSim.amount}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateStripePayment}
                    disabled={stripeProcessing}
                    className="w-full py-3 bg-gradient-to-r from-[#22D3EE] to-[#6366F1] text-[#070709] font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-115 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {stripeProcessing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        PROCESSING LEDGER CRYPTO PAYMENT...
                      </>
                    ) : (
                      <>
                        CONFIRM CARD & ESCROW PAYMENT
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setShowStripeSim(null)}
                    className="w-full py-2 text-slate-500 hover:text-slate-300 font-mono text-[10px] uppercase font-bold text-center"
                  >
                    Cancel Action
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 1. SOCIAL NETWORK ACTIVITY FEED */}
          {activeTab === 'feed' && (
            <motion.div 
              key="social-feed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Glassmorphism Hero Showcase */}
              <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-[#0C0D15] via-[#0D0D12] to-[#12111F] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 bottom-0 w-80 h-80 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-mono bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#A78BFA] rounded-md font-bold uppercase tracking-wider animate-pulse">
                      🌱 CRATER DIRECTORY
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                      Trade high-CTR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#6366F1]">Social Media Gigs</span>
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      GigSocial is 100% focused on social network growth. Connect, follow, view credentials, and buy optimized services designed to scale your digital presence.
                    </p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto shrink-0">
                    <div className="flex-1 md:flex-initial p-4 border border-white/5 bg-white/3 rounded-2xl text-center backdrop-blur-sm">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Global Users</span>
                      <span className="text-lg font-black font-mono text-[#22D3EE]">{profiles.length}</span>
                    </div>
                    <div className="flex-1 md:flex-initial p-4 border border-white/5 bg-white/3 rounded-2xl text-center backdrop-blur-sm">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Total Gigs</span>
                      <span className="text-lg font-black font-mono text-[#6366F1]">{gigs.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Search and Community Showcase */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={13} className="text-[#22D3EE] animate-pulse" /> Community Creator Grid
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-3 text-slate-500 pointer-events-none" size={12} />
                    <input 
                      type="text"
                      placeholder="Search credentials..."
                      value={feedSearch}
                      onChange={(e) => setFeedSearch(e.target.value)}
                      className="w-full bg-[#0D0D11] border border-white/5 p-2 px-8.5 text-xs text-slate-300 font-mono outline-none rounded-xl focus:border-[#6366F1] transition-all"
                    />
                  </div>
                </div>

                {/* Grid listing all other creators */}
                {profiles.filter(p => !feedSearch || p.fullName.toLowerCase().includes(feedSearch.toLowerCase()) || p.username.toLowerCase().includes(feedSearch.toLowerCase()) || p.skills.some(sk => sk.toLowerCase().includes(feedSearch.toLowerCase()))).length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-white/5 bg-slate-950/20 text-slate-500 font-mono text-xs">
                    No active creative nodes matches search filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profiles.map((p) => {
                      const isMe = user && p.id === user.uid;
                      const isFollowing = follows.some(f => f.followerId === user?.uid && f.followingId === p.id);
                      const myFollowerCount = follows.filter(f => f.followingId === p.id).length;
                      
                      return (
                        <div 
                          key={p.id}
                          className="glass-panel p-5 border border-white/5 bg-[#0F0F14]/80 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:border-[#6366F1]/30 group"
                        >
                          <img 
                            src={p.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.username}`} 
                            alt={p.username} 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/10 shadow-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-black text-sm text-white group-hover:text-[#22D3EE] transition-colors truncate">
                                  {p.fullName}
                                </h5>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  @{p.username} • {p.country}
                                </p>
                              </div>
                              <span className="text-[10px] text-[#22D3EE] font-mono flex items-center gap-0.5 shrink-0 bg-[#22D3EE]/5 px-2 py-0.5 rounded border border-[#22D3EE]/20 font-bold">
                                <Star size={9} className="fill-current text-[#22D3EE]" /> {p.rating?.toFixed(1) || '5.0'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {p.bio || "Optimizing content operations inside the social media hub."}
                            </p>

                            {/* Skills Pills */}
                            <div className="flex flex-wrap gap-1">
                              {p.skills?.slice(0, 3).map((sk, idx) => (
                                <span key={idx} className="text-[8px] bg-[#6366F1]/10 text-[#A78BFA] border border-[#6366F1]/25 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                                  {sk}
                                </span>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
                              <span className="text-[9px] text-[#A78BFA] font-mono uppercase font-bold">
                                📶 {myFollowerCount} Subscribers
                              </span>
                              <div className="flex gap-2">
                                {!isMe && user && (
                                  <button
                                    onClick={() => handleToggleFollow(p.id)}
                                    className="py-1 px-2.5 bg-white/5 border border-white/10 hover:border-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg text-[9px] font-mono text-slate-300 hover:text-white uppercase font-bold transition-all relative flex items-center gap-1 cursor-pointer"
                                  >
                                    {isFollowing ? (
                                      <>
                                        <UserMinus size={10} />
                                        Unsub
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus size={10} className="text-[#22D3EE]" />
                                        Subscribe
                                      </>
                                    )}
                                  </button>
                                )}
                                {!isMe && (
                                  <button
                                    onClick={() => handleInitiateChat(p.id)}
                                    className="py-1 px-2.5 bg-[#6366F1] hover:brightness-110 rounded-lg text-[9px] font-mono text-[#070709] uppercase font-black transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <MessageSquare size={10} />
                                    Contact
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. FREELANCE MARKETPLACE / GIG SERVICE LISTINGS */}
          {activeTab === 'market' && (
            <motion.div 
              key="market-gigs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Category selector row */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 gap-4">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setMarketCategory('all')}
                    className={cn(
                      "py-1.5 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase border font-mono transition-all cursor-pointer",
                      marketCategory === 'all'
                        ? "bg-[#22D3EE] text-[#070709] border-[#22D3EE] shadow-[0_4px_15px_rgba(34,211,238,0.25)]"
                        : "text-slate-400 bg-[#0F0F14] border-white/5 hover:text-white"
                    )}
                  >
                    All categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMarketCategory(cat)}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase border font-mono transition-all cursor-pointer",
                        marketCategory === cat
                          ? "bg-[#6366F1] text-white border-[#6366F1] shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
                          : "text-slate-400 bg-[#0F0F14] border-white/5 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 text-slate-500 pointer-events-none" size={12} />
                  <input 
                    type="text"
                    placeholder="Search gigs..."
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="w-full bg-[#0D0D11] border border-white/5 p-2 px-8.5 text-xs text-slate-300 font-mono outline-none rounded-xl focus:border-[#6366F1]"
                  />
                </div>
              </div>

              {/* Gigs List Container */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-[#6366F1]" /> active gigs listings ({filteredGigs.length})
                  </h4>
                  {user && myProfile && (
                    <button
                      onClick={() => setShowGigForm(!showGigForm)}
                      className="py-1.5 px-3.5 bg-gradient-to-r from-[#6366F1] to-[#A78BFA] text-[#070709] font-black text-[9px] font-mono uppercase tracking-widest hover:brightness-110 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus size={10} /> List Freelance Gig
                    </button>
                  )}
                </div>

                {showGigForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 rounded-2xl border border-white/10 bg-[#0D0D11] space-y-4"
                  >
                    <h5 className="text-xs uppercase font-mono font-extrabold text-[#22D3EE]">Publish Freelance Listing</h5>
                    <form onSubmit={handlePostGig} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Gig Title</label>
                        <input 
                          type="text"
                          required
                          value={gigTitle}
                          onChange={(e) => setGigTitle(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100"
                          placeholder="Provide optimized description layout..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Category</label>
                        <select 
                          value={gigCategory}
                          onChange={(e) => setGigCategory(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-300"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Starting Price (Comp USD)</label>
                        <input 
                          type="number"
                          required
                          value={gigPrice}
                          onChange={(e) => setGigPrice(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 font-mono"
                          placeholder="e.g. 50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Tags / Keywords</label>
                        <input 
                          type="text"
                          value={gigTags}
                          onChange={(e) => setGigTags(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100"
                          placeholder="e.g. youtube, short, highctr"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Link Showcased Portfolio Item</label>
                        <select 
                          value={gigPortfolioId}
                          onChange={(e) => setGigPortfolioId(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-300"
                        >
                          <option value="">No custom showcase file linked</option>
                          {myPortfolios.map(port => (
                            <option key={port.id} value={port.id}>{port.title} (${port.price})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Listing Scope & Requirements</label>
                        <textarea 
                          rows={3}
                          required
                          value={gigDesc}
                          onChange={(e) => setGigDesc(e.target.value)}
                          className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 resize-none"
                          placeholder="Explain what parameters you deliver..."
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowGigForm(false)}
                          className="px-4 py-2 hover:bg-white/5 text-slate-400 rounded-xl uppercase font-bold text-[10px]"
                        >
                          Close Form
                        </button>
                        <button 
                          type="submit" 
                          disabled={submittingGig}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#22D3EE] to-[#6366F1] text-[#070709] font-black text-[10px] uppercase rounded-xl cursor-pointer disabled:opacity-50"
                        >
                          {submittingGig ? "Publishing Transaction..." : "Launch Live Listing"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {filteredGigs.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-white/5 bg-slate-900/10 flex flex-col items-center justify-center space-y-3">
                    <Search className="text-slate-600 animate-pulse" size={32} />
                    <p className="text-xs font-mono text-slate-500 uppercase font-bold">Market Directory Empty</p>
                    <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">
                      Be the first node to list a freelance Gig. Register under Persona setting, then click 'List Freelance Gig' to trigger the contract ledger.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGigs.map((g) => {
                      const ownerProfile = profiles.find(p => p.id === g.userId);
                      const linkedPort = portfolios.find(p => p.id === g.portfolioId);
                      const isMine = user && g.userId === user.uid;

                      return (
                        <div 
                          key={g.id}
                          className="p-5 rounded-2xl border border-white/5 bg-[#0F0F14]/70 hover:border-[#22D3EE]/30 transition-all flex flex-col justify-between gap-4 group relative"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest bg-[#6366F1]/15 text-[#A78BFA] border border-[#6366F1]/20">
                                {g.category}
                              </span>
                              <span className="text-sm font-black font-mono text-[#22D3EE]">${g.priceFrom} starting</span>
                            </div>

                            <div className="space-y-1">
                              <h5 className="font-extrabold text-sm text-white group-hover:text-[#22D3EE] transition-colors uppercase leading-tight">
                                {g.title}
                              </h5>
                              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                                {g.description}
                              </p>
                            </div>

                            {/* Tags display */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {g.tags.map((tg, idx) => (
                                <span key={idx} className="text-[8px] text-slate-500 font-mono">
                                  #{tg}
                                </span>
                              ))}
                            </div>

                            {/* Linked Portfolio showcase image shortcut if exists */}
                            {linkedPort && (
                              <div className="p-2 border border-white/5 bg-[#050507] rounded-xl flex items-center gap-3">
                                {linkedPort.images[0] && (
                                  <img 
                                    src={linkedPort.images[0]} 
                                    className="w-10 h-10 object-cover bg-slate-800 rounded-lg shrink-0 border border-white/10"
                                    alt={linkedPort.title}
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="text-[9px] text-slate-500 font-mono uppercase font-bold leading-none">Linked File Showcase</p>
                                  <p className="text-[10px] text-slate-200 truncate font-semibold pt-1">{linkedPort.title}</p>
                                </div>
                              </div>
                            )}

                            {/* Author credit snippet with follow check */}
                            {ownerProfile && (
                              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={ownerProfile.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${ownerProfile.username}`} 
                                    className="w-6 h-6 rounded-md object-cover bg-slate-800"
                                    alt={ownerProfile.username}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <h6 className="text-[10px] text-slate-300 font-bold leading-none">{ownerProfile.fullName}</h6>
                                    <span className="text-[9px] text-[#A78BFA] font-mono">@{ownerProfile.username}</span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-[#22D3EE] font-mono flex items-center gap-0.5 font-bold">
                                  ★ {ownerProfile.rating?.toFixed(1) || '5.0'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                            {isMine ? (
                              <button
                                onClick={() => handleDeleteGig(g.id)}
                                className="p-1 px-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-[9px] font-mono uppercase font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={10} />
                                Delete
                              </button>
                            ) : (
                              <div />
                            )}
                            <div className="flex gap-2">
                              {ownerProfile && !isMine && (
                                <button
                                  onClick={() => handleInitiateChat(ownerProfile.id)}
                                  className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-mono text-slate-300 hover:text-white uppercase font-bold transition-all cursor-pointer"
                                >
                                  Inquire
                                </button>
                              )}
                              {!isMine && (
                                <button
                                  onClick={() => handleInitiateOrder(g)}
                                  className="py-1 px-3 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#070709] font-black text-[9px] font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  Order GIG
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 3. MESSAGING / REALTIME WORKSPACE */}
          {activeTab === 'messages' && (
            <motion.div 
              key="chat-workspace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]"
            >
              {/* Left sidebar chats list */}
              <div className="lg:col-span-1 bg-[#0F0F14] border border-white/5 rounded-3xl p-4 flex flex-col justify-between overflow-y-auto max-h-full">
                <div className="space-y-4">
                  <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest border-b border-white/5 pb-3">
                    Active messaging nodes
                  </h4>
                  <div className="space-y-2">
                    {uniqueMessageUsers().map((p) => {
                      const isSelected = activeChat?.receiverId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleInitiateChat(p.id)}
                          className={cn(
                            "p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer",
                            isSelected 
                              ? "bg-[#6366F1]/10 border-[#6366F1]/50 text-white" 
                              : "bg-[#050507] border-white/5 text-slate-400 hover:text-white hover:border-[#22D3EE]/30"
                          )}
                        >
                          <img 
                            src={p.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.username}`} 
                            className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                            alt={p.username}
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[11px] font-extrabold truncate uppercase leading-none">{p.fullName}</h5>
                            <span className="text-[9px] font-mono text-slate-500 block pt-1">@{p.username}</span>
                          </div>
                        </div>
                      );
                    })}
                    {uniqueMessageUsers().length === 0 && (
                      <p className="text-[10px] text-slate-600 font-mono text-center py-8 leading-relaxed">
                        No secure channels launched. Click Contact under user profile in social feed!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right chatbot/communication console */}
              <div className="lg:col-span-2 bg-[#0F0F14] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between h-full relative">
                {activeChat ? (
                  <>
                    {/* Active target header profile specs */}
                    <div className="p-4 border-b border-white/5 bg-[#0A0A0F] flex items-center gap-3.5 justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={activeChat.receiverProfile?.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeChat.receiverId}`} 
                          className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-white/10"
                          alt={activeChat.receiverProfile?.username}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="font-extrabold text-[#22D3EE] text-xs uppercase leading-none">
                            {activeChat.receiverProfile?.fullName || "Specialist Node"}
                          </h5>
                          <span className="text-[9px] text-[#A78BFA] font-mono">
                            @{activeChat.receiverProfile?.username || "creator_handle"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                        Ledger Synced
                      </span>
                    </div>

                    {/* Chat log wrapper */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px] min-h-[300px]">
                      {chatMessages.map((m) => {
                        const isSenderMe = m.senderId === user?.uid;
                        return (
                          <div 
                            key={m.id}
                            className={cn(
                              "flex flex-col max-w-[70%] space-y-1",
                              isSenderMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                          >
                            <div 
                              className={cn(
                                "p-3 rounded-2xl text-xs leading-relaxed font-sans border-0",
                                isSenderMe 
                                  ? "bg-gradient-to-tr from-[#6366F1] to-[#6366F1]/85 text-white rounded-br-none" 
                                  : "bg-[#07070A] text-slate-100 rounded-bl-none border border-white/5"
                              )}
                            >
                              {m.content}
                            </div>
                            <span className="text-[8px] text-slate-600 font-mono font-semibold">
                              {m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                            </span>
                          </div>
                        );
                      })}
                      {chatMessages.length === 0 && (
                        <div className="text-center py-16">
                          <Smile className="mx-auto text-slate-700 animate-bounce mb-3" size={24} />
                          <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">Secure communications channel primed</p>
                          <p className="text-[9px] text-slate-600 mt-1">Send a message to initialize direct client dialog.</p>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Input send message toolbar */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-[#050507] flex gap-2">
                      <input 
                        type="text"
                        required
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                        placeholder="Establish message stream..."
                        className="flex-1 bg-[#0D0D11] border border-white/5 p-2.5 px-4 outline-none rounded-2xl text-xs text-slate-300 focus:border-[#6366F1]"
                      />
                      <button 
                        type="submit"
                        className="p-3.5 bg-[#6366F1] hover:brightness-110 active:scale-95 transition-all rounded-2xl text-[#070709] cursor-pointer shrink-0"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-24 m-auto">
                    <MessageSquare size={36} className="mx-auto text-slate-700 animate-pulse mb-3" />
                    <p className="text-xs text-slate-500 uppercase font-mono font-bold">No convo target chosen</p>
                    <p className="text-[10px] text-slate-600 max-w-xs leading-normal mx-auto mt-1">
                      Explore the creative network on 'Community Feed' and click 'Contact' under other specialists metrics to trigger direct workspace chats.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. ORDERS & ESCROW TRANSACTIONS LEDGER */}
          {activeTab === 'orders' && (
            <motion.div 
              key="orders-ledger"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="p-5 bg-gradient-to-r from-[#0F0F14] to-[#12121E] border border-white/5 rounded-3xl">
                <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest border-b border-white/5 pb-3">
                  Transaction Escrow Ledger
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  
                  {/* BUYING OPERATIONS (YOU ARE BUYER) */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-mono text-[#22D3EE] uppercase font-black flex items-center gap-1.5">
                      📥 Acquisitions & Hires ({boughtContracts.length})
                    </h5>

                    {boughtContracts.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono py-8 text-center bg-[#050507] rounded-2xl">
                        No active job acquisitions initialized by client.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {boughtContracts.map((ord) => {
                          const linkedGig = gigs.find(g => g.id === ord.gigId);
                          const sellerProf = profiles.find(p => p.id === ord.sellerId);

                          return (
                            <div 
                              key={ord.id}
                              className="p-4 border border-white/5 bg-[#050507] rounded-2xl space-y-3"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h6 className="text-[11px] font-semibold text-slate-200 uppercase truncate max-w-[150px]">
                                    {linkedGig?.title || "Freelance social media Gig"}
                                  </h6>
                                  {sellerProf && (
                                    <span className="text-[9px] text-[#A78BFA] font-mono">
                                      Contracted Specialist: @{sellerProf.username}
                                    </span>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border-0",
                                  ord.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                                  ord.status === 'in_progress' && "bg-[#22D3EE]/15 text-[#22D3EE]",
                                  ord.status === 'dispatched' && "bg-purple-500/15 text-purple-400",
                                  ord.status === 'completed' && "bg-emerald-500/15 text-emerald-400",
                                  ord.status === 'cancelled' && "bg-red-500/15 text-red-400",
                                )}>
                                  {ord.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-center bg-white/3 p-2 rounded-xl text-[10px] font-mono">
                                <span className="text-slate-500">ESCROW LOCK AMOUNT:</span>
                                <span className="text-[#22D3EE] font-bold">${ord.amount}</span>
                              </div>

                              {/* Actions depending on state */}
                              <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                                {ord.status === 'pending' && (
                                  <button
                                    onClick={() => setShowStripeSim(ord)}
                                    className="px-2.5 py-1.5 bg-[#22D3EE] text-[#070709] text-[9px] font-mono uppercase font-black tracking-widest rounded-lg cursor-pointer hover:brightness-110"
                                  >
                                    Pay Escrow (Stripe)
                                  </button>
                                )}
                                {ord.status === 'dispatched' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord, 'completed')}
                                    className="px-2.5 py-1.5 bg-emerald-500 text-slate-900 text-[9px] font-mono uppercase font-black tracking-widest rounded-lg cursor-pointer"
                                  >
                                    Confirm deliver & Accept
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SELLING OPERATIONS (YOU ARE THE CREATOR) */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-mono text-[#6366F1] uppercase font-black flex items-center gap-1.5">
                      📤 Dispatched Gigs & Earnings ({soldContracts.length})
                    </h5>

                    {soldContracts.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono py-8 text-center bg-[#050507] rounded-2xl">
                        No client orders directed at your profile node.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {soldContracts.map((ord) => {
                          const linkedGig = gigs.find(g => g.id === ord.gigId);
                          const buyerProf = profiles.find(p => p.id === ord.buyerId);

                          return (
                            <div 
                              key={ord.id}
                              className="p-4 border border-white/5 bg-[#050507] rounded-2xl space-y-3"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h6 className="text-[11px] font-semibold text-slate-200 uppercase truncate max-w-[150px]">
                                    {linkedGig?.title || "Freelance social media Gig"}
                                  </h6>
                                  {buyerProf && (
                                    <span className="text-[9px] text-[#A78BFA] font-mono">
                                      Contractor Employer: @{buyerProf.username}
                                    </span>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded",
                                  ord.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                                  ord.status === 'in_progress' && "bg-[#22D3EE]/15 text-[#22D3EE]",
                                  ord.status === 'dispatched' && "bg-purple-500/15 text-purple-400",
                                  ord.status === 'completed' && "bg-emerald-500/15 text-emerald-400",
                                  ord.status === 'cancelled' && "bg-red-500/15 text-red-400",
                                )}>
                                  {ord.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-center bg-white/3 p-2 rounded-xl text-[10px] font-mono">
                                <span className="text-slate-500">YOUR SETTLEMENT:</span>
                                <span className="text-emerald-400 font-bold">${ord.amount}</span>
                              </div>

                              {/* Actions depending on state */}
                              <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                                {ord.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord, 'dispatched')}
                                    className="px-2.5 py-1.5 bg-[#6366F1] text-white text-[9px] font-mono uppercase font-black tracking-widest rounded-lg cursor-pointer hover:brightness-110"
                                  >
                                    Dispatch Work files
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* 5. GIG CREATOR PORTFOLIO & BIOGRAPHY */}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile-showcase"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Persona Specifications Card */}
                <div className="lg:col-span-1 space-y-6">
                  {myProfile ? (
                    <div className="p-6 rounded-3xl border border-white/5 bg-[#0F0F14] relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h4 className="text-xs font-mono uppercase font-extrabold text-[#22D3EE] tracking-widest flex items-center gap-1.5">
                            <User size={14} /> Persona active node
                          </h4>
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Registered
                          </span>
                        </div>

                        <div className="space-y-2">
                          <img 
                            src={myProfile.avatarURL} 
                            className="w-16 h-16 rounded-2xl object-cover bg-slate-850 border border-white/10 shadow-md mb-2" 
                            alt={myProfile.username}
                            referrerPolicy="no-referrer"
                          />
                          <h4 className="font-extrabold text-sm text-white uppercase">{myProfile.fullName}</h4>
                          <span className="text-[10px] font-mono text-slate-500 block">@{myProfile.username}</span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed pt-2">
                          {myProfile.bio || "Provide bio specifications to customize your node presence."}
                        </p>

                        <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1">
                          {myProfile.skills?.map((sk, index) => (
                            <span key={index} className="text-[8px] bg-[#6366F1]/10 text-[#A78BFA] border border-[#6366F1]/20 px-2 py-0.5 rounded font-mono uppercase font-bold">
                              {sk}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 space-y-2">
                          <div className="flex justify-between">
                            <span>Origin Country:</span>
                            <span className="text-white">{myProfile.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating index:</span>
                            <span className="text-[#22D3EE] font-bold">★ {myProfile.rating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowProfileSetup(true)}
                        className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-mono font-extrabold text-slate-300 hover:text-white border border-white/5 hover:border-[#22D3EE]/30 rounded-xl transition-all cursor-pointer"
                      >
                        RECONFIGURE SETTINGS
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-3xl border border-[#6366F1]/30 bg-indigo-950/20 text-center space-y-4">
                      <AlertCircle className="mx-auto text-[#6366F1]" size={32} />
                      <div className="space-y-1">
                        <h4 className="text-xs uppercase font-mono font-black text-white">Guest Mode Detected</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Synchronize your personal profile metadata using the Professional registration interface.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowProfileSetup(true)}
                        className="w-full py-2.5 bg-[#6366F1] text-white font-mono text-xs font-black uppercase rounded-lg cursor-pointer"
                      >
                        SETUP DETAILS
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Side: Showcase Files Management */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <Image size={13} className="text-[#22D3EE]" /> Active Portfolio showcases ({myPortfolios.length})
                    </h4>
                    {myProfile && (
                      <button
                        onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                        className="py-1.5 px-3 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#070709] font-black text-[9px] font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={10} /> Add Showcase File
                      </button>
                    )}
                  </div>

                  {showPortfolioForm && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="p-5 border border-white/10 bg-[#0D0D11] rounded-2xl space-y-4"
                     >
                       <h5 className="text-xs uppercase font-mono font-extrabold text-[#22D3EE]">Publish Custom Showcase</h5>
                       <form onSubmit={handlePostPortfolio} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                         <div className="space-y-1">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Showcase Title</label>
                           <input 
                             type="text"
                             required
                             value={portTitle}
                             onChange={(e) => setPortTitle(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100"
                             placeholder="e.g. My Premium CTR Thumbnails"
                           />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Category</label>
                           <select 
                             value={portCategory}
                             onChange={(e) => setPortCategory(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-300"
                           >
                             {categories.map(cat => (
                               <option key={cat} value={cat}>{cat}</option>
                             ))}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Showcase Thumbnail URL</label>
                           <input 
                             type="text"
                             value={portImage}
                             onChange={(e) => setPortImage(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 font-mono"
                             placeholder="https://images.unsplash.com/photo-..."
                           />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Representative Fee (USD)</label>
                           <input 
                             type="number"
                             required
                             value={portPrice}
                             onChange={(e) => setPortPrice(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 font-mono"
                             placeholder="e.g. 150"
                           />
                         </div>
                         <div className="space-y-1 sm:col-span-2">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Expected speed of delivery (Days)</label>
                           <input 
                             type="number"
                             required
                             value={portDelivery}
                             onChange={(e) => setPortDelivery(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 font-mono"
                             placeholder="e.g. 3"
                           />
                         </div>
                         <div className="space-y-1 sm:col-span-2">
                           <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Describe showcase deliverable details</label>
                           <textarea 
                             rows={3}
                             value={portDesc}
                             onChange={(e) => setPortDesc(e.target.value)}
                             className="w-full bg-[#050507] border border-white/5 p-2.5 rounded-xl outline-none text-slate-100 resize-none"
                             placeholder="Provide context regarding creation tooling, design strategy or past execution..."
                           />
                         </div>
                         <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                           <button 
                             type="button" 
                             onClick={() => setShowPortfolioForm(false)}
                             className="px-4 py-2 hover:bg-white/5 text-slate-400 rounded-xl uppercase font-bold text-[10px]"
                           >
                             Close Form
                           </button>
                           <button 
                             type="submit" 
                             disabled={submittingPortfolio}
                             className="px-5 py-2.5 bg-gradient-to-r from-[#22D3EE] to-[#6366F1] text-[#070709] font-black text-[10px] uppercase rounded-xl cursor-pointer"
                           >
                             {submittingPortfolio ? "Archiving Showcase parameters..." : "Add Showcase Deliverable"}
                           </button>
                         </div>
                       </form>
                     </motion.div>
                  )}

                  {myPortfolios.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border border-white/5 bg-slate-900/10 flex flex-col items-center justify-center space-y-4">
                      <Image className="text-slate-600 animate-pulse" size={32} />
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-slate-500 uppercase font-bold">Showcase catalog is empty</p>
                        <p className="text-[10px] text-slate-600 max-w-xs leading-normal mx-auto">
                          Highlight credentials by uploading high- CTR images, layout references, channel setup assets, or cognitive flows parameters so clients can hire you.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myPortfolios.map(port => (
                        <div 
                          key={port.id}
                          className="p-4 border border-white/5 bg-[#0D0D11] rounded-2xl flex flex-col justify-between gap-3 relative group overflow-hidden"
                        >
                          {port.images[0] && (
                            <img 
                              src={port.images[0]} 
                              className="w-full h-32 object-cover rounded-xl bg-slate-800 border border-white/5" 
                              alt={port.title}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="space-y-1.5 flex-1 select-none pointer-events-none">
                            <h5 className="text-[11px] font-mono uppercase bg-[#6366F1]/10 text-[#A78BFA] border border-[#6366F1]/20 px-2 py-0.5 rounded w-fit">
                              {port.category}
                            </h5>
                            <h5 className="font-extrabold text-xs text-white uppercase">{port.title}</h5>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{port.description}</p>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                            <div>
                              <span className="text-slate-500 uppercase text-[9px] block">Settlement value</span>
                              <span className="text-[#22D3EE] font-bold">${port.price}</span>
                            </div>
                            <button
                              onClick={() => handleDeletePortfolio(port.id)}
                              className="p-1.5 border border-red-500/20 text-red-500 rounded hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gig Listings list under owner profile */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <h4 className="font-extrabold text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                      ★ Active listings on directory ({myGigs.length})
                    </h4>
                    {myGigs.length === 0 ? (
                      <p className="p-4 border border-white/5 bg-[#050507] rounded-xl text-[10px] text-slate-600 font-mono text-center">
                        You have not broadcasted any active gigs on the public marketplace directory.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {myGigs.map(g => (
                          <div 
                            key={g.id}
                            className="p-3.5 border border-white/5 bg-[#050507] rounded-xl flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <span className="text-[8px] font-mono uppercase text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-2 py-0.5 rounded">
                                {g.category}
                              </span>
                              <h5 className="font-bold text-xs text-white uppercase truncate pt-1">{g.title}</h5>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold font-mono text-[#22D3EE]">${g.priceFrom}</span>
                              <button
                                onClick={() => handleDeleteGig(g.id)}
                                className="p-1 border border-red-500/15 hover:bg-red-500/10 text-red-400 rounded cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* 2026 Mobile & Tablet Bottom Navigation with Micro Interactions */}
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto bg-[#07070A]/95 border border-white/10 p-2 rounded-2xl flex items-center justify-around shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-40 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer",
              activeTab === 'feed'
                ? "text-[#22D3EE] bg-[#22D3EE]/5 shadow-[0_0_10px_rgba(34,211,238,0.1)] scale-105"
                : "text-slate-500 hover:text-slate-350"
            )}
          >
            <Activity size={15} />
            <span>Feed</span>
          </button>
          
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer",
              activeTab === 'market'
                ? "text-[#6366F1] bg-[#6366F1]/5 scale-105"
                : "text-slate-500 hover:text-slate-350"
            )}
          >
            <ShoppingBag size={15} />
            <span>Market</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer",
              activeTab === 'messages'
                ? "text-[#22D3EE] bg-[#22D3EE]/5 scale-105"
                : "text-slate-500 hover:text-slate-350"
            )}
          >
            <MessageSquare size={15} />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer",
              activeTab === 'orders'
                ? "text-[#6366F1] bg-[#6366F1]/5 scale-105"
                : "text-slate-500 hover:text-slate-350"
            )}
          >
            <Coins size={15} />
            <span>Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer",
              activeTab === 'profile'
                ? "text-[#22D3EE] bg-[#22D3EE]/5 scale-105"
                : "text-slate-500 hover:text-slate-350"
            )}
          >
            <User size={15} />
            <span>Persona</span>
          </button>
        </div>

      </div>
    </div>
  );
};
