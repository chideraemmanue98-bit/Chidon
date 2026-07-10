import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Star, Clock, RefreshCw, Check, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronDown, User, Heart, MessageSquare
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Gig, PricePackage, Review } from './types';
import { handleFirestoreError, OperationType } from './utils';

interface GigDetailViewProps {
  gig: Gig;
  onOrderCheckout: (packageType: 'basic' | 'standard' | 'premium', amount: number) => void;
  onOpenChat: (sellerId: string, sellerName: string) => void;
  onBack: () => void;
}

export const GigDetailView: React.FC<GigDetailViewProps> = ({ 
  gig, 
  onOrderCheckout, 
  onOpenChat,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [activePhoto, setActivePhoto] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Load reviews for this specific gig
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const colRef = collection(db, 'reviews');
        const q = query(colRef, where('gigId', '==', gig.id));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
        setReviews(list);
      } catch (err) {
        console.warn("Failed to fetch reviews (might not exist yet):", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [gig.id]);

  const activePackage: PricePackage = gig.packages[activeTab];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Back button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          ← Back to Marketplace
        </button>

        <button
          onClick={() => onOpenChat(gig.userId, gig.sellerName)}
          className="px-4 py-2 bg-brand/15 hover:bg-brand/20 border border-brand/25 text-brand rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
        >
          <MessageSquare size={13} /> Contact Seller
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Image gallery, description, FAQ, reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gig title */}
          <div className="space-y-3">
            <span className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-bold font-mono text-brand uppercase">
              {gig.category}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-snug">
              {gig.title}
            </h1>

            {/* Seller Quick Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <img src={gig.sellerAvatar} alt={gig.sellerName} className="w-6 h-6 rounded-lg object-cover" />
                <span className="font-bold text-white">@{gig.sellerName}</span>
              </div>
              <div className="text-slate-600">|</div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Level:</span>
                <span className="text-brand font-black uppercase tracking-wider">{gig.sellerLevel}</span>
              </div>
              <div className="text-slate-600">|</div>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{gig.sellerRating.toFixed(1)}</span>
                <span className="text-slate-600">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Photo Showcase */}
          <div className="space-y-3">
            <div className="aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-800">
              <img 
                src={gig.images[activePhoto] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60'} 
                alt={`Showcase ${activePhoto}`} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails list */}
            {gig.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gig.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`w-20 aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${activePhoto === idx ? 'border-brand' : 'border-slate-850 opacity-60'}`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About This Gig Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">About This Gig</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {gig.description}
            </p>
          </div>

          {/* Seller Requirements disclosure */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Buyer Requirements To Initiate</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans italic bg-slate-950 border border-slate-850 p-4 rounded-2xl">
              " {gig.requirements} "
            </p>
          </div>

          {/* FAQ Accordion */}
          {gig.faq && gig.faq.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Frequently Asked Questions</h3>
              
              <div className="space-y-3">
                {gig.faq.map((item, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full px-5 py-4 flex justify-between items-center text-xs font-bold text-white cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === idx && (
                      <div className="px-5 pb-4 pt-1 border-t border-slate-850/60 text-xs text-slate-400 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Freelancer Reviews ({reviews.length})</h3>

            {loadingReviews ? (
              <div className="text-center text-xs text-slate-500 py-4 font-mono">Loading reviews...</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <img src={rev.buyerAvatar} alt={rev.buyerName} className="w-5 h-5 rounded-md object-cover" />
                        <span className="text-xs font-black text-white">{rev.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{rev.comment}"</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">No reviews listed yet. Completed orders generate public reviews automatically.</div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Checkout Tier Box */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden sticky top-24 shadow-2xl">
            
            {/* Packages Tab List */}
            <div className="flex border-b border-slate-800">
              {(['basic', 'standard', 'premium'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setActiveTab(tier)}
                  className={`flex-1 py-3 text-xs font-black font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 ${activeTab === tier ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Selected Package Details */}
            <div className="p-6 space-y-6">
              
              {/* Price Row */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">{activePackage.title || `${activeTab.toUpperCase()} Tier`}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-3">{activePackage.description || 'Deliverables included in this purchase packet.'}</p>
                </div>
                <div className="flex items-baseline gap-0.5 text-emerald-400 font-mono">
                  <span className="text-xs font-bold">$</span>
                  <span className="text-xl font-black">{activePackage.price}</span>
                </div>
              </div>

              {/* Delivery / Revisions details */}
              <div className="flex gap-4 border-y border-slate-850 py-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-brand" /> {activePackage.deliveryTime} Days Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={12} className="text-brand" /> {activePackage.revisions === -1 ? 'Unlimited' : `${activePackage.revisions} Revisions`}
                </span>
              </div>

              {/* Package features */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">What's Included:</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activePackage.features.length > 0 ? (
                    activePackage.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-400" />
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-400" />
                        <span>Responsive layout optimization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-400" />
                        <span>Symmetric typography details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-400" />
                        <span>Complete source file transfer</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Trust disclaimer */}
              <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-2xl flex items-start gap-2.5 text-[10px] font-mono text-slate-500 leading-relaxed">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Funds held securely in ChidonEscrow and released strictly when you approve delivered assets.</span>
              </div>

              {/* Order Purchase trigger */}
              <button
                onClick={() => onOrderCheckout(activeTab, activePackage.price)}
                className="w-full py-3 bg-brand text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-lg hover:shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Secure Order Continue <ArrowRight size={13} />
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
