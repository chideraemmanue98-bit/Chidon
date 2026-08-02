import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  X, 
  Loader2, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Filter, 
  User, 
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { db, auth, storage } from '../../firebase';
import { Post, PostCard } from './PostCard';

const CATEGORIES = [
  'Electronics',
  'Services',
  'Vehicles',
  'Housing',
  'Fashion',
  'Jobs',
  'Community',
  'Books',
  'Other'
];

interface MarketplacePageProps {
  onSelectPost: (postId: string) => void;
  onNavigateToMessages: () => void;
  onNavigateToAuth: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onSelectPost,
  onNavigateToMessages,
  onNavigateToAuth
}) => {
  const currentUser = auth.currentUser;

  // List States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'buy' | 'sell'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // New Listing States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>(CATEGORIES[0]);
  const [newType, setNewType] = useState<'buy' | 'sell'>('sell');
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Listen to Firestore posts
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
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
      });
      setPosts(list);
      setLoading(false);
    }, (err) => {
      console.error('[MarketplacePage] Error syncing posts:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Multi-file Select Previews
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Cap at 4 images
    const selected = files.slice(0, 4 - newImageFiles.length);
    setNewImageFiles(prev => [...prev, ...selected]);

    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageSelect = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Listing
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be signed in to create a listing.');
      onNavigateToAuth();
      return;
    }

    if (!newTitle.trim() || !newDesc.trim() || !newPrice) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    setSubmittingPost(true);
    setSubmitError('');

    try {
      const uploadedUrls: string[] = [];

      // Upload selected images to Storage
      for (const file of newImageFiles) {
        try {
          const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
          const snap = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snap.ref);
          uploadedUrls.push(url);
        } catch (uploadErr) {
          console.warn('[MarketplacePage] Image upload failed, falling back:', uploadErr);
        }
      }

      // Default mock image if all uploads failed or no image was chosen
      if (uploadedUrls.length === 0) {
        uploadedUrls.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600');
      }

      const postPayload = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        price: Number(newPrice),
        images: uploadedUrls,
        category: newCategory,
        type: newType,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), postPayload);

      // Reset Form State
      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
      setNewCategory(CATEGORIES[0]);
      setNewType('sell');
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setShowCreateModal(false);

    } catch (err: any) {
      console.error('[MarketplacePage] Error publishing post:', err);
      setSubmitError(err.message || 'Publishing failed. Please check connection and try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Filter listings based on current filters
  const filteredPosts = posts.filter(post => {
    // Search match
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(searchLower);
    const descMatch = post.description.toLowerCase().includes(searchLower);
    const matchesSearch = !searchQuery || titleMatch || descMatch;

    // Type match
    const matchesType = selectedType === 'all' || post.type === selectedType;

    // Category match
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    // Price match
    const matchesPrice = !maxPrice || post.price <= Number(maxPrice);

    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-6 text-left">
      {/* LANDING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-linear-to-r from-brand/10 to-transparent border border-brand/10 rounded-2xl">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Chidon Marketplace
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The premium network directory connecting buyers and sellers directly. Negotiate, transact, and close deals instantly with 1-on-1 real-time communications.
          </p>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToMessages}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800/40 hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-bold uppercase tracking-wider border border-[var(--border-base)] rounded-xl transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            My Negotiations
          </button>
          
          <button
            onClick={() => {
              if (!currentUser) {
                alert('You must be signed in to create a listing.');
                onNavigateToAuth();
              } else {
                setShowCreateModal(true);
              }
            }}
            className="px-4 py-2.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={15} />
            Post Ad Listing
          </button>
        </div>
      </div>

      {/* FILTER PANEL AND GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* DESKTOP FILTERS (1 COLUMN) */}
        <div className="hidden lg:block p-5 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl space-y-5 text-left shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-3">
            <Filter size={15} className="text-brand" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Filters</h3>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/70" size={13} />
              <input 
                type="text" 
                placeholder="Search listings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70"
              />
            </div>
          </div>

          {/* Type Option buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Listing Type</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-50 dark:bg-gray-800/10 p-1 border border-[var(--border-base)]/60 rounded-xl">
              {(['all', 'buy', 'sell'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    selectedType === type 
                      ? 'bg-brand text-white' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Category SELECT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:border-brand/40"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Max Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-bold">$</span>
              <input 
                type="number" 
                placeholder="No Limit" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-7 pr-4 py-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedCategory('All');
              setMaxPrice('');
            }}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/10 dark:hover:bg-gray-800/20 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-base)] rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>

        </div>

        {/* MOBILE FILTERS BAR */}
        <div className="lg:hidden flex flex-col sm:flex-row gap-3 items-stretch w-full">
          {/* Mobile Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
            <input 
              type="text" 
              placeholder="Search listings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all"
            />
          </div>

          {/* Trigger filter modal */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 border border-[var(--border-base)] rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer text-[var(--text-secondary)]"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* MOBILE FILTERS EXPANDED PANEL */}
        {showMobileFilters && (
          <div className="lg:hidden p-4 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-xl space-y-4 text-left animate-fade-in w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)]">Listing Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full p-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="buy">Buying</option>
                  <option value="sell">Selling</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)]">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)]">Max Price (USD)</label>
              <input 
                type="number" 
                placeholder="No Limit" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none"
              />
            </div>
          </div>
        )}

        {/* POSTS GRID LISTING AREA (3 COLS) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
              <Loader2 className="animate-spin text-brand" size={28} />
              <span className="text-xs font-semibold tracking-widest uppercase font-mono">Retrieving board logs...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[var(--border-base)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/5 p-8 space-y-3.5">
              <div className="mx-auto w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/10">
                <ShoppingBag size={18} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">No Listings Found</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  There are no active postings match your current filter limits. Try clearing filters or list a new ad to start!
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('All');
                  setMaxPrice('');
                }}
                className="px-4 py-2 bg-brand/10 hover:bg-brand/15 text-brand text-[10px] font-bold uppercase tracking-wider border border-brand/15 rounded-xl transition-all cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => onSelectPost(post.id)} 
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* CREATE LISTING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8 animate-fade-in">
            
            {/* Header */}
            <div className="p-4 bg-[var(--bg-app)] border-b border-[var(--border-base)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="text-brand" size={18} />
                <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">Publish Marketplace Ad Listing</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-bold leading-relaxed">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Listing Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Apple iPhone 15 Pro Max 256GB"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description / Condition Details *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Provide precise details, condition, specs, and why you are listing this. Highly detailed cards transact 2x faster."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3.5 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70 resize-none leading-relaxed"
                />
              </div>

              {/* Pricing, Type, Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-secondary)]">$</span>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 250"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-3 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all"
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Transaction Mode</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'buy' | 'sell')}
                    className="w-full p-3 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:border-brand/40"
                  >
                    <option value="sell">I want to SELL</option>
                    <option value="buy">I want to BUY</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:border-brand/40"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images Pick & Previews */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Listing Images (Max 4)</label>
                
                {/* Previews Row */}
                {newImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 pb-2">
                    {newImagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl border border-[var(--border-base)] overflow-hidden bg-gray-50/20">
                        <img src={preview} alt="Listing preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageSelect(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer transition-colors"
                          title="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Picker trigger */}
                {newImageFiles.length < 4 && (
                  <label className="flex items-center justify-center gap-2.5 p-4 border border-dashed border-[var(--border-base)] hover:border-brand/30 bg-gray-50/5 dark:bg-gray-800/5 rounded-xl cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-all">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImagesSelect} 
                      className="hidden" 
                    />
                    <ImageIcon size={16} className="text-brand" />
                    <span>Attach Product Photos</span>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-base)]/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submittingPost}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800/40 hover:bg-gray-200 dark:hover:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-base)]/40 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {submittingPost ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Listing Ad
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
