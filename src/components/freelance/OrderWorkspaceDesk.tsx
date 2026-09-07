import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, ShieldAlert, Award, FileText, Send, Paperclip, 
  Mic, Play, Pause, ChevronRight, CheckCircle2, RotateCcw, AlertTriangle, 
  Clock, Trash2, ShieldCheck, Heart, User, Sparkles
} from 'lucide-react';
import { Order, ChatMessage, UserProfile } from './types';

interface OrderWorkspaceDeskProps {
  isOpen: boolean;
  order: Order | null;
  chatMessages: ChatMessage[];
  myProfile: UserProfile | null;
  onClose: () => void;
  onSendMessage: (orderId: string, text: string) => Promise<void>;
  onCompleteAndReview: (orderId: string, rating: number, reviewText: string) => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onUpdateOrderStatus: (
    orderId: string, 
    newStatus: 'pending' | 'in_escrow' | 'delivered' | 'completed' | 'cancelled' | 'revision_requested' | 'disputed',
    deliverableText?: string
  ) => Promise<void>;
}

export const OrderWorkspaceDesk: React.FC<OrderWorkspaceDeskProps> = ({
  isOpen,
  order,
  chatMessages,
  myProfile,
  onClose,
  onSendMessage,
  onCompleteAndReview,
  onCancelOrder,
  onUpdateOrderStatus
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'milestones' | 'deliverables' | 'resolution'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // File uploading simulation
  const [fileAttached, setFileAttached] = useState<string | null>(null);

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Resolution inputs
  const [resolutionReason, setResolutionReason] = useState('');
  const [disputeOpened, setDisputeOpened] = useState(false);
  const [cancelOffered, setCancelOffered] = useState(false);
  const [extensionDays, setExtensionDays] = useState('3 days');

  // Revision Form State
  const [revisionComments, setRevisionComments] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  if (!isOpen || !order) return null;

  // Calculate milestones
  const defaultMilestones = [
    { id: 'm1', label: 'Milestone 1: Project Alignment & Strategy Outlines', cost: parseFloat((order.price * 0.35).toFixed(2)), status: 'released' },
    { id: 'm2', label: 'Milestone 2: First Production Draft Delivery', cost: parseFloat((order.price * 0.40).toFixed(2)), status: order.status === 'completed' || order.status === 'delivered' ? 'released' : 'funded' },
    { id: 'm3', label: 'Milestone 3: Final Polish & Assets Handover', cost: parseFloat((order.price * 0.25).toFixed(2)), status: order.status === 'completed' ? 'released' : 'funded' }
  ];

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileAttached) return;

    setSending(true);
    try {
      let finalMsg = newMessage.trim();
      if (fileAttached) {
        finalMsg += `\n📎 Attached File: ${fileAttached}`;
      }
      await onSendMessage(order.id, finalMsg);
      setNewMessage('');
      setFileAttached(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSimulateVoiceNote = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate active countdown for voice note capture
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setVoiceNoteDuration(count);
      }, 1000);
      (window as any).voiceInterval = interval;
    } else {
      clearInterval((window as any).voiceInterval);
      setIsRecording(false);
      setSending(true);
      try {
        await onSendMessage(order.id, `🎙️ Transmitted Voice Note duration: ${voiceNoteDuration}s`);
        setVoiceNoteDuration(0);
      } catch (err) {
        console.error(err);
      } finally {
        setSending(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileAttached(e.target.files[0].name);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileAttached(e.dataTransfer.files[0].name);
    }
  };

  const handleReleaseEscrowMilestone = async (mId: string) => {
    alert(`Milestone payout initiated. Funds released securely through Paystack to freelancer @${order.sellerName}.`);
    if (mId === 'm3') {
      // Release entire order if final milestone is confirmed
      await onUpdateOrderStatus(order.id, 'completed');
    }
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionComments.trim()) return;

    try {
      await onUpdateOrderStatus(order.id, 'revision_requested');
      await onSendMessage(order.id, `🛑 REVISION REQUESTED:\n"${revisionComments.trim()}"`);
      setRevisionComments('');
      setShowRevisionForm(false);
      setActiveTab('chat');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileDispute = async () => {
    if (!resolutionReason.trim()) return;
    try {
      await onUpdateOrderStatus(order.id, 'disputed');
      await onSendMessage(order.id, `⚠️ CONFLICT ALERT: Dispute opened on Escrow deal #${order.id.slice(0,8)}. Reason: ${resolutionReason.trim()}`);
      setResolutionReason('');
      setDisputeOpened(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelContract = async () => {
    try {
      await onCancelOrder(order.id);
      await onSendMessage(order.id, `🚨 CONTRACT CANCELLATION REQUESTED.`);
      setCancelOffered(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestExtension = async () => {
    try {
      await onSendMessage(order.id, `⏰ TIME EXTENSION REQUESTED: Proposing an extension of ${extensionDays}.`);
      alert('Extension request transmitted to freelancer.');
    } catch (err) {
      console.error(err);
    }
  };

  const orderMessages = chatMessages.filter(msg => msg.orderId === order.id);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto select-text">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl overflow-hidden relative text-left my-8 flex flex-col h-[640px]"
      >
        {/* Workspace Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase">
                {order.gigCategory} Service
              </span>
              <span className="text-[10px] font-mono text-slate-500">• Secure Deal #{order.id.slice(0, 8)}</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">Contract Workspace: {order.gigTitle}</h3>
          </div>
          <button
            onClick={onClose}
            id="btn-close-workspace"
            className="text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Timeline Stepper (Feature 13) */}
        <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800 shrink-0">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span>ESCROW PROGRESS STAGES</span>
            <span className="text-cyan-400 font-bold uppercase">{order.status.replace('_', ' ')}</span>
          </div>
          
          <div className="flex items-center justify-between relative mt-2 pb-1">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-850 -translate-y-1/2 z-0" />
            {[
              { label: 'Escrow Lock', done: true },
              { label: 'Work Brief', done: true },
              { label: 'Working', done: !['pending'].includes(order.status) },
              { label: 'Revision', done: ['delivered', 'revision_requested', 'completed'].includes(order.status) },
              { label: 'Cleared', done: order.status === 'completed' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center z-10 relative">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all ${
                  step.done
                    ? 'bg-cyan-500 border-cyan-400 text-black'
                    : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span className={`text-[8px] font-mono mt-1 font-bold ${step.done ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs selector */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950 shrink-0 gap-4">
          {[
            { id: 'chat', label: 'Message Desk' },
            { id: 'milestones', label: 'Milestone Ledger' },
            { id: 'deliverables', label: 'Deliverables & Review' },
            { id: 'resolution', label: 'Resolution Center' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 pt-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tabs Contents */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-slate-950/40">
          
          {/* TAB 1: CHAT MESSAGE STREAM (Feature 12) */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full justify-between">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-[220px]">
                {orderMessages.length > 0 ? (
                  orderMessages.map(msg => {
                    const isMe = msg.senderId === myProfile?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          isMe
                            ? 'bg-cyan-500 text-black font-medium rounded-tr-none'
                            : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wider font-bold">
                          @{msg.senderName} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-[10px]">
                    💬 Direct message line open. Coordinates, brief updates, reference files will show here.
                  </div>
                )}
              </div>

              {/* Chat Input form with Attachments & Voice Note Recorder */}
              <form onSubmit={handleSendText} className="pt-4 border-t border-slate-800 space-y-3 shrink-0">
                {/* File Attachment Pill */}
                {fileAttached && (
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-mono text-cyan-400 truncate max-w-[280px]">📎 {fileAttached}</span>
                    <button
                      type="button"
                      onClick={() => setFileAttached(null)}
                      className="text-rose-400 hover:underline text-[10px] font-mono font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* File attach button */}
                  <label className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors shrink-0">
                    <Paperclip size={14} />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type alignment brief, revision guidelines, or queries..."
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-sans"
                  />

                  {/* Voice simulation trigger (Feature 12) */}
                  <button
                    type="button"
                    onClick={handleSimulateVoiceNote}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic size={14} />
                  </button>

                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !fileAttached)}
                    className="p-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
                
                {isRecording && (
                  <p className="text-[10px] font-mono text-rose-500 animate-pulse text-left">
                    🎙️ Voice note recording: {voiceNoteDuration}s. Click microphone icon again to transmit.
                  </p>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: MILESTONES LEDGER (Feature 10) */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Milestone Payments Breakdown</h4>
                <span className="text-[10px] font-mono text-cyan-400">Escrow Locked: ${order.price}</span>
              </div>

              <div className="space-y-3">
                {defaultMilestones.map((milestone, idx) => (
                  <div key={milestone.id} className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500 font-black uppercase">Phase {idx + 1}</span>
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
                          milestone.status === 'released'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-950/50 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {milestone.status.toUpperCase()}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white leading-normal">{milestone.label}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">Amount Allocation: ${milestone.cost}</p>
                    </div>

                    {milestone.status === 'funded' && (
                      <button
                        onClick={() => handleReleaseEscrowMilestone(milestone.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        Release Phase Funds
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERABLES ROOM & REVISIONS (Feature 13, 14) */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Submitted Deliverables Vault</h4>
                <span className="text-[10px] font-mono text-slate-500">Secure Download Channel</span>
              </div>

              {order.deliverableText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">Freelancer Submission Received</span>
                    </div>
                    
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{order.deliverableText}"
                    </p>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">📎 final_deliverables_pkg.zip (14.2 MB)</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-black border border-emerald-500/10">READY</span>
                    </div>
                  </div>

                  {!showRevisionForm ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        Approve & Release Full Escrow
                      </button>
                      <button
                        onClick={() => setShowRevisionForm(true)}
                        className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:border-slate-700 cursor-pointer"
                      >
                        Request Revision 🛑
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRevision} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Specify Revision Guidelines</label>
                        <textarea
                          value={revisionComments}
                          onChange={e => setRevisionComments(e.target.value)}
                          placeholder="List out exactly what edits, tone changes, formats or references are required before funding clearance..."
                          required
                          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400 font-sans resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Dispatch Revision Guidelines
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRevisionForm(false)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-mono text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                  <Clock size={20} className="mx-auto text-slate-500 animate-pulse" />
                  <p className="text-xs text-slate-400 font-mono mt-3">The seller is currently drafting creative assets.</p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1 max-w-xs mx-auto">
                    You can coordinate requirements directly inside the Message Desk tab. Escrow remains safely locked.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESOLUTION CENTER (Feature 15) */}
          {activeTab === 'resolution' && (
            <div className="space-y-4 text-left">
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex gap-2">
                <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  <strong>Resolution Center:</strong> Direct contract modifications are protected under Escrow. Mutually agreed cancellations refund instantly. Disputes lock funds indefinitely until mediation.
                </p>
              </div>

              {disputeOpened ? (
                <div className="p-4 bg-rose-950/20 border-2 border-rose-500/30 rounded-2xl text-center space-y-2">
                  <ShieldAlert size={24} className="mx-auto text-rose-400 animate-bounce" />
                  <h4 className="text-xs font-mono font-black text-white uppercase">Escrow Vault Permanently Locked</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                    A formal dispute has been logged. Chidon dispute coordinators have been dispatched to analyze deliverables, guidelines, and workspace logs.
                  </p>
                </div>
              ) : cancelOffered ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
                  <h4 className="text-xs font-mono font-black text-white uppercase">Cancellation Initiated</h4>
                  <p className="text-[10px] text-slate-400">
                    A cancellation proposal has been transmitted. Funds will release to your Chidon credits immediately upon freelancer approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Extension form */}
                  <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-3">
                    <span className="text-[9px] font-mono text-slate-500 font-black uppercase">Schedule Alterations</span>
                    <h5 className="text-xs font-bold text-white">Propose Project Deadline Extension</h5>
                    <div className="flex gap-2">
                      <select
                        value={extensionDays}
                        onChange={e => setExtensionDays(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                      >
                        <option value="3 days">Extend by 3 Days</option>
                        <option value="7 days">Extend by 1 Week</option>
                        <option value="14 days">Extend by 2 Weeks</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleRequestExtension}
                        className="px-4 bg-slate-800 hover:bg-slate-750 text-white font-mono text-[10px] font-bold rounded-xl cursor-pointer"
                      >
                        Transmit Proposal
                      </button>
                    </div>
                  </div>

                  {/* Conflict/Dispute Form */}
                  <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-3">
                    <span className="text-[9px] font-mono text-rose-400 font-black uppercase">Severe Conflict Escalation</span>
                    <h5 className="text-xs font-bold text-white">File Dispute & Freeze Funds</h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={resolutionReason}
                        onChange={e => setResolutionReason(e.target.value)}
                        placeholder="State reason: e.g. seller non-responsive or poor quality"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleFileDispute}
                          disabled={!resolutionReason.trim()}
                          className="flex-1 py-2 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500 hover:text-black text-rose-400 text-[10px] font-mono font-bold uppercase rounded-xl cursor-pointer disabled:opacity-40"
                        >
                          Freeze & Dispute Escrow
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelContract}
                          className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 text-[10px] font-mono font-bold uppercase rounded-xl cursor-pointer"
                        >
                          Request Cancel Contract
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
