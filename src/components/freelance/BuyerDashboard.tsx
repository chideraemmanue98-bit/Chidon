import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Plus, Shield, ShoppingBag, MessageSquare, 
  User, Check, ChevronRight, MessageCircle, Star, ThumbsUp, Send, 
  DollarSign, Clock, AlertCircle, Trash2, Heart, ExternalLink, X 
} from 'lucide-react';
import { FreelanceGig, JobPost, Order, ChatMessage, UserProfile } from './types';

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
  onSwitchToSeller
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post_job' | 'my_listings' | 'orders'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter'>('All');
  
  // Custom job post form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobBudget, setJobBudget] = useState(150);
  const [jobCategory, setJobCategory] = useState<'Instagram' | 'TikTok' | 'YouTube' | 'Twitter'>('TikTok');
  const [jobDelivery, setJobDelivery] = useState('3 days');
  const [postingJob, setPostingJob] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);

  // Active gig viewing & Paystack checkout state
  const [selectedGig, setSelectedGig] = useState<FreelanceGig | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<FreelanceGig | null>(null);
  const [payingWithPaystack, setPayingWithPaystack] = useState(false);
  const [paystackEmail, setPaystackEmail] = useState(myProfile?.fullName ? `${myProfile.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'buyer@chidon.iq');
  const [paystackPhone, setPaystackPhone] = useState('08123456789');
  const [paystackSuccess, setPaystackSuccess] = useState(false);

  // Active chat/order messaging
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Order Review State
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Filter Gigs based on search + category
  const filteredGigs = allGigs.filter(gig => {
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gig.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
        deliveryTime: jobDelivery
      });
      setJobTitle('');
      setJobDesc('');
      setJobBudget(150);
      setJobSuccess(true);
      setTimeout(() => {
        setJobSuccess(false);
        setActiveTab('my_listings');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setPostingJob(false);
    }
  };

  const triggerPaystackCheckout = async (gig: FreelanceGig) => {
    setPayingWithPaystack(true);
    
    // Simulating Paystack gateway response callback
    setTimeout(async () => {
      try {
        await onBuyGig(gig);
        setPaystackSuccess(true);
        setTimeout(() => {
          setPaystackSuccess(false);
          setShowCheckoutModal(null);
          setSelectedGig(null);
          setActiveTab('orders');
        }, 1500);
      } catch (err) {
        console.error(err);
      } finally {
        setPayingWithPaystack(false);
      }
    }, 2000);
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

  const handleCompleteAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;

    setSubmittingReview(true);
    try {
      await onCompleteOrder(reviewOrderId, reviewRating, reviewText.trim());
      setReviewOrderId(null);
      setReviewText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Search & Tabs control navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-4">
          {[
            { id: 'browse', label: 'Browse Services' },
            { id: 'post_job', label: 'Post custom brief' },
            { id: 'my_listings', label: 'My Posted Briefs' },
            { id: 'orders', label: `Active Escrows (${myOrders.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`tab-buyer-${tab.id}`}
              className={`pb-3 text-xs font-mono uppercase tracking-wider font-black border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                id={`cat-buyer-${cat.toLowerCase()}`}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RENDER SECTIONS */}
      {activeTab === 'browse' && !selectedGig && (
        <div className="space-y-6">
          {/* Headline and search box */}
          <div className="p-6 bg-gradient-to-r from-cyan-950/20 via-slate-950 to-indigo-950/20 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-display font-black text-white">Find Elite Social Media Creators</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">Instantly hire vetted freelancers specializing in organic audience acceleration, visual hooks, and copywriting.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search 'TikTok edit' or 'IG Growth'..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="input-buyer-search"
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:border-cyan-400 text-xs text-white font-sans"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            </div>
          </div>

          {/* Gigs Grid */}
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map(gig => (
                <motion.div
                  key={gig.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedGig(gig)}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group transition-all"
                  id={`gig-card-${gig.id}`}
                >
                  {/* Gig Visual Cover */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={gig.mediaURL}
                      alt={gig.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 text-[9px] font-mono font-bold bg-black/80 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
                      {gig.category}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-5 space-y-3.5">
                    {/* Seller details */}
                    <div className="flex items-center gap-2">
                      <img
                        src={gig.sellerAvatar}
                        alt={gig.sellerName}
                        className="w-5 h-5 rounded-full bg-slate-800"
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-400">@{gig.sellerName}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {gig.title}
                    </h3>

                    {/* Ratings and count */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-bold">{gig.rating}</span>
                      <span>({gig.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  {/* Bottom strip */}
                  <div className="px-5 py-3 bg-slate-900/40 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {gig.deliveryTime}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-extrabold">
                      From ${gig.price}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center col-span-full">
              <AlertCircle size={24} className="text-slate-500" />
              <p className="text-sm text-slate-400 font-mono mt-3">No gigs found</p>
              {onSwitchToSeller && (
                <button
                  onClick={onSwitchToSeller}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-black text-xs rounded-xl cursor-pointer transition-all"
                >
                  Create Your First Gig
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* INDIVIDUAL GIG PAGE DETAIL VIEW */}
      {selectedGig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setSelectedGig(null)}
            className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to all services
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Core Details */}
            <div className="lg:col-span-8 bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-6">
              {/* Category & Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedGig.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">• {selectedGig.deliveryTime} delivery</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-display font-black text-white leading-snug">
                {selectedGig.title}
              </h1>

              {/* Seller Profiling */}
              <div className="flex items-center gap-3 py-3 border-y border-slate-800/80">
                <img
                  src={selectedGig.sellerAvatar}
                  alt={selectedGig.sellerName}
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
                />
                <div>
                  <span className="text-sm font-extrabold text-white block">@{selectedGig.sellerName}</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-bold">{selectedGig.rating}</span>
                    <span>({selectedGig.reviewsCount} verified deals completed)</span>
                  </div>
                </div>
              </div>

              {/* Visual Cover image */}
              <div className="h-80 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <img
                  src={selectedGig.mediaURL}
                  alt={selectedGig.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Scope Description */}
              <div className="space-y-2.5 text-slate-300 text-xs md:text-sm leading-relaxed">
                <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Service Scope Overview</h3>
                <p className="whitespace-pre-wrap">{selectedGig.description}</p>
              </div>

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedGig.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Buying sidebar */}
            <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-extrabold text-slate-400 uppercase">Package Price</span>
                  <span className="text-2xl font-mono text-cyan-400 font-extrabold">${selectedGig.price}</span>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                    <Clock size={13} className="text-cyan-400" />
                    <span>{selectedGig.deliveryTime} Express Delivery</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">Vetted premium social media asset delivered straight into your Escrow storage board. Complete revision safety included.</p>
                </div>
              </div>

              {/* Buy/Checkout button */}
              <button
                onClick={() => setShowCheckoutModal(selectedGig)}
                id="btn-buyer-order-service"
                className="w-full py-4 bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <span>Order Service Now</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Shield size={12} className="text-emerald-500" />
                <span>Escrow Guarantee Protection Linked</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* POST A CUSTOM JOB BRIEF */}
      {activeTab === 'post_job' && (
        <div className="max-w-xl bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase">Post custom requirement</h2>
            <p className="text-xs text-slate-400">Describe exactly what social content you require, and sellers will pitch you with proposals.</p>
          </div>

          {jobSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              🎉 Requirement dispatched to the global marketplace successfully!
            </div>
          )}

          <form onSubmit={handlePostJobSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Need 10 TikTok edits for SaaS tool launching soon"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                id="input-postjob-title"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Platform Tag</label>
                <select
                  value={jobCategory}
                  onChange={e => setJobCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Budget (USD)</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={jobBudget}
                  onChange={e => setJobBudget(parseInt(e.target.value))}
                  id="input-postjob-budget"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Detailed Brief & Scope</label>
              <textarea
                required
                placeholder="Describe details, required dimensions, tone, views target, reference links, and milestones."
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                id="textarea-postjob-desc"
                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-sans resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-extrabold text-slate-300 uppercase block">Target Timeline</label>
              <input
                type="text"
                placeholder="e.g. 5 days, 1 week"
                value={jobDelivery}
                onChange={e => setJobDelivery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={postingJob}
              id="btn-postjob-submit"
              className="w-full py-3 bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-all cursor-pointer disabled:opacity-50"
            >
              {postingJob ? 'Broadcasting Requirements...' : 'Publish Job Brief 🚀'}
            </button>
          </form>
        </div>
      )}

      {/* MY POSTED BRIEFS */}
      {activeTab === 'my_listings' && (
        <div className="space-y-4">
          <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">My Active Requirements</h2>
          {myPostedJobs.length > 0 ? (
            <div className="space-y-3.5">
              {myPostedJobs.map(job => (
                <div key={job.id} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md uppercase">
                      {job.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{job.description}</p>
                    <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                      <span>Timeline: {job.deliveryTime}</span>
                      <span>Budget: ${job.budget}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    Active Contract
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
              <AlertCircle size={20} className="mx-auto text-slate-500" />
              <p className="text-xs text-slate-400 font-mono mt-2">No active requirements posted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE ESCROW DEALS (ORDERS) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Escrows List */}
            <div className="flex-1 space-y-4">
              <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Active Secure Contracts</h2>
              {myOrders.length > 0 ? (
                <div className="space-y-3.5">
                  {myOrders.map(order => {
                    const isSelected = selectedOrderForChat?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForChat(order)}
                        id={`order-deal-row-${order.id}`}
                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col md:flex-row justify-between gap-4 ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
                              {order.gigCategory}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">• Vetted Freelancer: @{order.sellerName}</span>
                          </div>

                          <h3 className="text-sm font-bold text-white">{order.gigTitle}</h3>
                          
                          {order.deliverableText && (
                            <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-emerald-300">
                              <span className="font-bold text-[9px] font-mono uppercase tracking-widest block text-emerald-400">Freelancer Submitted Deliverable</span>
                              <p className="italic mt-0.5">"{order.deliverableText}"</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-mono text-slate-500 pt-1">
                            <span className="font-bold text-white">Amt: ${order.price}</span>
                            <span>Target: {order.deliveryDate}</span>
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                order.status === 'completed' ? 'bg-emerald-400' :
                                order.status === 'delivered' ? 'bg-purple-400 animate-pulse' : 'bg-yellow-400'
                              }`} />
                              <span className="capitalize">{order.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                        </div>

                        {/* Order management actions */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center w-full md:w-auto">
                          {order.status === 'delivered' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewOrderId(order.id);
                              }}
                              id={`btn-complete-deal-${order.id}`}
                              className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                            >
                              Approve & Release Escrow
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForChat(order)}
                            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg text-center"
                          >
                            Open Chat Thread
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center w-full">
                  <Shield size={24} className="text-slate-500" />
                  <p className="text-sm text-slate-400 font-mono mt-3">No orders yet</p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-black text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Browse Sellers
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Escrow Order Chat */}
            {selectedOrderForChat && (
              <div className="w-full lg:w-96 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[480px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-400">Escrow Chat Thread</h3>
                    <span className="text-sm font-bold text-white block truncate max-w-[200px]">@{selectedOrderForChat.sellerName}</span>
                  </div>
                  <button onClick={() => setSelectedOrderForChat(null)} className="text-slate-500 hover:text-white">
                    <X size={16} />
                  </button>
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
                              ? 'bg-cyan-500 text-black font-medium rounded-tr-none' 
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
                      💬 Post safety, rules, requirements or questions to coordinate your vetted creator.
                    </div>
                  )}
                </div>

                {/* Input field */}
                <form onSubmit={handleSendMessageSubmit} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !newMessageText.trim()}
                    className="px-3 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYSTACK MODAL EMBED GATEWAY OVERLAY */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-text">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-6 relative text-left"
          >
            <button
              onClick={() => setShowCheckoutModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Paystack Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Paystack Escrow System</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">Secure Node</span>
            </div>

            {paystackSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={24} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black text-white">Payment Authorized Successfully</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Escrow lock deployed. Vetted freelancers have been routed to initiate content development immediately.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Gig Overview summary */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{showCheckoutModal.category} Service Package</span>
                  <h3 className="text-sm font-bold text-white leading-snug">{showCheckoutModal.title}</h3>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Amount:</span>
                    <span className="text-cyan-400 font-extrabold">${showCheckoutModal.price}</span>
                  </div>
                </div>

                {/* Simulated paystack fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Billing Email Address</label>
                    <input
                      type="email"
                      value={paystackEmail}
                      onChange={e => setPaystackEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Mobile Number (WhatsApp Link)</label>
                    <input
                      type="tel"
                      value={paystackPhone}
                      onChange={e => setPaystackPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Escrow Disclaimer statement */}
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex gap-2">
                  <Shield size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    <strong>Chidon Escrow Protection:</strong> Money is held securely. Funds will only be processed and released to the creator when you approve final delivered social assets.
                  </p>
                </div>

                <button
                  onClick={() => triggerPaystackCheckout(showCheckoutModal)}
                  disabled={payingWithPaystack || !paystackEmail.trim()}
                  id="btn-confirm-paystack-payment"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {payingWithPaystack ? (
                    <>
                      <span className="animate-pulse">Accessing Paystack Node...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ${showCheckoutModal.price} via Paystack</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* RATING & REVIEW OVERLAY */}
      {reviewOrderId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-5 relative text-left"
          >
            <button
              onClick={() => setReviewOrderId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase">Approve Work & Rate Creator</h3>
              <p className="text-xs text-slate-400">Releasing Escrow locked funds. Leave a review to conclude this contract.</p>
            </div>

            <form onSubmit={handleCompleteAndReview} className="space-y-4">
              {/* Star scale */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Assign Rating Stars</label>
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
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Short Review & Feedback</label>
                <textarea
                  required
                  placeholder="Tell others how satisfied you are with the final delivery..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                id="btn-complete-rating-submit"
                className="w-full py-3 bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 cursor-pointer transition-all"
              >
                {submittingReview ? 'Processing Escrow Release...' : 'Submit Review & Release Payout 🚀'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
