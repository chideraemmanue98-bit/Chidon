import { Tag, ShoppingBag, DollarSign, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  type: 'buy' | 'sell';
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: any;
}

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(post.price);

  const getPostDateLabel = () => {
    if (!post.createdAt) return 'Just now';
    try {
      const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div 
      id={`post-card-${post.id}`}
      onClick={onClick}
      className="group flex flex-col bg-[var(--bg-app)] border border-[var(--border-base)] hover:border-brand/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800/10 overflow-hidden shrink-0">
        {post.images && post.images.length > 0 ? (
          <img 
            src={post.images[0]} 
            alt={post.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)]/40 gap-1.5">
            <ShoppingBag size={28} strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-widest uppercase">No Image</span>
          </div>
        )}

        {/* Type Badge (Buy/Sell) */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm select-none border ${
            post.type === 'sell' 
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' 
              : 'bg-brand/15 text-brand border-brand/20'
          }`}>
            {post.type === 'sell' ? 'Selling' : 'Buying'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-900/80 backdrop-blur-xs text-white border border-white/5 shadow-sm select-none">
            {post.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3 text-left">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            {post.title}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Price & Date */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base font-black text-brand tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]/80 flex items-center gap-1">
              <Clock size={10} />
              {getPostDateLabel()}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border-base)]/40" />

          {/* Seller / Poster Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {post.userPhoto ? (
                <img 
                  src={post.userPhoto} 
                  alt={post.userName} 
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-[var(--border-base)]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/10">
                  <User size={10} />
                </div>
              )}
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {post.userName || 'Chidon User'}
              </span>
            </div>
            <span className="text-[10px] font-medium text-brand/90 hover:underline flex items-center gap-0.5">
              Contact →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
