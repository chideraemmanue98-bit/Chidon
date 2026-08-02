import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Tag, 
  ShoppingBag, 
  Clock, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { Post } from './PostCard';
import { SellerProfileCard } from './SellerProfileCard';
import { NewMessageModal } from './NewMessageModal';
import { formatDistanceToNow } from 'date-fns';

interface PostDetailProps {
  postId: string;
  onBack: () => void;
  onStartChat: (
    otherUserId: string, 
    otherUserName: string, 
    otherUserPhoto: string, 
    postId: string, 
    postTitle: string, 
    postPrice: string | number,
    initialText: string,
    imageFile: File | null
  ) => Promise<string>;
  onNavigateToAuth: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  postId,
  onBack,
  onStartChat,
  onNavigateToAuth
}) => {
  const currentUser = auth.currentUser;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Image slider active index
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  
  // New Message Connection Modal
  const [isMsgModalOpen, setIsMsgModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setError('');

    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          images: data.images || [],
          category: data.category || 'Other',
          type: data.type || 'sell',
          userId: data.userId || '',
          userName: data.userName || 'Anonymous',
          userPhoto: data.userPhoto || '',
          createdAt: data.createdAt
        });
      } else {
        setError('The specified ad listing could not be found or has been archived.');
      }
      setLoading(false);
    }, (err) => {
      console.error('[PostDetail] Error fetching post:', err);
      setError('Could not establish synchronization with post document.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const formattedPrice = post 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(post.price)
    : '';

  const getPostDateLabel = () => {
    if (!post?.createdAt) return 'Recently';
    try {
      const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleMessageButton = () => {
    if (!currentUser) {
      alert('You must be signed in to connect with developers.');
      onNavigateToAuth();
      return;
    }
    setIsMsgModalOpen(true);
  };

  const handleSendInitial = async (initialText: string, imageFile: File | null) => {
    if (!post) return;
    // Execute startChat logic passed down
    await onStartChat(
      post.userId,
      post.userName,
      post.userPhoto || '',
      post.id,
      post.title,
      formattedPrice,
      initialText,
      imageFile
    );
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
        <Loader2 className="animate-spin text-brand" size={28} />
        <span className="text-xs font-semibold tracking-widest uppercase font-mono">Synchronizing ad record...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 text-center border border-[var(--border-base)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/5 max-w-lg mx-auto p-8 space-y-4 text-left">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full w-fit">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Listing Offline</h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {error || 'This post is no longer available in the active registry database.'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-brand text-white text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isCurrentUser = currentUser?.uid === post.userId;

  return (
    <div className="space-y-6 text-left">
      {/* BACK NAVIGATION BAR */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/40 dark:hover:bg-gray-800 text-[10px] font-bold uppercase tracking-wider border border-[var(--border-base)]/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft size={12} />
        Back to listings
      </button>

      {/* CONTENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: IMAGES & DESCRIPTION */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl overflow-hidden relative shadow-2xs">
            <div className="aspect-[16/10] w-full relative bg-gray-50 dark:bg-gray-800/10">
              <img 
                src={post.images[activeImageIdx]} 
                alt={`${post.title} - view ${activeImageIdx}`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />

              {/* Slider Arrows */}
              {post.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? post.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === post.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails list */}
            {post.images.length > 1 && (
              <div className="p-3.5 bg-gray-50/50 dark:bg-gray-800/5 border-t border-[var(--border-base)] flex gap-2.5 overflow-x-auto justify-center select-none">
                {post.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx ? 'border-brand scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs Card */}
          <div className="p-6 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl space-y-4 shadow-3xs">
            
            {/* Title & Price Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  post.type === 'sell' 
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' 
                    : 'bg-brand/15 text-brand border-brand/20'
                }`}>
                  {post.type === 'sell' ? 'For Sale' : 'Looking to Buy'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800/40 text-[var(--text-secondary)] border border-[var(--border-base)]/40">
                  {post.category}
                </span>
              </div>

              <h1 className="text-lg md:text-xl font-black text-[var(--text-primary)] leading-snug">
                {post.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1.5 border-b border-[var(--border-base)]/40 pb-4">
                <span className="text-xl font-black text-brand tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1">
                  <Clock size={11} />
                  Published {getPostDateLabel()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Product Details
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap select-text">
                {post.description}
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: SELLER PROFILE */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1">
            Listed by Developer
          </h3>
          <SellerProfileCard 
            sellerId={post.userId}
            sellerName={post.userName}
            sellerPhoto={post.userPhoto}
            onMessageClick={handleMessageButton}
            isCurrentUser={isCurrentUser}
          />
        </div>

      </div>

      {/* CHIDON MESSAGE INITIALIZE MODAL */}
      <NewMessageModal 
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        sellerName={post.userName}
        postTitle={post.title}
        postPrice={formattedPrice}
        onSend={handleSendInitial}
      />

    </div>
  );
};
