import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Briefcase, DollarSign, Clock, Shield, 
  CheckCircle2, MessageSquare, PlusCircle, AlertCircle, Edit2, Trash2, 
  Eye, FileText, Send, X, ArrowUpRight, Check, TrendingUp, BarChart2, PieChart as PieChartIcon,
  Award, Sparkles, Languages, FileSpreadsheet, PlayCircle, Image, User, CheckCircle,
  ToggleLeft, ToggleRight, UserCheck, BookOpen, AlertTriangle, RefreshCw, Layers, CheckSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { FreelanceGig, Order, ChatMessage, UserProfile, JobPost } from './types';
import { getSupabaseClient } from '../../lib/supabase';
import { PaymentOverviewWidget } from './PaymentOverviewWidget';

interface SellerDashboardProps {
  myProfile: UserProfile | null;
  allGigs: FreelanceGig[];
  myOrders: Order[];
  onCreateGig: (gigData: any) => Promise<void>;
  onDeleteGig: (gigId: string) => Promise<void>;
  onDeliverWork: (orderId: string, deliverableText: string) => Promise<void>;
  onSendMessage: (orderId: string, text: string) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, newStatus: 'pending' | 'in_escrow' | 'delivered' | 'completed' | 'cancelled' | 'revision_requested' | 'disputed', deliverableText?: string) => Promise<void>;
  chatMessages: ChatMessage[];
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  myProfile,
  allGigs,
  myOrders,
  onCreateGig,
  onDeleteGig,
  onDeliverWork,
  onSendMessage,
  onUpdateOrderStatus,
  chatMessages,
  checkAndDeductCredits
}) => {
  const supabase = getSupabaseClient();
  
  // Tabs: 'overview' | 'gigs' | 'orders' | 'get_work' | 'ai_hub' | 'profile'
  const [activeTab, setActiveTab] = useState<'overview' | 'gigs' | 'orders' | 'get_work' | 'ai_hub' | 'profile'>('overview');

  // Unified global loading states for AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STATE DEFINITIONS FOR THE 20 FEATURES
  // -------------------------------------------------------------
  
  // 1. Profile Setup States
  const [profilePhoto, setProfilePhoto] = useState(myProfile?.avatarURL || '');
  const [profileBio, setProfileBio] = useState(myProfile?.bio || '');
  const [profileSkills, setProfileSkills] = useState(myProfile?.skills?.join(', ') || '');
  const [profileEducation, setProfileEducation] = useState('B.Sc. Creative Media & Communication');
  const [profileLanguages, setProfileLanguages] = useState('English (Native), Spanish (Conversational)');
  const [profileCertifications, setProfileCertifications] = useState('Certified Social Media Manager, Prompt Engineering Master');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // 2. Availability badge
  const [availabilityBadge, setAvailabilityBadge] = useState(true);

  // 3. Create Gig Form States
  const [showCreateGigModal, setShowCreateGigModal] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDesc, setGigDesc] = useState('');
  const [gigPrice, setGigPrice] = useState(150);
  const [gigCategory, setGigCategory] = useState<'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Design' | 'Dev' | 'Video' | 'Marketing' | 'Writing' | 'AI'>('TikTok');
  const [gigDeliveryTime, setGigDeliveryTime] = useState('3 days');
  const [gigMediaURL, setGigMediaURL] = useState('');
  const [gigTagsInput, setGigTagsInput] = useState('');
  const [gigFaqInput, setGigFaqInput] = useState('Q: Do you offer raw video files?\nA: Yes, premium source raw timelines are included.');
  const [creatingGig, setCreatingGig] = useState(false);
  const [gigSuccess, setGigSuccess] = useState(false);

  // 4. Gig Optimizer Suggestions State
  const [optimizedTitle, setOptimizedTitle] = useState('');
  const [optimizedDesc, setOptimizedDesc] = useState('');
  const [optimizedTags, setOptimizedTags] = useState('');

  // 5. Portfolio states
  const [portfolioItems, setPortfolioItems] = useState<any[]>([
    { id: 'p1', title: 'Viral Reel for FinTech Client', description: 'Re-edited standard podcast clip with smart captions and dynamic hooks. Achieved 250k views.', mediaURL: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400', link: 'https://instagram.com/reels' },
    { id: 'p2', title: 'SaaS Twitter Thread Campaign', description: 'Crafted educational visual slides & copywriting hook sequence explaining modern server integration.', mediaURL: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?q=80&w=400', link: 'https://twitter.com/threads' }
  ]);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portURL, setPortURL] = useState('');
  const [portLink, setPortLink] = useState('');

  // 7. Buyer Requests (Jobs list) and proposal states
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJobForProposal, setSelectedJobForProposal] = useState<JobPost | null>(null);
  const [proposalRate, setProposalRate] = useState<number>(100);
  const [proposalTimeline, setProposalTimeline] = useState('3 days');
  const [proposalPitch, setProposalPitch] = useState('');
  const [myProposals, setMyProposals] = useState<any[]>([
    { id: 'prop-1', jobTitle: 'Need high-retention editor for TikTok automation channel', rate: 150, timeline: '2 days', pitch: 'Hey, I have over 3 years of editing experience explicitly for viral channel formats. Unlocking growth metrics is my key target.', status: 'pending' }
  ]);

  // 10. Quick Response Templates
  const quickTemplates = [
    { title: 'Introductory Greeting', text: 'Hi! Thank you for reviewing my listing. I specialize in custom social hooks, premium video timelines, and caption integrations. I am excited to align on your briefs!' },
    { title: 'WIP Delivery Draft', text: 'Hello! I have completed the initial drafts. Please take a look at the attached file link and share your thoughts so we can refine it.' },
    { title: 'Assets Final Submission', text: 'Hi! All complete high-retention deliverables have been submitted into Escrow for your safety. Ready for clearance!' },
    { title: 'Revision Handshake', text: 'Thank you for the constructive feedback. I have noted the specific adjustments and am starting production on the corrected draft immediately.' }
  ];

  // 13. Delivery Form
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFileURL, setDeliveryFileURL] = useState('');
  const [deliveringWork, setDeliveringWork] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // 14. Revision State
  const [revisionFeedback, setRevisionFeedback] = useState<Record<string, string>>({});

  // 15. Late Delivery Protection state
  const [lateProtection, setLateProtection] = useState<Record<string, boolean>>({});

  // 17. Payout Form States
  const [payoutMethod, setPayoutMethod] = useState<'Bank' | 'PayPal' | 'MobileMoney'>('Bank');
  const [payoutDetails, setPayoutDetails] = useState('Access Bank - 0124458902');
  const [instantPayout24hr, setInstantPayout24hr] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawnSuccess, setWithdrawnSuccess] = useState(false);

  // 19. AI Tools Hub Forms
  const [aiPortfolioInput, setAiPortfolioInput] = useState('Senior Video Editor, specialized in CapCut cap captions, CapCut speed ramps, YouTube short hook editing.');
  const [aiPortfolioResult, setAiPortfolioResult] = useState('');
  
  const [aiThumbnailInput, setAiThumbnailInput] = useState('How I Built a Relational Database with 0ms Caching in Node.js');
  const [aiThumbnailResult, setAiThumbnailResult] = useState('');

  const [aiScriptTopic, setAiScriptTopic] = useState('3 Psychological Copywriting Hooks to Triple TikTok CTR');
  const [aiScriptResult, setAiScriptResult] = useState('');

  // 20. Skills tests & badges states
  const [selectedQuiz, setSelectedQuiz] = useState<'smm' | 'editing' | 'prompting' | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [passedQuizzes, setPassedQuizzes] = useState<string[]>([]);
  const [isAI_Verified, setIsAI_Verified] = useState(myProfile?.isVerified || false);

  const smmQuiz = [
    { q: "Which TikTok metric determines first-stage algorithm recommendation?", options: ["Visual retention speed", "Average watch time in first 3 seconds", "Account follower ratio", "Hashtag volume density"], correct: 1 },
    { q: "What is an effective strategy for Instagram Reel organic reach?", options: ["Overloading 30+ generic tags", "Keeping subtitles within high contrast margins", "Re-uploading direct watermarked TikTok files", "Disabling comments"], correct: 1 },
    { q: "What does CTR stand for in YouTube analytics?", options: ["Creative Time Ratio", "Click-Through Rate", "Channel Transfer Registry", "Conversion Target Ratio"], correct: 1 },
    { q: "Which hook style challenges static user assumptions?", options: ["The Contrarian Hook", "The Chronological Hook", "The Silent Hook", "The Academic Hook"], correct: 0 },
    { q: "What is the recommended video resolution for optimal mobile format posting?", options: ["1920x1080", "1280x720", "1080x1920 (9:16)", "1080x1080 (1:1)"], correct: 2 }
  ];

  // -------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION ON MOUNT
  // -------------------------------------------------------------
  useEffect(() => {
    fetchJobsAndProfile();
  }, []);

  const fetchJobsAndProfile = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('jobs').select('*');
      if (!error && data) {
        setJobs(data as JobPost[]);
      }
    } catch (err) {
      console.error("Failed fetching jobs data", err);
    }
  };

  // Chat overlay in active order
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Dynamic Milestone checklist state indexed by order ID
  const [milestones, setMilestones] = useState<Record<string, { id: string; label: string; checked: boolean }[]>>({});

  // -------------------------------------------------------------
  // COMPUTED STATS
  // -------------------------------------------------------------
  const myGigs = allGigs.filter(g => g.sellerId === myProfile?.id);
  const activeContracts = myOrders.filter(o => o.sellerId === myProfile?.id);
  const completedContracts = activeContracts.filter(o => o.status === 'completed');
  
  const totalEarnings = completedContracts.reduce((sum, o) => sum + o.price, 0);
  const pendingClearance = activeContracts.filter(o => o.status === 'delivered' || o.status === 'in_escrow' || o.status === 'revision_requested').reduce((sum, o) => sum + o.price, 0);
  const availableToWithdraw = Math.max(0, totalEarnings - 20); // Hold small reserve or show as available

  // Mock static rates
  const responseRate = 99; // 99% Response Rate
  const orderQueueCount = activeContracts.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  // -------------------------------------------------------------
  // GIG SUBMISSIONS & OPTIMIZATION
  // -------------------------------------------------------------
  const handleCreateGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle.trim() || !gigDesc.trim() || !gigPrice) return;

    setCreatingGig(true);
    try {
      await onCreateGig({
        title: gigTitle.trim(),
        description: gigDesc.trim(),
        price: Number(gigPrice),
        category: gigCategory,
        deliveryTime: gigDeliveryTime,
        mediaURL: gigMediaURL.trim() || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
        tags: gigTagsInput.split(',').map(t => t.trim()).filter(Boolean)
      });
      setGigTitle('');
      setGigDesc('');
      setGigPrice(150);
      setGigMediaURL('');
      setGigTagsInput('');
      setGigSuccess(true);
      setTimeout(() => {
        setGigSuccess(false);
        setShowCreateGigModal(false);
        setActiveTab('gigs');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingGig(false);
    }
  };

  // Feature 6: AI Gig Optimizer call
  const triggerGigOptimizer = async () => {
    if (!gigTitle.trim()) {
      setAiError("Please type a draft Title first to optimize!");
      return;
    }
    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(2, 'AI Gig Optimizer');
      if (!allowed) {
        setAiError("Insufficient credits! Please fund your wallet nodes.");
        return;
      }
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Optimize my Freelance Service Gig title, tags, description and strategic pricing for maximum client click-through rate. 
Original Title: "${gigTitle}"
Category: "${gigCategory}"
Provide recommendations in a clean, easily copyable format. Suggest 1 optimized title, 5 precise SEO tags, and a highly engaging marketing tagline.`,
          feature: 'bio',
          userId: myProfile?.id || 'guest'
        })
      });
      const data = await response.json();
      if (data.text) {
        setOptimizedTitle(`🚀 [Optimized Title Suggestion]`);
        setOptimizedDesc(data.text);
      } else {
        setAiError("Could not retrieve AI recommendations. Check credits.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Network failure connecting to Gemini AI optimizer.");
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PROFILE SUBMISSIONS (Feature 1 Setup)
  // -------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !myProfile) return;
    setAiLoading(true);
    try {
      const updatedSkills = profileSkills.split(',').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: profilePhoto || myProfile.avatarURL,
          bio: profileBio,
          skills: updatedSkills,
          education: profileEducation,
          languages: profileLanguages,
          certifications: profileCertifications,
          is_verified: isAI_Verified
        })
        .eq('id', myProfile.id);

      if (error) throw error;
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GETTING WORK / UPWORK PROPOSALS (Feature 7 & 8)
  // -------------------------------------------------------------
  const triggerAIProposalWriter = async (job: JobPost) => {
    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(2, 'AI Proposal Writer');
      if (!allowed) {
        setAiError("Insufficient credits! Please fund your wallet nodes.");
        return;
      }
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a highly professional, Upwork-style proposal pitch letter for this client brief.
Job Title: "${job.title}"
Category: "${job.category}"
Brief description: "${job.description}"
Budget: $${job.budget}
Delivery: ${job.deliveryTime}
Focus on structural clarity, outline past successes editing/publishing dynamic social assets, and keep the tone professional and conversion-oriented.`,
          feature: 'scripts',
          userId: myProfile?.id || 'guest'
        })
      });
      const data = await response.json();
      if (data.text) {
        setProposalPitch(data.text);
      } else {
        setAiError("AI Proposal Generator failed to respond. Check account credits.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Connection error calling Gemini service.");
    } finally {
      setAiLoading(false);
    }
  };

  const submitProposal = (job: JobPost) => {
    const newProp = {
      id: 'prop-' + Math.random().toString(36).substring(4),
      jobTitle: job.title,
      rate: proposalRate,
      timeline: proposalTimeline,
      pitch: proposalPitch,
      status: 'pending'
    };
    setMyProposals([newProp, ...myProposals]);
    setSelectedJobForProposal(null);
    setProposalPitch('');
  };

  // -------------------------------------------------------------
  // DELIVERIES & ORDER ACTIONS (Feature 13, 14, 15)
  // -------------------------------------------------------------
  const handleDeliverWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!deliveryNote.trim() && !deliveryFileURL.trim()) || !selectedOrderForDelivery) return;

    setDeliveringWork(true);
    try {
      const deliverablePayload = `Note: ${deliveryNote.trim()}\nFile/Link: ${deliveryFileURL.trim()}`;
      await onDeliverWork(selectedOrderForDelivery.id, deliverablePayload);
      setDeliveryNote('');
      setDeliveryFileURL('');
      setDeliverySuccess(true);
      setTimeout(() => {
        setDeliverySuccess(false);
        setSelectedOrderForDelivery(null);
        setActiveTab('orders');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setDeliveringWork(false);
    }
  };

  // Feature 14: Revision Action handlers
  const handleRevisionAction = async (orderId: string, action: 'accept' | 'decline') => {
    if (!onUpdateOrderStatus) return;
    try {
      if (action === 'accept') {
        await onUpdateOrderStatus(orderId, 'revision_requested', 'Revision approved. Starting adjustments.');
        setRevisionFeedback(prev => ({ ...prev, [orderId]: 'Revision request accepted! Delivery status rolled back.' }));
      } else {
        await onUpdateOrderStatus(orderId, 'disputed', 'Revision request declined by freelancer. Initializing Dispute Resolution.');
        setRevisionFeedback(prev => ({ ...prev, [orderId]: 'Revision declined. Initiated dispute resolution module.' }));
      }
      setTimeout(() => {
        setRevisionFeedback(prev => {
          const copy = { ...prev };
          delete copy[orderId];
          return copy;
        });
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // PORTFOLIO CASES (Feature 5)
  // -------------------------------------------------------------
  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim()) return;
    const item = {
      id: 'p-' + Math.random().toString(36).substring(4),
      title: portTitle.trim(),
      description: portDesc.trim(),
      mediaURL: portURL.trim() || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400',
      link: portLink.trim() || 'https://instagram.com'
    };
    setPortfolioItems([item, ...portfolioItems]);
    setPortTitle('');
    setPortDesc('');
    setPortURL('');
    setPortLink('');
  };

  // -------------------------------------------------------------
  // PAYOUTS (Feature 16 & 17)
  // -------------------------------------------------------------
  const triggerPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableToWithdraw <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawnSuccess(true);
      setTimeout(() => setWithdrawnSuccess(false), 2500);
    }, 2000);
  };

  // -------------------------------------------------------------
  // AI TOOLS HUB GENERATORS (Feature 19)
  // -------------------------------------------------------------
  const handleAIPortfolioGen = async () => {
    setAiLoading(true);
    setAiPortfolioResult('');
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a premium, beautifully written, professional freelancer biography and Case Study layout based on these details:
"${aiPortfolioInput}". Use markdown, keep it compelling for clients looking to hire.`,
          feature: 'bio',
          userId: myProfile?.id || 'guest'
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiPortfolioResult(data.text);
      } else {
        setAiError("Deduction failed or API limit reached.");
      }
    } catch (err) {
      setAiError("Network error calling portfolio service.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIThumbnailGen = async () => {
    setAiLoading(true);
    setAiThumbnailResult('');
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Suggest a high-conversion, highly viral YouTube or TikTok video thumbnail composition outline for the video title: "${aiThumbnailInput}".
Suggest:
1. Exact visual layout elements (Background, Foreground, Accent)
2. Strategic color schemes (Hex values) that capture rapid click behavior
3. Big display text overlays (less than 3 words) with dramatic fonts.`,
          feature: 'thumbnails',
          userId: myProfile?.id || 'guest'
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiThumbnailResult(data.text);
      } else {
        setAiError("API error occurred. Please verify your connection.");
      }
    } catch (err) {
      setAiError("Failed connecting to AI Thumbnail service.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIScriptGen = async () => {
    setAiLoading(true);
    setAiScriptResult('');
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a high-retention 60-second social media short script for TikTok/YouTube Shorts on the topic: "${aiScriptTopic}".
Follow this structure:
0-3s: Disruptive Contrarian Hook
3-20s: Story / Key Problem Build
20-50s: Solution breakdown (Provide 3 quick actionable tips)
50-60s: Fast-tempo CTA (Call to Action).
Add visual cue brackets e.g. [Visual: Zoom on reaction expression].`,
          feature: 'scripts',
          userId: myProfile?.id || 'guest'
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiScriptResult(data.text);
      } else {
        setAiError("Service unavailable.");
      }
    } catch (err) {
      setAiError("Network disconnect.");
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SKILL TEST & VERIFICATION QUIZ (Feature 20)
  // -------------------------------------------------------------
  const startSkillQuiz = (type: 'smm' | 'editing' | 'prompting') => {
    setSelectedQuiz(type);
    setCurrentQuizIndex(0);
    setQuizScore(0);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    const isCorrect = optionIdx === smmQuiz[currentQuizIndex].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    if (currentQuizIndex + 1 < smmQuiz.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Quiz complete
      const finalS = isCorrect ? quizScore + 1 : quizScore;
      if (finalS >= 4) {
        setPassedQuizzes([...passedQuizzes, selectedQuiz!]);
        setIsAI_Verified(true);
        if (supabase && myProfile) {
          supabase.from('profiles').update({ is_verified: true }).eq('id', myProfile.id).catch(err => console.error(err));
        }
      }
      setSelectedQuiz(null);
    }
  };

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedOrderForChat) return;

    setSendingMsg(true);
    try {
      await onSendMessage(selectedOrderForChat.id, newMessageText.trim());
      setNewMessageText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'overview', label: 'Earning Hub', icon: DollarSign },
            { id: 'gigs', label: 'Portfolio & Gigs', icon: Layers },
            { id: 'get_work', label: 'Upwork Board', icon: Briefcase },
            { id: 'orders', label: `Active Orders (${orderQueueCount})`, icon: Clock },
            { id: 'ai_hub', label: 'AI Tools Hub', icon: Sparkles },
            { id: 'profile', label: 'My Setup', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setAiError(null);
              }}
              className={`px-3 py-2 text-xs font-mono font-black border rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Level & Availability status */}
        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl font-mono text-[10px]">
            <span className="font-extrabold text-slate-400">Available Now</span>
            <button 
              onClick={() => setAvailabilityBadge(!availabilityBadge)}
              className="text-purple-400 hover:text-purple-300 transition-all cursor-pointer"
            >
              {availabilityBadge ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  🟢 ON
                </span>
              ) : (
                <span className="text-slate-500">⚪ OFF</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-900/20 to-slate-900 border border-purple-500/20 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black uppercase text-purple-400">
            <Award size={12} />
            <span>
              {totalEarnings > 5000 ? 'Top Rated Creator' : totalEarnings > 1500 ? 'Level 2' : totalEarnings > 400 ? 'Level 1' : 'New Creator'}
            </span>
          </div>
        </div>
      </div>

      {/* GLOBAL AI LOGS BANNER */}
      {aiLoading && (
        <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-center gap-2.5 text-xs text-purple-300 font-mono animate-pulse">
          <RefreshCw size={14} className="animate-spin text-purple-400" />
          <span>Sovereign AI Node executing instructions. Deducting credits...</span>
        </div>
      )}
      {aiError && (
        <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300 font-mono">
          <AlertTriangle size={14} className="text-red-400" />
          <span>{aiError}</span>
        </div>
      )}

      {/* TAB COMPONENTS RENDERING */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (() => {
        const earningsHistoryData = [
          { name: 'May', earnings: 250, tasks: 2 },
          { name: 'Jun', earnings: 600, tasks: 4 },
          { name: 'Jul', earnings: 1450, tasks: 6 },
          { name: 'Aug', earnings: 2100, tasks: 9 },
          { name: 'Sep', earnings: totalEarnings > 0 ? 2100 + totalEarnings : 2600, tasks: 11 },
        ];

        return (
          <div className="space-y-6">
            {/* Paystack Smart Escrow Vault Widget */}
            <PaymentOverviewWidget orders={myOrders} role="seller" />

            {/* Top metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Cleared */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Earned</span>
                <h3 className="text-2xl font-mono font-extrabold text-white mt-1">${totalEarnings}</h3>
                <p className="text-[10px] text-emerald-400 font-mono mt-1.5">★ {myProfile?.rating || '5.0'} average score</p>
              </div>

              {/* Locked in Escrow */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Locked in Escrow</span>
                <h3 className="text-2xl font-mono font-extrabold text-white mt-1">${pendingClearance}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1.5">Active escrowed milestones</p>
              </div>

              {/* Available for withdraw */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Ready to Withdraw</span>
                <h3 className="text-2xl font-mono font-extrabold text-white mt-1">${availableToWithdraw}</h3>
                <p className="text-[10px] text-purple-400 font-mono mt-1.5">Withdrawn cleared ledger</p>
              </div>

              {/* Active queue tickets */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Response Rate & Queue</span>
                <h3 className="text-2xl font-mono font-extrabold text-white mt-1">{responseRate}% Response</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1.5">{orderQueueCount} Orders currently in queue</p>
              </div>
            </div>

            {/* Seller Level Unlocked Benefits Indicator */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-yellow-400" />
                  Sovereign Level Milestones
                </h4>
                <span className="text-[9px] font-mono text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">LEVEL TRACKER</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {[
                  { title: 'New Seller', target: '$0 Earnings', benefits: 'List up to 5 custom gigs, 3.9% commission rate' },
                  { title: 'Level 1', target: '$400 Earned', benefits: 'List up to 10 custom gigs, search boost, auto-invoicing' },
                  { title: 'Level 2', target: '$1500 Earned', benefits: 'List up to 15 custom gigs, priority resolution support' },
                  { title: 'Top Rated', target: '$5000 Earned', benefits: 'Unlimited gigs, instant 24hr payout clearing, VIP support' }
                ].map((tier, i) => {
                  const grossThresh = [0, 400, 1500, 5000];
                  const currentThresh = grossThresh[i];
                  const activeLevel = totalEarnings >= currentThresh;
                  return (
                    <div key={tier.title} className={`p-4 rounded-xl border ${activeLevel ? 'bg-purple-950/10 border-purple-500/40 text-slate-200' : 'bg-slate-950/40 border-slate-900 text-slate-500'}`}>
                      <div className="flex items-center gap-1.5">
                        {activeLevel ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} />}
                        <span className="font-bold font-mono">{tier.title}</span>
                      </div>
                      <span className="text-[9px] font-mono block text-slate-400 mt-1">Goal: {tier.target}</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5 leading-normal">{tier.benefits}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payouts setup (Feature 17) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earning growth chart */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-purple-400" />
                      Earning Growth Trend
                    </h4>
                  </div>
                </div>
                <div className="h-56 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" tickLine={false} style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                      <YAxis stroke="#64748B" tickLine={false} style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px' }} 
                        itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                        labelStyle={{ color: '#64748B', fontSize: '10px', fontFamily: 'monospace' }}
                      />
                      <Area type="monotone" dataKey="earnings" stroke="#A855F7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Withdrawal system (Feature 16 & 17) */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-indigo-400" />
                      Instant 24-Hour Payout Portal
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">Instant active</span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed mb-4">
                    Secure direct settlement of cleared freelance revenues. Choose your local channels for direct payouts.
                  </p>

                  <form onSubmit={triggerPayout} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {['Bank', 'PayPal', 'MobileMoney'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPayoutMethod(method as any)}
                          className={`py-2 text-[10px] font-mono border rounded-xl font-bold cursor-pointer transition-all ${
                            payoutMethod === method
                              ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                              : 'bg-slate-950 border-slate-850 text-slate-400'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 block uppercase">Payout Details / Address</label>
                      <input
                        type="text"
                        required
                        value={payoutDetails}
                        onChange={(e) => setPayoutDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-slate-900">
                      <div className="text-left">
                        <span className="text-[10px] font-mono font-black text-white uppercase block">Instant Payout (24 hours processing)</span>
                        <span className="text-[9px] text-slate-400 font-mono">Top Rated & Level 2 creators bypass hold clearance timelines</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInstantPayout24hr(!instantPayout24hr)}
                        className="text-purple-400 hover:text-purple-300 transition-all cursor-pointer text-lg"
                      >
                        {instantPayout24hr ? '🟢 ACTIVE' : '⚪ OFF'}
                      </button>
                    </div>

                    {withdrawnSuccess && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400 font-mono">
                        🎉 Withdrawal initialized! Funds will clear into your account in 24 hours.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isWithdrawing || availableToWithdraw <= 0}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      {isWithdrawing ? 'Transferring funds...' : `Claim $${availableToWithdraw} Instant Withdrawal`}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Top Gigs / Top Buyers list (Feature 18) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider border-b border-slate-900 pb-2">
                  Top Performing Gigs
                </h4>
                <div className="divide-y divide-slate-900">
                  {myGigs.length > 0 ? myGigs.map((gig, idx) => (
                    <div key={gig.id} className="py-2 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                        <span className="text-slate-200 font-medium truncate max-w-[200px]">{gig.title}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">${gig.price}</span>
                    </div>
                  )) : (
                    <span className="text-xs text-slate-500 font-mono block">No performance records found yet.</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider border-b border-slate-900 pb-2">
                  Top Clients & Buyers
                </h4>
                <div className="divide-y divide-slate-900 font-mono text-xs">
                  {activeContracts.length > 0 ? activeContracts.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-300">@{ord.buyerName}</span>
                      <span className="text-purple-400 font-bold">${ord.price} paid</span>
                    </div>
                  )) : (
                    <span className="text-xs text-slate-500 font-mono block">No active clients.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* GIGS & PORTFOLIO TAB */}
      {activeTab === 'gigs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Gigs Setup & Portfolio cases</h2>
            <button
              onClick={() => setShowCreateGigModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={11} strokeWidth={3} />
              <span>New Gig</span>
            </button>
          </div>

          {/* Gigs List with impressions & click metrics (Feature 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGigs.map(gig => {
              // Simulated analytics numbers based on gig title complexity
              const baseImp = 1200 + gig.price * 2;
              const baseClick = Math.round(baseImp * 0.18);
              const baseOrd = Math.round(baseClick * 0.05);
              const conversion = ((baseOrd / baseClick) * 100).toFixed(1);

              return (
                <div key={gig.id} className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div className="relative h-36 bg-slate-900">
                    <img src={gig.mediaURL} alt="" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-mono font-black bg-black/80 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                      {gig.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{gig.title}</h3>

                    {/* Gig Analytics Block (Feature 4) */}
                    <div className="grid grid-cols-4 gap-1 py-2 px-2.5 bg-slate-900/60 border border-slate-850/60 rounded-xl font-mono text-[9px] text-center">
                      <div>
                        <span className="text-slate-500 block">IMPR</span>
                        <span className="text-slate-200 font-bold">{baseImp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">CLICKS</span>
                        <span className="text-slate-200 font-bold">{baseClick}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ORDERS</span>
                        <span className="text-slate-200 font-bold">{baseOrd}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">CONV</span>
                        <span className="text-purple-400 font-bold">{conversion}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-900 pt-2.5">
                      <span className="text-slate-400">Starting at: ${gig.price}</span>
                      <button
                        onClick={() => onDeleteGig(gig.id)}
                        className="text-red-400 hover:text-red-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {myGigs.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl">
                <p className="text-xs text-slate-500 font-mono">You do not have any listed growth gigs. Click New Gig to begin.</p>
              </div>
            )}
          </div>

          {/* Portfolio cases (Feature 5) */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <PlayCircle size={14} className="text-purple-400" /> My Portfolio Showcase & Cases
            </h3>

            {/* Past items list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolioItems.map(item => (
                <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex gap-3 text-left">
                  <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                    <img src={item.mediaURL} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{item.description}</p>
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-[9px] font-mono text-purple-400 hover:underline block pt-1">
                      View live asset link ➔
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Case Study Add form */}
            <form onSubmit={handleAddPortfolio} className="space-y-3 pt-3 border-t border-slate-900">
              <span className="text-[10px] font-mono font-bold text-slate-400 block">UPLOAD PAST WORK CASE STUDY</span>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Case Study/Project Title"
                  value={portTitle}
                  onChange={e => setPortTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="url"
                  placeholder="Showcase Asset Image URL"
                  value={portURL}
                  onChange={e => setPortURL(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Description / Case Details"
                  value={portDesc}
                  onChange={e => setPortDesc(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="url"
                  placeholder="Live Project URL (Instagram, TikTok, YT)"
                  value={portLink}
                  onChange={e => setPortLink(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                + Add Project Case to Portfolio Showcase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GETTING WORK UPWORK PROPOSALS TAB */}
      {activeTab === 'get_work' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Upwork-Style Job Requests & Proposals</h2>
            <p className="text-xs text-slate-400 mt-1">Browse active client briefs and send verified growth proposals.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Jobs lists */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider">Active Client Briefs</h3>
              <div className="space-y-3.5">
                {jobs.map(job => (
                  <div key={job.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full uppercase">
                        {job.category}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-400">${job.budget} BUDGET</span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{job.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-normal">{job.description}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2.5">
                      <span>Client: @{job.buyerName}</span>
                      <span>Timeline: {job.deliveryTime}</span>
                      
                      <button
                        onClick={() => setSelectedJobForProposal(job)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Send Proposal
                      </button>
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-mono text-xs bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl">
                    No active job requests available.
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 col: Submitted Proposals Tracker */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider">My Submitted Proposals</h3>
              <div className="space-y-3">
                {myProposals.map(prop => (
                  <div key={prop.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-2">
                    <h4 className="font-bold text-white truncate">{prop.jobTitle}</h4>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-slate-400">Rate: ${prop.rate}</span>
                      <span className="text-slate-400">Timeline: {prop.timeline}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed truncate">{prop.pitch}</p>
                    <span className="inline-block text-[8px] font-mono uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Pending Client Review
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proposal Composer Drawer / Dialog */}
          {selectedJobForProposal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xl w-full bg-[#0B0F19] border border-slate-850 rounded-3xl p-6 space-y-4 relative text-left"
              >
                <button
                  onClick={() => setSelectedJobForProposal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>

                <div className="space-y-1">
                  <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Submit Proposal</h3>
                  <p className="text-xs text-slate-400 truncate">Job Brief: {selectedJobForProposal.title}</p>
                </div>

                {/* AI PROPOSAL WRITER BUTTON (Feature 8) */}
                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase block">AI PROPOSAL COMPOSER</span>
                    <span className="text-[9px] text-slate-400 font-mono">1-click analyze client's brief to write proposal</span>
                  </div>
                  <button
                    onClick={() => triggerAIProposalWriter(selectedJobForProposal)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[10px] uppercase rounded-lg cursor-pointer"
                  >
                    Generate AI Cover Letter ⚡
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase">My Bid Rate (USD)</label>
                    <input
                      type="number"
                      value={proposalRate}
                      onChange={e => setProposalRate(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase">Proposed Delivery</label>
                    <input
                      type="text"
                      value={proposalTimeline}
                      onChange={e => setProposalTimeline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                {/* Cover Letter Pitch text */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-slate-400 uppercase">Pitch & Cover Letter</label>
                    {/* Auto-reply Quick responses insertion */}
                    <div className="flex items-center gap-1 text-[9px] font-mono text-purple-400">
                      <span>Insert Quick Template:</span>
                      <select 
                        onChange={(e) => setProposalPitch(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded text-slate-400 text-[9px]"
                      >
                        <option value="">-- Choose template --</option>
                        {quickTemplates.map((t) => (
                          <option key={t.title} value={t.text}>{t.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea
                    required
                    placeholder="Describe how your social expertise matches this brand brief..."
                    value={proposalPitch}
                    onChange={e => setProposalPitch(e.target.value)}
                    className="w-full h-40 bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none font-sans"
                  />
                </div>

                <button
                  onClick={() => submitProposal(selectedJobForProposal)}
                  className="w-full py-3 bg-purple-600 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-purple-500"
                >
                  Submit verified proposal 🚀
                </button>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE CLIENT ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Orders list */}
            <div className="flex-1 space-y-4 text-left">
              <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Active Client Agreements</h2>
              {activeContracts.length > 0 ? (
                <div className="space-y-3.5">
                  {activeContracts.map(order => {
                    const isSelected = selectedOrderForChat?.id === order.id;
                    const orderProtection = lateProtection[order.id] || false;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForChat(order)}
                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col md:flex-row justify-between gap-4 ${
                          isSelected
                            ? 'bg-slate-900 border-purple-500 shadow-lg'
                            : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                                {order.gigCategory}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">• Client: @{order.buyerName}</span>
                            </div>

                            {/* Feature 15: Late Delivery Protection Toggle */}
                            <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-850 font-mono text-[8px]">
                              <span>Late Shield:</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLateProtection(prev => ({ ...prev, [order.id]: !orderProtection }));
                                }}
                                className="text-purple-400 hover:text-purple-300 transition-all font-bold"
                              >
                                {orderProtection ? '🛡️ ACTIVE' : '⚪ OFF'}
                              </button>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-white">{order.gigTitle}</h3>

                          <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-mono text-slate-500 pt-1">
                            <span className="font-bold text-white">Amt: ${order.price}</span>
                            <span>Timeline: {order.deliveryDate} {orderProtection && ' (+48hrs extension buffer active)'}</span>
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                order.status === 'completed' ? 'bg-emerald-400' :
                                order.status === 'delivered' ? 'bg-purple-400 animate-pulse' : 
                                order.status === 'revision_requested' ? 'bg-orange-400' : 'bg-yellow-400'
                              }`} />
                              <span className="capitalize">{order.status.replace('_', ' ')}</span>
                            </span>
                          </div>

                          {/* Feature 14: Revision Action block */}
                          {order.status === 'revision_requested' && (
                            <div className="p-3 bg-orange-950/10 border border-orange-500/20 rounded-xl mt-3 space-y-2">
                              <span className="text-[9px] font-mono text-orange-400 block font-bold">CLIENT REQUESTED REVISION CHANGES</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{order.deliverableText || 'Please adjust the visual caption format and check rendering on dynamic feeds.'}</p>
                              
                              {revisionFeedback[order.id] && (
                                <p className="text-[10px] font-mono text-purple-400 animate-pulse">{revisionFeedback[order.id]}</p>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRevisionAction(order.id, 'accept');
                                  }}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-mono text-[9px] font-bold rounded-lg cursor-pointer"
                                >
                                  Accept & Rework Draft
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRevisionAction(order.id, 'decline');
                                  }}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-red-400 font-mono text-[9px] font-bold rounded-lg cursor-pointer"
                                >
                                  Decline & Open Arbitration
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order management actions */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center w-full md:w-auto">
                          {(order.status === 'in_escrow' || order.status === 'revision_requested') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderForDelivery(order);
                              }}
                              className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                            >
                              Deliver Complete Work
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForChat(order)}
                            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg text-center"
                          >
                            Open Chat & Briefs
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl">
                  <Shield size={24} className="mx-auto text-slate-500" />
                  <p className="text-xs text-slate-400 font-mono mt-3">No active gig assignments currently allocated to your profile.</p>
                </div>
              )}
            </div>

            {/* Right Column: Escrow Order Chat */}
            {selectedOrderForChat && (() => {
              const orderId = selectedOrderForChat.id;
              // Initialize default milestones if empty
              const defaultList = [
                { id: 'm1', label: 'Review & Analyze Job Brief', checked: true },
                { id: 'm2', label: 'Draft Creative Hook Formulas', checked: selectedOrderForChat.status !== 'pending' },
                { id: 'm3', label: 'Deliver Work Milestone draft', checked: ['delivered', 'completed'].includes(selectedOrderForChat.status) },
                { id: 'm4', label: 'Verify & Release Escrow Payout', checked: selectedOrderForChat.status === 'completed' }
              ];
              const activeMilestones = milestones[orderId] || defaultList;

              const toggleMilestone = (mId: string) => {
                const updated = activeMilestones.map(m => m.id === mId ? { ...m, checked: !m.checked } : m);
                setMilestones({ ...milestones, [orderId]: updated });
              };

              const completedCount = activeMilestones.filter(m => m.checked).length;
              const percentAchieved = Math.round((completedCount / activeMilestones.length) * 100);

              // Contract status stages mapping
              const stages = [
                { label: 'Funded', statusKey: 'in_escrow' },
                { label: 'Production', statusKey: 'production' },
                { label: 'Delivered', statusKey: 'delivered' },
                { label: 'Cleared', statusKey: 'completed' }
              ];

              // Check current active stage index
              let currentStageIndex = 0;
              if (selectedOrderForChat.status === 'in_escrow') currentStageIndex = 1;
              if (selectedOrderForChat.status === 'delivered') currentStageIndex = 2;
              if (selectedOrderForChat.status === 'completed') currentStageIndex = 3;

              return (
                <div className="w-full lg:w-96 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col h-[560px]">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-850 bg-slate-900/60 rounded-t-2xl flex justify-between items-center shrink-0">
                    <div className="text-left">
                      <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-400">Workspace Contracts Desk</h3>
                      <span className="text-sm font-bold text-white block truncate max-w-[200px]">@{selectedOrderForChat.buyerName}</span>
                    </div>
                    <button onClick={() => setSelectedOrderForChat(null)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Dynamic Progress Stages Tracker */}
                  <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-850 shrink-0 space-y-2 text-left">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                      <span>PROJECT CONTRACT TRACKER</span>
                      <span className="text-purple-400">{percentAchieved}% COMPLETE</span>
                    </div>
                    
                    {/* Visual Stepper bar */}
                    <div className="flex items-center justify-between relative py-2">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${(currentStageIndex / 3) * 100}%` }}
                      />
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        return (
                          <div key={stage.label} className="flex flex-col items-center z-10 relative">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all ${
                              isDone 
                                ? 'bg-purple-600 border-purple-400 text-white' 
                                : 'bg-slate-950 border-slate-850 text-slate-500'
                            } ${isCurrent ? 'ring-2 ring-purple-500/40 animate-pulse' : ''}`}>
                              {isDone && idx < currentStageIndex ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[8px] font-mono mt-1 font-extrabold tracking-tight ${isDone ? 'text-purple-400' : 'text-slate-500'}`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Milestones list drawer */}
                  <div className="px-4 py-2.5 bg-slate-900/20 border-b border-slate-850 shrink-0 space-y-1.5 text-left">
                    <span className="text-[9px] font-mono text-slate-400 block font-bold">SOVEREIGN WORK MILESTONES (CLICK TO UPDATE)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeMilestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          className={`p-2 rounded-xl text-[9px] font-mono border text-left flex items-start gap-1.5 transition-all cursor-pointer ${
                            m.checked 
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                              : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 font-bold">{m.checked ? '☑' : '☐'}</span>
                          <span className="leading-tight truncate">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messages Body */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar">
                    {chatMessages.filter(m => m.orderId === selectedOrderForChat.id).length > 0 ? (
                      chatMessages.filter(m => m.orderId === selectedOrderForChat.id).map(msg => {
                        const isMe = msg.senderId === myProfile?.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-xs ${
                              isMe 
                                ? 'bg-purple-600 text-white font-medium rounded-tr-none' 
                                : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 mt-1">@{msg.senderName}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-500 font-mono text-[10px]">
                        💬 Post safety, milestones, files, or questions to align with your client.
                      </div>
                    )}
                  </div>

                  {/* Input field */}
                  <form onSubmit={handleSendMessageSubmit} className="p-3 border-t border-slate-850 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={newMessageText}
                      onChange={e => setNewMessageText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !newMessageText.trim()}
                      className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      <Send size={14} strokeWidth={2.5} />
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* AI TOOLS HUB TAB (Feature 19) */}
      {activeTab === 'ai_hub' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">AI Tools Hub</h2>
            <p className="text-xs text-slate-400 mt-1">Increase productivity using pre-prompted social growth generators.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            {/* AI Portfolio Generator */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-[9px] font-mono font-black text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">AI BIO GENERATOR</span>
                <h4 className="text-xs font-bold text-white">AI Portfolio Copywriter</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">Input roles to write bio summaries and sample case structure outlines.</p>
                <textarea
                  value={aiPortfolioInput}
                  onChange={e => setAiPortfolioInput(e.target.value)}
                  className="w-full h-20 bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-purple-500 font-sans"
                />
                
                {aiPortfolioResult && (
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-300 font-mono overflow-y-auto max-h-40 whitespace-pre-wrap leading-relaxed select-all">
                    {aiPortfolioResult}
                  </div>
                )}
              </div>
              <button
                onClick={handleAIPortfolioGen}
                className="w-full mt-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Generate Biography Profile ⚡
              </button>
            </div>

            {/* AI Thumbnail Planner */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">IMAGE & GRAPHICS</span>
                <h4 className="text-xs font-bold text-white">AI Thumbnail Planner</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">Suggest high-click graphic schemes, layout cards, and bold text.</p>
                <input
                  type="text"
                  value={aiThumbnailInput}
                  onChange={e => setAiThumbnailInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
                
                {aiThumbnailResult && (
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-300 font-mono overflow-y-auto max-h-40 whitespace-pre-wrap leading-relaxed select-all">
                    {aiThumbnailResult}
                  </div>
                )}
              </div>
              <button
                onClick={handleAIThumbnailGen}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Plan Thumbnail Design 🎨
              </button>
            </div>

            {/* AI Script Writer */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-[9px] font-mono font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">COPYWRITING</span>
                <h4 className="text-xs font-bold text-white">AI Social Scriptwriter</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">Write 60s viral TikTok drafts with structured visual cue brackets.</p>
                <input
                  type="text"
                  value={aiScriptTopic}
                  onChange={e => setAiScriptTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
                
                {aiScriptResult && (
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-300 font-mono overflow-y-auto max-h-40 whitespace-pre-wrap leading-relaxed select-all">
                    {aiScriptResult}
                  </div>
                )}
              </div>
              <button
                onClick={handleAIScriptGen}
                className="w-full mt-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-mono font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Write High Retention Script ✍️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETUP & VERIFICATION TESTS TAB (Feature 1, 20) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">My Sovereign Creator Profile & Skills Verification</h2>
              <p className="text-xs text-slate-400 mt-1">Configure biography and complete certification exams to display verification checkmarks.</p>
            </div>
            
            {/* Show Verification Status Badging */}
            {isAI_Verified ? (
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-mono text-[10px] font-black flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>AI VERIFIED CREATOR STATUS</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-slate-900 text-slate-500 border border-slate-800 rounded-xl font-mono text-[10px] font-black">
                Exam Verification Pending
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Left Col: Setup Bio and Details Form (Feature 1 Setup) */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider border-b border-slate-900 pb-2">
                Setup Bio & Profile Credentials
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Profile Photo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={profilePhoto}
                      onChange={e => setProfilePhoto(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Education (University/Degree)</label>
                    <input
                      type="text"
                      required
                      value={profileEducation}
                      onChange={e => setProfileEducation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block">Sovereign Biography</label>
                  <textarea
                    required
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    className="w-full h-20 bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white resize-none"
                    placeholder="Describe your creative experience, content automation, or strategy targets..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block">Specialist Skills (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={profileSkills}
                    onChange={e => setProfileSkills(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="video production, copywriting, captions, hook design"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Languages Spoken</label>
                    <input
                      type="text"
                      required
                      value={profileLanguages}
                      onChange={e => setProfileLanguages(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Certifications</label>
                    <input
                      type="text"
                      required
                      value={profileCertifications}
                      onChange={e => setProfileCertifications(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-400 font-mono">
                    🎉 Creator profile credentials updated successfully!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  Save Credentials Profile
                </button>
              </form>
            </div>

            {/* Right Col: Skill Tests + Verification exams (Feature 20) */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider border-b border-slate-900 pb-2">
                Sovereign Certification exams
              </h3>

              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Unlock the prestigious glowing **AI Verified badge** on your profile, listing cards, and bids. Complete 5-question multiple choice quizzes scoring at least 4 out of 5 correctly.
              </p>

              <div className="space-y-2.5">
                {[
                  { id: 'smm', title: 'Social Media Organic Strategist', length: '5 Questions', scoreNeeded: '4/5 correct' },
                  { id: 'editing', title: 'Video Production & Retention Editor', length: '5 Questions', scoreNeeded: '4/5 correct' },
                  { id: 'prompting', title: 'Generative Prompt Engineering Specialist', length: '5 Questions', scoreNeeded: '4/5 correct' }
                ].map(exam => {
                  const passed = passedQuizzes.includes(exam.id);
                  return (
                    <div key={exam.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <span className="text-[11px] font-bold text-white block">{exam.title}</span>
                        <span className="text-[9px] font-mono text-slate-400">{exam.length} • target: {exam.scoreNeeded}</span>
                      </div>
                      {passed ? (
                        <span className="text-[10px] font-mono font-black text-emerald-400 uppercase flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                          ✓ PASSED
                        </span>
                      ) : (
                        <button
                          onClick={() => startSkillQuiz(exam.id as any)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-mono font-black text-[10px] uppercase cursor-pointer"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Quiz Overlay Overlay if quiz is open */}
              {selectedQuiz && (() => {
                const quiz = smmQuiz;
                const questionObj = quiz[currentQuizIndex];
                return (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="max-w-md w-full bg-[#0B0F19] border border-slate-850 rounded-3xl p-6 space-y-4 relative text-left"
                    >
                      <button
                        onClick={() => setSelectedQuiz(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block">
                          QUIZ EXAM IN PROGRESS • QUESTION {currentQuizIndex + 1} OF {quiz.length}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">{questionObj.q}</h4>
                      </div>

                      <div className="space-y-2">
                        {questionObj.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            className="w-full text-left p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-200 hover:text-white transition-all cursor-pointer font-sans"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CREATE GIG MODAL OVERLAY */}
      {showCreateGigModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-5 relative text-left overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={() => setShowCreateGigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase">List New Social Gig</h3>
              <p className="text-xs text-slate-400">Specify your deliverables package, category, price, and cover image.</p>
            </div>

            {/* AI GIG OPTIMIZER SECTION (Feature 6) */}
            <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-2xl space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase block">AI GIG OPTIMIZER</span>
                <button
                  type="button"
                  onClick={triggerGigOptimizer}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={10} /> Optimize Title & Keywords
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Analyzes title details using Gemini AI to return conversion recommendations.</p>
              
              {optimizedTitle && (
                <div className="space-y-1.5 pt-2.5 border-t border-slate-900 font-mono text-[9px] text-slate-300">
                  <span className="text-emerald-400 font-bold block">{optimizedTitle}</span>
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl max-h-32 overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                    {optimizedDesc}
                  </div>
                </div>
              )}
            </div>

            {gigSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                🎉 Your specialized social media gig has been listed live!
              </div>
            )}

            <form onSubmit={handleCreateGigSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase block">Gig Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. I will edit 5 high retention viral TikTok videos"
                  value={gigTitle}
                  onChange={e => setGigTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300 uppercase block">Category</label>
                  <select
                    value={gigCategory}
                    onChange={e => setGigCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Design">Design</option>
                    <option value="Dev">Dev</option>
                    <option value="Video">Video</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Writing">Writing</option>
                    <option value="AI">AI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300 uppercase block">Price (USD)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={gigPrice}
                    onChange={e => setGigPrice(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase block">Scope & Deliverables</label>
                <textarea
                  required
                  placeholder="Describe details, layout formats, revision iterations, timelines, and raw file delivery details."
                  value={gigDesc}
                  onChange={e => setGigDesc(e.target.value)}
                  className="w-full h-20 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300 uppercase block">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={gigMediaURL}
                    onChange={e => setGigMediaURL(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-300 uppercase block">Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 days"
                    value={gigDeliveryTime}
                    onChange={e => setGigDeliveryTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase block">FAQ setup (Questions and Answers)</label>
                <textarea
                  value={gigFaqInput}
                  onChange={e => setGigFaqInput(e.target.value)}
                  className="w-full h-16 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[11px] text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase block">Search Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. video, viral, capcut, reels"
                  value={gigTagsInput}
                  onChange={e => setGigTagsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 text-[11px] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={creatingGig}
                className="w-full py-3 bg-purple-600 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all cursor-pointer"
              >
                {creatingGig ? 'Listing Gig...' : 'Publish Gig Listed 🚀'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* DELIVER WORK MODAL OVERLAY */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-5 relative text-left"
          >
            <button
              onClick={() => setSelectedOrderForDelivery(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase">Deliver Milestone Deliverables</h3>
              <p className="text-xs text-slate-400">Describe or link your completed social assets for client approval.</p>
            </div>

            {deliverySuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                🎉 Deliverables uploaded into Escrow! Client has been notified.
              </div>
            )}

            <form onSubmit={handleDeliverWorkSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Work File Link / Drive URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={deliveryFileURL}
                  onChange={e => setDeliveryFileURL(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Work Description / notes</label>
                  {/* Auto insert quick responses */}
                  <select 
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-slate-400 font-mono text-[9px] rounded"
                  >
                    <option value="">-- Quick templates --</option>
                    {quickTemplates.map(t => (
                      <option key={t.title} value={t.text}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  required
                  placeholder="Provide brief writeup of completed tasks..."
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={deliveringWork}
                className="w-full py-3 bg-purple-600 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-purple-500 cursor-pointer transition-all"
              >
                {deliveringWork ? 'Submitting Work...' : 'Submit Deliverables into Escrow 🚀'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
