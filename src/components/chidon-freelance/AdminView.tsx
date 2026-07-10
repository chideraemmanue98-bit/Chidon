import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, AlertTriangle, Users, Briefcase, FileText, 
  Trash, CheckCircle, RefreshCw, XCircle, Award, DollarSign
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Gig, Order, Dispute, FreelanceProfile } from './types';
import { handleFirestoreError, OperationType } from './utils';

interface AdminViewProps {
  profile: FreelanceProfile;
}

export const AdminView: React.FC<AdminViewProps> = ({ profile }) => {
  const [users, setUsers] = useState<FreelanceProfile[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  
  const [activeTab, setActiveTab] = useState<'users' | 'gigs' | 'orders' | 'disputes'>('disputes');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load Users
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() })) as FreelanceProfile[]);

      // 2. Load Gigs
      const gigsSnap = await getDocs(collection(db, 'gigs'));
      setGigs(gigsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Gig[]);

      // 3. Load Orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]);

      // 4. Load Disputes
      const disputesSnap = await getDocs(collection(db, 'disputes'));
      setDisputes(disputesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Dispute[]);
    } catch (err) {
      console.warn("Error loading admin datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Seller verification toggling
  const toggleUserVerification = async (user: FreelanceProfile) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isVerified: !user.isVerified });
      setUsers(users.map(u => u.uid === user.uid ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Moderate / Delete gig
  const handleDeleteGig = async (gigId: string) => {
    if (!confirm("Are you sure you want to moderate and remove this gig?")) return;
    try {
      await deleteDoc(doc(db, 'gigs', gigId));
      setGigs(gigs.filter(g => g.id !== gigId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gigs/${gigId}`);
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (dispute: Dispute, resolution: 'refund_buyer' | 'payout_seller') => {
    try {
      // Update dispute status
      const disputeRef = doc(db, 'disputes', dispute.id);
      await updateDoc(disputeRef, {
        status: 'resolved',
        resolutionNotes: `Resolved by administrator: ${resolution === 'refund_buyer' ? 'Refunded buyer' : 'Paid out seller'}`
      });

      // Update order status based on resolution
      const orderRef = doc(db, 'orders', dispute.orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order;
        
        if (resolution === 'payout_seller') {
          await updateDoc(orderRef, { status: 'completed' });
          
          // Payout seller
          const sellerRef = doc(db, 'users', orderData.sellerId);
          const sellerSnap = await getDoc(sellerRef);
          if (sellerSnap.exists()) {
            await updateDoc(sellerRef, {
              earnings: (sellerSnap.data().earnings || 0) + orderData.amount,
              totalOrders: (sellerSnap.data().totalOrders || 0) + 1
            });
          }
        } else {
          // Refund Buyer
          await updateDoc(orderRef, { status: 'cancelled' });
        }
      }

      setDisputes(disputes.map(d => d.id === dispute.id ? { ...d, status: 'resolved' } : d));
      alert("Dispute resolution executed successfully!");
      fetchAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `disputes/${dispute.id}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 text-left">
      
      {/* Header operations bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-red-500" /> Administrative Moderation Console
          </h2>
          <p className="text-xs text-slate-400 font-mono">Verify freelance experts, mediate open disputes, and moderate active gigs</p>
        </div>

        <button 
          onClick={fetchAdminData}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl hover:text-white text-slate-500 flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Databases
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {(['disputes', 'users', 'gigs', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? 'bg-red-600 text-white border-red-600' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            {tab === 'disputes' ? `🔥 Disputes (${disputes.filter(d=>d.status==='open').length})` : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 font-mono animate-pulse">Running admin queries...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          
          {/* TAB 1: DISPUTES MEDIATION */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-500" /> Mediate Escrow Disputes
              </h3>

              <div className="space-y-4">
                {disputes.map((disp) => (
                  <div key={disp.id} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-850 pb-2">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Dispute ID: #{disp.id.slice(0, 8)}</span>
                        <h4 className="text-xs font-black text-white">Reason: {disp.reason}</h4>
                        <p className="text-[10px] font-mono text-slate-400">Raised By: @{disp.raisedByName}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black uppercase ${disp.status === 'open' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {disp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 italic">" {disp.details} "</p>

                    {disp.status === 'open' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-850/50">
                        <button
                          onClick={() => handleResolveDispute(disp, 'refund_buyer')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded-lg transition-all"
                        >
                          Refund Client (Cancel Order)
                        </button>
                        <button
                          onClick={() => handleResolveDispute(disp, 'payout_seller')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg transition-all"
                        >
                          Payout Expert (Complete Order)
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {disputes.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-500 font-mono italic">No disputes listed. ChidonFreelance escrow nodes are operating smoothly.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USER VERIFICATION */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase">User & Expert Badges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u) => (
                  <div key={u.uid} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarURL} alt={u.fullName} className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          {u.fullName || u.username}
                          {u.isVerified && <ShieldCheck size={12} className="text-emerald-400" />}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Role: {u.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleUserVerification(u)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase border transition-all ${u.isVerified ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20'}`}
                    >
                      {u.isVerified ? 'Revoke Verified' : 'Grant Verified'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GIG MODERATION */}
          {activeTab === 'gigs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase">Active Gig Listings</h3>

              <div className="space-y-2">
                {gigs.map((g) => (
                  <div key={g.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{g.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Seller: @{g.sellerName} | Category: {g.category}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteGig(g.id)}
                      className="p-2 bg-slate-900 hover:bg-red-600/20 hover:text-red-400 text-slate-500 rounded-lg border border-slate-850"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS CONTROL */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase">Universal Contract Ledger</h3>

              <div className="space-y-2">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500">#{ord.id.slice(0, 8)}</span>
                        <h4 className="font-bold text-white line-clamp-1">{ord.gigTitle}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">Buyer: @{ord.buyerName} | Seller: @{ord.sellerName} | Amount: ${ord.amount}</p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-slate-900 border border-slate-850 text-slate-400">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
