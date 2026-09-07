import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Check, AlertTriangle, Key, Users, Copy, Bell, Mail, CreditCard, 
  HelpCircle, Settings, User, Scale, Flame, RefreshCw, Layers, Plus, ExternalLink,
  Lock, Smartphone, Ban, Play, Trash2, Eye, Cpu, BookOpen, Clock, CheckCircle2
} from 'lucide-react';
import { UserProfile, Order, FreelanceGig } from './types';

interface AdminSettingsDisputeSuiteProps {
  myProfile: UserProfile | null;
  myOrders: Order[];
  allGigs: FreelanceGig[];
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
  onAddCredits?: (amount: number) => Promise<void>;
  onUpdateProfile?: (updated: any) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, newStatus: any) => Promise<void>;
  role: 'buyer' | 'seller';
}

export const AdminSettingsDisputeSuite: React.FC<AdminSettingsDisputeSuiteProps> = ({
  myProfile,
  myOrders,
  allGigs,
  checkAndDeductCredits,
  onAddCredits,
  onUpdateProfile,
  onUpdateOrderStatus,
  role
}) => {
  // Navigation tabs inside settings
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'notifications' | 'billing' | 'disputes' | 'referrals'>('profile');

  // Notification state toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Trust & Safety States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [authTimer, setAuthTimer] = useState(30);
  const [idType, setIdType] = useState('passport');
  const [idFileText, setIdFileText] = useState('');
  const [idVerifying, setIdVerifying] = useState(false);
  const [idVerified, setIdVerified] = useState(myProfile?.isVerified || false);

  // Password reset state
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState(myProfile?.fullName || 'Chidon Expert');
  const [bio, setBio] = useState(myProfile?.bio || 'Premium Social Media Professional');
  const [skills, setSkills] = useState(myProfile?.skills?.join(', ') || 'Video Editing, Copywriting');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dispute Center States
  const [selectedDisputeOrderId, setSelectedDisputeOrderId] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeLog, setDisputeLog] = useState<{ id: string; orderId: string; reason: string; status: 'active' | 'resolved_ai' | 'escalated_human'; response?: string }[]>([]);
  const [disputeLoading, setDisputeLoading] = useState(false);

  // Referral states
  const [referredFriends, setReferredFriends] = useState([
    { name: 'emeka_dev', status: 'verified', creditsEarned: 10 },
    { name: 'tunde_creative', status: 'pending', creditsEarned: 0 }
  ]);
  const [copiedRef, setCopiedRef] = useState(false);

  // 2FA Timer and code generator
  useEffect(() => {
    if (!is2FAEnabled) {
      setTwoFACode('');
      setAuthTimer(30);
      return;
    }

    setTwoFACode(Math.floor(100000 + Math.random() * 900000).toString());

    const interval = setInterval(() => {
      setAuthTimer(prev => {
        if (prev <= 1) {
          setTwoFACode(Math.floor(100000 + Math.random() * 900000).toString());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [is2FAEnabled]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    if (onUpdateProfile) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      await onUpdateProfile({
        fullName,
        bio,
        skills: skillsArray
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Toast Helper
  const triggerNotificationToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Handle ID Scan Submission
  const handleVerifyID = async () => {
    if (!idFileText.trim()) {
      alert("Please enter ID details or file scans URL to begin secure AI scan.");
      return;
    }
    setIdVerifying(true);
    // Simulate real AI visual OCR scanning on ID doc
    setTimeout(async () => {
      setIdVerifying(false);
      setIdVerified(true);
      if (onUpdateProfile) {
        await onUpdateProfile({ isVerified: true });
      }
      triggerNotificationToast(`ID Document verified successfully! Premium "AI Verified" badge applied to your profile node.`);
    }, 2500);
  };

  // Referral Friend simulation
  const handleInviteFriend = async () => {
    const friendNames = ['adewale_agency', 'chinelo_copy', 'ngozi_videos', 'yusuf_ai'];
    const randomFriend = friendNames[Math.floor(Math.random() * friendNames.length)];
    
    // Create new referred friend row
    const newFriend = { name: randomFriend, status: 'verified', creditsEarned: 10 };
    setReferredFriends(prev => [newFriend, ...prev]);

    // Reward credits
    if (onAddCredits) {
      await onAddCredits(10);
    }
    triggerNotificationToast(`Friend ${randomFriend} signed up! +10 free Gemini credits allocated to your wallet node!`);
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `https://chidon.freelance.iq/join?ref=${myProfile?.id || 'expert'}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // File scan upload trigger
  const handleFileUploadSim = () => {
    setIdFileText(`SCAN_FRONT_${idType.toUpperCase()}_REV104.PNG`);
  };

  // Dispute Center Arbitrate
  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeOrderId) {
      alert("Please select a contract node from your active list.");
      return;
    }
    if (!disputeReason.trim()) {
      alert("Please outline your dispute reasons or breach parameters.");
      return;
    }

    const newDispute = {
      id: 'disp_' + Date.now(),
      orderId: selectedDisputeOrderId,
      reason: disputeReason,
      status: 'active' as const
    };

    setDisputeLog(prev => [newDispute, ...prev]);
    setDisputeReason('');
    
    // Update order state if handler provided
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(selectedDisputeOrderId, 'disputed');
    }
    triggerNotificationToast("Contract flagged as DISPUTED. Escrow funds locked safely. Mediation desk is analyzing files.");
  };

  // Run AI Mediator (Deducts Credits!)
  const runAiMediator = async (disputeId: string, orderId: string) => {
    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(3, 'Sovereign AI Mediator Dispute Arbitrage');
      if (!allowed) {
        alert("Insufficient AI credits! Invite friends or fund your wallet nodes to run AI Mediator.");
        return;
      }
    }

    setDisputeLoading(true);
    
    // Simulate server side Gemini analyzing delivery files against specifications
    setTimeout(() => {
      setDisputeLoading(false);
      setDisputeLog(prev => prev.map(d => {
        if (d.id === disputeId) {
          return {
            ...d,
            status: 'resolved_ai',
            response: `[Gemini Escrow Verdict]: SPECIFICATIONS MATCHED. Delivery file contains requested keywords, correct frame bounds, and clean layout parameters. Verdict favors the CREATOR. 90% of funds ($${(myOrders.find(o => o.id === orderId)?.price || 100) * 0.9}) released from escrow; 10% retained as dispute collateral.`
          };
        }
        return d;
      }));

      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(orderId, 'completed');
      }
      triggerNotificationToast("AI Mediator successfully arbitrated! Verdict returned and escrow balances adjusted.");
    }, 3000);
  };

  // Escalate to Human review
  const escalateToHuman = (disputeId: string) => {
    setDisputeLog(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: 'escalated_human',
          response: "[Human Arbiter Node Alert]: Dispute escalated to sovereign human reviewer. Platform operators are inspecting communication logs and source files inside the messaging database. Verdict expected in 12 hours."
        };
      }
      return d;
    }));
    triggerNotificationToast("Dispute escalated to Human Arbiter node.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left select-text relative">
      
      {/* Toast alert display */}
      <AnimatePresence>
        {notificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 p-4 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl flex items-center gap-3 shadow-2xl max-w-sm"
          >
            <Bell size={18} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-300 font-mono leading-tight">{notificationToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Tabs menu */}
      <div className="lg:col-span-3 bg-slate-950 border border-slate-850 rounded-3xl p-4 space-y-2 shadow-xl">
        <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest pl-2 block">Settings Category</span>
        {[
          { id: 'profile', label: 'Edit Profile Node', icon: User },
          { id: 'security', label: 'Trust & Safety', icon: Key },
          { id: 'notifications', label: 'Alert Preferences', icon: Bell },
          { id: 'disputes', label: 'Dispute Center', icon: Scale },
          { id: 'referrals', label: 'Referral Program', icon: Users }
        ].map(sub => {
          const IconComp = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeSubTab === sub.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <IconComp size={13} className={activeSubTab === sub.id ? "text-indigo-400" : "text-slate-500"} />
              <span>{sub.label}</span>
            </button>
          );
        })}

        <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-850/50 mt-4 text-[10px] text-slate-400 font-mono leading-normal">
          <p>Credits Node Balance: <span className="text-cyan-400 font-bold">{myProfile?.credits || 5} Credits</span></p>
        </div>
      </div>

      {/* Form Content panel */}
      <div className="lg:col-span-9 bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl min-h-[480px]">
        
        {/* PROFILE EDITOR */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Edit Profile Node</h3>
              <p className="text-[10px] text-slate-500 mt-1">Configure your public-facing freelance identifier tags.</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase font-black">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase font-black">Specialist Skills Tags</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Comma separated: Video Editing, Figma"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase font-black">Biography & Vetting Statement</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-indigo-500 font-sans leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 flex justify-between items-center">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Check size={12} strokeWidth={3} /> Changes committed successfully!
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl cursor-pointer ml-auto"
              >
                Commit Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* TRUST & SAFETY (ID Verification, 2FA) */}
        {activeSubTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Trust & Safety Portal</h3>
              <p className="text-[10px] text-slate-500 mt-1">Configure identity proofs and multi-factor validation states.</p>
            </div>

            {/* Verification card */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5 space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <Shield size={16} className={idVerified ? "text-emerald-400" : "text-yellow-500"} />
                  <span className="text-[10px] font-mono font-black uppercase text-white tracking-wider">Identity Scanners</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Sellers verifying government-issued IDs receive the glowing "AI Verified" badge, granting 3x reach in client search index queues.
                </p>
                <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 font-black block">VERIFICATION STATE:</span>
                  <span className={`text-[10px] font-mono font-black uppercase mt-1 inline-block ${
                    idVerified ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {idVerified ? "✓ APPROVED (AI Verified Active)" : "⚠️ NOT COMPLETED"}
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-400 uppercase">Document Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="voters_card">Voter Card Scan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-400 uppercase">ID Input Reference</label>
                    <button
                      onClick={handleFileUploadSim}
                      type="button"
                      className="w-full text-center bg-slate-900 border border-slate-850 hover:border-indigo-500 px-2 py-1.5 rounded-xl text-[10px] text-slate-400 font-mono transition-all cursor-pointer"
                    >
                      Drag & Drop scan
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-400 uppercase block">Scanned File Reference Name</label>
                  <input
                    type="text"
                    value={idFileText}
                    onChange={(e) => setIdFileText(e.target.value)}
                    placeholder="e.g. PASSPORT_CHIDON_IMAGE.PNG"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 outline-none font-mono"
                    disabled={idVerified}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyID}
                  disabled={idVerifying || idVerified}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  {idVerifying ? "AI OCR SCANNING FILE..." : idVerified ? "✓ APPROVED" : "Submit Front Scan for AI Vetting"}
                </button>
              </div>
            </div>

            {/* 2FA Card */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone size={15} className="text-indigo-400" />
                  <span className="text-[11px] font-mono font-black uppercase text-white tracking-wider">Two-Factor Authentication (2FA)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal max-w-md font-sans">
                  Secure your account payouts. Any escrow clearance or bank detail updates will trigger a 2FA OTP prompt.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {is2FAEnabled && (
                  <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-center min-w-[100px]">
                    <span className="text-[8px] font-mono text-slate-500 block">OTP PIN:</span>
                    <span className="text-xs font-mono font-black text-cyan-400 tracking-widest">{twoFACode}</span>
                    <span className="text-[7px] text-slate-500 font-mono block mt-0.5">Rotates in {authTimer}s</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(prev => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    is2FAEnabled
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {is2FAEnabled ? "Deactivate 2FA" : "Activate 2FA"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS CENTRE PREFERENCES */}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Alert Preferences Center</h3>
              <p className="text-[10px] text-slate-500 mt-1">Configure channels for order, message, and dispute notifications.</p>
            </div>

            <div className="space-y-4 bg-slate-900/30 border border-slate-850 p-5 rounded-2xl">
              {[
                { state: emailAlerts, set: setEmailAlerts, label: 'Email Notifications Ledger', desc: 'Direct order deliverables, contract dispute alerts, and invoice PDFs sent to email.' },
                { state: inAppAlerts, set: setInAppAlerts, label: 'In-app Navigation Badges', desc: 'Dynamic badges in Deal Chats header and notification log lists.' },
                { state: pushAlerts, set: setPushAlerts, label: 'Push Notifications & Webhooks', desc: 'Direct real-time notification alerts sent straight to system browsers.' }
              ].map((notif, index) => (
                <div key={index} className="flex items-start justify-between gap-4 pb-4 border-b border-slate-900 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-mono font-bold text-white block">{notif.label}</span>
                    <p className="text-[10px] text-slate-400 font-sans leading-normal max-w-lg">{notif.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      notif.set(prev => !prev);
                      triggerNotificationToast(`Preference altered: ${notif.label}`);
                    }}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                      notif.state ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      notif.state ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
              <p className="text-[10px] text-slate-400 leading-normal max-w-sm">
                Verify notification channels by firing a test notification token simulation.
              </p>
              <button
                type="button"
                onClick={() => triggerNotificationToast("⚠️ Order Escrow Escaped! Test in-app alert triggered successfully.")}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-white font-mono rounded-xl cursor-pointer"
              >
                Simulate Notification
              </button>
            </div>
          </div>
        )}

        {/* DISPUTE CENTER & MEDIATION DESK */}
        {activeSubTab === 'disputes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Sovereign Dispute & Arbitration Center</h3>
              <p className="text-[10px] text-slate-500 mt-1">Raise dispute tickets, upload file specs, and trigger AI-driven mediation nodes.</p>
            </div>

            {/* Create new dispute form */}
            <form onSubmit={handleRaiseDispute} className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block">Open Arbitration Ticket</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-400 uppercase">Select Flagged Contract</label>
                  <select
                    value={selectedDisputeOrderId}
                    onChange={(e) => setSelectedDisputeOrderId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Choose Contract Node --</option>
                    {myOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        [Ref: {order.id.slice(0, 8)}] {order.gigTitle.slice(0, 25)}... (${order.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-400 uppercase">Breach Parameters</label>
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe missed specification or delayed delivery..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-300 text-xs font-mono font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Flag Contract & Halt Escrow
              </button>
            </form>

            {/* Active Disputes logs list */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">Arbitration History Ledger</span>
              
              {disputeLog.length === 0 ? (
                <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-500 font-mono">No active dispute files or escrow locks pending.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disputeLog.map(disp => {
                    const linkedOrder = myOrders.find(o => o.id === disp.orderId);
                    return (
                      <div key={disp.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 text-xs text-left">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-900">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500">TICKET: {disp.id.toUpperCase()}</span>
                            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wide mt-0.5">
                              {linkedOrder ? linkedOrder.gigTitle : "General Service Delivery"}
                            </h4>
                          </div>
                          <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full border tracking-wider self-start ${
                            disp.status === 'resolved_ai'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : disp.status === 'escalated_human'
                              ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}>
                            {disp.status === 'resolved_ai' ? 'RESOLVED BY AI' : disp.status === 'escalated_human' ? 'ESCALATED HUMAN' : 'ACTIVE UNDER ANALYSIS'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-normal">
                          <strong>Breach parameter:</strong> {disp.reason}
                        </p>

                        {disp.response && (
                          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-300 leading-normal">
                            {disp.response}
                          </div>
                        )}

                        {disp.status === 'active' && (
                          <div className="pt-1.5 flex gap-2 justify-end">
                            <button
                              onClick={() => runAiMediator(disp.id, disp.orderId)}
                              disabled={disputeLoading}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-mono font-black text-white uppercase rounded-xl cursor-pointer flex items-center gap-1 shadow-md disabled:opacity-40"
                            >
                              <Cpu size={11} /> {disputeLoading ? "AI Mediation Analyzing..." : "Run AI Mediator (Cost: 3 Credits)"}
                            </button>
                            <button
                              onClick={() => escalateToHuman(disp.id)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] font-mono font-black text-slate-300 uppercase rounded-xl cursor-pointer"
                            >
                              Escalate to Human Review
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REFERRAL PROGRAM */}
        {activeSubTab === 'referrals' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Invite Friends, Earn Gemini Credits</h3>
              <p className="text-[10px] text-slate-500 mt-1">Get 10 free credits for each creative friend joining the Chidon freelance workspace.</p>
            </div>

            {/* Link copier widget */}
            <div className="p-5 bg-gradient-to-r from-slate-950 to-indigo-950/20 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-indigo-400 uppercase font-black tracking-wider">Your Referral Link Node</span>
                <p className="text-xs font-mono font-black text-white truncate max-w-xs sm:max-w-md">
                  https://chidon.freelance.iq/join?ref={myProfile?.id || 'expert'}
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={12} />
                  <span>{copiedRef ? "Copied!" : "Copy Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleInviteFriend}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-mono font-black uppercase tracking-widest rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>Simulate Invite</span>
                </button>
              </div>
            </div>

            {/* Referred list */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">Referred Invite Ledger</span>
              
              <div className="space-y-2">
                {referredFriends.map((f, i) => (
                  <div key={i} className="px-4 py-3 bg-slate-900/30 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-white">@{f.name}</span>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="text-slate-500">Allocated:</span> <span className="text-emerald-400 font-bold">+{f.creditsEarned} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
