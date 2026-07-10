import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingCart, RefreshCw, ArrowRight, ShieldCheck, 
  Search, ExternalLink, Sparkles, Compass, HelpCircle, Activity
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, FreelanceProfile } from './types';

interface BuyerDashboardViewProps {
  profile: FreelanceProfile;
  onSelectOrder: (order: Order) => void;
  onNavigateToExplore: () => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({ 
  profile, 
  onSelectOrder,
  onNavigateToExplore
}) => {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyerData = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      const ordersQuery = query(ordersCol, where('buyerId', '==', profile.uid));
      const ordersSnap = await getDocs(ordersQuery);
      setMyOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]);
    } catch (err) {
      console.warn("Error fetching buyer dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [profile.uid]);

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in_progress': return 'bg-brand/10 text-brand border-brand/20';
      case 'delivered': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'pending_requirements': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'disputed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-850 text-slate-400 border-slate-800';
    }
  };

  const totalInvestment = myOrders.reduce((acc, o) => acc + (o.amount || 0), 0);
  const activeContractsCount = myOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedContractsCount = myOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* 1. Buyer Welcome & Summary */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] font-black uppercase tracking-wider font-mono">
              Buyer Command Center
            </span>
            <span className="text-slate-500 text-[10px] font-mono">Commission-Free Talent Acquisition</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">ChidonFreelance Buyer Dashboard</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Browse services worldwide, commission projects, manage active escrows, and download high-quality assets seamlessly.
          </p>
        </div>

        <button
          onClick={onNavigateToExplore}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/10 shrink-0 cursor-pointer"
        >
          <Compass size={14} />
          <span>Browse Services</span>
        </button>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Project Investment</span>
          <div className="text-2xl font-black text-white font-mono">${totalInvestment}</div>
          <p className="text-[10px] text-slate-500 font-mono">Capital deployed across all transactions</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Ongoing Escrow Holds</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{activeContractsCount}</div>
          <p className="text-[10px] text-slate-500 font-mono">Active jobs being completed by freelancers</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Completed Contracts</span>
          <div className="text-2xl font-black text-blue-400 font-mono">{completedContractsCount}</div>
          <p className="text-[10px] text-slate-500 font-mono">Deliverables approved and released from escrow</p>
        </div>
      </div>

      {/* 3. Core Layout Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Orders In Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={15} className="text-emerald-400" /> 
                <span>Your Escrow Orders In Progress</span>
              </h3>
              
              <button 
                onClick={fetchBuyerData} 
                className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg hover:text-white text-slate-500 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {loading ? (
              <div className="text-center text-xs text-slate-500 py-10 font-mono">Syncing active contract indexes...</div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((ord) => (
                  <div 
                    key={ord?.id}
                    onClick={() => ord?.id && onSelectOrder(ord)}
                    className="p-5 bg-slate-950/40 border border-slate-850 hover:border-emerald-500/30 hover:bg-slate-950 rounded-2xl cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-[9px] font-mono font-bold text-slate-500">#{ord?.id?.slice(0, 8)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black uppercase border ${getStatusStyle(ord?.status)}`}>
                          {ord?.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{ord?.gigTitle}</h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        Expert Partner: <span className="text-slate-300 font-bold">@{ord?.sellerName}</span> | Allocated Escrow: <span className="text-emerald-400 font-bold">${ord?.amount}</span>
                      </p>
                    </div>

                    <button className="p-2.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all">
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}

                {myOrders.length === 0 && (
                  <div className="text-center py-12 space-y-3 bg-slate-950/10 rounded-2xl border border-dashed border-slate-850">
                    <ShoppingCart size={24} className="text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">No active contracts found in your buyer history.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Guarantees & Safe Harbor */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} /> Chidon Escrow Protection
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-semibold pl-4 list-disc">
              <li>Your funds are locked in secure holding and only released upon your explicit approval of the deliverables.</li>
              <li>Milestone releases are tracked in real-time with comprehensive files and change logs.</li>
              <li>Disputes are handled objectively with rapid admin mediation panels.</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Looking for Gigs?</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Browse elite verified tech and creative experts with transparent multi-tiered pricing packages.
            </p>
            <button 
              onClick={onNavigateToExplore}
              className="w-full mt-2 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[10px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Launch Market Explorer</span>
              <ExternalLink size={10} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
