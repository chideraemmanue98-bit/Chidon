import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CreditCard, ShieldCheck, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface PaystackButtonProps {
  price: number; // The price in full dollars (e.g., 9.99), not in cents
  email: string; // Customer's billing email
  name: string;  // Customer's display name
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
}

interface ToastState {
  type: 'success' | 'error' | 'info' | null;
  message: string;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  price,
  email,
  name,
  onSuccess,
  onCancel
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [toast, setToast] = useState<ToastState>({ type: null, message: '' });
  const [isOpening, setIsOpening] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load the Paystack Inline script dynamically
  useEffect(() => {
    if ((window as any).PaystackPop) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      console.log("Paystack Inline SDK successfully loaded dynamically");
    };
    script.onerror = () => {
      setScriptError(true);
      console.error("Failed to load Paystack Inline SDK");
    };
    document.body.appendChild(script);

    return () => {
      // Clean up load events
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  // Display toast auto-dismiss trigger
  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => {
        setToast({ type: null, message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handlePaymentInitiation = () => {
    if (!scriptLoaded) {
      setToast({
        type: 'error',
        message: "SDK is still loading. Please try again in a moment."
      });
      return;
    }

    setIsOpening(true);

    /**
     * Requirement 2: Fix amount calculation bug
     * Paystack uses subunits (cents) for USD currency transactions.
     * If the price is $9.99, we must multiply by 100 to send 999 subunit cents.
     * Formula: amount = Math.round(priceInDollars * 100).
     */
    const calculatedAmountInCents = Math.round(price * 100);

    /**
     * Requirement 5: Environment variable setup
     * Add this key in Vercel/Netlify env vars.
     * We fallback to window.process or standard modern build environment values if needed,
     * but strictly prefer process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as requested.
     */
    const paystackPublicKey = 
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY : undefined) ||
      (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 
      'pk_test_sample_usd_paystack_public_key';

    /**
     * Requirement 1: Force USD currency in Paystack config object. 
     * Remove any default NGN billing parameters.
     */
    const payloadConfig = {
      key: paystackPublicKey,
      email: email || 'customer@chidon.iq',
      amount: calculatedAmountInCents,
      currency: "USD",
      ref: `pay_usd_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: name || 'Valued Subscriber'
          }
        ]
      }
    };

    /**
     * Requirement 4: Add currency check before opening Popup
     * Console log the config parameters so the operator can inspect and verify that:
     * - Currency is explicitly set to "USD"
     * - Amount is correctly formatted in cents
     */
    console.log("PAYSTACK CONFIGURATION VERIFICATION CHECK:", {
      configuredCurrency: payloadConfig.currency,
      finalAmountCents: payloadConfig.amount,
      clientKey: payloadConfig.key,
      fullConfigObject: payloadConfig
    });

    try {
      const paystackHandler = (window as any).PaystackPop.setup({
        ...payloadConfig,
        callback: async function (response: { reference: string }) {
          console.log("Paystack popup authorization completed. Reference code:", response.reference);
          
          setIsOpening(false);
          setIsVerifying(true);
          setToast({
            type: 'info',
            message: "Verifying payment reference with secure backend..."
          });

          try {
            // Frontend role - Call /api/verify-payment with the reference
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reference: response.reference })
            });

            const verifyResult = await verifyRes.json();

            if (verifyRes.ok && verifyResult.status === 'success') {
              console.log("Server verification successful! Securing user license.");
              setToast({
                type: 'success',
                message: `Payment successful! $${price} paid`
              });

              if (onSuccess) {
                onSuccess(response.reference);
              }

              // Redirect to success page as required (Requirement 6)
              setTimeout(() => {
                window.location.href = `/success?reference=${response.reference}&amount=${price}`;
              }, 2500);
            } else {
              console.error("Server verification failed:", verifyResult);
              setToast({
                type: 'error',
                message: "Payment verification failed"
              });
            }
          } catch (verifyError: any) {
            console.error("Payment verification call error:", verifyError);
            setToast({
              type: 'error',
              message: "Payment verification failed"
            });
          } finally {
            setIsVerifying(false);
          }
        },
        onClose: function () {
          console.warn("Paystack Inline Payment iframe closed by user.");
          setIsOpening(false);
          
          // Trigger Close/Cancel Handling (Requirement 6)
          setToast({
            type: 'error',
            message: "Payment cancelled"
          });

          if (onCancel) {
            onCancel();
          }
        }
      });

      paystackHandler.openIframe();
    } catch (error: any) {
      console.error("Critical error while opening Paystack payment portal:", error);
      setIsOpening(false);
      setToast({
        type: 'error',
        message: "Payment Gateaway Error: Failed to open Paystack secure portal"
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Dynamic Success/Error Toast Portal */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-6 right-6 z-[99999] max-w-sm w-full p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur bg-[#070A13]/95 border-white/10"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
              ) : toast.type === 'info' ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 animate-pulse" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-[10px] font-black tracking-widest uppercase font-mono text-slate-400">
                {toast.type === 'success' ? 'TRANSACTION COMPLETED' : toast.type === 'info' ? 'SECURITY CHECK' : 'TRANSACTION REJECTED'}
              </h4>
              <p className="text-xs mt-1 font-semibold text-white leading-relaxed">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requirement 3: Paystack Action Button */}
      <button
        type="button"
        disabled={scriptError || isOpening || isVerifying}
        onClick={handlePaymentInitiation}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-brand hover:from-purple-500 hover:to-brand text-white hover:scale-[1.01] active:scale-95 transition-all rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand/20 border border-white/10 disabled:opacity-50"
      >
        {!scriptLoaded && !scriptError ? (
          <>
            <Loader2 size={14} className="animate-spin text-white" />
            <span>CONNECTING GATEWAY...</span>
          </>
        ) : isOpening ? (
          <>
            <Loader2 size={14} className="animate-spin text-white" />
            <span>ESTABLISHING ESCROW CONTEXT...</span>
          </>
        ) : isVerifying ? (
          <>
            <Loader2 size={14} className="animate-spin text-white" />
            <span>VERIFYING WITH INTEGRITY ENGINE...</span>
          </>
        ) : (
          <>
            <CreditCard size={14} />
            <span>Pay ${price.toFixed(2)} USD</span>
          </>
        )}
      </button>

      {/* Requirement 3: Information texts */}
      <div className="text-center space-y-1">
        <p className="text-[10px] font-mono text-slate-450 tracking-wide">
          You will be charged in USD by Paystack
        </p>
        <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500">
          <ShieldCheck size={11} className="text-emerald-500" />
          <span>PCI-DSS Compliant Secure Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};
