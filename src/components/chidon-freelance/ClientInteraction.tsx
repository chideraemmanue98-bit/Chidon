import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, MessageSquare, Plus, Clock, FileText, ChevronRight, 
  Send, User, ArrowLeft, Layers, ShieldCheck, Flag, AlertTriangle, RefreshCw
} from 'lucide-react';
import { collection, getDocs, query, where, addDoc, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, FreelanceProfile } from './types';

interface MilestoneUpdate {
  id?: string;
  orderId: string;
  milestoneIndex: number;
  authorId: string;
  authorName: string;
  authorRole: 'client' | 'expert';
  statusNote: string;
  createdAt: any;
}

interface ClientInteractionProps {
  profile: FreelanceProfile;
  initialOrder?: Order;
  onBack?: () => void;
}

export const ClientInteraction: React.FC<ClientInteractionProps> = ({
  profile,
  initialOrder,
  onBack
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialOrder || null);
  const [updates, setUpdates] = useState<MilestoneUpdate[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Status Note Form state
  const [statusNote, setStatusNote] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Milestones list
  const milestones = [
    { num: 1, label: "Kickoff & Discovery", desc: "Aligning architectural objectives, branding direction, and creative scopes." },
    { num: 2, label: "Core Blueprinting", desc: "Constructing core database schemas, outlines, and structural wires." },
    { num: 3, label: "Incremental Deliverable", desc: "Submitting first draft layout, script, or system prototype." },
    { num: 4, label: "Final Review & Polish", desc: "Validating user suggestions, polishing interfaces, and verifying speed constraints." },
    { num: 5, label: "Escrow Release", desc: "Confirming absolute satisfaction, authorizing payout, and handoff of keys." }
  ];

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const ordersCol = collection(db, 'orders');
        const q = profile.role === 'buyer'
          ? query(ordersCol, where('buyerId', '==', profile.uid))
          : query(ordersCol, where('sellerId', '==', profile.uid));

        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
        setOrders(list);
        if (list.length > 0 && !selectedOrder) {
          setSelectedOrder(list[0]);
        }
      } catch (err) {
        console.error("Error retrieving client orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [profile.uid, profile.role]);

  // Real-time snapshot of milestone updates for selected order
  useEffect(() => {
    if (!selectedOrder?.id) return;

    setLoadingUpdates(true);
    const updatesCol = collection(db, 'milestone_updates');
    const q = query(
      updatesCol,
      where('orderId', '==', selectedOrder.id),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MilestoneUpdate[];
      setUpdates(list);
      setLoadingUpdates(false);
    }, (error) => {
      console.error("Updates synchronization failed:", error);
      setLoadingUpdates(false);
    });

    return () => unsub();
  }, [selectedOrder?.id]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !statusNote.trim()) return;

    setSubmitting(true);
    try {
      const updateData: MilestoneUpdate = {
        orderId: selectedOrder.id,
        milestoneIndex: selectedMilestone,
        authorId: profile.uid,
        authorName: profile.fullName || profile.username,
        authorRole: profile.role === 'buyer' ? 'client' : 'expert',
        statusNote: statusNote.trim(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'milestone_updates'), updateData);
      
      // Post system notification to other party
      await addDoc(collection(db, 'notifications'), {
        userId: profile.role === 'buyer' ? selectedOrder.sellerId : selectedOrder.buyerId,
        title: `Milestone #${selectedMilestone} Status Update`,
        message: `@${profile.username} posted a status update on "${selectedOrder.gigTitle}" milestone: "${statusNote.trim().slice(0, 45)}..."`,
        type: 'order',
        linkId: selectedOrder.id,
        isRead: false,
        createdAt: serverTimestamp()
      });

      setStatusNote('');
    } catch (err) {
      console.error("Failed to post status update:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-base)]/40 pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-1.5 rounded-xl border border-[var(--border-base)] hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              >
                <ArrowLeft size={14} className="text-[var(--text-primary)]" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] uppercase flex items-center gap-2">
              <MessageSquare className="text-brand" size={22} />
              Client Interaction Terminal
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-mono">View project milestones, communicate live updates, and release checkpoints</p>
        </div>
      </div>

      {/* Main Grid: Selector vs Milestone Tracking & Communicator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 4 columns: Select Project */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-2">
              <Layers size={15} className="text-brand" /> Active Contracts
            </h3>

            {loadingOrders ? (
              <div className="text-xs font-mono text-[var(--text-secondary)]">Retrieving projects...</div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No active contracts listed.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full p-3.5 rounded-xl text-left border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                      selectedOrder?.id === ord.id
                        ? 'bg-brand/10 text-brand border-brand/20 font-black'
                        : 'bg-slate-50/50 dark:bg-slate-900/10 border-transparent text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500">#{ord.id.slice(0, 8)}</span>
                    <span className="font-bold line-clamp-1">{ord.gigTitle}</span>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      {profile.role === 'buyer' ? `Expert: @${ord.sellerName}` : `Client: @${ord.buyerName}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 8 columns: Active Interaction Interface */}
        <div className="lg:col-span-8 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              
              {/* Project Card summary */}
              <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">CURRENT CONTRACT LEDGER</span>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">{selectedOrder.gigTitle}</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Agreement between <strong className="text-brand">@{selectedOrder.buyerName}</strong> (Client) and <strong className="text-brand">@{selectedOrder.sellerName}</strong> (Expert)
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-slate-500">ESCROW AMOUNT</span>
                  <span className="text-xl font-black text-emerald-500 font-mono">${selectedOrder.amount} USD</span>
                </div>
              </div>

              {/* Milestones Flow Chart */}
              <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-3">
                  <Flag size={15} className="text-brand animate-bounce" /> Project Milestones & Interactive Checkpoints
                </h3>

                <div className="space-y-6 relative pl-6 border-l-2 border-[var(--border-base)] ml-3">
                  {milestones.map((mil) => {
                    const isPassed = 
                      (selectedOrder.status === 'completed' && mil.num <= 5) ||
                      (selectedOrder.status === 'delivered' && mil.num <= 4) ||
                      (selectedOrder.status === 'in_progress' && mil.num <= 2) ||
                      (selectedOrder.status !== 'pending_requirements' && mil.num <= 1);

                    return (
                      <div key={mil.num} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                          isPassed 
                            ? 'bg-brand border-brand text-white' 
                            : 'bg-[var(--bg-card)] border-[var(--border-base)]'
                        }`}>
                          {isPassed && <CheckCircle size={10} className="stroke-[3px]" />}
                        </div>

                        <div className="space-y-1">
                          <h4 className={`text-xs font-black flex items-center gap-2 ${isPassed ? 'text-brand' : 'text-[var(--text-secondary)]'}`}>
                            Milestone #{mil.num}: {mil.label}
                            {isPassed && <span className="text-[8px] font-mono font-black uppercase tracking-widest bg-brand/5 border border-brand/20 px-1.5 py-0.5 rounded">Passed</span>}
                          </h4>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{mil.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Communicate Update Form */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Post update notes */}
                <form onSubmit={handlePostUpdate} className="md:col-span-5 card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-base)]/40 pb-2">
                    <Plus size={14} className="text-brand" /> Post Status Log
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Target Milestone</label>
                    <select
                      value={selectedMilestone}
                      onChange={(e) => setSelectedMilestone(Number(e.target.value))}
                      className="w-full input-base py-1.5 px-3 text-xs"
                    >
                      {milestones.map(m => (
                        <option key={m.num} value={m.num}>Milestone #{m.num}: {m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Status Update Comment</label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Completed draft architecture schemas. Uploaded wire mockups to primary workspace logs."
                      className="w-full input-base text-xs h-24 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-brand hover:bg-brand/95 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    Post Checkpoint Log
                  </button>
                </form>

                {/* Stream list of updates */}
                <div className="md:col-span-7 card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-base)]/40 pb-2">
                    <Clock size={14} className="text-cyan-500" /> Milestone Audit Stream
                  </h3>

                  {loadingUpdates ? (
                    <div className="text-xs font-mono text-slate-500 py-12 text-center">Syncing interactive feed...</div>
                  ) : updates.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic">
                      No status logs recorded for this agreement yet. Post the first update to keep your counterparty informed.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {updates.map((up) => (
                        <div key={up.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="font-bold text-slate-500 flex items-center gap-1">
                              <User size={10} className="text-brand" />
                              @{up.authorName} ({up.authorRole.toUpperCase()})
                            </span>
                            <span className="text-slate-400">Milestone #{up.milestoneIndex}</span>
                          </div>
                          <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{up.statusNote}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="card-base p-12 text-center border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
              <AlertTriangle size={32} className="text-amber-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Select Contract Agreement</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                  To open live milestone audits and communicate updates, please select an active project agreement from the left ledger list.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
