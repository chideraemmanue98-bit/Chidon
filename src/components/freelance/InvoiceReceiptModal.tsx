import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, ShieldCheck, CreditCard, Download } from 'lucide-react';
import { Order, UserProfile } from './types';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  buyerProfile: UserProfile | null;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  buyerProfile
}) => {
  if (!isOpen || !order) return null;

  const handlePrintInvoice = () => {
    window.print();
  };

  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const txRef = 'TXN-' + order.id.toUpperCase().slice(0, 8) + '-' + Math.floor(Math.random() * 10000);
  
  // Backwards calculated prices
  const paystackFee = parseFloat((order.price * 0.015).toFixed(2));
  const subtotal = order.price;
  const grandTotal = parseFloat((subtotal + paystackFee).toFixed(2));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto select-text print:bg-white print:p-0">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xl w-full bg-[#0B0F19] border-2 border-slate-800 rounded-3xl p-6 relative text-left print:bg-white print:text-black print:border-none print:w-full print:m-0"
      >
        {/* Controls */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6 print:hidden">
          <span className="text-xs font-mono font-bold text-cyan-400">Chidon Financial Ledger Node</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrintInvoice}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white font-mono text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer size={12} /> Print Invoice
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-900 p-1.5 rounded-full cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Invoice Body Printable Area */}
        <div className="space-y-6 print:text-black print:p-6" id="printable-invoice-container">
          {/* Header block */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-black tracking-tight text-white print:text-black uppercase">CHIDON FREELANCE</h2>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed print:text-slate-600">
                Lekki Phase 1, Lagos, Nigeria<br />
                support@chidoniq.com.ng<br />
                https://chidoniq.com.ng
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md uppercase print:text-emerald-600 print:border-emerald-600">
                {order.status === 'completed' ? 'Cleared & Released' : 'Funded in Escrow'}
              </span>
              <h3 className="text-base font-bold text-white mt-2 print:text-black uppercase">OFFICIAL RECEIPT</h3>
            </div>
          </div>

          <hr className="border-slate-800/80 print:border-black" />

          {/* Details metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1 text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Client Node (Bill To)</span>
              <strong className="text-white print:text-black">@{buyerProfile?.fullName || order.buyerName || 'Client Buyer'}</strong>
              <p className="text-[10px] text-slate-400 print:text-slate-600">Verified Chidon Member<br />ID: #{order.buyerId.slice(0, 10)}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Contract Specifics</span>
              <p className="text-[10px] text-slate-400 print:text-slate-600">
                Invoice ID: #{order.id.slice(0, 8).toUpperCase()}<br />
                Tx Reference: {txRef}<br />
                Billing Date: {invoiceDate}
              </p>
            </div>
          </div>

          {/* Itemized list */}
          <div className="overflow-hidden border border-slate-850 rounded-2xl print:border-black">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-850 print:bg-slate-100 print:text-black print:border-black">
                <tr>
                  <th className="px-4 py-2">Service Description</th>
                  <th className="px-4 py-2 text-right">Escrow Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 print:divide-black print:text-black">
                <tr>
                  <td className="px-4 py-3">
                    <strong className="text-white block text-xs print:text-black">{order.gigTitle}</strong>
                    <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider mt-0.5">{order.gigCategory} Service Bundle • Freelancer @{order.sellerName}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-white print:text-black">
                    ${subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="w-full max-w-xs ml-auto space-y-2 text-xs font-mono text-right text-slate-400 print:text-black">
            <div className="flex justify-between">
              <span>Subtotal Escrow:</span>
              <span className="text-white font-bold print:text-black">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee (1.5%):</span>
              <span className="text-white font-bold print:text-black">${paystackFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800/80 pt-2 flex justify-between text-sm">
              <strong className="text-white print:text-black font-extrabold">Total Charged:</strong>
              <strong className="text-cyan-400 font-black print:text-black">${grandTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Note Footer */}
          <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-2xl flex gap-2 print:border-black">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5 print:text-black" />
            <p className="text-[9px] text-slate-400 leading-normal font-mono print:text-slate-700">
              This payment receipt confirms that funds have been safely captured via Paystack and locked inside Chidon’s Escrow Protection system. Released to freelancer only upon delivery validation and client confirmation.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
