import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, ShieldCheck, Landmark, Phone, Key, Clock, 
  HelpCircle, AlertCircle, CheckCircle, RefreshCw, X, ArrowRight, Copy, Globe, Send
} from 'lucide-react';

interface PaystackGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  email: string;
  amountUsd: number;
  reference: string;
  title: string;
}

interface CurrencyConfig {
  symbol: string;
  rate: number;
  label: string;
  flag: string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: { symbol: '₦', rate: 1500, label: 'Nigeria (NGN)', flag: '🇳🇬' },
  USD: { symbol: '$', rate: 1.0, label: 'Global / USA (USD)', flag: '🇺🇸' },
  GHS: { symbol: 'GH₵', rate: 15.2, label: 'Ghana (GHS)', flag: '🇬🇭' },
  KES: { symbol: 'KSh', rate: 131.5, label: 'Kenya (KES)', flag: '🇰🇪' },
  ZAR: { symbol: 'R', rate: 18.4, label: 'South Africa (ZAR)', flag: '🇿🇦' },
  GBP: { symbol: '£', rate: 0.78, label: 'United Kingdom (GBP)', flag: '🇬🇧' },
  EUR: { symbol: '€', rate: 0.92, label: 'Europe (EUR)', flag: '🇪🇺' },
};

export const PaystackGatewayModal: React.FC<PaystackGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  amountUsd,
  reference,
  title
}) => {
  // Let people living abroad select their local currency/country
  const [billingCurrency, setBillingCurrency] = useState<string>('USD');
  const [activeTab, setActiveTab] = useState<'card' | 'transfer' | 'ussd' | 'phone' | 'paystack_to_paystack'>('paystack_to_paystack');

  const selectedConfig = CURRENCIES[billingCurrency] || CURRENCIES.USD;
  const activeAmount = amountUsd * selectedConfig.rate;

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedBank, setSelectedBank] = useState('GTBank');
  const [senderPaystackEmail, setSenderPaystackEmail] = useState(email);

  // Interactive flow states
  const [paymentState, setPaymentState] = useState<'idle' | 'submitting_pin' | 'submitting_otp' | 'verifying' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transferTimer, setTransferTimer] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);

  // Transfer timer effect
  useEffect(() => {
    if (!isOpen || activeTab !== 'transfer' || transferTimer <= 0) return;
    const interval = setInterval(() => {
      setTransferTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab, transferTimer]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('9920192837');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMerchantEmail = () => {
    navigator.clipboard.writeText('paystack-ledger@chidon.iq');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const autofillTestCard = () => {
    setCardNumber('4000 1234 5678 9010');
    setExpiry('12/29');
    setCvv('123');
    setPin('4321');
    setErrorMessage(null);
  };

  const handlePaymentInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'card') {
      if (!cardNumber || cardNumber.length < 15) {
        setErrorMessage('Please enter a valid credit/debit card number.');
        return;
      }
      if (!expiry || expiry.length < 5) {
        setErrorMessage('Please enter card expiry (MM/YY).');
        return;
      }
      if (!cvv || cvv.length < 3) {
        setErrorMessage('Please enter valid 3-digit CVV security code.');
        return;
      }
      
      // Step into PIN entry
      setPaymentState('submitting_pin');
    } else if (activeTab === 'phone') {
      if (!phoneNumber || phoneNumber.length < 10) {
        setErrorMessage('Please enter a valid mobile number.');
        return;
      }
      setPaymentState('submitting_otp');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMessage('Please enter your 4-digit card PIN.');
      return;
    }
    setErrorMessage(null);
    setPaymentState('submitting_otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code sent to your device.');
      return;
    }
    setErrorMessage(null);
    triggerVerification();
  };

  const triggerVerification = () => {
    setPaymentState('verifying');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        onSuccess(reference);
      }, 1500);
    }, 2000);
  };

  const handleBankTransferSent = () => {
    setPaymentState('verifying');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        onSuccess(reference);
      }, 1500);
    }, 2500);
  };

  const handlePaystackToPaystackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPaystackEmail.trim() || !senderPaystackEmail.includes('@')) {
      setErrorMessage('Please enter a valid Paystack account email address.');
      return;
    }
    setErrorMessage(null);
    setPaymentState('verifying');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        onSuccess(reference);
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
      />

      {/* Paystack Box */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row text-slate-800 border border-slate-200"
      >
        
        {/* Left Side: Paystack payment channels menu */}
        <div className="w-full md:w-2/5 bg-slate-50 border-r border-slate-100 p-4 flex flex-col justify-between">
          <div className="space-y-4 text-left">
            {/* Paystack Logo & amount info */}
            <div>
              <span className="text-[10px] font-mono font-black text-slate-400 block tracking-widest uppercase">Paystack Secures</span>
              <div className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Chidon IQ</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{email}</p>
            </div>

            {/* Currency Selector for People Living Abroad */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={10} className="text-emerald-500" />
                <span>BILLING LOCATION</span>
              </label>
              <select
                value={billingCurrency}
                onChange={(e) => {
                  setBillingCurrency(e.target.value);
                  // Default tab based on currency
                  if (e.target.value !== 'NGN' && activeTab !== 'paystack_to_paystack' && activeTab !== 'card') {
                    setActiveTab('paystack_to_paystack');
                  } else if (e.target.value === 'NGN' && activeTab === 'paystack_to_paystack') {
                    setActiveTab('card');
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([code, cfg]) => (
                  <option key={code} value={code}>
                    {cfg.flag} {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-left">
              <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase block">Payable Amount</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-sm font-bold text-slate-900">{selectedConfig.symbol}</span>
                <span className="text-lg font-black text-slate-950">
                  {activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {billingCurrency !== 'USD' && (
                <div className="text-[8px] text-slate-400 font-mono mt-0.5">Approx. ${amountUsd} USD (1$ = {selectedConfig.symbol}{selectedConfig.rate})</div>
              )}
            </div>

            {/* Menu options list */}
            <div className="space-y-1 pt-1">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Channel</span>
              
              <button
                onClick={() => { setActiveTab('paystack_to_paystack'); setPaymentState('idle'); setErrorMessage(null); }}
                className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-left transition-all flex items-center justify-between ${activeTab === 'paystack_to_paystack' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <span className="flex items-center gap-1.5">
                  <Send size={11} className="text-emerald-500" />
                  <span>Paystack-to-Paystack</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-600 text-[8px] px-1 rounded-sm uppercase tracking-wider scale-90">ABROAD</span>
              </button>

              <button
                onClick={() => { setActiveTab('card'); setPaymentState('idle'); setErrorMessage(null); }}
                className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-left transition-all flex items-center gap-1.5 ${activeTab === 'card' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <CreditCard size={11} />
                <span>Pay with Card</span>
              </button>

              {billingCurrency === 'NGN' && (
                <>
                  <button
                    onClick={() => { setActiveTab('transfer'); setPaymentState('idle'); setErrorMessage(null); }}
                    className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-left transition-all flex items-center gap-1.5 ${activeTab === 'transfer' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <Landmark size={11} />
                    <span>Bank Transfer (NGN)</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('ussd'); setPaymentState('idle'); setErrorMessage(null); }}
                    className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-left transition-all flex items-center gap-1.5 ${activeTab === 'ussd' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <Key size={11} />
                    <span>USSD Dial (NGN)</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('phone'); setPaymentState('idle'); setErrorMessage(null); }}
                    className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-left transition-all flex items-center gap-1.5 ${activeTab === 'phone' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <Phone size={11} />
                    <span>Mobile Account (NGN)</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Secure lock footer */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-mono mt-4 text-left">
            <ShieldCheck size={12} className="text-emerald-500 flex-shrink-0" />
            <span>Secured by Paystack Escrow Integration.</span>
          </div>
        </div>

        {/* Right Side: Active Workspace Form */}
        <div className="flex-1 p-6 flex flex-col justify-between min-h-[350px]">
          
          {/* Header row with Close button */}
          <div className="flex justify-between items-start">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">{title}</span>
              <h3 className="text-xs font-extrabold text-slate-900">Sandbox Payment Portal</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Interactive States screens */}
          <div className="my-auto py-4">
            
            {paymentState === 'verifying' && (
              <div className="py-6 text-center space-y-4">
                <RefreshCw size={28} className="animate-spin text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">Verifying Transaction Ledger</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Routing through Paystack sandbox servers...</p>
                </div>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="py-6 text-center space-y-4">
                <CheckCircle size={36} className="text-emerald-500 fill-emerald-500/10 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">Payment Completed!</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Ref: {reference.slice(0, 16)}</p>
                </div>
              </div>
            )}

            {paymentState === 'idle' && (
              <>
                {/* 0. Paystack-to-Paystack direct cross-border transfer */}
                {activeTab === 'paystack_to_paystack' && (
                  <form onSubmit={handlePaystackToPaystackSubmit} className="space-y-3.5 text-left">
                    {errorMessage && (
                      <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-[10px] font-semibold leading-relaxed flex items-center gap-2">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2 text-slate-600">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 uppercase font-black">
                        <span>Merchant Account Node</span>
                        <span className="text-emerald-500">Live Payout Node</span>
                      </div>
                      
                      <div className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Receiver Merchant:</span>
                          <span className="font-bold text-slate-800">Chidon IQ Global Ltd</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Settlement Currency:</span>
                          <span className="font-bold text-slate-800">{selectedConfig.label}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Merchant Paystack ID:</span>
                          <div className="flex items-center gap-1 text-[9px]">
                            <span className="font-black text-slate-800">paystack-ledger@chidon.iq</span>
                            <button
                              type="button"
                              onClick={handleCopyMerchantEmail}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                            >
                              <Copy size={10} className={copied ? "text-emerald-500" : ""} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gateway Route:</span>
                          <span className="font-black text-emerald-600 bg-emerald-50 px-1 rounded-sm uppercase tracking-wider text-[8px]">
                            Paystack-to-Paystack direct ledger transfer
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Your Paystack Account / Registered Email
                      </label>
                      <input
                        type="email"
                        required
                        value={senderPaystackEmail}
                        onChange={(e) => setSenderPaystackEmail(e.target.value)}
                        placeholder="e.g. sender-paystack@domain.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-xs font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
                    >
                      <Send size={12} />
                      <span>Settle {selectedConfig.symbol}{activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </button>

                    <p className="text-[8px] font-mono text-slate-400 leading-relaxed text-center">
                      * Cross-border Paystack merchant accounts auto-resolve instantly. Foreign currencies are credited securely in real-time.
                    </p>
                  </form>
                )}

                {/* 1. Pay with Credit Card Form */}
                {activeTab === 'card' && (
                  <form onSubmit={handlePaymentInitiate} className="space-y-3.5 text-left">
                    {errorMessage && (
                      <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-[10px] font-semibold leading-relaxed flex items-center gap-2">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Enter Card Credentials</span>
                      <button
                        type="button"
                        onClick={autofillTestCard}
                        className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ⚡ Autofill Demo Card
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ''))}
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="12/29"
                          maxLength={5}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">CVV</label>
                        <input
                          type="password"
                          required
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 text-xs font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md mt-4"
                    >
                      <span>Pay {selectedConfig.symbol}{activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                )}

                {/* 2. Pay with Bank Transfer */}
                {activeTab === 'transfer' && (
                  <div className="space-y-4 text-left font-sans">
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
                      <Clock size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Transfer the exact NGN amount to the virtual account below. Account expires in <strong className="font-mono text-amber-600">{formatTimer(transferTimer)}</strong>.
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Amount:</span>
                        <span className="font-black text-slate-900 text-sm">₦{activeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bank Name:</span>
                        <span className="font-bold text-slate-800">Wema Bank / ALAT</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">9920192837</span>
                          <button 
                            onClick={handleCopyAccount} 
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                            title="Copy Account"
                          >
                            <Copy size={11} className={copied ? 'text-emerald-500' : ''} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-150 pt-2 text-[11px]">
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="font-bold text-slate-800">Chidon IQ Escrow Svc</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBankTransferSent}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <span>I have sent the money</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                {/* 3. Pay with USSD */}
                {activeTab === 'ussd' && (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Select Bank for USSD Code</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 font-sans text-xs font-semibold cursor-pointer"
                      >
                        <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                        <option value="Zenith">Zenith Bank</option>
                        <option value="Access">Access Bank</option>
                        <option value="UBA">United Bank for Africa (UBA)</option>
                        <option value="Sterling">Sterling Bank</option>
                      </select>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Dial USSD Code on Mobile</span>
                      <div className="text-lg font-mono font-black text-slate-950 select-all py-1">
                        {selectedBank === 'GTBank' && `*737*1*2*9920192837*${Math.round(activeAmount)}#`}
                        {selectedBank === 'Zenith' && `*966*000#`}
                        {selectedBank === 'Access' && `*901#`}
                        {selectedBank === 'UBA' && `*919#`}
                        {selectedBank === 'Sterling' && `*822#`}
                      </div>
                      <p className="text-[9px] text-slate-400">Verify dial code connects to Chidon Escrow Wema Virtual Account.</p>
                    </div>

                    <button
                      onClick={handleBankTransferSent}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <span>Confirm Dial Success</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                {/* 4. Pay with Phone / Mobile Account */}
                {activeTab === 'phone' && (
                  <form onSubmit={handlePaymentInitiate} className="space-y-4 text-left">
                    {errorMessage && (
                      <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                        <AlertCircle size={13} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Mobile Phone Number</label>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 08031234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 text-xs font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <span>Initiate Mobile Pay</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Verification OTP Steps */}
            {paymentState === 'submitting_pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
                {errorMessage && (
                  <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                    <AlertCircle size={13} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Enter Card 4-Digit PIN</label>
                    <span className="text-[9px] font-bold text-slate-400 italic">Secure Card Verification</span>
                  </div>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="* * * *"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-center font-mono text-sm font-bold tracking-[1em]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentState('idle')}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    Verify PIN
                  </button>
                </div>
              </form>
            )}

            {paymentState === 'submitting_otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4 text-left">
                {errorMessage && (
                  <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                    <AlertCircle size={13} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">One-Time Password (OTP)</label>
                    <span className="text-[9px] font-mono text-emerald-600 font-bold">Sent via SMS to device</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-center font-mono text-sm font-bold tracking-[0.5em]"
                  />
                  <span className="text-[8px] text-slate-400 block pt-1 text-center font-mono">Use any dummy numbers (e.g. 123456) to proceed.</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentState('idle')}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    Submit OTP
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Secured network branding */}
          <div className="text-[8px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
            <span>🛡 Certified PCI-DSS Compliant Gateway •</span>
            <span className="text-emerald-500 font-bold font-sans">paystack</span>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
