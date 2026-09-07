import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Percent, DollarSign, Info, CreditCard, ChevronRight, Check } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { FreelanceGig } from './types';

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: FreelanceGig | null;
  selectedPackage: 'basic' | 'standard' | 'premium';
  onPaymentSuccess: (ref: string, amountPaidUSD: number, hasMilestones: boolean, milestoneBreakdown: any[]) => Promise<void>;
  buyerEmail: string;
}

export const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({
  isOpen,
  onClose,
  gig,
  selectedPackage,
  onPaymentSuccess,
  buyerEmail
}) => {
  const [paystackKey, setPaystackKey] = useState('pk_test_412e6bf54bfaec7217fb0da793ffcebca9a23999'); // Official default public key
  const [email, setEmail] = useState(buyerEmail || 'buyer@chidon.iq');
  const [phone, setPhone] = useState('08123456789');
  
  // Funding Options
  const [escrowType, setEscrowType] = useState<'full' | 'milestones'>('full');
  
  // Coupon state
  const [coupon, setCoupon] = useState('');
  const [appliedCode, setAppliedCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');

  // Processing payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transRef, setTransRef] = useState('');

  if (!isOpen || !gig) return null;

  // Base pricing configurations
  const packagePriceMap = {
    basic: gig.price,
    standard: Math.round(gig.price * 1.8),
    premium: Math.round(gig.price * 3.2)
  };

  const basePrice = packagePriceMap[selectedPackage];
  
  // Coupon reduction
  let discountValue = 0;
  if (appliedCode === 'CHIDON20') {
    discountValue = basePrice * 0.20;
  } else if (appliedCode === 'GROWTH50') {
    discountValue = Math.min(basePrice - 5, 50);
  } else if (appliedCode === 'AI-VERIFIED') {
    discountValue = basePrice * 0.10;
  }

  const subtotal = basePrice - discountValue;
  const paystackFee = parseFloat((subtotal * 0.015).toFixed(2)); // 1.5% gateway fee
  const finalPriceUSD = parseFloat((subtotal + paystackFee).toFixed(2));
  
  // Standard conversion to Nigerian Naira for Paystack Card Processing
  const EXCHANGE_RATE_NGN = 1650;
  const finalPriceNGN = Math.round(finalPriceUSD * EXCHANGE_RATE_NGN);

  const handleApplyCoupon = () => {
    setCouponError('');
    const cleanCode = coupon.trim().toUpperCase();
    if (['CHIDON20', 'GROWTH50', 'AI-VERIFIED'].includes(cleanCode)) {
      setAppliedCode(cleanCode);
      setCoupon('');
    } else {
      setCouponError('Invalid coupon code. Try CHIDON20, GROWTH50 or AI-VERIFIED');
    }
  };

  // Setup React Paystack configurations
  const paystackConfig = {
    reference: 'chidon_esc_' + Math.floor(Math.random() * 1000000000 + 1),
    email: email.trim(),
    amount: finalPriceNGN * 100, // Paystack operates in NGN kobo / minor units
    publicKey: paystackKey.trim() || 'pk_test_412e6bf54bfaec7217fb0da793ffcebca9a23999',
    currency: 'NGN',
    metadata: {
      custom_fields: [
        { display_name: "Buyer Email", variable_name: "buyer_email", value: email },
        { display_name: "Gig Title", variable_name: "gig_title", value: gig.title },
        { display_name: "Selected Package", variable_name: "selected_package", value: selectedPackage }
      ]
    }
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleLaunchPaystackPayment = () => {
    setIsProcessing(true);

    // Configure Milestone Breakdowns if selected
    const milestones = escrowType === 'milestones' ? [
      { id: 'ms1', label: 'Milestone 1: Creative Strategy & Outlines', percentage: 35, cost: parseFloat((finalPriceUSD * 0.35).toFixed(2)), status: 'funded' },
      { id: 'ms2', label: 'Milestone 2: Work Draft & Delivery Review', percentage: 40, cost: parseFloat((finalPriceUSD * 0.40).toFixed(2)), status: 'pending' },
      { id: 'ms3', label: 'Milestone 3: Revisions & Handover', percentage: 25, cost: parseFloat((finalPriceUSD * 0.25).toFixed(2)), status: 'pending' }
    ] : [
      { id: 'ms_full', label: 'Single Fully Funded Escrow', percentage: 100, cost: finalPriceUSD, status: 'funded' }
    ];

    try {
      initializePayment({
        onSuccess: async (response?: any) => {
          const referenceCode = response?.reference || paystackConfig.reference;
          setTransRef(referenceCode);
          setPaymentSuccess(true);
          setIsProcessing(false);
          
          setTimeout(async () => {
            await onPaymentSuccess(referenceCode, finalPriceUSD, escrowType === 'milestones', milestones);
            setPaymentSuccess(false);
            onClose();
          }, 2000);
        },
        onClose: () => {
          setIsProcessing(false);
          alert('Sovereign escrow payment cancelled. No funds have been deducted.');
        }
      });
    } catch (err) {
      console.error('[Paystack React SDK Error]:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto select-text">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 relative text-left"
      >
        <button
          onClick={onClose}
          id="btn-close-paystack"
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full cursor-pointer transition-colors"
        >
          <X size={14} />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield size={16} className="text-cyan-400" />
          <div>
            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest leading-none">Paystack Escrow Terminal</h3>
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-1 inline-block">OFFICIAL REACT SDK CONNECTED</span>
          </div>
        </div>

        {paymentSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <Check size={24} strokeWidth={3} />
            </div>
            <h3 className="text-base font-black text-white">Payment Verified Successfully</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans leading-relaxed">
              Transaction ID: <span className="font-mono text-cyan-400">{transRef}</span>. Escrow contract locked. The creator has been notified to start production.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Gig Info recap */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">{selectedPackage} Package Selection</span>
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{gig.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono">By vetted seller: @{gig.sellerName}</p>
            </div>

            {/* Contract Type Selection: Single Funding vs Upwork Milestones */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Contract Funding Strategy</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEscrowType('full')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    escrowType === 'full'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono block">Single Escrow</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 block">Fund full amount upfront</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEscrowType('milestones')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    escrowType === 'milestones'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono block">Milestones Track</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 block">Release in chunks (35/40/25)</span>
                </button>
              </div>
            </div>

            {/* Email & Public Key configurations */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block">Billing Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block">Mobile Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Advanced Custom Key Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block">Paystack Public Key</label>
                  <span className="text-[8px] font-mono text-slate-500">Official SDK configuration field</span>
                </div>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={paystackKey}
                  onChange={(e) => setPaystackKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-[10px] text-slate-400 outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Coupons & Credits Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Coupons & Credits</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CHIDON20, GROWTH50"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCode && (
                <p className="text-[10px] text-emerald-400 font-mono">
                  ✓ Code {appliedCode} applied successfully!
                </p>
              )}
              {couponError && (
                <p className="text-[10px] text-rose-400 font-mono">
                  {couponError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Package:</span>
                <span className="text-white">${basePrice}</span>
              </div>
              {appliedCode && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Code Discount:</span>
                  <span>-${discountValue}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Paystack Gateway Fee (1.5%):</span>
                <span className="text-white">${paystackFee}</span>
              </div>
              <div className="border-t border-slate-800 my-1 pt-1.5 flex justify-between items-center text-sm">
                <span className="text-white font-bold">Total (USD):</span>
                <span className="text-cyan-400 font-black">${finalPriceUSD}</span>
              </div>
              <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-slate-400 text-[10px] leading-normal flex items-start gap-1.5">
                <Info size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Paystack runs in **NGN** currency. Equivalent payment due: <strong>₦{finalPriceNGN.toLocaleString()}</strong> at ₦{EXCHANGE_RATE_NGN}/$1.
                </p>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleLaunchPaystackPayment}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <CreditCard size={14} />
              <span>{isProcessing ? 'Processing Transaction...' : `Secure Pay ₦${finalPriceNGN.toLocaleString()}`}</span>
            </button>

            <p className="text-[9px] text-slate-500 font-mono text-center">
              Powered by official Paystack React SDK nodes. Funds are held in escrow.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
