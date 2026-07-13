import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, CreditCard, Wallet, Banknote, RefreshCw, ArrowUpRight, 
  CheckCircle, ArrowRight, Printer, Download, Eye, X, HelpCircle, 
  FileText, ArrowDownLeft, ShieldCheck, DollarSign
} from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, FreelanceProfile } from './types';
import { handleFirestoreError, OperationType } from './utils';

interface PaymentDashboardViewProps {
  profile: FreelanceProfile;
  onRefreshProfile?: () => void;
}

interface WithdrawalLog {
  id: string;
  amount: number;
  method: string;
  destination: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  reference: string;
}

export const PaymentDashboardView: React.FC<PaymentDashboardViewProps> = ({ 
  profile, 
  onRefreshProfile 
}) => {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal form states
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'crypto' | 'paypal'>('bank');
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  
  // Local storage logs for withdrawals
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalLog[]>(() => {
    const saved = localStorage.getItem(`withdrawals_${profile.uid}`);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchFinanceLogs = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      const ordersQuery = query(ordersCol, where('sellerId', '==', profile.uid));
      const ordersSnap = await getDocs(ordersQuery);
      const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];

      const completed = allOrders.filter(o => o.status === 'completed');
      const active = allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

      setCompletedOrders(completed);
      setActiveOrders(active);
    } catch (err) {
      console.error("Error retrieving financial logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceLogs();
  }, [profile.uid]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const earnings = profile.earnings || 0;

    if (withdrawAmount <= 0) {
      setErrorMessage("Please enter a valid payout amount.");
      return;
    }
    if (withdrawAmount > earnings) {
      setErrorMessage(`Insufficient balance. You have $${earnings} available to withdraw.`);
      return;
    }

    let destination = '';
    if (payoutMethod === 'bank') {
      if (!accountNumber || accountNumber.length < 10) {
        setErrorMessage("Please enter a valid 10-digit bank account number.");
        return;
      }
      destination = `${bankName} • Acct: ${accountNumber.slice(0, 3)}****${accountNumber.slice(-3)}`;
    } else if (payoutMethod === 'crypto') {
      if (!cryptoAddress || cryptoAddress.length < 20) {
        setErrorMessage("Please enter a valid Web3 cryptocurrency wallet address.");
        return;
      }
      destination = `USDT Wallet • ${cryptoAddress.slice(0, 6)}...${cryptoAddress.slice(-4)}`;
    } else {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        setErrorMessage("Please enter a valid PayPal account email address.");
        return;
      }
      destination = `PayPal • ${paypalEmail}`;
    }

    setIsWithdrawing(true);
    try {
      // Deduct earnings from Firestore user profile document
      const userRef = doc(db, 'users', profile.uid);
      const remainingEarnings = Math.max(0, earnings - withdrawAmount);
      await updateDoc(userRef, {
        earnings: remainingEarnings
      });

      // Add system notification
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'Payout Dispatched',
        message: `Your withdrawal of $${withdrawAmount} is processing. Funds routed to: ${destination}`,
        type: 'system',
        isRead: false,
        createdAt: new Date()
      });

      // Update withdrawal logs locally
      const refHash = `TX-WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newLog: WithdrawalLog = {
        id: refHash,
        amount: withdrawAmount,
        method: payoutMethod === 'bank' ? `${bankName} Transfer` : payoutMethod === 'crypto' ? 'USDT (ERC-20)' : 'PayPal Payout',
        destination,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'completed',
        reference: refHash
      };

      const updatedLogs = [newLog, ...withdrawalHistory];
      setWithdrawalHistory(updatedLogs);
      localStorage.setItem(`withdrawals_${profile.uid}`, JSON.stringify(updatedLogs));

      setWithdrawalSuccess(true);
      setWithdrawAmount(Math.max(0, remainingEarnings));
      setAccountNumber('');
      setCryptoAddress('');
      setPaypalEmail('');
      setAccountName('');

      if (onRefreshProfile) {
        onRefreshProfile();
      }

      setTimeout(() => {
        setWithdrawalSuccess(false);
      }, 3000);

    } catch (err) {
      console.error("Payout transaction failed:", err);
      setErrorMessage("Cashout transaction interrupted. Please verify connection and retry.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const calculateLifetimeEarnings = () => {
    return completedOrders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
  };

  const calculatePendingEscrow = () => {
    return activeOrders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
  };

  const calculateTotalWithdrawn = () => {
    return withdrawalHistory.reduce((sum, log) => sum + log.amount, 0);
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* Visual Finance Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-950 border border-cyan-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[240px] h-[240px] rounded-full bg-cyan-500/5 filter blur-[60px] pointer-events-none" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest font-mono">
            Seller Finance Terminal
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">Revenue Tracking & Payout Hub</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Track sandbox client receipts, audit zero-commission escrow settlements, and initiate direct payouts instantly.
          </p>
        </div>

        <button 
          onClick={fetchFinanceLogs} 
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-stretch md:self-auto justify-center"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-cyan-400' : ''} />
          <span>Refresh ledger</span>
        </button>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Available Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono">${profile.earnings || 0}</div>
            <p className="text-[9px] text-slate-500 font-mono">Settled funds ready to withdraw</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/40" />
        </div>

        {/* Metric 2: Pending Escrow */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Held in Escrow</span>
            <Banknote className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-amber-400 font-mono">${calculatePendingEscrow()}</div>
            <p className="text-[9px] text-slate-500 font-mono">Locked in active milestones</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500/40" />
        </div>

        {/* Metric 3: Lifetime Earnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Lifetime Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-450 font-mono">${calculateLifetimeEarnings()}</div>
            <p className="text-[9px] text-slate-500 font-mono">Total earned on Chidon (0% Fees)</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/40" />
        </div>

        {/* Metric 4: Lifetime Withdrawn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Lifetime Payouts</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-indigo-400 font-mono">${calculateTotalWithdrawn()}</div>
            <p className="text-[9px] text-slate-500 font-mono">Successfully cashed out to accounts</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500/40" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Completed Receipts and Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileText size={15} className="text-cyan-400" /> Earned Payment Receipts
                </h3>
                <p className="text-[11px] text-slate-500">Official, verified receipts for every approved escrow service</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono font-extrabold text-slate-400">
                {completedOrders.length} settled
              </span>
            </div>

            {loading ? (
              <div className="text-center text-xs text-slate-500 py-16 font-mono flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-cyan-400" />
                <span>Decrypting ledger logs...</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {completedOrders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="p-4 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">REC-ORD-{ord.id.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold uppercase border border-emerald-500/20">
                          Released
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{ord.gigTitle}</h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        Client: @{ord.buyerName} | Deposit: ${ord.amount}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2 hidden sm:block">
                        <div className="text-xs font-black text-white font-mono">+${ord.amount}</div>
                        <div className="text-[8px] font-mono text-slate-500">0% fee applied</div>
                      </div>
                      <button 
                        onClick={() => setSelectedReceipt(ord)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white rounded-lg border border-slate-850 text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={11} />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}

                {completedOrders.length === 0 && (
                  <div className="text-center py-16 space-y-3 bg-slate-950/20 rounded-xl border border-dashed border-slate-850">
                    <FileText size={28} className="text-slate-700 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold">No Settled Receipts Yet</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Receipts are automatically audited and generated immediately upon successful client approval and release of funds from escrow.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cashout Form */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ArrowUpRight size={16} className="text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                Initiate Secure Withdrawal
              </h3>
            </div>

            {withdrawalSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle size={20} className="text-emerald-400 mx-auto animate-bounce" />
                <span className="text-emerald-400 font-black text-xs uppercase block">Withdrawal Confirmed</span>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Funds released and routed to your designated payout channel. Audit receipt posted to your transaction history.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-semibold leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                {/* Method */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">Payout Destination</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => {
                      setPayoutMethod(e.target.value as any);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-sans text-xs font-semibold cursor-pointer"
                  >
                    <option value="bank">Direct Nigerian Bank Transfer (NGN)</option>
                    <option value="crypto">Web3 Wallet (USDT ERC-20 / USDC)</option>
                    <option value="paypal">PayPal / International Wire (USD)</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">Withdraw Amount (USD)</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(profile.earnings || 0)}
                      className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
                    >
                      Max (${profile.earnings || 0})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={5}
                      max={profile.earnings || 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl pl-7 pr-3 py-2 outline-none focus:border-cyan-500 font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Conditional Fields based on method */}
                {payoutMethod === 'bank' && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">Select Destination Bank</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-sans text-xs font-semibold cursor-pointer"
                      >
                        <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                        <option value="Zenith">Zenith Bank</option>
                        <option value="Access">Access Bank</option>
                        <option value="Kuda">Kuda Microfinance Bank</option>
                        <option value="UBA">United Bank for Africa (UBA)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">10-Digit Account Number</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 0123456789"
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-mono text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. Chidon IQ Operator"
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-sans text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                {payoutMethod === 'crypto' && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">USDT Destination Wallet (ERC-20)</label>
                      <input
                        type="text"
                        required
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="e.g. 0x71C...3A9f"
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                {payoutMethod === 'paypal' && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">PayPal Account Email</label>
                      <input
                        type="email"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-sans text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isWithdrawing || (profile.earnings || 0) <= 0 || withdrawAmount < 5}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isWithdrawing ? 'Validating security rails...' : 'Execute Instant Cashout'}
                </button>
              </form>
            )}
          </div>

          {/* Past Payout Transaction History logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
              Withdrawal Audit Log
            </h4>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {withdrawalHistory.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-[11px] font-mono flex justify-between items-center">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold">${log.amount}</span>
                      <span className="text-[8px] text-slate-500 uppercase">({log.method})</span>
                    </div>
                    <div className="text-[8px] text-slate-500 truncate max-w-[130px]" title={log.destination}>
                      To: {log.destination}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">
                      {log.status}
                    </span>
                    <div className="text-[8px] text-slate-500">{log.date}</div>
                  </div>
                </div>
              ))}

              {withdrawalHistory.length === 0 && (
                <div className="text-center py-6 text-[11px] font-mono text-slate-500 italic">
                  No previous payouts.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- PREMIUM RECEIPT PRINT DIALOG MODAL --- */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSelectedReceipt(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl z-10 space-y-6 flex flex-col justify-between"
            >
              {/* Receipt Body */}
              <div id="printable-escrow-receipt" className="space-y-6">
                
                {/* Header branding */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div className="text-left">
                    <div className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">CHIDON ESCROW NETWORK</div>
                    <h2 className="text-lg font-black text-slate-950 tracking-tight">PAYMENT RECEIPT</h2>
                    <p className="text-[9px] font-mono text-slate-500">SECURE TRANSACTION VERIFIED BY CRYPTO-ROUTED ESCROW</p>
                  </div>
                  
                  <div className="text-right font-mono text-[10px] text-slate-500 space-y-0.5">
                    <div>Receipt Ref: <span className="font-bold text-slate-900">CHID-REC-{selectedReceipt.id.slice(0, 8).toUpperCase()}</span></div>
                    <div>Date release: <span className="font-bold text-slate-900">{new Date(selectedReceipt.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span></div>
                  </div>
                </div>

                {/* Relational details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Settled Beneficiary (Seller)</span>
                    <div className="font-bold text-slate-950">{selectedReceipt.sellerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Freelance Node ID: @{profile.username}</div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Client Depositor (Buyer)</span>
                    <div className="font-bold text-slate-950">{selectedReceipt.buyerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Depositor Account</div>
                  </div>
                </div>

                {/* Line items table */}
                <div className="border-t border-b border-slate-150 py-3 text-xs">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 uppercase mb-2">
                    <span>Description</span>
                    <span>Total (USD)</span>
                  </div>
                  <div className="flex justify-between font-bold items-center text-slate-900">
                    <div className="text-left">
                      <div className="text-xs">{selectedReceipt.gigTitle}</div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">Package: {selectedReceipt.packageType} ({selectedReceipt.packageTitle})</div>
                    </div>
                    <span className="font-mono text-xs font-black">${selectedReceipt.amount}.00</span>
                  </div>
                </div>

                {/* Calculation audit */}
                <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-150 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">${selectedReceipt.amount}.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Chidon Commission (0% Promo)</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-100 pt-2">
                    <span>Net Released Payout</span>
                    <span className="font-mono text-slate-950">${selectedReceipt.amount}.00</span>
                  </div>
                </div>

                {/* Escrow verification seal */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-left">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div className="text-[10px] leading-normal text-slate-500">
                    <span className="font-bold text-slate-800 block">Verified Escrow Release Seal</span>
                    This transaction has been successfully released from sandbox escrow custody directly into the beneficiary's active funds ledger. Paystack Ref: <span className="font-mono font-bold text-slate-700">{selectedReceipt.paystackReference || 'SIMULATED_ESC_SETTLE'}</span>.
                  </div>
                </div>

              </div>

              {/* Print Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-150">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    // Generate a real download file with receipt details
                    try {
                      const content = `CHIDON ESCROW AUDIT RECEIPT\n` +
                        `====================================\n` +
                        `Receipt ID: ${selectedReceipt.id}\n` +
                        `Order ID: ${selectedReceipt.id}\n` +
                        `Buyer: ${selectedReceipt.buyerName}\n` +
                        `Seller: ${selectedReceipt.sellerName}\n` +
                        `Package: ${selectedReceipt.packageTitle}\n` +
                        `Amount Paid: $${selectedReceipt.amount}\n` +
                        `Status: Fully Settled / Released from Escrow\n` +
                        `Paystack Reference: ${selectedReceipt.paystackReference || 'SIMULATED_ESC_SETTLE'}\n` +
                        `====================================\n` +
                        `Thank you for using Chidon Freelance.`;
                      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `receipt_escrow_${selectedReceipt.id}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } catch (e) {
                      console.error("Failed to generate receipt:", e);
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
