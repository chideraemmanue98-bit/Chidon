import { User, MessageCircle, ShieldAlert, Star, ShieldCheck } from 'lucide-react';

interface SellerProfileCardProps {
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  memberSince?: string;
  rating?: number;
  onMessageClick: () => void;
  isCurrentUser: boolean;
}

export const SellerProfileCard: React.FC<SellerProfileCardProps> = ({
  sellerName,
  sellerPhoto,
  memberSince = 'July 2026',
  rating = 4.8,
  onMessageClick,
  isCurrentUser
}) => {
  return (
    <div 
      id="seller-profile-card"
      className="p-5 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl space-y-4 shadow-sm text-left"
    >
      <div className="flex items-center gap-3.5">
        {/* Large Avatar */}
        {sellerPhoto ? (
          <img 
            src={sellerPhoto} 
            alt={sellerName} 
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border-2 border-brand/20 shadow-xs"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/15 shadow-xs">
            <User size={22} />
          </div>
        )}

        {/* Identity Details */}
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 leading-snug">
            {sellerName}
            <span className="p-0.5 bg-emerald-500/10 rounded-full text-emerald-500" title="Verified Chidon Operator">
              <ShieldCheck size={12} />
            </span>
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Trust & Ratings Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/10 border border-[var(--border-base)]/40 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={11} fill="currentColor" />
            <span className="text-xs font-black">{rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">User Rating</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/10 border border-[var(--border-base)]/40 flex flex-col justify-center">
          <span className="text-xs font-bold text-emerald-500">100%</span>
          <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Response Rate</span>
        </div>
      </div>

      {/* Primary Action Button */}
      {isCurrentUser ? (
        <div className="text-center p-2.5 rounded-xl bg-gray-100/50 dark:bg-gray-800/10 text-xs font-medium text-[var(--text-secondary)] select-none">
          This is your post listing.
        </div>
      ) : (
        <button
          onClick={onMessageClick}
          className="w-full py-2.5 px-4 bg-brand text-white font-bold rounded-xl text-xs hover:bg-brand/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle size={15} />
          Message {sellerName}
        </button>
      )}

      {/* Reporting Note */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <ShieldAlert size={11} className="text-[var(--text-secondary)]/60" />
        <span className="text-[10px] text-[var(--text-secondary)] font-medium">
          Verify safety before committing payments
        </span>
      </div>
    </div>
  );
};
