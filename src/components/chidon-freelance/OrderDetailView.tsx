import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Send, CheckCircle, Clock, AlertTriangle, MessageSquare, 
  Download, Upload, Star, HelpCircle, User, ShieldCheck, RefreshCw, XCircle
} from 'lucide-react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, FreelanceProfile, Message, Dispute } from './types';
import { handleFirestoreError, OperationType, convertFileToBase64 } from './utils';

interface OrderDetailViewProps {
  order: Order;
  profile: FreelanceProfile;
  onBack: () => void;
  onRefreshProfile: () => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ 
  order, 
  profile, 
  onBack,
  onRefreshProfile
}) => {
  const [activeOrder, setActiveOrder] = useState<Order>(order);
  const [reqInput, setReqInput] = useState('');
  
  // Deliver states
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFile, setDeliveryFile] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);

  // Revision states
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute states
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);

  // Message board specific to this order
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageFile, setMessageFile] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const isBuyer = profile.uid === activeOrder.buyerId;
  const isSeller = profile.uid === activeOrder.sellerId;

  // Real-time Order synchronization
  useEffect(() => {
    const docRef = doc(db, 'orders', order.id);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setActiveOrder({ id: snap.id, ...snap.data() } as Order);
      }
    });
    return () => unsub();
  }, [order.id]);

  // Real-time Chat synchronization specific to this order
  useEffect(() => {
    const colRef = collection(db, 'messages');
    const q = query(
      colRef, 
      where('chatId', '==', `order_${order.id}`),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
      setMessages(list);
    }, (err) => {
      console.warn("Messages timeline setup:", err);
    });
    return () => unsub();
  }, [order.id]);

  // Submit Buyer Requirements
  const handleSubmitRequirements = async () => {
    if (!reqInput.trim()) return;
    try {
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, {
        requirementsSubmitted: reqInput.trim(),
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      setReqInput('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  // Upload attachment base64 helper
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'delivery' | 'chat') => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      if (target === 'delivery') {
        setDeliveryFile(base64);
      } else {
        setMessageFile(base64);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit delivery
  const handleDeliverWork = async () => {
    if (!deliveryNote.trim() || !deliveryFile) {
      alert("Provide a descriptive note and attach the final delivery deliverables.");
      return;
    }
    try {
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, {
        deliveryNotes: deliveryNote.trim(),
        deliveryFileUrl: deliveryFile,
        status: 'delivered',
        updatedAt: serverTimestamp()
      });
      setDeliveryNote('');
      setDeliveryFile('');
      setIsDelivering(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  // Approve and release funds
  const handleApproveDelivery = async () => {
    try {
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      // Release money to seller account balance!
      const sellerRef = doc(db, 'users', activeOrder.sellerId);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        const currentEarnings = sellerSnap.data().earnings || 0;
        const currentTotalOrders = sellerSnap.data().totalOrders || 0;
        await updateDoc(sellerRef, {
          earnings: currentEarnings + activeOrder.amount,
          totalOrders: currentTotalOrders + 1
        });
      }

      onRefreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  // Request revision
  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) return;
    try {
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, {
        revisionNotes: revisionNotes.trim(),
        status: 'revision',
        updatedAt: serverTimestamp()
      });
      setRevisionNotes('');
      setIsRequestingRevision(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  // Submit Review Rating
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const reviewData = {
        orderId: activeOrder.id,
        gigId: activeOrder.gigId,
        buyerId: activeOrder.buyerId,
        buyerName: activeOrder.buyerName,
        buyerAvatar: profile.avatarURL,
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      setHasReviewed(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async () => {
    if (!disputeReason.trim() || !disputeDetails.trim()) return;
    try {
      const disputeData = {
        orderId: activeOrder.id,
        raisedById: profile.uid,
        raisedByName: profile.fullName || profile.username,
        reason: disputeReason.trim(),
        details: disputeDetails.trim(),
        status: 'open',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'disputes'), disputeData);

      // Set order status to disputed
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, {
        status: 'disputed',
        updatedAt: serverTimestamp()
      });

      setDisputeReason('');
      setDisputeDetails('');
      setIsDisputing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'disputes');
    }
  };

  // Send workspace messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !messageFile) return;
    setSendingMsg(true);
    try {
      const msgData = {
        chatId: `order_${order.id}`,
        senderId: profile.uid,
        senderName: profile.fullName || profile.username,
        content: messageInput.trim() || 'Shared attachment document.',
        fileUrl: messageFile || undefined,
        fileName: messageFile ? 'attachment.png' : undefined,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'messages'), msgData);
      setMessageInput('');
      setMessageFile('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    } finally {
      setSendingMsg(false);
    }
  };

  // Timeline render helper
  const getStatusColor = (st: Order['status']) => {
    switch (st) {
      case 'pending_requirements': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'in_progress': return 'text-brand bg-brand/10 border-brand/20 animate-pulse';
      case 'delivered': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'revision': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'disputed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Header Back controls */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(activeOrder.status)}`}>
          {activeOrder.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Order summary, timeline work logs, chat boards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Brief Summary Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">GIG CONTRACT ID: #{activeOrder.id.slice(0, 8)}</span>
              <h2 className="text-sm font-black text-white">{activeOrder.gigTitle}</h2>
              <p className="text-xs font-mono text-slate-400">
                Buyer: <span className="text-white">@{activeOrder.buyerName}</span> | Seller: <span className="text-white">@{activeOrder.sellerName}</span>
              </p>
            </div>

            <div className="text-center font-mono bg-slate-950 border border-slate-850 px-5 py-3 rounded-2xl">
              <div className="text-xs text-slate-500">Contract Total</div>
              <div className="text-lg font-black text-emerald-400">${activeOrder.amount}</div>
            </div>
          </div>

          {/* Workflow Steps Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock size={14} className="text-brand" /> Work Contract Workspace
            </h3>

            {/* 1. Requirements Setup */}
            {activeOrder.status === 'pending_requirements' && (
              <div className="p-5 bg-slate-950 border border-amber-500/10 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                    <FileText size={14} /> Submit Requirements to Initiate Escrow Timeline
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The freelancer requires these project briefs to kickoff execution. The contract timeline officially starts once submitted.
                  </p>
                </div>

                {isBuyer ? (
                  <div className="space-y-3">
                    <textarea
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      placeholder="Input your design wireframes, specifications, or content briefs here..."
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-700 focus:outline-none"
                    />
                    <button
                      onClick={handleSubmitRequirements}
                      disabled={!reqInput.trim()}
                      className="px-5 py-2.5 bg-brand text-white text-xs font-black uppercase rounded-xl hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      Submit Requirements & Kickoff
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic">Waiting for buyer to submit necessary requirements...</div>
                )}
              </div>
            )}

            {/* 2. Work in Progress */}
            {activeOrder.status === 'in_progress' && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-brand flex items-center gap-1.5">
                    <RefreshCw size={13} className="animate-spin" /> Contract Execution Active
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    The freelancer is actively building, coding, or translating your requests. Coordinate updates inside the team chat workspace below.
                  </p>
                </div>

                {isSeller && !isDelivering && (
                  <button
                    onClick={() => setIsDelivering(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Deliver Final Deliverables
                  </button>
                )}

                {/* Delivery Form */}
                {isDelivering && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h5 className="text-xs font-black text-white">Upload Assets & Document Delivery</h5>
                    
                    <textarea
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Write a clear summary of your work delivery..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                    />

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                        <Upload size={14} /> 
                        {deliveryFile ? 'File Attached ✔' : 'Attach Delivery File'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleAttachmentUpload(e, 'delivery')}
                        />
                      </label>
                      {deliveryFile && (
                        <span className="text-[10px] font-mono text-emerald-400">Deliverable loaded</span>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsDelivering(false)}
                        className="px-3 py-1.5 bg-slate-950 text-slate-400 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeliverWork}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase"
                      >
                        Publish Delivery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Delivered deliverables */}
            {activeOrder.status === 'delivered' && (
              <div className="p-5 bg-slate-950 border border-cyan-500/10 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Assets Delivered for Your Verification
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Freelancer note: <span className="text-slate-300 italic">"{activeOrder.deliveryNotes}"</span>
                  </p>
                </div>

                {activeOrder.deliveryFileUrl && (
                  <div className="p-3 bg-slate-900 border border-slate-805 rounded-xl flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">deliverable_package.png</span>
                    <a
                      href={activeOrder.deliveryFileUrl}
                      download="deliverable.png"
                      className="p-2 bg-slate-950 text-brand rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                )}

                {isBuyer && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={handleApproveDelivery}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Approve & Release Escrow
                    </button>
                    <button
                      onClick={() => setIsRequestingRevision(true)}
                      className="py-2.5 px-4 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Request Revision
                    </button>
                  </div>
                )}

                {isRequestingRevision && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Specify exactly what modifications, tweaks, or improvements you require..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsRequestingRevision(false)} className="px-3 py-1 bg-slate-950 text-slate-500 rounded-lg text-xs">Cancel</button>
                      <button onClick={handleRequestRevision} className="px-4 py-1 bg-yellow-600 text-white rounded-lg text-xs font-bold">Submit Revision</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Revision state */}
            {activeOrder.status === 'revision' && (
              <div className="p-5 bg-slate-950 border border-yellow-500/10 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-yellow-500">Contract in Revision Checkpoint</h4>
                <p className="text-[11px] text-slate-400">
                  Buyer notes: <span className="text-slate-300 italic">"{activeOrder.revisionNotes}"</span>
                </p>
                {isSeller && !isDelivering && (
                  <button onClick={() => setIsDelivering(true)} className="px-4 py-2 bg-brand text-white text-xs font-black uppercase rounded-xl">Redeliver Assets</button>
                )}
              </div>
            )}

            {/* 5. Complete state */}
            {activeOrder.status === 'completed' && (
              <div className="p-5 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={14} className="fill-emerald-400/10" /> Escrow Released & Completed Successfully
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    The deliverables have been approved. Escrow funds are transferred safely to the freelancer. Leave a review of your experience below.
                  </p>
                </div>

                {isBuyer && !hasReviewed && (
                  <form onSubmit={handlePostReview} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Leave a Star Review</div>
                    
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReviewRating(idx + 1)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star size={16} className={idx < reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share constructive feedback about communication, quality, and speed..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      required
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-lg"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 6. Disputed state */}
            {activeOrder.status === 'disputed' && (
              <div className="p-5 bg-red-950/20 border border-red-500/10 rounded-2xl space-y-2">
                <h4 className="text-xs font-black text-red-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Dispute Resolution Workspace Opened
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Both participants have paused work. Our ChidonFreelance system administrator is reviewing communications and deliverables to declare a refund or payout. Continue supplying notes in the chat.
                </p>
              </div>
            )}

          </div>

          {/* Interactive Workspace Chat Messenger */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-brand" /> Work Chat Timeline Logs
            </h3>

            {/* Logs & Messages Scroller */}
            <div className="h-64 bg-slate-950 border border-slate-850 rounded-2xl p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const self = m.senderId === profile.uid;
                return (
                  <div key={m.id} className={`flex flex-col ${self ? 'items-end' : 'items-start'} space-y-1`}>
                    <span className="text-[8px] font-mono text-slate-500">@{m.senderName}</span>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${self ? 'bg-brand text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'}`}>
                      {m.content}
                      {m.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center gap-4">
                          <span className="text-[9px] font-mono opacity-80 truncate">attachment_asset.png</span>
                          <a href={m.fileUrl} download="attached.png" className="text-white hover:opacity-80">
                            <Download size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {messages.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-600 font-mono italic">Timeline workspace is quiet. Post an update...</div>
              )}
            </div>

            {/* Messenger controls */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Post updates, links, or clarification questions..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-700 outline-none"
              />
              
              <label className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer flex items-center justify-center">
                <Upload size={14} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleAttachmentUpload(e, 'chat')}
                />
              </label>

              <button
                type="submit"
                disabled={sendingMsg}
                className="p-2.5 bg-brand text-white rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
            {messageFile && (
              <div className="text-[9px] font-mono text-emerald-400 pl-1">✓ Chat attachment loaded. Press send to upload.</div>
            )}
          </div>

        </div>

        {/* Right Column: Escrow Status, paystack logs, resolution triggers */}
        <div className="space-y-6">
          
          {/* Escrow Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Escrow Security</h3>
            
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500">Paystack Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{activeOrder.paystackStatus || 'escrowed'}</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500">Paystack Ref:</span>
                <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{activeOrder.paystackReference || 'local_esc_ref'}</span>
              </div>
              <div className="flex justify-between items-center font-mono pt-2 border-t border-slate-850">
                <span className="text-slate-500">Escrow Release:</span>
                <span className="text-slate-300 font-bold">Upon Approval</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850/80 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
              <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Security escrow protects both sides. Buyers approve deliverables before payouts; sellers have proof of delivery.</span>
            </div>
          </div>

          {/* Resolution / Dispute Trigger */}
          {activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && activeOrder.status !== 'disputed' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Resolution Center</h3>
              <p className="text-[10px] text-slate-500 leading-normal">
                Encountering delays, communications failures, or scope creep? Resolve issues or trigger disputes.
              </p>

              {!isDisputing ? (
                <button
                  onClick={() => setIsDisputing(true)}
                  className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Raise Dispute Claim
                </button>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Brief reason (e.g., Delay)"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <textarea
                    value={disputeDetails}
                    onChange={(e) => setDisputeDetails(e.target.value)}
                    placeholder="Explain full circumstances..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsDisputing(false)} className="px-3 py-1 bg-slate-900 text-slate-500 rounded-lg text-xs">Cancel</button>
                    <button onClick={handleRaiseDispute} className="flex-1 py-1 bg-red-600 text-white rounded-lg text-xs font-bold uppercase">Submit Dispute</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
