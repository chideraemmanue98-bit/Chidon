import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, DollarSign, ChevronRight, Coins, Shield, User, Star, 
  Cpu, LogOut, CheckCircle, Flame, MessageCircle, RefreshCw, Layers,
  Search, Filter, Plus, Menu, BookOpen, Settings, Check, HelpCircle, 
  ArrowRight, Heart, CreditCard, Send, PlusCircle, Trash2, Edit, 
  CheckCircle2, ShoppingBag, X, Info, Globe, Loader2, ArrowUpRight, Award, Key,
  MessageSquare
} from 'lucide-react';
import { auth } from '../firebase';
import { getSupabaseClient } from '../lib/supabase';
import { triggerNotification } from '../hooks/useNotifications';

import { useChat } from '../hooks/useChat';
import { MarketplacePage } from './marketplace/MarketplacePage';
import { PostDetail } from './marketplace/PostDetail';
import { MessagesPage } from './marketplace/MessagesPage';

import { Welcome } from './freelance/Welcome';
import { ChooseRole } from './freelance/ChooseRole';
import { JoinBuyer } from './freelance/JoinBuyer';
import { JoinSeller } from './freelance/JoinSeller';
import { SetupProfile } from './freelance/SetupProfile';
import { BuyerDashboard } from './freelance/BuyerDashboard';
import { SellerDashboard } from './freelance/SellerDashboard';
import { UserProfile, FreelanceGig, JobPost, Order, ChatMessage } from './freelance/types';

interface ChidonFreelanceEarnProps {
  onBack: () => void;
  user: any;
  onSignIn?: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
}

export const ChidonFreelanceEarn: React.FC<ChidonFreelanceEarnProps> = ({ 
  onBack, 
  user, 
  onSignIn, 
  isDarkMode = true, 
  setIsDarkMode 
}) => {
  // Navigation states: 'welcome' | 'role_selection' | 'join_buyer' | 'join_seller' | 'profile_setup' | 'portal'
  const [step, setStep] = useState<'welcome' | 'role_selection' | 'join_buyer' | 'join_seller' | 'profile_setup' | 'portal'>('welcome');
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const [portalTab, setPortalTab] = useState<'home' | 'dashboard' | 'profile' | 'menu' | 'welcome' | 'marketplace' | 'post' | 'messages'>('home');

  // Integrated Marketplace states
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const chatTools = useChat();

  const handleStartChat = async (
    otherUserId: string,
    otherUserName: string,
    otherUserPhoto: string,
    postId: string,
    postTitle: string,
    postPrice: string | number,
    initialText: string,
    imageFile: File | null
  ) => {
    try {
      const chatId = await chatTools.startChat(
        otherUserId,
        otherUserName,
        otherUserPhoto,
        postId,
        postTitle,
        postPrice
      );
      if (initialText.trim() || imageFile) {
        await chatTools.sendMessage(chatId, initialText, imageFile);
      }
      setActiveChatId(chatId);
      setPortalTab('messages');
      return chatId;
    } catch (err: any) {
      console.error('[ChidonFreelanceEarn] Error initiating chat:', err);
      alert(err.message || 'Could not connect with developer. Please check your credentials.');
      throw err;
    }
  };

  // Role switching survey states
  const [showSwitchSurvey, setShowSwitchSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyTargetRole, setSurveyTargetRole] = useState<'buyer' | 'seller'>('buyer');
  const [surveyAnswer1, setSurveyAnswer1] = useState('');
  const [surveyAnswer2, setSurveyAnswer2] = useState('');
  const [surveyAnswer3, setSurveyAnswer3] = useState('');

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExperience, setEditExperience] = useState(0);
  const [editSkills, setEditSkills] = useState('');
  const [refillingState, setRefillingState] = useState(false);

  // Home Page custom quick checkout states
  const [homeCheckoutGig, setHomeCheckoutGig] = useState<FreelanceGig | null>(null);
  const [payingHomePaystack, setPayingHomePaystack] = useState(false);
  const [homePaystackEmail, setHomePaystackEmail] = useState('');
  const [homePaystackPhone, setHomePaystackPhone] = useState('08123456789');
  const [homePaystackSuccess, setHomePaystackSuccess] = useState(false);

  // Marketplace states
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [homeSelectedCategory, setHomeSelectedCategory] = useState<'All' | 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter'>('All');

  // Realtime Database lists
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [gigs, setGigs] = useState<FreelanceGig[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Verification & Admin stats
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const fetchData = async (isSilent = false) => {
    if (!user || !supabase) return;
    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      // Fetch all tables in parallel to optimize load speed and prevent layout shifting
      const [
        profilesResult,
        gigsResult,
        jobsResult,
        ordersResult,
        messagesResult
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('gigs').select('*'),
        supabase.from('jobs').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('messages').select('*').order('created_at', { ascending: true })
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (gigsResult.error) throw gigsResult.error;
      if (jobsResult.error) throw jobsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (messagesResult.error) throw messagesResult.error;

      const profilesData = profilesResult.data;
      const gigsData = gigsResult.data;
      const jobsData = jobsResult.data;
      const ordersData = ordersResult.data;
      const msgsData = messagesResult.data;

      // 1. Format profiles
      const formattedProfiles: UserProfile[] = (profilesData || []).map(p => ({
        id: p.id,
        role: p.role || 'buyer',
        fullName: p.full_name || 'Anonymous User',
        bio: p.bio || '',
        avatarURL: p.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.id}`,
        skills: p.skills || [],
        experienceYears: p.experience_years,
        platforms: p.platforms || [],
        isVerified: p.is_verified || false,
        rating: Number(p.rating) || 5.0,
        credits: p.credits || 250,
        createdAt: p.created_at
      }));
      setProfiles(formattedProfiles);

      const found = formattedProfiles.find(p => p.id === user.uid);
      if (found) {
        setMyProfile(prev => {
          if (prev && 
              prev.id === found.id && 
              prev.role === found.role && 
              prev.fullName === found.fullName && 
              prev.bio === found.bio && 
              prev.credits === found.credits && 
              prev.isVerified === found.isVerified && 
              prev.rating === found.rating && 
              prev.experienceYears === found.experienceYears && 
              JSON.stringify(prev.skills) === JSON.stringify(found.skills)) {
            return prev;
          }
          return found;
        });
        setSelectedRole(prev => prev !== found.role ? found.role : prev);
        setStep(prev => prev !== 'portal' ? 'portal' : prev);
      } else {
        setStep(prev => (prev === 'portal' || prev === 'profile_setup' || prev === 'role_selection') ? prev : 'welcome');
      }

      // 2. Format gigs
      setGigs((gigsData || []).map(g => ({
        id: g.id,
        sellerId: g.seller_id,
        sellerName: g.seller_name || 'Anonymous',
        sellerAvatar: g.seller_avatar || 'https://api.dicebear.com/7.x/identicon/svg',
        title: g.title || '',
        description: g.description || '',
        price: g.price || 50,
        category: g.category || 'TikTok',
        deliveryTime: g.delivery_time || '3 days',
        mediaURL: g.media_url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
        tags: g.tags || [],
        rating: Number(g.rating) || 5.0,
        reviewsCount: g.reviews_count || 0,
        createdAt: g.created_at
      })));

      // 3. Format jobs
      setJobs((jobsData || []).map(j => ({
        id: j.id,
        buyerId: j.buyer_id,
        buyerName: j.buyer_name || 'Anonymous',
        title: j.title || '',
        description: j.description || '',
        budget: j.budget || 100,
        category: j.category || 'TikTok',
        deliveryTime: j.delivery_time || '3 days',
        proposalsCount: j.proposals_count || 0,
        createdAt: j.created_at
      })));

      // 4. Format orders
      setOrders((ordersData || []).map(o => ({
        id: o.id,
        buyerId: o.buyer_id,
        buyerName: o.buyer_name || '',
        sellerId: o.seller_id,
        sellerName: o.seller_name || '',
        gigId: o.gig_id,
        gigTitle: o.gig_title || '',
        gigCategory: o.gig_category || 'TikTok',
        price: o.price || 50,
        status: o.status || 'pending',
        deliveryDate: o.delivery_date || '3 days',
        deliverableText: o.deliverable_text,
        reviewId: o.review_id,
        createdAt: o.created_at
      })));

      // 5. Format chat messages
      setMessages((msgsData || []).map(m => ({
        id: m.id,
        orderId: m.order_id,
        senderId: m.sender_id,
        senderName: m.sender_name || '',
        text: m.text || '',
        createdAt: m.created_at
      })));

    } catch (err: any) {
      console.error("Supabase load error:", err);
      setError(err.message || "Failed to load freelance data");
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Use an optimized silent background sync every 30 seconds instead of loud 10 seconds to eliminate shaking
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (myProfile && !isEditingProfile) {
      setEditFullName(myProfile.fullName || '');
      setEditBio(myProfile.bio || '');
      setEditExperience(myProfile.experienceYears || 0);
      setEditSkills(myProfile.skills ? myProfile.skills.join(', ') : '');
      if (myProfile.fullName) {
        setHomePaystackEmail(`${myProfile.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`);
      }
    }
  }, [myProfile, isEditingProfile]);

  // COMPLETE PROFILE NODE METHOD
  const handleCompleteProfile = async (profileData: any, portfolioData?: any) => {
    if (!user || !supabase) return;
    try {
      const payload = {
        id: user.uid,
        role: profileData.role || 'buyer',
        full_name: profileData.fullName || user.email?.split('@')[0] || 'creator',
        bio: profileData.bio || '',
        avatar_url: profileData.avatarURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        skills: profileData.skills || [],
        experience_years: profileData.experienceYears || 0,
        platforms: profileData.platforms || [],
        is_verified: profileData.isVerified || false,
        rating: profileData.rating || 5.0,
        credits: profileData.credits || 250
      };

      const { error } = await supabase
        .from('profiles')
        .upsert([payload]);
      
      if (error) throw error;

      if (portfolioData && portfolioData.title) {
        const { error: portErr } = await supabase
          .from('gigs')
          .insert([{
            seller_id: user.uid,
            seller_name: payload.full_name,
            seller_avatar: payload.avatar_url,
            title: portfolioData.title,
            description: portfolioData.description || '',
            price: portfolioData.price || 50,
            category: portfolioData.category || 'Custom',
            delivery_time: portfolioData.deliveryTime || '3 days',
            media_url: portfolioData.mediaURL || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'
          }]);
        if (portErr) throw portErr;
      }
      
      const formattedLocalProfile: UserProfile = {
        id: payload.id,
        role: payload.role,
        fullName: payload.full_name,
        bio: payload.bio,
        avatarURL: payload.avatar_url,
        skills: payload.skills,
        experienceYears: payload.experience_years,
        platforms: payload.platforms,
        isVerified: payload.is_verified,
        rating: payload.rating,
        credits: payload.credits,
        createdAt: new Date().toISOString()
      };
      setMyProfile(formattedLocalProfile);
      setSelectedRole(payload.role);
      setStep('portal');

      await fetchData();
    } catch (err) {
      console.error("Error creating user node: ", err);
      throw err;
    }
  };

  const handleSkipOnboarding = async () => {
    if (!user || !supabase) return;
    try {
      const payload = {
        id: user.uid,
        full_name: user.email ? user.email.split('@')[0] : 'Chidon Creator',
        bio: 'Premium Social Media Professional',
        role: selectedRole,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        rating: 5.0,
        credits: 500
      };
      const { error } = await supabase
        .from('profiles')
        .upsert([payload]);
      if (error) throw error;
      
      const formattedLocalProfile: UserProfile = {
        id: payload.id,
        role: payload.role,
        fullName: payload.full_name,
        bio: payload.bio,
        avatarURL: payload.avatar_url,
        skills: [],
        experienceYears: 1,
        platforms: [],
        isVerified: false,
        rating: payload.rating,
        credits: payload.credits,
        createdAt: new Date().toISOString()
      };
      setMyProfile(formattedLocalProfile);
      setSelectedRole(payload.role);
      setStep('portal');

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // buyer triggers
  const handlePostJob = async (jobData: any) => {
    if (!user || !myProfile || !supabase) return;
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          buyer_id: user.uid,
          buyer_name: myProfile.fullName,
          title: jobData.title,
          description: jobData.description,
          budget: jobData.budget,
          category: jobData.category,
          delivery_time: jobData.deliveryTime,
          proposals_count: 0
        }]);
      if (error) throw error;
      
      // Real-time notification trigger
      triggerNotification(user.uid, {
        type: 'system',
        title: 'Chidon Freelance: Job Posted',
        body: `Your job listing "${jobData.title}" was published successfully with a budget of $${jobData.budget}.`,
        link: '/earn'
      }).catch(err => console.error("Notification dispatch failed", err));

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyGig = async (gig: FreelanceGig) => {
    if (!user || !myProfile || !supabase) return;
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.uid,
          buyer_name: myProfile.fullName,
          seller_id: gig.sellerId,
          seller_name: gig.sellerName,
          gig_id: gig.id,
          gig_title: gig.title,
          gig_category: gig.category,
          price: gig.price,
          status: 'in_escrow',
          delivery_date: gig.deliveryTime
        }]);
      if (error) throw error;

      // Real-time notification trigger
      triggerNotification(user.uid, {
        type: 'credit',
        title: 'Chidon Freelance: Gig Purchase & Escrow Initialized',
        body: `Successfully placed order for "${gig.title}" for $${gig.price}. Funds are secured in escrow.`,
        link: '/earn'
      }).catch(err => console.error("Notification dispatch failed", err));

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // seller triggers
  const handleCreateGig = async (gigData: any) => {
    if (!user || !myProfile || !supabase) return;
    try {
      const { error } = await supabase
        .from('gigs')
        .insert([{
          seller_id: user.uid,
          seller_name: myProfile.fullName,
          seller_avatar: myProfile.avatarURL,
          title: gigData.title,
          description: gigData.description,
          price: gigData.price,
          category: gigData.category,
          delivery_time: gigData.deliveryTime,
          media_url: gigData.mediaURL,
          tags: gigData.tags || [],
          rating: 5.0,
          reviews_count: 0
        }]);
      if (error) throw error;

      // Real-time notification trigger
      triggerNotification(user.uid, {
        type: 'system',
        title: 'Chidon Freelance: Gig Created',
        body: `Your growth service gig "${gigData.title}" is now live in the Marketplace at $${gigData.price}.`,
        link: '/earn'
      }).catch(err => console.error("Notification dispatch failed", err));

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', gigId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliverWork = async (orderId: string, deliverableText: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          deliverable_text: deliverableText
        })
        .eq('id', orderId);
      if (error) throw error;

      // Real-time notification trigger
      if (user) {
        triggerNotification(user.uid, {
          type: 'ai_result',
          title: 'Chidon Freelance: Assets Delivered',
          body: `You have successfully submitted deliverables for Order ID: ${orderId}.`,
          link: '/earn'
        }).catch(err => console.error("Notification dispatch failed", err));
      }

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteOrder = async (orderId: string, rating: number, reviewText: string) => {
    if (!supabase) return;
    try {
      const { error: ordErr } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
      if (ordErr) throw ordErr;

      const { error: revErr } = await supabase
        .from('reviews')
        .insert([{
          order_id: orderId,
          rating,
          text: reviewText,
          buyer_name: myProfile?.fullName || 'Client'
        }]);
      if (revErr) throw revErr;

      // Real-time notification trigger
      if (user) {
        triggerNotification(user.uid, {
          type: 'credit',
          title: 'Chidon Freelance: Order Completed',
          body: `Order ID: ${orderId} has been successfully completed and reviewed! Escrow funds cleared.`,
          link: '/earn'
        }).catch(err => console.error("Notification dispatch failed", err));
      }

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;

      // Real-time notification trigger
      if (user) {
        triggerNotification(user.uid, {
          type: 'system',
          title: 'Chidon Freelance: Order Cancelled',
          body: `Order ID: ${orderId} was cancelled. Any pending escrow holds have been released.`,
          link: '/earn'
        }).catch(err => console.error("Notification dispatch failed", err));
      }

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerHomeCheckout = async (gig: FreelanceGig) => {
    if (!user || !myProfile || !supabase) return;
    setPayingHomePaystack(true);
    try {
      // Simulate gateway transaction and security handshake
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.uid,
          buyer_name: myProfile.fullName,
          seller_id: gig.sellerId,
          seller_name: gig.sellerName,
          gig_id: gig.id,
          gig_title: gig.title,
          gig_category: gig.category,
          price: gig.price,
          status: 'in_escrow',
          delivery_date: gig.deliveryTime
        }]);
        
      if (error) throw error;
      
      // Real-time notification trigger
      triggerNotification(user.uid, {
        type: 'credit',
        title: 'Chidon Freelance: Quick Escrow Started',
        body: `Secure checkout for "${gig.title}" completed. $${gig.price} holds active in escrow.`,
        link: '/earn'
      }).catch(err => console.error("Notification dispatch failed", err));

      setHomePaystackSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setHomeCheckoutGig(null);
      setHomePaystackSuccess(false);
      setPortalTab('dashboard'); // Redirect to dashboard to track active operations
      await fetchData();
    } catch (err) {
      console.error("Payment processor failed:", err);
    } finally {
      setPayingHomePaystack(false);
    }
  };

  const handleSendMessage = async (orderId: string, text: string) => {
    if (!user || !myProfile || !supabase) return;
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          order_id: orderId,
          sender_id: user.uid,
          sender_name: myProfile.fullName,
          text
        }]);
      if (error) throw error;

      // Real-time notification trigger
      triggerNotification(user.uid, {
        type: 'message',
        title: 'Chidon Freelance: Message Dispatched',
        body: `You sent a message inside Order ${orderId}: "${text.slice(0, 45)}..."`,
        link: '/earn'
      }).catch(err => console.error("Notification dispatch failed", err));

      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRole = async () => {
    const nextRole = selectedRole === 'buyer' ? 'seller' : 'buyer';
    setSurveyTargetRole(nextRole);
    setSurveyAnswer1('');
    setSurveyAnswer2('');
    setSurveyAnswer3('');
    setSurveyStep(1);
    setShowSwitchSurvey(true);
  };

  const handleCompleteSurveyAndSwitch = async () => {
    if (!user || !myProfile || !supabase) return;
    try {
      // Append survey details to the professional biography statement
      const surveyInfo = ` [Focus: ${surveyAnswer1} | Allocation: ${surveyAnswer2} | Budget/Target: ${surveyAnswer3}]`;
      const updatedBio = (myProfile.bio || 'Premium Social Media Professional') + surveyInfo;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: surveyTargetRole,
          bio: updatedBio
        })
        .eq('id', user.uid);
      if (error) throw error;
      
      setSelectedRole(surveyTargetRole);
      setMyProfile(prev => prev ? { ...prev, role: surveyTargetRole, bio: updatedBio } : null);
      setShowSwitchSurvey(false);
      await fetchData();
    } catch (err) {
      console.error("Survey submission role toggle failed:", err);
    }
  };

  // Render subviews
  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* Onboarding Wizard Flows */}
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Welcome 
              onNext={() => setStep('role_selection')} 
              onSkip={handleSkipOnboarding} 
            />
          </motion.div>
        )}

        {step === 'role_selection' && (
          <motion.div
            key="role_selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChooseRole 
              onSelectRole={(role) => {
                setSelectedRole(role);
                setStep(role === 'buyer' ? 'join_buyer' : 'join_seller');
              }}
              onBack={() => setStep('welcome')}
            />
          </motion.div>
        )}

        {step === 'join_buyer' && (
          <motion.div
            key="join_buyer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <JoinBuyer 
              onProceed={() => setStep('profile_setup')}
              onSkip={handleSkipOnboarding}
              onBack={() => setStep('role_selection')}
            />
          </motion.div>
        )}

        {step === 'join_seller' && (
          <motion.div
            key="join_seller"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <JoinSeller 
              onProceed={() => setStep('profile_setup')}
              onSkip={handleSkipOnboarding}
              onBack={() => setStep('role_selection')}
            />
          </motion.div>
        )}

        {step === 'profile_setup' && (
          <motion.div
            key="profile_setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SetupProfile
              role={selectedRole}
              onCompleteProfile={handleCompleteProfile}
              onSkip={handleSkipOnboarding}
              onBack={() => setStep(selectedRole === 'buyer' ? 'join_buyer' : 'join_seller')}
            />
          </motion.div>
        )}

        {step === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6"
          >
            {/* Top Navigation & Brand Header */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Brand Identity */}
              <div className="flex items-center gap-3 text-left">
                <button 
                  onClick={onBack}
                  id="btn-portal-exit-to-app"
                  className="w-9 h-9 rounded-full border border-slate-800 hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Go back to main menu"
                >
                  <ChevronRight size={14} className="rotate-180" strokeWidth={3} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-display font-black tracking-tight text-white uppercase">Chidon Freelance</h2>
                    <span className={`text-[8px] font-mono uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                      selectedRole === 'buyer' 
                        ? "text-cyan-400 bg-cyan-500/10 border-cyan-400/20" 
                        : "text-purple-400 bg-purple-500/10 border-purple-500/20"
                    }`}>
                      {selectedRole === 'buyer' ? 'Buyer terminal' : 'Creator terminal'}
                    </span>
                    {myProfile?.isVerified && (
                      <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black tracking-widest">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Connected as {myProfile?.fullName || 'Chidon Expert'}</p>
                </div>
              </div>

              {/* Middle Desktop Tabs */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 p-1.5 rounded-2xl">
                {[
                  { id: 'home', label: 'Home Hub', icon: Globe },
                  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
                  { id: 'messages', label: 'Deal Chats', icon: MessageSquare },
                  { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'welcome', label: 'Walkthrough', icon: BookOpen },
                  { id: 'menu', label: 'Command Menu', icon: Menu }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = portalTab === tab.id || (tab.id === 'marketplace' && portalTab === 'post');
                  const totalUnread = tab.id === 'messages' && user 
                    ? chatTools.chats.reduce((acc, c) => acc + (c.unreadCounts?.[user?.uid] || 0), 0) 
                    : 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPortalTab(tab.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/10' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <IconComp size={12} />
                      <span>{tab.label}</span>
                      {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center">
                          {totalUnread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Profile Widget & Switcher */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                {/* Mobile Tab Indicator */}
                <div className="md:hidden">
                  <button
                    onClick={() => setPortalTab('menu')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5"
                  >
                    <Menu size={12} />
                    <span>Pages Menu</span>
                  </button>
                </div>

                {/* Credits Widget */}
                <button 
                  onClick={() => setPortalTab('profile')}
                  className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-3 py-2 rounded-2xl cursor-pointer transition-all"
                  title="Go to profile to add credits"
                >
                  <Coins size={14} className="text-cyan-400" />
                  <div className="text-left">
                    <span className="text-[8px] block font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Wallet balance</span>
                    <span className="text-xs font-bold text-cyan-400 leading-none">${myProfile?.credits || 0} credits</span>
                  </div>
                </button>

                {/* Active Perspective Toggle */}
                <div 
                  onClick={toggleRole}
                  id="btn-header-role-switcher"
                  className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-800 shadow-xl transition-all cursor-pointer group select-none"
                  title="Switch workspace view"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider leading-none">Mode</span>
                    <span className={`text-[10px] font-black uppercase tracking-wide leading-none ${
                      selectedRole === 'buyer' ? "text-cyan-400" : "text-purple-400"
                    }`}>
                      {selectedRole === 'buyer' ? "Buyer" : "Creator"}
                    </span>
                  </div>
                  
                  {/* Outer switch capsule */}
                  <div className="w-8 h-5 bg-slate-850 rounded-full p-0.5 relative transition-colors duration-200 group-hover:bg-slate-800 border border-slate-800">
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-lg transform transition-transform duration-200 flex items-center justify-center font-bold ${
                      selectedRole === 'buyer' ? "translate-x-0 text-cyan-500" : "translate-x-3 text-purple-600"
                    }`}>
                      {selectedRole === 'buyer' ? <Flame size={8} /> : <Layers size={8} />}
                    </div>
                  </div>
                </div>

                {/* Developer Board button */}
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-purple-400 cursor-pointer transition-all"
                  title="Toggle admin board"
                >
                  <Cpu size={14} className={showAdminPanel ? 'text-purple-400 animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Admin Panel Panel */}
            <AnimatePresence>
              {showAdminPanel && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 bg-slate-950/90 border border-purple-500/30 rounded-3xl text-left space-y-4 shadow-xl overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full tracking-widest uppercase flex items-center gap-2">
                      <Cpu size={12} /> Verification Board (Developer Admin Sandbox)
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Live Profiles: {profiles.length} detected</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profiles.map(profile => (
                      <div key={profile.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <img src={profile.avatarURL} alt="" className="w-6 h-6 rounded-full border border-slate-800" />
                            <span className="text-xs font-bold text-white">@{profile.fullName}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">Role: {profile.role} | Credits: ${profile.credits}</p>
                          <p className="text-[10px] text-slate-500 italic max-w-xs truncate">"{profile.bio || 'No bio written'}"</p>
                        </div>

                        <button
                          onClick={async () => {
                            if (!supabase) return;
                            await supabase
                              .from('profiles')
                              .update({ is_verified: !profile.isVerified })
                              .eq('id', profile.id);
                            await fetchData();
                          }}
                          className={`w-full py-1.5 rounded-lg font-mono text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            profile.isVerified
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {profile.isVerified ? 'Revoke seller badge' : 'Verify seller profile'}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN PORTAL PAGES SECTION */}
            <AnimatePresence mode="wait">
              
              {/* PAGE 1: HOME PAGE */}
              {portalTab === 'home' && (
                <motion.div
                  key="home_page"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  {/* Platform Overview Hero Banner */}
                  <div className="relative bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-3 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/25 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-indigo-400 tracking-wider uppercase">
                        <Globe size={10} /> Active Gigs Network Node
                      </div>
                      <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white uppercase">
                        Discover & Hire Exceptional Talent
                      </h1>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Secure social growth packages with automated escrow smart payments. Creators deliver assets directly to our network for local verification before clearing funds.
                      </p>
                    </div>

                    {/* Platform Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 font-black uppercase block tracking-wider">Verified Experts</span>
                        <span className="text-xl font-bold font-mono text-white mt-1 block">{profiles.filter(p => p.isVerified).length} Nodes</span>
                      </div>
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 font-black uppercase block tracking-wider">Gig Packages</span>
                        <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{gigs.length} Active</span>
                      </div>
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 font-black uppercase block tracking-wider">Job Postings</span>
                        <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">{jobs.length} Listed</span>
                      </div>
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                        <span className="text-[9px] font-mono text-slate-500 font-black uppercase block tracking-wider">Protected Volume</span>
                        <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                          ${orders.filter(o => o.status === 'in_escrow').reduce((sum, o) => sum + o.price, 0)} Escrow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search, Filter & Hub Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left 2 Columns: Gig Marketplace */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Search Bar & Categories */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                              type="text"
                              value={homeSearchQuery}
                              onChange={(e) => setHomeSearchQuery(e.target.value)}
                              placeholder="Search growth services, platforms, skills, tags..."
                              className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-xs px-10 py-2.5 rounded-xl text-white outline-none font-mono transition-all"
                            />
                          </div>
                          
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-[10px] font-mono text-slate-500 uppercase font-black whitespace-nowrap">Filter:</span>
                            <div className="flex flex-wrap gap-1">
                              {(['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter'] as const).map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setHomeSelectedCategory(cat)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                    homeSelectedCategory === cat 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gigs List */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag size={14} className="text-indigo-400" /> Active Service Gigs ({gigs.filter(g => (homeSelectedCategory === 'All' || g.category === homeSelectedCategory) && (g.title.toLowerCase().includes(homeSearchQuery.toLowerCase()) || g.description.toLowerCase().includes(homeSearchQuery.toLowerCase()))).length})
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500">Click gig to view package checkout</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {gigs
                            .filter(gig => {
                              const matchesCat = homeSelectedCategory === 'All' || gig.category === homeSelectedCategory;
                              const matchesSearch = gig.title.toLowerCase().includes(homeSearchQuery.toLowerCase()) || 
                                                    gig.description.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
                                                    gig.tags.some(t => t.toLowerCase().includes(homeSearchQuery.toLowerCase()));
                              return matchesCat && matchesSearch;
                            })
                            .map(gig => {
                              const isOwner = gig.sellerId === user?.uid;
                              return (
                                <motion.div
                                  key={gig.id}
                                  whileHover={{ y: -3 }}
                                  className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
                                >
                                  <div>
                                    {/* Gig Cover Image placeholder */}
                                    <div className="h-32 w-full bg-slate-900 relative">
                                      <img 
                                        src={gig.mediaURL || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'} 
                                        alt="" 
                                        className="w-full h-full object-cover opacity-60"
                                      />
                                      <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-slate-950/90 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full uppercase">
                                        {gig.category}
                                      </span>
                                    </div>

                                    {/* Creator & Details */}
                                    <div className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <img src={gig.sellerAvatar} alt="" className="w-5 h-5 rounded-full border border-slate-800 bg-slate-950" />
                                          <span className="text-[10px] font-mono font-bold text-slate-400">@{gig.sellerName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Star size={10} className="text-amber-400 fill-amber-400" />
                                          <span className="text-[10px] font-mono font-black text-slate-300">5.0</span>
                                        </div>
                                      </div>

                                      <h4 className="text-xs font-bold text-white leading-snug">{gig.title}</h4>
                                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{gig.description}</p>
                                      
                                      {/* Tags */}
                                      <div className="flex flex-wrap gap-1">
                                        {gig.tags.slice(0, 3).map((tag, i) => (
                                          <span key={i} className="text-[8px] font-mono bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850/80">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom CTA / Price */}
                                  <div className="p-4 border-t border-slate-900/60 flex items-center justify-between gap-2">
                                    <div className="text-left">
                                      <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none">Starting at</span>
                                      <span className="text-sm font-bold text-emerald-400 font-mono">${gig.price}</span>
                                    </div>

                                    {isOwner ? (
                                      <button 
                                        onClick={() => setPortalTab('profile')}
                                        className="px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                                      >
                                        Manage Gig
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setHomeCheckoutGig(gig)}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[10px] font-mono font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-indigo-600/10"
                                      >
                                        <span>Order & Lock Escrow</span>
                                        <ArrowUpRight size={10} />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}

                          {gigs.length === 0 && (
                            <div className="col-span-2 p-8 text-center bg-slate-950/40 border border-slate-850 border-dashed rounded-2xl text-slate-500 font-mono text-xs">
                              No active gigs discovered. Start by creating a gig.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right 1 Column: General Public Job Board */}
                    <div className="space-y-6">
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                          <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase size={12} className="text-purple-400" /> Active Job Board
                          </h3>
                          <button
                            onClick={() => {
                              setSelectedRole('buyer');
                              setPortalTab('dashboard');
                            }}
                            className="text-[9px] font-mono text-indigo-400 hover:underline cursor-pointer font-bold uppercase"
                          >
                            + Post Job
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Clients actively listing briefs. Switch to Creator Terminal to send proposals.
                        </p>

                        <div className="space-y-3">
                          {jobs.map(job => (
                            <div key={job.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase">
                                  {job.category}
                                </span>
                                <span className="text-[10px] font-mono font-black text-emerald-400">${job.budget} budget</span>
                              </div>

                              <h4 className="text-xs font-bold text-white">{job.title}</h4>
                              <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                              
                              <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-850/60 pt-2">
                                <span>Client: @{job.buyerName}</span>
                                <span>Timeframe: {job.deliveryTime}</span>
                              </div>
                            </div>
                          ))}

                          {jobs.length === 0 && (
                            <div className="p-6 text-center text-slate-500 font-mono text-[10px] border-2 border-dashed border-slate-850 rounded-xl">
                              No active job briefs posted.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Paystack checkout overlay directly on Home */}
                      <AnimatePresence>
                        {homeCheckoutGig && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-5"
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                                <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <CreditCard size={14} /> Paystack Secure Escrow Gate
                                </span>
                                <button 
                                  onClick={() => setHomeCheckoutGig(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
                                <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">You are ordering package:</span>
                                <h4 className="text-xs font-black text-white">{homeCheckoutGig.title}</h4>
                                <div className="flex justify-between items-center text-xs font-mono pt-1">
                                  <span className="text-slate-400">Total Escrow Amount:</span>
                                  <span className="text-emerald-400 font-bold">${homeCheckoutGig.price} USD</span>
                                </div>
                              </div>

                              <form onSubmit={(e) => { e.preventDefault(); triggerHomeCheckout(homeCheckoutGig); }} className="space-y-3">
                                <div>
                                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Billing Email Address</label>
                                  <input
                                    type="email"
                                    required
                                    value={homePaystackEmail}
                                    onChange={(e) => setHomePaystackEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono"
                                    placeholder="your-node@chidon.iq"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Contact Phone Number</label>
                                  <input
                                    type="text"
                                    required
                                    value={homePaystackPhone}
                                    onChange={(e) => setHomePaystackPhone(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono"
                                  />
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[9px] text-indigo-400 font-mono">
                                  <Shield size={14} className="shrink-0" />
                                  <span>Funds stay locked in decentralized escrow contracts until you verify creator asset links.</span>
                                </div>

                                <div className="pt-2">
                                  {homePaystackSuccess ? (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-mono font-bold text-center">
                                      ✓ Secure Paystack callback authorized! Redirecting...
                                    </div>
                                  ) : (
                                    <button
                                      type="submit"
                                      disabled={payingHomePaystack}
                                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      {payingHomePaystack ? (
                                        <>
                                          <Loader2 size={12} className="animate-spin" />
                                          <span>Securing Paystack Gateway...</span>
                                        </>
                                      ) : (
                                        <span>Authorize & Lock Escrow</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </form>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* PAGE 2: DASHBOARD PAGE */}
              {portalTab === 'dashboard' && (
                <motion.div
                  key="dashboard_page"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  {/* Perspective Toggle Bar */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Active Operations Dashboard</h3>
                      <p className="text-[10px] text-slate-500">Currently viewing terminal as: <strong className="text-slate-300 uppercase font-mono">{selectedRole === 'buyer' ? 'Buyer Client' : 'Social Creator'}</strong></p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={async () => {
                          if (!user || !supabase) return;
                          await supabase.from('profiles').update({ role: 'buyer' }).eq('id', user.uid);
                          setSelectedRole('buyer');
                          await fetchData();
                        }}
                        className={`px-4 py-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          selectedRole === 'buyer' 
                            ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Buyer Hub
                      </button>
                      <button
                        onClick={async () => {
                          if (!user || !supabase) return;
                          await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.uid);
                          setSelectedRole('seller');
                          await fetchData();
                        }}
                        className={`px-4 py-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          selectedRole === 'seller' 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Creator Terminal
                      </button>
                    </div>
                  </div>

                  {/* Render the core dashboards */}
                  {selectedRole === 'buyer' ? (
                    <BuyerDashboard
                      myProfile={myProfile}
                      allGigs={gigs}
                      myPostedJobs={jobs.filter(j => j.buyerId === user?.uid)}
                      myOrders={orders.filter(o => o.buyerId === user?.uid)}
                      onPostJob={handlePostJob}
                      onBuyGig={handleBuyGig}
                      onSendMessage={handleSendMessage}
                      onCompleteOrder={handleCompleteOrder}
                      onCancelOrder={handleCancelOrder}
                      chatMessages={messages}
                      allProfiles={profiles}
                    />
                  ) : (
                    <SellerDashboard
                      myProfile={myProfile}
                      allGigs={gigs}
                      myOrders={orders.filter(o => o.sellerId === user?.uid)}
                      onCreateGig={handleCreateGig}
                      onDeleteGig={handleDeleteGig}
                      onDeliverWork={handleDeliverWork}
                      onSendMessage={handleSendMessage}
                      chatMessages={messages}
                    />
                  )}
                </motion.div>
              )}

              {/* PAGE 3: PROFILE PAGE */}
              {portalTab === 'profile' && (
                <motion.div
                  key="profile_page"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Column 1: Identity Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      {/* Badge / Avatar */}
                      <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-850">
                        <div className="relative">
                          <img 
                            src={myProfile?.avatarURL || 'https://api.dicebear.com/7.x/identicon/svg'} 
                            alt="" 
                            className="w-20 h-20 rounded-full border-2 border-indigo-500/40 bg-slate-900"
                          />
                          {myProfile?.isVerified && (
                            <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 border border-slate-950 rounded-full text-white" title="Verified Sovereign node">
                              <Award size={12} />
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                            @{myProfile?.fullName}
                          </h3>
                          <span className="text-[9px] font-mono font-bold bg-slate-900 text-slate-500 px-2.5 py-1 rounded-full border border-slate-850 uppercase tracking-widest mt-1 inline-block">
                            Node: {myProfile?.role === 'buyer' ? 'BUYER CLIENT' : 'CREATOR PLATFORM'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 italic max-w-xs px-2 leading-relaxed">
                          "{myProfile?.bio || 'No status message set. Click Edit Profile below to customize your sovereign node status.'}"
                        </p>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-3 text-xs font-mono text-slate-400 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Node Trust rating:</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Star size={11} className="fill-amber-400" />
                            {myProfile?.rating || '5.0'} / 5.0
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Platform experience:</span>
                          <span className="text-slate-300 font-bold">{myProfile?.experienceYears || 0} years</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Skills declared:</span>
                          <span className="text-slate-300 text-right">{myProfile?.skills && myProfile.skills.length > 0 ? myProfile.skills.slice(0,3).join(', ') : 'None listed'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Connected node:</span>
                          <span className="text-indigo-400">@{myProfile?.id?.slice(0, 8)}...</span>
                        </div>
                      </div>

                      {/* Wallet credits instant Top-up node */}
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Coins size={14} className="text-cyan-400" />
                            <span className="text-xs font-bold text-white font-mono">My Wallet Balance</span>
                          </div>
                          <span className="text-sm font-bold text-cyan-400 font-mono">${myProfile?.credits || 0}</span>
                        </div>
                        
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Need more test credits to lock escrow or order gigs? Simulate a mock fund reload instantly.
                        </p>

                        <button
                          onClick={async () => {
                            if (!user || !supabase || !myProfile || refillingState) return;
                            setRefillingState(true);
                            try {
                              const nextCreds = (myProfile.credits || 0) + 500;
                              const { error: updErr } = await supabase
                                .from('profiles')
                                .update({ credits: nextCreds })
                                .eq('id', user.uid);
                              if (updErr) throw updErr;
                              await fetchData();
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setRefillingState(false);
                            }
                          }}
                          disabled={refillingState}
                          className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-400 font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {refillingState ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                          <span>Simulate refill (+$500)</span>
                        </button>
                      </div>
                    </div>

                    {/* Column 2 & 3: Profile Editor / Node Gigs Portfolio */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Editor section */}
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                          <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Settings size={14} className="text-indigo-400" /> Sovereign Node Configuration
                          </h3>
                          <button
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer"
                          >
                            {isEditingProfile ? 'Cancel' : 'Edit profile info'}
                          </button>
                        </div>

                        {isEditingProfile ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Display Name / Alias</label>
                                <input
                                  type="text"
                                  value={editFullName}
                                  onChange={(e) => setEditFullName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Industry Experience (Years)</label>
                                <input
                                  type="number"
                                  value={editExperience}
                                  onChange={(e) => setEditExperience(Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Personal Biography Statement</label>
                              <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono h-20 resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Skill sets (Comma separated list)</label>
                              <input
                                type="text"
                                value={editSkills}
                                onChange={(e) => setEditSkills(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none font-mono"
                                placeholder="Growth, TikTok SEO, Instagram Reels, Copywriting..."
                              />
                            </div>

                            <button
                              onClick={async () => {
                                if (!user || !supabase) return;
                                try {
                                  const { error: updErr } = await supabase
                                    .from('profiles')
                                    .update({
                                      full_name: editFullName,
                                      bio: editBio,
                                      experience_years: Number(editExperience),
                                      skills: editSkills.split(',').map(s => s.trim()).filter(Boolean)
                                    })
                                    .eq('id', user.uid);
                                  if (updErr) throw updErr;
                                  await fetchData();
                                  setIsEditingProfile(false);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-mono font-black uppercase text-white cursor-pointer"
                            >
                              Save Node Settings
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-850 space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase font-black">Active Bio Statement</span>
                              <p className="text-slate-300 leading-relaxed italic">"{myProfile?.bio || 'None listed yet'}"</p>
                            </div>
                            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-850 space-y-2">
                              <span className="text-[9px] text-slate-500 uppercase font-black block">Interactive tags</span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {myProfile?.skills && myProfile.skills.length > 0 ? (
                                  myProfile.skills.map((skill, idx) => (
                                    <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-1 rounded-lg border border-slate-800 text-[10px]">
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 italic">No custom tags registered.</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sovereign listed portfolio items */}
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                          <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen size={14} className="text-purple-400" /> My Node Active Listings
                          </h3>
                          <button
                            onClick={() => setPortalTab('dashboard')}
                            className="text-[10px] font-mono text-purple-400 hover:underline font-bold uppercase cursor-pointer"
                          >
                            + Add Item
                          </button>
                        </div>

                        {myProfile?.role === 'seller' ? (
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Creator Gigs listed:</span>
                            {gigs.filter(g => g.sellerId === user?.uid).map(gig => (
                              <div key={gig.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase">{gig.category}</span>
                                  <h4 className="text-xs font-bold text-white mt-1">{gig.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-mono">${gig.price} — Delivery: {gig.deliveryTime}</p>
                                </div>

                                <button
                                  onClick={() => handleDeleteGig(gig.id)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 cursor-pointer"
                                  title="Delete gig listing"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}

                            {gigs.filter(g => g.sellerId === user?.uid).length === 0 && (
                              <p className="text-[10px] font-mono text-slate-500 italic py-4 text-center">You have no creator gigs listed. Go to Dashboard page under Creator Terminal to list your first growth package.</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">My Active Job Board briefs:</span>
                            {jobs.filter(j => j.buyerId === user?.uid).map(job => (
                              <div key={job.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase">{job.category}</span>
                                  <h4 className="text-xs font-bold text-white mt-1">{job.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-mono">Budget: ${job.budget} — Delivery requested: {job.deliveryTime}</p>
                                </div>
                              </div>
                            ))}

                            {jobs.filter(j => j.buyerId === user?.uid).length === 0 && (
                              <p className="text-[10px] font-mono text-slate-500 italic py-4 text-center">You have no public job briefs active. Post a job in the Dashboard view to hire local talent.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* PAGE 4: WELCOME PLATFORM GUIDE */}
              {portalTab === 'welcome' && (
                <motion.div
                  key="welcome_info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="text-center space-y-3 max-w-xl mx-auto">
                      <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-full text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                        🛡️ PLATFORM PROTOCOL WALKTHROUGH
                      </div>
                      <h2 className="text-2xl font-display font-black tracking-tight text-white uppercase">Sovereign Social Gig Exchange</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chidon Freelance uses smart local data models to implement robust, peer-to-peer social service tracking completely free from heavy broker cuts. Here is how our workflow runs securely:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">1. Node Escrow Lock</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Buyers select custom growth packages or post job briefs. When hiring is initiated, funds are immediately frozen in paystack simulated smart escrow wallets.
                        </p>
                      </div>
                      <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
                        <span className="text-xs font-mono font-bold text-purple-400">2. Asset Verification</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Creators deliver files, content posts, or analytics links directly into the order delivery gate. Chats operate instantly for direct milestones auditing.
                        </p>
                      </div>
                      <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">3. Escrow Clearing</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Upon verifying the deliveries, the client clicks "Approve & Complete" which releases the frozen escrow capital instantly into the creator's ledger node.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-3">
                      <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-400" /> Platform Operations Guidelines
                      </h3>
                      <ul className="text-[11px] text-slate-400 space-y-2 font-mono list-disc list-inside leading-relaxed pl-1">
                        <li>Maintain verified proof-of-work within active platform portfolio nodes.</li>
                        <li>Deliver tasks strictly within specified delivery times (e.g. 3 days, 7 days).</li>
                        <li>Communicate using the live encrypted messages terminal for all escrow auditing.</li>
                        <li>Fund wallet nodes with free credit tokens whenever you need to lock budgets.</li>
                      </ul>
                    </div>

                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setPortalTab('home')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-indigo-500/20 cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>Enter Marketplace</span>
                        <ArrowRight size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PAGE 5: MENU PAGE (COMMAND HUB DIRECTORY) */}
              {portalTab === 'menu' && (
                <motion.div
                  key="menu_page"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="text-center space-y-1.5 py-4">
                    <span className="text-[9px] font-mono font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                      🌐 CHIDON FREELANCE COMMAND BOARD
                    </span>
                    <h2 className="text-2xl font-display font-black tracking-tight text-white uppercase">Platform Navigation Directory</h2>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Navigate between sovereign nodes, active escrow tracking gates, profile setups, and admin sandbox configurations instantly.
                    </p>
                  </div>

                  {/* Bento Grid Command Menu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    
                    {/* Card 1: Home */}
                    <div 
                      onClick={() => setPortalTab('home')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Globe size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">1. Marketplace Hub</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Browse all vetted social media gigs, search for skills, and view active client requests on the job board.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Dashboard */}
                    <div 
                      onClick={() => setPortalTab('dashboard')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Briefcase size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">2. Escrow Dashboard</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Monitor ongoing orders, chat with sellers or buyers, submit tasks, and release frozen funds.
                        </p>
                      </div>
                    </div>

                    {/* Integrated Marketplace */}
                    <div 
                      onClick={() => setPortalTab('marketplace')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <ShoppingBag size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Freelance Marketplace</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Browse freelance projects, post custom ad listings, search for gigs, and initiate milestones negotiations.
                        </p>
                      </div>
                    </div>

                    {/* Integrated Deal Chats */}
                    <div 
                      onClick={() => setPortalTab('messages')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <MessageSquare size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Sovereign Deal Chats</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Real-time peer-to-peer chats integrated directly with active post listings for frictionless payments.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Profile */}
                    <div 
                      onClick={() => setPortalTab('profile')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <User size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">3. Sovereign Profile</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Edit biography info, declare verified skills, manage portfolio listings, and refill simulated wallet balances.
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Walkthrough */}
                    <div 
                      onClick={() => setPortalTab('welcome')}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <BookOpen size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">4. Walkthrough Guide</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Review guidelines on secure platform operations, escrow milestones, and sovereign proof-of-skills rules.
                        </p>
                      </div>
                    </div>

                    {/* Card 5: Switcher */}
                    <div 
                      onClick={toggleRole}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedRole === 'buyer' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {selectedRole === 'buyer' ? <Flame size={18} /> : <Layers size={18} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">5. Swap Mode perspective</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Toggle between Buyer Client mode to purchase or Seller Creator mode to fulfill social growth gigs.
                        </p>
                      </div>
                    </div>

                    {/* Card 6: Admin panel */}
                    <div 
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                      className="p-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl cursor-pointer transition-all space-y-3 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <Cpu size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">6. Admin Sandbox Board</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Open developer board to grant verified badges to other sovereign node sellers or review live profiles logs.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Back to App trigger */}
                  <div className="pt-6 text-center">
                    <button
                      onClick={onBack}
                      className="px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-mono font-black uppercase text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      ← Back to main Chidon IQ terminal
                    </button>
                  </div>
                </motion.div>
              )}

              {portalTab === 'marketplace' && (
                <MarketplacePage
                  onSelectPost={(postId) => {
                    setActivePostId(postId);
                    setPortalTab('post');
                  }}
                  onNavigateToMessages={() => setPortalTab('messages')}
                  onNavigateToAuth={() => {
                    if (onSignIn) {
                      onSignIn();
                    } else {
                      alert('Please authenticate to list or hire.');
                    }
                  }}
                />
              )}

              {portalTab === 'post' && activePostId && (
                <PostDetail
                  postId={activePostId}
                  onBack={() => setPortalTab('marketplace')}
                  onStartChat={handleStartChat}
                  onNavigateToAuth={() => {
                    if (onSignIn) {
                      onSignIn();
                    } else {
                      alert('Please authenticate to connect.');
                    }
                  }}
                />
              )}

              {portalTab === 'messages' && (
                <MessagesPage
                  activeChatId={activeChatId}
                  onSelectChatId={(chatId) => setActiveChatId(chatId)}
                  onViewPost={(postId) => {
                    setActivePostId(postId);
                    setPortalTab('post');
                  }}
                  chatTools={chatTools}
                />
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC ROLE SWITCH SURVEY MODAL */}
      <AnimatePresence>
        {showSwitchSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-left space-y-6 relative overflow-hidden"
            >
              {/* Top ambient color bar based on target role */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                surveyTargetRole === 'seller' ? 'bg-purple-500' : 'bg-cyan-500'
              }`} />

              {/* Close Button */}
              <button 
                onClick={() => setShowSwitchSurvey(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="space-y-1.5">
                <span className={`text-[9px] font-mono font-black border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  surveyTargetRole === 'seller' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                }`}>
                  Perspective Swap Protocol: Step {surveyStep} of 3
                </span>
                <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  {surveyTargetRole === 'seller' ? 'Unlock Seller Creator Node' : 'Unlock Buyer Client Node'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Complete this micro-survey to re-route your connected node profile details.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    surveyTargetRole === 'seller' ? 'bg-purple-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${(surveyStep / 3) * 100}%` }}
                />
              </div>

              {/* Survey Content */}
              <div className="space-y-4 py-1">
                {surveyTargetRole === 'seller' ? (
                  <>
                    {/* SELLER QUESTIONS */}
                    {surveyStep === 1 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          1. What is your primary creative expertise as a Creator?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Short-form Video Editing (CapCut/Premiere)",
                            "Copywriting & Ghostwriting (Threads/Blogs)",
                            "Audience Growth Strategy & Analytics",
                            "Neuromorphic Sound Design & Scoring"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSurveyAnswer1(opt);
                                setSurveyStep(2);
                              }}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer1 === opt 
                                  ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 2 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          2. How many hours per week do you plan to allocate?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Part-time (<15 hours/week)",
                            "Standard Freelance (15-30 hours/week)",
                            "Full-time Creator (30+ hours/week)"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSurveyAnswer2(opt);
                                setSurveyStep(3);
                              }}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer2 === opt 
                                  ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 3 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          3. What is your target minimum monthly earnings goal?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Starter Milestone (<$1000/mo)",
                            "Professional Creator ($1000-$4000/mo)",
                            "Sovereign Creator ($4000+/mo)"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSurveyAnswer3(opt)}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer3 === opt 
                                  ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* BUYER QUESTIONS */}
                    {surveyStep === 1 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          1. What type of creators are you looking to hire today?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Long-term brand content partners",
                            "Fast single-milestone gig editors",
                            "UGC Ads and Video marketers",
                            "Channel optimization auditors"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSurveyAnswer1(opt);
                                setSurveyStep(2);
                              }}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer1 === opt 
                                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 2 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          2. What is your estimated monthly social growth budget?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Testing budget (<$500/mo)",
                            "Brand growth budget ($500-$2500/mo)",
                            "Premium enterprise budget ($2500+/mo)"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSurveyAnswer2(opt);
                                setSurveyStep(3);
                              }}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer2 === opt 
                                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {surveyStep === 3 && (
                      <div className="space-y-3">
                        <label className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wide block">
                          3. Which social media platform is your highest priority?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "TikTok Shop & Organic Shorts",
                            "Instagram Reels and Carousels",
                            "YouTube Longform & Shorts",
                            "Twitter/X Threads & Authority Building"
                          ].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSurveyAnswer3(opt)}
                              className={`p-3.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                                surveyAnswer3 === opt 
                                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Navigation Controls inside survey */}
              <div className="flex justify-between items-center border-t border-slate-850 pt-4">
                <button
                  type="button"
                  disabled={surveyStep === 1}
                  onClick={() => setSurveyStep(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-950 disabled:opacity-30 border border-slate-850 hover:border-slate-700 text-xs font-mono uppercase text-slate-400 rounded-xl transition-all cursor-pointer"
                >
                  ← Back
                </button>

                {surveyStep < 3 ? (
                  <button
                    type="button"
                    disabled={surveyStep === 1 && !surveyAnswer1 || surveyStep === 2 && !surveyAnswer2}
                    onClick={() => setSurveyStep(prev => prev + 1)}
                    className={`px-4 py-2 text-xs font-mono uppercase font-black rounded-xl cursor-pointer ${
                      surveyTargetRole === 'seller' ? 'bg-purple-600 text-white' : 'bg-cyan-500 text-black'
                    }`}
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!surveyAnswer3}
                    onClick={handleCompleteSurveyAndSwitch}
                    className={`px-6 py-3 text-xs font-mono uppercase font-black rounded-xl cursor-pointer transition-all ${
                      surveyTargetRole === 'seller' 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/10' 
                        : 'bg-cyan-500 hover:bg-cyan-450 text-black shadow-lg shadow-cyan-500/10'
                    }`}
                  >
                    ✓ complete & Launch Node View
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
