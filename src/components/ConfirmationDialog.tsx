import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "DISCARD SAVED INTEL",
  message = "Are you sure you want to permanently delete this item? This action is irreversible and the deleted item cannot be recovered.",
  confirmText = "DISCARD",
  cancelText = "CANCEL",
  isDanger = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-[4px]"
          onClick={onClose}
        >
          {/* Main Modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.15)] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative line */}
            <div className={cn(
              "h-1.5 w-full",
              isDanger ? "bg-red-500" : "bg-cyan-primary"
            )} />

            {/* Close trigger */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  isDanger ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-cyan-primary/10 text-cyan-primary border border-cyan-primary/20"
                )}>
                  {isDanger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#22D3EE] uppercase leading-none">
                    Security confirmation
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight pt-1 leading-tight uppercase font-sans">
                    {title}
                  </h3>
                </div>
              </div>

              {/* Message text */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {message}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-3 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-slate-200 border border-white/10 rounded-xl text-xs font-black tracking-wider uppercase transition-all"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full sm:w-1/2 py-3 px-4 active:scale-[0.98] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5",
                    isDanger 
                      ? "bg-red-600 hover:bg-red-500 shadow-red-900/30 font-black" 
                      : "bg-[#22D3EE] hover:bg-[#06B6D4] text-[#0F172A] shadow-cyan-900/30 font-black"
                  )}
                >
                  {isDanger && <Trash2 size={14} />}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
