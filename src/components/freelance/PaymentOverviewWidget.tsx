import React, { useState } from 'react';
import { Shield, Clock, HelpCircle, Coins, ArrowUpRight, Award, CheckCircle, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { Order } from './types';

interface PaymentOverviewWidgetProps {
  orders: Order[];
  role: 'buyer' | 'seller';
  onWithdrawClick?: () => void;
  onRefresh?: () => void;
}

export const PaymentOverviewWidget: React.FC<PaymentOverviewWidgetProps> = ({
  orders,
  role,
  onWithdrawClick,
  onRefresh
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // 1. Calculate Escrow Status
  const activeEscrowOrders = orders.filter(
    o => o.status === 'in_escrow' || o.status === 'revision_requested' || o.status === 'delivered'
  );
  
  const totalHeldInEscrow = activeEscrowOrders.reduce((sum, o) => sum + o.price, 0);

  // 2. Pending Milestones
  // Standard escrow splits: Milestone 1: 35% (funded), Milestone 2: 40% (pending), Milestone 3: 25% (pending)
  // Let's dynamically create milestone breakdowns based on active escrow orders
  const pendingMilestonesCount = activeEscrowOrders.length * 2; // Assuming 2 pending milestones per active contract
  const pendingMilestoneFunds = activeEscrowOrders.reduce((sum, o) => sum + Math.round(o.price * 0.65), 0); // 65% pending release

  // 3. Funds Ready for Payout
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalEarned = completedOrders.reduce((sum, o) => sum + o.price, 0);
  
  // Available is total earned, with standard buffer simulation
  const fundsReadyForPayout = role === 'seller' ? Math.max(0, totalEarned) : 0; 
  const totalRefundableFunds = role === 'buyer' ? orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.price, 0) : 0;

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-2xl select-text">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Shield size={16} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
              Paystack Smart Escrow Vault
            </h4>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block mt-0.5">
              Secure Ledger Node Verification
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh ledger state"
            >
              <RefreshCw size={12} className="animate-hover-spin" />
            </button>
          )}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[9px] font-mono font-black bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            {showBreakdown ? 'Hide Ledger' : 'Show Ledger'}
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Held-In-Escrow */}
        <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={36} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              Held in Escrow
            </span>
            <h3 className="text-2xl font-mono font-black text-white mt-1.5 tracking-tight">
              ${totalHeldInEscrow.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>{activeEscrowOrders.length} active contract{activeEscrowOrders.length !== 1 ? 's' : ''}</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/5 px-2 py-0.5 rounded-full border border-cyan-500/10">Locked</span>
          </div>
        </div>

        {/* Metric 2: Pending Milestones */}
        <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={36} className="text-yellow-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              Pending Milestones
            </span>
            <h3 className="text-2xl font-mono font-black text-white mt-1.5 tracking-tight">
              ${pendingMilestoneFunds.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>{pendingMilestonesCount} future phases</span>
            <span className="text-yellow-400 font-bold bg-yellow-500/5 px-2 py-0.5 rounded-full border border-yellow-500/10">Deferred</span>
          </div>
        </div>

        {/* Metric 3: Ready for Payout */}
        <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins size={36} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              {role === 'seller' ? 'Funds Ready for Payout' : 'Refundable Canceled Funds'}
            </span>
            <h3 className="text-2xl font-mono font-black text-white mt-1.5 tracking-tight">
              ${(role === 'seller' ? fundsReadyForPayout : totalRefundableFunds).toLocaleString()}
            </h3>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-500">
              {role === 'seller' ? 'Cleared and withdrawable' : 'Refunding client ledger'}
            </span>
            {role === 'seller' && onWithdrawClick && fundsReadyForPayout > 0 && (
              <button
                onClick={onWithdrawClick}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                Withdraw <ArrowUpRight size={10} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Expandable Detailed Ledger Breakdown */}
      {showBreakdown && (
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-1 text-[10px] font-mono font-black text-white uppercase tracking-wider">
            <Layers size={11} className="text-cyan-400" />
            <span>Escrow Ledger Audit Ledger</span>
          </div>

          {activeEscrowOrders.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeEscrowOrders.map((order) => {
                const milestone1 = Math.round(order.price * 0.35);
                const milestone2 = Math.round(order.price * 0.40);
                const milestone3 = Math.round(order.price * 0.25);

                return (
                  <div key={order.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-left">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[200px] font-bold text-white">
                        {order.gigTitle}
                      </span>
                      <span className="font-extrabold text-cyan-400">${order.price} Total</span>
                    </div>

                    {/* Milestones Pipeline Visual */}
                    <div className="grid grid-cols-3 gap-1.5 text-[8px] font-mono uppercase font-black text-center">
                      <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Ph1: ${milestone1} <span className="block text-[6px] font-bold text-emerald-500">FUNDED</span>
                      </div>
                      <div className={`p-1 rounded ${
                        order.status === 'delivered' || order.status === 'revision_requested'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                          : 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500/60'
                      }`}>
                        Ph2: ${milestone2} <span className="block text-[6px] font-bold">{order.status === 'delivered' ? 'SUBMITTED' : 'IN PLAY'}</span>
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-500">
                        Ph3: ${milestone3} <span className="block text-[6px] font-bold">RELEASE</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-950/40 border border-slate-850 border-dashed rounded-2xl text-center">
              <span className="text-[10px] font-mono text-slate-500">No active milestone transactions found in this session.</span>
            </div>
          )}

          {/* Secure Handshake Disclaimer */}
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl text-[9px] text-slate-400 leading-normal flex items-start gap-1.5 font-mono">
            <AlertTriangle size={12} className="text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
            <p>
              Escrowed funds are held safely by the smart ledger contract nodes using Paystack. Sellers can request clearance at any time; buyers reserve 48hr rejection/revision rights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
