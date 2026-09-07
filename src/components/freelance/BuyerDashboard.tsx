import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Plus, Shield, ShoppingBag, MessageSquare, 
  User, Check, ChevronRight, MessageCircle, Star, ThumbsUp, Send, 
  DollarSign, Clock, AlertCircle, Trash2, Heart, ExternalLink, X, TrendingUp, BookOpen,
  SlidersHorizontal, Sparkles, Award, ArrowUpRight, HelpCircle, FileText, CheckCircle2, RotateCcw
} from 'lucide-react';
import { FreelanceGig, JobPost, Order, ChatMessage, UserProfile } from './types';
import { SellerProfileModal } from './SellerProfileModal';
import { PaystackCheckoutModal } from './PaystackCheckoutModal';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import { OrderWorkspaceDesk } from './OrderWorkspaceDesk';
import { PaymentOverviewWidget } from './PaymentOverviewWidget';

interface BuyerDashboardProps {
  myProfile: UserProfile | null;
  allGigs: FreelanceGig[];
  myPostedJobs: JobPost[];
  myOrders: Order[];
  onPostJob: (jobData: any) => Promise<void>;
  onBuyGig: (gig: FreelanceGig) => Promise<void>;
  onSendMessage: (orderId: string, text: string) => Promise<void>;
  onCompleteOrder: (orderId: string, rating: number, reviewText: string) => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
  chatMessages: ChatMessage[];
  allProfiles: UserProfile[];
  onSwitchToSeller?: () => void;
  onUpdateOrderStatus?: (
    orderId: string, 
    newStatus: 'pending' | 'in_escrow' | 'delivered' | 'completed' | 'cancelled' | 'revision_requested' | 'disputed',
    deliverableText?: string
  ) => Promise<void>;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  myProfile,
  allGigs,
  myPostedJobs,
  myOrders,
  onPostJob,
  onBuyGig,
  onSendMessage,
  onCompleteOrder,
  onCancelOrder,
  chatMessages,
  allProfiles,
  onSwitchToSeller,
  onUpdateOrderStatus
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'browse' | 'post_job' | 'my_listings' | 'orders'>('browse');
  
  // Category & Subcategory selection (Feature 2)
  const [selectedCategory, setSelectedCategory] = useState<FreelanceGig['category'] | 'All'>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // Search and Advanced Filters Panel states (Feature 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterMinBudget, setFilterMinBudget] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterSellerLevel, setFilterSellerLevel] = useState('all');
  const [filterAiVerifiedOnly, setFilterAiVerifiedOnly] = useState(false);

  // Favorites & Followings (Feature 16)
  const [favoriteGigs, setFavoriteGigs] = useState<string[]>([]);
  const [followedSellers, setFollowedSellers] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Seller Profile Modal mounting state (Feature 4)
  const [viewingSeller, setViewingSeller] = useState<UserProfile | null>(null);

  // Selected Gig and Package Details states (Feature 7)
  const [selectedGig, setSelectedGig] = useState<FreelanceGig | null>(null);
  const [activePackage, setActivePackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  // Requirements Page Setup (Feature 8)
  const [showRequirementsPage, setShowRequirementsPage] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState('');
  const [orderRequirementsFiles, setOrderRequirementsFiles] = useState<string[]>([]);

  // Paystack modal trigger states (Feature 9)
  const [gigToBuy, setGigToBuy] = useState<FreelanceGig | null>(null);
  const [checkoutPackage, setCheckoutPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  // Active Order Workspace overlay (Feature 13)
  const [activeWorkspaceOrder, setActiveWorkspaceOrder] = useState<Order | null>(null);

  // Invoices Receipt overlay (Feature 19)
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  // Order Review State (Feature 17)
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // AI Job Matcher Recommendations states (Feature 6)
  const [matcherJob, setMatcherJob] = useState<JobPost | null>(null);
  const [matchedFreelancers, setMatchedFreelancers] = useState<any[]>([]);
  const [matchingInProgress, setMatchingInProgress] = useState(false);

  // Custom Job Post inputs (Feature 5)
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobBudget, setJobBudget] = useState(150);
  const [jobCategory, setJobCategory] = useState<FreelanceGig['category']>('TikTok');
  const [jobDelivery, setJobDelivery] = useState('3 days');
  const [jobSkills, setJobSkills] = useState('Video Editing, Hooks');
  const [postingJob, setPostingJob] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);

  // Proposals tracking per Job (Feature 5)
  const [viewingJobProposals, setViewingJobProposals] = useState<JobPost | null>(null);

  // Mapping subcategories per category
  const subcategoriesMap: Record<string, string[]> = {
    All: [],
    Instagram: ['All', 'IG Growth', 'IG Reels', 'Grid Styling', 'IG Ad Campaigns'],
    TikTok: ['All', 'TikTok Hooks', 'Reels Editing', 'Viral Strategy', 'TikTok Ads'],
    YouTube: ['All', 'Thumbnail Design', 'Video Editing', 'SEO Optimization', 'Long Form Edits'],
    Twitter: ['All', 'Ghostwriting', 'Thread Crafting', 'Audience Growth', 'Ad Copy'],
    Design: ['All', 'Logos', 'Social Graphics', 'Brand Guides', 'UI Mockups'],
    Dev: ['All', 'Web Apps', 'Telegram Bots', 'Smart Contracts', 'Landing Pages'],
    Video: ['All', 'TikTok Reels', 'YouTube Edits', 'Promos', 'Animation'],
    Marketing: ['All', 'SMM Ads', 'SEO Optimization', 'Influencer Outreach', 'Newsletter Management'],
    Writing: ['All', 'Copywriting', 'Scripts', 'Blog Posts', 'Technical Writing'],
    AI: ['All', 'Prompt Eng', 'Model Training', 'AI Avatars', 'Agents Setup']
  };

  // Toggle Favorite
  const toggleFavorite = (gigId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteGigs(prev =>
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
  };

  // Toggle Follow Seller
  const toggleFollowSeller = (sellerId: string) => {
    setFollowedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  // Post dynamic job post
  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDesc.trim()) return;

    setPostingJob(true);
    try {
      await onPostJob({
        title: jobTitle.trim(),
        description: jobDesc.trim(),
        budget: Number(jobBudget),
        category: jobCategory,
        deliveryTime: jobDelivery,
        skills: jobSkills.split(',').map(s => s.trim())
      });
      setJobTitle('');
      setJobDesc('');
      setJobBudget(150);
      setJobSuccess(true);
      setTimeout(() => {
        setJobSuccess(false);
        setActiveTab('my_listings');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setPostingJob(false);
    }
  };

  // Run AI Job Matcher algorithm (Feature 6)
  const runAiJobMatcher = (job: JobPost) => {
    setMatcherJob(job);
    setMatchingInProgress(true);
    setMatchedFreelancers([]);

    // Simulating deep semantic scoring
    setTimeout(() => {
      const candidates = allProfiles.filter(p => p.role === 'seller' || p.skills.length > 0);
      const matches = (candidates.length > 0 ? candidates : allProfiles).map((profile, index) => {
        const scores = [98, 94, 91, 88, 85, 82];
        const matchPct = scores[index % scores.length];
        
        let justification = "Matches requested skills overlap & category.";
        if (job.description.toLowerCase().includes('video') || job.title.toLowerCase().includes('tiktok')) {
          justification = "Has completed 12 similar TikTok editing orders with excellent client sentiment.";
        } else if (job.description.toLowerCase().includes('dev') || job.title.toLowerCase().includes('bot')) {
          justification = "Direct specialist in smart contracts and custom automated API routing nodes.";
        }

        return {
          profile,
          matchPercentage: matchPct,
          justification
        };
      }).slice(0, 5);

      setMatchedFreelancers(matches);
      setMatchingInProgress(false);
    }, 1500);
  };

  // Mock proposals received (Feature 5)
  const getMockProposals = (jobId: string) => {
    return [
      { id: 'prop1', sellerName: 'precious_dev', price: Math.round(110), delivery: '2 days', pitch: 'Hey! I specialize in React + Tailwind setups and can deploy this rapidly. Let\'s get this secured today.', rating: 5 },
      { id: 'prop2', sellerName: 'creative_chidi', price: Math.round(140), delivery: '3 days', pitch: 'Hello. I reviewed your job description and love the scope. I have over 3 years experience editing TikTok/YouTube reels.', rating: 4.9 },
      { id: 'prop3', sellerName: 'amara_marketing', price: Math.round(150), delivery: '4 days', pitch: 'Highly interested. We have designed campaigns for 3 separate startups in Lagos. See my portfolio!', rating: 4.8 }
    ];
  };

  // Paystack checkout callback
  const handlePaystackPaymentSuccess = async (ref: string, amount: number, hasMilestones: boolean, milestoneBreakdown: any[]) => {
    if (!gigToBuy) return;
    try {
      await onBuyGig({
        ...gigToBuy,
        price: amount // override standard gig price with actual package / promo price
      });
      alert('Paystack transaction captured successfully! Order ESCROW locks active.');
      setGigToBuy(null);
      setSelectedGig(null);
      setShowRequirementsPage(false);
      setActiveTab('orders');
    } catch (err) {
      console.error(err);
    }
  };

  // Paystack checkout for proposals
  const handlePaystackProposalSuccess = async (ref: string, amount: number) => {
    if (!viewingJobProposals) return;
    // Simulate order placement
    alert('Proposal payment escrow funded via Paystack!');
    setViewingJobProposals(null);
    setActiveTab('orders');
  };

  // Submit complete order & rating
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrder) return;

    setSubmittingReview(true);
    try {
      await onCompleteOrder(reviewingOrder.id, reviewRating, reviewText.trim());
      setReviewingOrder(null);
      setReviewText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Triggering 1-click Rehire (Feature 18)
  const handleRehireCreator = (order: Order) => {
    const matchedGig = allGigs.find(g => g.id === order.gigId);
    if (matchedGig) {
      setGigToBuy(matchedGig);
      setCheckoutPackage('basic');
    } else {
      alert('This specific service gig is no longer active. Let\'s browse alternative profiles.');
    }
  };

  // Internal Order Update Proxy
  const handleUpdateOrderStatusProxy = async (
    orderId: string, 
    newStatus: 'pending' | 'in_escrow' | 'delivered' | 'completed' | 'cancelled' | 'revision_requested' | 'disputed',
    deliverableText?: string
  ) => {
    if (onUpdateOrderStatus) {
      await onUpdateOrderStatus(orderId, newStatus, deliverableText);
    } else {
      // Direct complete if onCompleteOrder is standard fallback
      if (newStatus === 'completed') {
        const orderToComplete = myOrders.find(o => o.id === orderId);
        if (orderToComplete) {
          setReviewingOrder(orderToComplete);
        }
      }
    }
  };

  // Filters application
  const filteredGigs = allGigs.filter(gig => {
    // 1. Category Filter
    const matchesCategory = selectedCategory === ('All' as any) || gig.category === selectedCategory;
    
    // 2. Subcategory Filter
    const matchesSubcat = selectedSubcategory === 'All' || gig.tags.some(t => t.toLowerCase() === selectedSubcategory.toLowerCase());
    
    // 3. Search Query
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gig.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 4. Budget Filters
    const min = filterMinBudget !== '' ? Number(filterMinBudget) : 0;
    const max = filterMaxBudget !== '' ? Number(filterMaxBudget) : Infinity;
    const matchesBudget = gig.price >= min && gig.price <= max;

    // 5. Delivery Speeds
    let matchesDelivery = true;
    if (filterDelivery !== 'all') {
      const days = parseInt(gig.deliveryTime);
      if (filterDelivery === '3') matchesDelivery = days <= 3;
      if (filterDelivery === '7') matchesDelivery = days <= 7;
      if (filterDelivery === '14') matchesDelivery = days <= 14;
    }

    // 6. Language & Level & Verification (Mocks)
    let matchesLanguage = true;
    if (filterLanguage !== 'all') {
      matchesLanguage = gig.tags.some(t => t.toLowerCase() === filterLanguage.toLowerCase()) || gig.description.toLowerCase().includes(filterLanguage.toLowerCase());
    }

    let matchesLevel = true;
    if (filterSellerLevel !== 'all') {
      const isTop = filterSellerLevel === 'Top Rated' && gig.rating >= 4.9 && gig.reviewsCount > 10;
      const isLevel2 = filterSellerLevel === 'Level 2' && gig.reviewsCount > 5;
      matchesLevel = filterSellerLevel === 'all' || isTop || isLevel2 || filterSellerLevel === 'New Seller';
    }

    const matchesAiVerified = !filterAiVerifiedOnly || gig.rating >= 4.9;

    // 7. Favorites only
    const matchesFavorites = !showFavoritesOnly || favoriteGigs.includes(gig.id);

    return matchesCategory && matchesSubcat && matchesSearch && matchesBudget && matchesDelivery && matchesLanguage && matchesLevel && matchesAiVerified && matchesFavorites;
  });

  return (
    <div className="space-y-6 text-left select-text">
      {/* Header Tabs Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'browse', label: 'Browse Talent & Services' },
            { id: 'post_job', label: 'Post a Job brief' },
            { id: 'my_listings', label: 'My Posted Briefs' },
            { id: 'orders', label: `Active Escrows (${myOrders.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedGig(null);
                setShowRequirementsPage(false);
              }}
              className={`pb-3 text-xs font-mono uppercase tracking-wider font-black border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id && !selectedGig && !showRequirementsPage
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Saved Favorites quick filter switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showFavoritesOnly
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-black'
                : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={10} className={showFavoritesOnly ? 'fill-rose-400' : ''} />
            <span>My Favorites ({favoriteGigs.length})</span>
          </button>
        </div>
      </div>

      {/* RENDER SECTIONS */}

      {/* VIEW A: BROWSE GIG SERVICES */}
      {activeTab === 'browse' && !selectedGig && !showRequirementsPage && (
        <div className="space-y-6">
          {/* Categories Horizontal Scrolling bar (Feature 2) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-thin">
            {([
              'All', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Design', 'Dev', 'Video', 'Marketing', 'Writing', 'AI'
            ] as const).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory('All');
                }}
                className={`px-4 py-2 rounded-2xl text-[10px] font-mono font-bold border cursor-pointer transition-all uppercase tracking-wide whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 text-slate-400 border-slate-850 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Subcategories Grid Row (Feature 2) */}
          {selectedCategory && subcategoriesMap[selectedCategory]?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/30 p-2 border border-slate-850/60 rounded-2xl">
              <span className="text-[9px] font-mono text-slate-500 font-black uppercase tracking-wider pl-1 shrink-0">Subcat:</span>
              {subcategoriesMap[selectedCategory].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1 rounded-xl text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    selectedSubcategory === sub
                      ? 'bg-slate-800 text-cyan-400 border border-slate-750 font-black'
                      : 'bg-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Search, Discovery and Filters Panel (Feature 1) */}
          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Field */}
              <div className="relative w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search creators, skills, 'TikTok edit', 'Brand guidelines'..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-2xl outline-none focus:border-cyan-400 text-xs text-white"
                />
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 w-full md:w-auto ${
                  showFilters || filterMinBudget || filterMaxBudget || filterDelivery !== 'all' || filterAiVerifiedOnly
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Advanced Filters</span>
              </button>
            </div>

            {/* Filters Expansion panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t border-slate-900 overflow-hidden"
                >
                  {/* Budget Inputs */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 font-bold block uppercase">Budget Range</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filterMinBudget}
                        onChange={e => setFilterMinBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <span className="text-slate-600">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filterMaxBudget}
                        onChange={e => setFilterMaxBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Delivery Speeds */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 font-bold block uppercase">Delivery Time</label>
                    <select
                      value={filterDelivery}
                      onChange={e => setFilterDelivery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="all">Any Speed</option>
                      <option value="3">3 Days or less</option>
                      <option value="7">1 Week or less</option>
                      <option value="14">2 Weeks or less</option>
                    </select>
                  </div>

                  {/* Languages Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 font-bold block uppercase">Spoken Language</label>
                    <select
                      value={filterLanguage}
                      onChange={e => setFilterLanguage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="all">Any Language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Yoruba">Yoruba</option>
                      <option value="Hausa">Hausa</option>
                    </select>
                  </div>

                  {/* Seller Level selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 font-bold block uppercase">Seller Level</label>
                    <select
                      value={filterSellerLevel}
                      onChange={e => setFilterSellerLevel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="all">Any Level</option>
                      <option value="New Seller">New Seller</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Top Rated">Top Rated</option>
                    </select>
                  </div>

                  {/* AI-Verified switch */}
                  <div className="flex flex-col justify-center text-left">
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase block mb-1">Verify Status</span>
                    <button
                      type="button"
                      onClick={() => setFilterAiVerifiedOnly(!filterAiVerifiedOnly)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border text-left flex items-center justify-between cursor-pointer ${
                        filterAiVerifiedOnly
                          ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-400'
                      }`}
                    >
                      <span>AI-Verified Only</span>
                      <Sparkles size={11} className={filterAiVerifiedOnly ? 'text-emerald-400 animate-pulse' : ''} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gigs Directory Grid (Feature 3) */}
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map(gig => {
                const isFavorited = favoriteGigs.includes(gig.id);
                // Check if verified
                const isVerified = gig.rating >= 4.9 && gig.reviewsCount > 3;

                return (
                  <motion.div
                    key={gig.id}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setSelectedGig(gig);
                      setActivePackage('basic');
                    }}
                    className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group transition-all relative shadow-lg"
                  >
                    {/* Cover image placeholder */}
                    <div className="h-44 bg-slate-900 relative">
                      <img
                        src={gig.mediaURL || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop'}
                        alt={gig.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      
                      {/* Favorite trigger (Feature 16) */}
                      <button
                        onClick={(e) => toggleFavorite(gig.id, e)}
                        className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full border border-slate-800 text-white cursor-pointer transition-colors"
                      >
                        <Heart size={14} className={isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                      </button>

                      {/* Category Label */}
                      <span className="absolute bottom-3 left-3 text-[8px] font-mono font-bold bg-slate-950/90 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded-md uppercase">
                        {gig.category}
                      </span>
                    </div>

                    {/* Details content */}
                    <div className="p-5 space-y-3 text-left">
                      {/* Seller Profile block (Feature 4) */}
                      <div 
                        className="flex items-center gap-2 group/seller"
                        onClick={(e) => {
                          e.stopPropagation();
                          const profile = allProfiles.find(p => p.id === gig.sellerId) || {
                            id: gig.sellerId,
                            fullName: gig.sellerName,
                            bio: 'Sovereign platform creator specializing in digital campaign management and hooks delivery.',
                            avatarURL: gig.sellerAvatar,
                            skills: ['Design', 'Copywriting', 'Video Editing'],
                            role: 'seller'
                          } as UserProfile;
                          setViewingSeller(profile);
                        }}
                      >
                        <img
                          src={gig.sellerAvatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover border border-slate-800"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-400 hover:text-cyan-400">@{gig.sellerName}</span>
                        <span className="text-[8px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                          {gig.rating >= 4.9 ? 'Top Rated' : 'Lvl 1'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white leading-normal line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {gig.title}
                      </h3>

                      {/* AI-Verified sparkly badge & reviews (Feature 3) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                          <Star size={11} className="fill-amber-400" />
                          <span className="font-extrabold">{gig.rating}</span>
                          <span className="text-slate-500">({gig.reviewsCount})</span>
                        </div>

                        {isVerified && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <Sparkles size={9} />
                            <span>AI-VERIFIED</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="px-5 py-3.5 bg-slate-900/30 border-t border-slate-900 flex justify-between items-center text-xs font-mono">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {gig.deliveryTime} delivery
                      </span>
                      <span className="text-cyan-400 font-extrabold text-sm">
                        From ${gig.price}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-850 rounded-3xl flex flex-col items-center justify-center">
              <AlertCircle size={24} className="text-slate-500" />
              <p className="text-xs text-slate-400 font-mono mt-3">No matching service packages found.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All' as any);
                  setSelectedSubcategory('All');
                  setSearchQuery('');
                  setFilterMinBudget('');
                  setFilterMaxBudget('');
                  setFilterDelivery('all');
                  setFilterAiVerifiedOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-black text-xs rounded-xl cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: INDIVIDUAL GIG DETAIL WITH PACKAGE SELECTOR (Feature 7) */}
      {selectedGig && !showRequirementsPage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setSelectedGig(null)}
            className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to services catalog
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Gig Info */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-850 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded uppercase">
                  {selectedGig.category} Service
                </span>
                <span className="text-[10px] font-mono text-slate-500">• {selectedGig.deliveryTime} delivery speed</span>
              </div>

              <h1 className="text-xl md:text-2xl font-display font-black text-white leading-snug">
                {selectedGig.title}
              </h1>

              {/* Cover visual placeholder */}
              <div className="h-64 w-full bg-slate-900 rounded-2xl overflow-hidden">
                <img
                  src={selectedGig.mediaURL || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-left">
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Service Scope Overview</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedGig.description || 'Vetted professional contract brief covering audience acceleration strategy, custom design formatting, and analytics optimization.'}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedGig.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-850 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing Packages Matrix Sidebar (Feature 7) */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
              {/* Package selection headers */}
              <div className="grid grid-cols-3 bg-slate-900/60 border-b border-slate-850 shrink-0">
                {(['basic', 'standard', 'premium'] as const).map(pkg => (
                  <button
                    key={pkg}
                    onClick={() => setActivePackage(pkg)}
                    className={`py-3 text-[10px] font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                      activePackage === pkg
                        ? 'border-cyan-400 text-cyan-400 bg-slate-950 font-black'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>

              {/* Package breakdown */}
              <div className="p-5 space-y-5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-mono text-cyan-400 font-extrabold">
                    ${activePackage === 'basic' ? selectedGig.price : activePackage === 'standard' ? Math.round(selectedGig.price * 1.8) : Math.round(selectedGig.price * 3.2)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Secure Escrow Lock</span>
                </div>

                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-white capitalize">{activePackage} Package scope</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {activePackage === 'basic' && 'Standard audience alignment content pack. Includes 1 standard draft deliverable and core revisional safety.'}
                    {activePackage === 'standard' && 'Comprehensive branding upgrade. Includes 3 separate design drafts, custom high-res formats, source files, and SEO alignment.'}
                    {activePackage === 'premium' && 'The complete sovereign social solution. Unlimited design revisions, prioritized delivery speed, full commercial rights, source files, and 24/7 priority channel support.'}
                  </p>

                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Delivery Target:</span>
                      <span className="text-white font-bold">{activePackage === 'basic' ? selectedGig.deliveryTime : activePackage === 'standard' ? '2 days' : '1 day'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revisions Allowed:</span>
                      <span className="text-white font-bold">{activePackage === 'basic' ? '1 Revision' : activePackage === 'standard' ? '3 Revisions' : 'Unlimited'}</span>
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => setShowRequirementsPage(true)}
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  Configure Order Requirements
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW C: REQUIREMENTS FORM & ESCROW SELECTION (Feature 8) */}
      {showRequirementsPage && selectedGig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl bg-slate-950 border border-slate-850 p-6 md:p-8 rounded-3xl space-y-6 mx-auto"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <div>
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Step 2: Order Page Requirements</span>
              <h2 className="text-sm font-bold text-white uppercase mt-0.5">Submit Creative Guidelines</h2>
            </div>
            <button
              onClick={() => setShowRequirementsPage(false)}
              className="text-xs font-mono text-slate-500 hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!orderRequirements.trim()) return;
              setGigToBuy(selectedGig);
              setCheckoutPackage(activePackage);
            }}
            className="space-y-4 text-left"
          >
            {/* Choosen Recap */}
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl text-xs font-mono flex justify-between">
              <div>
                <span className="text-slate-500 uppercase">Selected Service:</span>
                <strong className="text-white block truncate max-w-[220px] mt-0.5">{selectedGig.title}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase">Pricing:</span>
                <strong className="text-cyan-400 block text-sm font-extrabold mt-0.5">
                  ${activePackage === 'basic' ? selectedGig.price : activePackage === 'standard' ? Math.round(selectedGig.price * 1.8) : Math.round(selectedGig.price * 3.2)}
                </strong>
              </div>
            </div>

            {/* Guidelines guidelines input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Guidance & Project Brief</label>
              <textarea
                required
                value={orderRequirements}
                onChange={e => setOrderRequirements(e.target.value)}
                placeholder="Submit your URLs, reference design directions, hook phrases, color parameters, or specific formats..."
                className="w-full h-32 bg-slate-900 border border-slate-850 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-400 font-sans resize-none"
              />
            </div>

            {/* Custom mock files uploader */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Reference Media & Assets</label>
              <div className="p-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl text-center space-y-2 cursor-pointer hover:border-slate-700 transition-colors">
                <Plus className="mx-auto text-slate-500" size={16} />
                <span className="text-[10px] font-mono text-slate-400 block font-bold">DRAG & DROP REFERENCE FILES HERE</span>
                <span className="text-[8px] text-slate-500 block">Maximum file upload size limit: 25MB (ZIP, PNG, MP4, PDF)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              Proceed to Secure Paystack Checkout
            </button>
          </form>
        </motion.div>
      )}

      {/* VIEW D: POST A CUSTOM JOB BRIEF - UPWORK STYLE (Feature 5) */}
      {activeTab === 'post_job' && (
        <div className="max-w-xl bg-slate-950 border border-slate-850 p-6 md:p-8 rounded-3xl space-y-6 mx-auto">
          <div className="space-y-1">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Post Custom Requirement brief</h2>
            <p className="text-xs text-slate-400 leading-relaxed">Specify platform guidelines, required competencies, and set budget thresholds. Certified freelancers willpitch you with competitive proposals.</p>
          </div>

          {jobSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 font-mono">
              🎉 Job brief dispatched successfully! Freelancers are building proposals.
            </div>
          )}

          <form onSubmit={handlePostJobSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Brief Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Need 5 aesthetic TikTok edits with subtitles for SaaS app"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Category Focus</label>
                <select
                  value={jobCategory}
                  onChange={e => setJobCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Budget Allocation ($ USD)</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={jobBudget}
                  onChange={e => setJobBudget(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Detailed Guidelines & Project brief</label>
              <textarea
                required
                placeholder="Describe details, required dimensions, competitor styles, files, and deliverables."
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                className="w-full h-32 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-400 font-sans resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Required Competencies</label>
                <input
                  type="text"
                  placeholder="Video editing, CapCut, Scripts"
                  value={jobSkills}
                  onChange={e => setJobSkills(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-slate-300 uppercase block">Target Delivery Speed</label>
                <input
                  type="text"
                  placeholder="3 days, 1 week"
                  value={jobDelivery}
                  onChange={e => setJobDelivery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={postingJob}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {postingJob ? 'Broadcasting Brief...' : 'Publish Project Brief 🚀'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW E: MY LISTED BRIEFS WITH INTERACTIVE PROPOSALS & AI MATCHER (Feature 5, 6) */}
      {activeTab === 'my_listings' && (
        <div className="space-y-6">
          <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">My Active Brief Listings</h2>
          {myPostedJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Briefs List */}
              <div className="lg:col-span-7 space-y-4">
                {myPostedJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="p-5 bg-slate-950 border border-slate-850 rounded-3xl space-y-3 relative text-left shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                          {job.category} Category
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5">{job.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-cyan-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                        ${job.budget}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-900">
                      <span>Timeline: {job.deliveryTime}</span>
                      <span>Proposals: 3 Received</span>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => runAiJobMatcher(job)}
                        className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white font-mono font-bold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Sparkles size={11} /> Run AI Job Matcher
                      </button>
                      <button
                        onClick={() => setViewingJobProposals(job)}
                        className="flex-1 py-2 bg-slate-900 border border-slate-800 text-white font-mono font-bold text-[10px] uppercase rounded-xl hover:border-slate-700 cursor-pointer"
                      >
                        Review Pitches (3)
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side Overlay: AI Job Matcher Recommendations list */}
              <div className="lg:col-span-5 space-y-4">
                {matcherJob && (
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-400" />
                        <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">AI Top Creator Recommendations</h4>
                      </div>
                      <button onClick={() => setMatcherJob(null)} className="text-slate-500 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>

                    {matchingInProgress ? (
                      <div className="text-center py-12 space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Running semantic overlap index...</p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-left">
                        {matchedFreelancers.map((match, idx) => (
                          <div key={idx} className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <img src={match.profile.avatarURL} alt="" className="w-5 h-5 rounded-full bg-slate-800" />
                                <strong className="text-xs text-white">@{match.profile.fullName}</strong>
                              </div>
                              <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                                {match.matchPercentage}% Match
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal font-mono">
                              <strong>Overlap Reason:</strong> {match.justification}
                            </p>
                            <button
                              onClick={() => {
                                setGigToBuy({
                                  id: 'gig_matched',
                                  sellerId: match.profile.id,
                                  sellerName: match.profile.fullName,
                                  sellerAvatar: match.profile.avatarURL,
                                  title: `Matched Delivery for: ${matcherJob.title}`,
                                  description: matcherJob.description,
                                  price: matcherJob.budget,
                                  category: matcherJob.category,
                                  deliveryTime: matcherJob.deliveryTime,
                                  mediaURL: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=400&auto=format&fit=crop',
                                  tags: ['AI-Matched'],
                                  rating: 5,
                                  reviewsCount: 14
                                });
                                setCheckoutPackage('basic');
                              }}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              Hire Creator Instantly
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Direct proposals selection list */}
                {viewingJobProposals && (
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-4 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Freelancer Pitches</h4>
                      <button onClick={() => setViewingJobProposals(null)} className="text-slate-500 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {getMockProposals(viewingJobProposals.id).map(prop => (
                        <div key={prop.id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="font-bold text-white">@{prop.sellerName}</span>
                            <span className="text-cyan-400 font-extrabold">${prop.price}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic font-mono leading-relaxed">
                            "{prop.pitch}"
                          </p>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                            <span className="text-[9px] font-mono text-slate-500">Speed: {prop.delivery}</span>
                            <button
                              onClick={() => {
                                setGigToBuy({
                                  id: 'gig_prop_' + prop.id,
                                  sellerId: 'seller_' + prop.sellerName,
                                  sellerName: prop.sellerName,
                                  sellerAvatar: 'https://api.dicebear.com/7.x/identicon/svg',
                                  title: `Proposal Accepted: ${viewingJobProposals.title}`,
                                  description: viewingJobProposals.description,
                                  price: prop.price,
                                  category: viewingJobProposals.category,
                                  deliveryTime: prop.delivery,
                                  mediaURL: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
                                  tags: ['Proposal'],
                                  rating: prop.rating,
                                  reviewsCount: 12
                                });
                                setCheckoutPackage('basic');
                              }}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[9px] uppercase rounded-lg cursor-pointer"
                            >
                              Accept & Fund Escrow
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-850 rounded-3xl">
              <Plus className="mx-auto text-slate-500 mb-2" size={24} />
              <p className="text-xs text-slate-400 font-mono">No briefs listed yet.</p>
              <button
                onClick={() => setActiveTab('post_job')}
                className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-black text-xs rounded-xl cursor-pointer"
              >
                Post Your First Brief
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW F: ACTIVE ESCROW CONTRACTS (Feature 13) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Unified Paystack Escrow Payment Overview Widget */}
          <PaymentOverviewWidget orders={myOrders} role="buyer" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Escrow Contract Rows */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Active Secure Contracts ledger</h2>
              
              {myOrders.length > 0 ? (
                <div className="space-y-3">
                  {myOrders.map(order => {
                    const isCompleted = order.status === 'completed';
                    return (
                      <div
                        key={order.id}
                        className="p-5 bg-slate-950 border border-slate-850 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md text-left"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
                              {order.gigCategory} Focus
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">• Vetted Freelancer: @{order.sellerName}</span>
                          </div>

                          <h3 className="text-xs font-bold text-white leading-normal">{order.gigTitle}</h3>

                          {order.deliverableText && (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-[11px] text-emerald-300">
                              <span className="font-bold text-[9px] font-mono uppercase tracking-widest block text-emerald-400">Freelancer Submitted Deliverable</span>
                              <p className="italic mt-0.5">"{order.deliverableText}"</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                            <span className="font-extrabold text-white">Amt: ${order.price}</span>
                            <span>Target Delivery: {order.deliveryDate}</span>
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                order.status === 'completed' ? 'bg-emerald-400' :
                                order.status === 'delivered' ? 'bg-purple-400 animate-pulse' : 
                                order.status === 'disputed' ? 'bg-rose-500' : 'bg-yellow-400'
                              }`} />
                              <span className="capitalize">{order.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                        </div>

                        {/* Management Buttons */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center w-full md:w-auto">
                          {isCompleted ? (
                            <>
                              <button
                                onClick={() => setViewingInvoiceOrder(order)}
                                className="flex-1 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer hover:border-slate-700"
                              >
                                View Invoice Receipt
                              </button>
                              <button
                                onClick={() => handleRehireCreator(order)}
                                className="flex-1 py-2 px-3 bg-cyan-400 text-black font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                              >
                                Rehire Seller
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setActiveWorkspaceOrder(order)}
                                className="flex-1 py-2.5 px-3 bg-cyan-400 text-black font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                              >
                                Open Contract Desk
                              </button>
                              {order.status === 'delivered' && (
                                <button
                                  onClick={() => setReviewingOrder(order)}
                                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                                >
                                  Approve & Review
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-850 rounded-3xl flex flex-col items-center justify-center">
                  <Shield size={24} className="text-slate-500 animate-pulse" />
                  <p className="text-xs text-slate-400 font-mono mt-3">No active escrows locked.</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-black text-xs rounded-xl cursor-pointer"
                  >
                    Browse Services Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Mini Guidelines Ledger Card */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-4 text-left">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-900">
                <Shield size={14} className="text-emerald-400" />
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Escrow Safety Node</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-mono">
                All transactions are captured via Paystack. Funds are locked in intermediate secure multi-sig vaults and are released directly to developers only upon project handover.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paystack Secure API Link.
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Dynamic Milestone Invoicing.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY COMPONENTS (MODULARS) */}

      {/* 1. SELLER PROFILES (Feature 4 & 16) */}
      {viewingSeller && (
        <SellerProfileModal
          isOpen={!!viewingSeller}
          onClose={() => setViewingSeller(null)}
          seller={viewingSeller}
          isFollowing={followedSellers.includes(viewingSeller.id)}
          onToggleFollow={toggleFollowSeller}
          sellerGigs={allGigs.filter(g => g.sellerId === viewingSeller.id)}
          onSelectGig={(gig) => {
            setSelectedGig(gig);
            setActivePackage('basic');
          }}
        />
      )}

      {/* 2. PAYSTACK CHECKOUT (Feature 9, 10, 11) */}
      {gigToBuy && (
        <PaystackCheckoutModal
          isOpen={!!gigToBuy}
          onClose={() => setGigToBuy(null)}
          gig={gigToBuy}
          selectedPackage={checkoutPackage}
          buyerEmail={myProfile?.fullName ? `${myProfile.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'buyer@chidon.iq'}
          onPaymentSuccess={handlePaystackPaymentSuccess}
        />
      )}

      {/* 3. ORDER HISTORY & INVOICES (Feature 19) */}
      {viewingInvoiceOrder && (
        <InvoiceReceiptModal
          isOpen={!!viewingInvoiceOrder}
          onClose={() => setViewingInvoiceOrder(null)}
          order={viewingInvoiceOrder}
          buyerProfile={myProfile}
        />
      )}

      {/* 4. ACTIVE WORKSPACE DESK (Feature 12, 13, 14, 15) */}
      {activeWorkspaceOrder && (
        <OrderWorkspaceDesk
          isOpen={!!activeWorkspaceOrder}
          onClose={() => setActiveWorkspaceOrder(null)}
          order={activeWorkspaceOrder}
          chatMessages={chatMessages}
          myProfile={myProfile}
          onSendMessage={onSendMessage}
          onCompleteAndReview={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onUpdateOrderStatus={handleUpdateOrderStatusProxy}
        />
      )}

      {/* 5. REVIEW AND RATING MODAL (Feature 17) */}
      {reviewingOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-5 relative text-left shadow-2xl"
          >
            <button
              onClick={() => setReviewingOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase">Approve Deliverable & Rate Creator</h3>
              <p className="text-xs text-slate-400 leading-normal">Escrow locked funds are released immediately upon approval. Please write verified client feedback to conclude this contract.</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Assign Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = star <= reviewRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star size={24} className={isFilled ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Short Review Review Commentary</label>
                <textarea
                  required
                  placeholder="Share details on communication quality, delivery speed, and asset efficiency..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full h-24 bg-slate-900 border border-slate-850 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-400 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3.5 bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 cursor-pointer transition-all shadow-lg"
              >
                {submittingReview ? 'Releasing Funds Vault...' : 'Submit Rating & Release Escrow 🚀'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
