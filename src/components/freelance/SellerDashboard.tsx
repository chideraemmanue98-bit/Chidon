import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Briefcase, DollarSign, Clock, Shield, 
  CheckCircle2, MessageSquare, PlusCircle, AlertCircle, Edit2, Trash2, 
  Eye, FileText, Send, X, ArrowUpRight, Check 
} from 'lucide-react';
import { FreelanceGig, Order, ChatMessage, UserProfile } from './types';

interface SellerDashboardProps {
  myProfile: UserProfile | null;
  allGigs: FreelanceGig[];
  myOrders: Order[];
  onCreateGig: (gigData: any) => Promise<void>;
  onDeleteGig: (gigId: string) => Promise<void>;
  onDeliverWork: (orderId: string, deliverableText: string) => Promise<void>;
  onSendMessage: (orderId: string, text: string) => Promise<void>;
  chatMessages: ChatMessage[];
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  myProfile,
  allGigs,
  myOrders,
  onCreateGig,
  onDeleteGig,
  onDeliverWork,
  onSendMessage,
  chatMessages
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gigs' | 'orders'>('overview');

  // New Gig Form states
  const [showCreateGigModal, setShowCreateGigModal] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDesc, setGigDesc] = useState('');
  const [gigPrice, setGigPrice] = useState(150);
  const [gigCategory, setGigCategory] = useState<'Instagram' | 'TikTok' | 'YouTube' | 'Twitter'>('TikTok');
  const [gigDeliveryTime, setGigDeliveryTime] = useState('3 days');
  const [gigMediaURL, setGigMediaURL] = useState('');
  const [gigTagsInput, setGigTagsInput] = useState('');
  const [creatingGig, setCreatingGig] = useState(false);
  const [gigSuccess, setGigSuccess] = useState(false);

  // Delivery form states
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveringWork, setDeliveringWork] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Chat overlay in active order
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Calculated Stats
  const myGigs = allGigs.filter(g => g.sellerId === myProfile?.id);
  const activeContracts = myOrders.filter(o => o.sellerId === myProfile?.id);
  
  const completedContracts = activeContracts.filter(o => o.status === 'completed');
  const totalEarnings = completedContracts.reduce((sum, o) => sum + o.price, 0);
  const pendingClearance = activeContracts.filter(o => o.status === 'delivered' || o.status === 'in_escrow').reduce((sum, o) => sum + o.price, 0);

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

  const handleDeliverWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryNote.trim() || !selectedOrderForDelivery) return;

    setDeliveringWork(true);
    try {
      await onDeliverWork(selectedOrderForDelivery.id, deliveryNote.trim());
      setDeliveryNote('');
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
      {/* Search & Tabs control navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Earning Overview' },
            { id: 'gigs', label: `My Listed Gigs (${myGigs.length})` },
            { id: 'orders', label: `My Active Gigs (${activeContracts.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`tab-seller-${tab.id}`}
              className={`pb-3 text-xs font-mono uppercase tracking-wider font-black border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateGigModal(true)}
          id="btn-seller-add-gig-modal"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/10"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Create New Gig</span>
        </button>
      </div>

      {/* OVERVIEW MODULE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Headline banner */}
          <div className="p-6 bg-gradient-to-r from-purple-950/20 via-slate-950 to-indigo-950/20 border border-slate-800 rounded-2xl">
            <h2 className="text-xl font-display font-black text-white">Creative Node Workspace</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">Analyze incoming briefs, deliver milestones into the escrow, and claim instant cleared payments.</p>
          </div>

          {/* Core metrics overview blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total earnings */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-purple-400/20">
                <DollarSign size={36} />
              </div>
              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">Total Cleared Earnings</span>
              <h3 className="text-3xl font-mono text-white font-black">${totalEarnings}</h3>
              <p className="text-[10px] text-emerald-400 font-mono">⚡ Funds directly withdrawable to Paystack</p>
            </div>

            {/* Locked escrow */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-cyan-400/20">
                <Shield size={36} />
              </div>
              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">Pending Escrow Clearance</span>
              <h3 className="text-3xl font-mono text-white font-black">${pendingClearance}</h3>
              <p className="text-[10px] text-slate-500 font-mono">Held in escrow during verification</p>
            </div>

            {/* Active order tickets */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-yellow-400/20">
                <Clock size={36} />
              </div>
              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">Active Gig Contracts</span>
              <h3 className="text-3xl font-mono text-white font-black">{activeContracts.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</h3>
              <p className="text-[10px] text-slate-500 font-mono">Milestone obligations requiring submission</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE GIGS LISTING TAB */}
      {activeTab === 'gigs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">My Social Media Gigs</h2>
          </div>

          {myGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs.map(gig => (
                <div key={gig.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative h-40 bg-slate-900">
                    <img
                      src={gig.mediaURL}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 text-[9px] font-mono font-bold bg-black/80 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                      {gig.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white line-clamp-2">{gig.title}</h3>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-800/80 pt-3">
                      <span className="text-slate-400">Price: ${gig.price}</span>
                      <button
                        onClick={() => onDeleteGig(gig.id)}
                        className="text-red-400 hover:text-red-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                        id={`btn-seller-delete-gig-${gig.id}`}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
              <PlusCircle size={24} className="mx-auto text-slate-500" />
              <p className="text-xs text-slate-400 font-mono mt-3">You don't have any live social media gigs listed yet.</p>
              <button
                onClick={() => setShowCreateGigModal(true)}
                className="mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
              >
                Create My First Gig 🚀
              </button>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE CLIENT ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Orders list */}
            <div className="flex-1 space-y-4">
              <h2 className="text-sm font-mono font-black text-white uppercase tracking-wider">Active Client Agreements</h2>
              {activeContracts.length > 0 ? (
                <div className="space-y-3.5">
                  {activeContracts.map(order => {
                    const isSelected = selectedOrderForChat?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForChat(order)}
                        id={`order-deal-row-${order.id}`}
                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col md:flex-row justify-between gap-4 ${
                          isSelected
                            ? 'bg-slate-900 border-purple-500 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                              {order.gigCategory}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">• Client: @{order.buyerName}</span>
                          </div>

                          <h3 className="text-sm font-bold text-white">{order.gigTitle}</h3>

                          <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-mono text-slate-500 pt-1">
                            <span className="font-bold text-white">Amt: ${order.price}</span>
                            <span>Timeline: {order.deliveryDate}</span>
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
                          {order.status === 'in_escrow' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderForDelivery(order);
                              }}
                              id={`btn-deliver-work-${order.id}`}
                              className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded-lg text-center cursor-pointer"
                            >
                              Deliver Complete Work
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
                <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
                  <Shield size={24} className="mx-auto text-slate-500" />
                  <p className="text-xs text-slate-400 font-mono mt-3">No active gig assignments currently allocated to your profile.</p>
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
                    <span className="text-sm font-bold text-white block truncate max-w-[200px]">@{selectedOrderForChat.buyerName}</span>
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
                <form onSubmit={handleSendMessageSubmit} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
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
            )}
          </div>
        </div>
      )}

      {/* CREATE GIG MODAL OVERLAY */}
      {showCreateGigModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 space-y-5 relative text-left"
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
                  id="input-newgig-title"
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
                    id="input-newgig-price"
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
                  id="textarea-newgig-desc"
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
                id="btn-seller-publish-gig"
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
                <label className="text-xs font-mono font-extrabold text-slate-400 uppercase block">Work Description / Live Link</label>
                <textarea
                  required
                  placeholder="Provide drive folders, unlisted video links, or a brief writeup of completed tasks..."
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-400 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={deliveringWork}
                id="btn-seller-submit-work-escrow"
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
