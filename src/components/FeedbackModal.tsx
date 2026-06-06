import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureId: string;
  generatedContent: string;
}

export const FeedbackModal = ({ isOpen, onClose, featureId, generatedContent }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const feedbackPayload: any = {
        featureId,
        rating,
        comment,
        generatedContent,
        timestamp: serverTimestamp(),
      };
      
      const activeUserId = auth.currentUser?.uid || (localStorage.getItem('simulated_user') ? JSON.parse(localStorage.getItem('simulated_user')!).uid : null);
      if (activeUserId) {
        feedbackPayload.userId = activeUserId;
      }

      await addDoc(collection(db, 'feedback'), feedbackPayload);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass-card p-8 relative border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.2)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto text-cyan-primary animate-bounce">
                  <Star fill="currentColor" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">THANKS FOR THE INTEL!</h3>
                <p className="text-slate-400 text-sm">Your feedback helps refine the CHIDON IQ algorithms.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-1">
                    <MessageSquare className="text-cyan-primary" size={24} />
                    FEEDBACK PROTOCOL
                  </h3>
                  <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Feature: {featureId}</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-lg max-h-24 overflow-hidden relative group">
                  <p className="text-[10px] text-slate-500 font-sans line-clamp-3 italic">
                    "{generatedContent}"
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Rate this output</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={cn(
                          "transition-all duration-300",
                          rating >= star ? "text-cyan-primary scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-slate-700 hover:text-slate-500"
                        )}
                      >
                        <Star fill={rating >= star ? "currentColor" : "none"} size={32} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Additional Comments</label>
                  <textarea
                    placeholder="How can we make this better?"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-primary transition-colors text-white text-sm resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  disabled={rating === 0 || isSubmitting}
                  onClick={handleSubmit}
                  className={cn(
                    "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase transition-all",
                    rating > 0 
                      ? "bg-cyan-primary text-navy-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(34,211,238,0.3)]" 
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? "TRANSMITTING..." : (
                    <>
                      <Send size={18} />
                      Submit Protocol
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
