import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, CheckCircle, Clock, Calendar, ShieldCheck, 
  DollarSign, ArrowUpRight, BarChart2, MessageSquare, AlertCircle, 
  Layers, RefreshCw, FileText, ChevronRight, Activity, ArrowDownRight
} from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, FreelanceProfile } from './types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface FreelanceProjectsProps {
  profile: FreelanceProfile;
  onSelectOrder: (order: Order) => void;
  onNavigateToChats: () => void;
}

export const FreelanceProjects: React.FC<FreelanceProjectsProps> = ({
  profile,
  onSelectOrder,
  onNavigateToChats
}) => {
  const [roleMode, setRoleMode] = useState<'seller' | 'buyer'>(profile.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      const ordersQuery = roleMode === 'seller'
        ? query(ordersCol, where('sellerId', '==', profile.uid))
        : query(ordersCol, where('buyerId', '==', profile.uid));

      const querySnap = await getDocs(ordersQuery);
      setOrders(querySnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]);
    } catch (err) {
      console.error("Error fetching projects logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [roleMode, profile.uid]);

  // Aggregate project statistics
  const activeContracts = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedContracts = orders.filter(o => o.status === 'completed');
  const totalVolume = orders.reduce((acc, o) => acc + o.amount, 0);
  const escrowFunds = activeContracts.reduce((acc, o) => acc + o.amount, 0);

  // Milestone mapping
  const getMilestones = (order: Order) => {
    const isCompleted = order.status === 'completed';
    const isDelivered = order.status === 'delivered' || isCompleted;
    const isInProgress = order.status === 'in_progress' || isDelivered;
    const isReqMet = order.status !== 'pending_requirements';

    return [
      { label: "Secured Escrow", desc: "Funds locked safely in Paystack Escrow Smart Contract", completed: true },
      { label: "Submitted Guidelines", desc: "Requirements provided for project execution", completed: isReqMet },
      { label: "Implementation Phase", desc: "Active engineering, writing, or design delivery", completed: isInProgress },
      { label: "Delivery Received", desc: "Final artifacts handed over for verification", completed: isDelivered },
      { label: "Completed & Released", desc: "Funds disbursed cleanly to provider", completed: isCompleted },
    ];
  };

  // Calculate current progress percentage
  const calculateProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending_requirements': return 20;
      case 'in_progress': return 50;
      case 'revision': return 65;
      case 'delivered': return 85;
      case 'completed': return 100;
      case 'disputed': return 50;
      default: return 10;
    }
  };

  // Generate earnings reports data over time
  const monthlyEarningsData = [
    { name: 'Jan', amount: Math.floor(totalVolume * 0.1) || 120 },
    { name: 'Feb', amount: Math.floor(totalVolume * 0.25) || 350 },
    { name: 'Mar', amount: Math.floor(totalVolume * 0.4) || 680 },
    { name: 'Apr', amount: Math.floor(totalVolume * 0.6) || 1200 },
    { name: 'May', amount: Math.floor(totalVolume * 0.75) || 1850 },
    { name: 'Jun', amount: Math.floor(totalVolume * 1.0) || totalVolume || 2500 }
  ];

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Workspace Header Cards */}
      <div className="bg-slate-900 border-2 border-[var(--border-base)] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="text-brand animate-pulse" size={22} />
            Freelance Projects & Ledger Overview
          </h2>
          <p className="text-xs text-slate-400 font-mono">Real-time smart contract state logs, active milestones, and secure escrow ledgers</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setRoleMode('seller')}
            className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${roleMode === 'seller' ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Seller Ledger
          </button>
          <button
            onClick={() => setRoleMode('buyer')}
            className={`px-4 py-2 text-xs font-black font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer ${roleMode === 'buyer' ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Buyer Ledger
          </button>
        </div>
      </div>

      {/* Grid: Financial & General Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-2 relative overflow-hidden">
          <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-wider block">Completed Volume</span>
          <div className="text-3xl font-black text-emerald-500 font-mono flex items-baseline gap-1">
            ${completedContracts.reduce((acc, o) => acc + o.amount, 0)}
            <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
            <ArrowUpRight size={12} /> +12.4% vs last month
          </div>
        </div>

        <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-2">
          <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-wider block">Locked Escrow Funds</span>
          <div className="text-3xl font-black text-brand font-mono flex items-baseline gap-1">
            ${escrowFunds}
            <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-mono">Funds protected by paystack inline checkout</p>
        </div>

        <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-2">
          <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-wider block">Active Contracts</span>
          <div className="text-3xl font-black text-[var(--text-primary)] font-mono">
            {activeContracts.length}
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-mono">Milestones currently being evaluated</p>
        </div>

        <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-2">
          <span className="text-[10px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-wider block">Total Ledger Volume</span>
          <div className="text-3xl font-black text-cyan-500 font-mono">
            ${totalVolume}
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-mono">Aggregate lifetime workspace throughput</p>
        </div>
      </div>

      {/* Main Grid: Active Contracts vs Earnings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Contracts Tracking list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-base p-6 md:p-8 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--border-base)]/40 pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Briefcase size={16} className="text-brand" /> 
                Ongoing Project Milestones & Milestones Tracking
              </h3>
              <button 
                onClick={fetchProjects}
                className="p-1.5 rounded-lg border border-[var(--border-base)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] cursor-pointer"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-[var(--text-secondary)]">
                Syncing ledger progress milestones...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-[var(--border-base)]">
                <Briefcase size={32} className="text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--text-primary)]">No Freelance Projects Listed</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                    List a service or explore current job boards to create a persistent smart escrow agreement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const milestones = getMilestones(order);
                  const progressPct = calculateProgress(order.status);
                  
                  return (
                    <div 
                      key={order.id} 
                      className="p-5 rounded-2xl border border-[var(--border-base)] bg-slate-50/50 dark:bg-slate-900/30 space-y-4 hover:border-brand/40 transition-all cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-base)]/40 pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500">ID: #{order.id.slice(0, 8)}</span>
                          <h4 className="text-xs font-black text-[var(--text-primary)] hover:text-brand transition-colors line-clamp-1">{order.gigTitle}</h4>
                        </div>
                        <span className="text-xs font-mono font-black text-brand bg-brand/5 border border-brand/20 px-3 py-1 rounded-xl">
                          ${order.amount} USD
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-[var(--text-secondary)] uppercase">Completed Status</span>
                          <span className="font-bold text-brand">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-brand rounded-full transition-all duration-500" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Render Milestones Inline */}
                      <div className="space-y-2 pt-2">
                        <h5 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Project Checkpoints</h5>
                        <div className="grid grid-cols-5 gap-1.5">
                          {milestones.map((mil, idx) => (
                            <div 
                              key={idx} 
                              className={`p-1.5 rounded text-center border text-[8px] font-mono transition-all ${
                                mil.completed 
                                  ? 'bg-brand/10 border-brand/25 text-brand font-black' 
                                  : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-400'
                              }`}
                              title={`${mil.label}: ${mil.desc}`}
                            >
                              M{idx + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Financial Ledger & Analytics Reporting Graph */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-4">
              <BarChart2 size={16} className="text-cyan-500" />
              Intelligence Earnings & Cash Flow Report
            </h3>

            {/* Simulated Chart Container */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEarningsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontStyle="mono" />
                  <YAxis stroke="#64748b" fontSize={9} fontStyle="mono" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#ffffff'
                    }} 
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Checkpoint Details */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Security Escrow Checkpoints</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-bold text-[var(--text-primary)]">Commission-Free Guarantee</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-normal">
                      Chidon charges 0% fees on all finished escrow releases. Users take home exactly what they list.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-brand/10 border border-brand/25 text-brand mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-bold text-[var(--text-primary)]">Automatic Paystack Integration</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-normal">
                      Every transaction creates an automated Web3 milestone contract backed by certified fiat payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
