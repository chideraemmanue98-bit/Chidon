import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, SlidersHorizontal, Heart, Bookmark, Filter, 
  MapPin, CheckCircle, HelpCircle, Star, Layers, RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Gig, FreelanceProfile } from './types';
import { handleFirestoreError, OperationType } from './utils';

// Seeding high quality initial marketplace gigs to ensure robust visual presentation immediately
export const SEED_GIGS: Gig[] = [
  {
    id: 'gig_seed_1',
    userId: 'seller_1',
    sellerName: 'Devon Creative',
    sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Devon',
    sellerRating: 4.9,
    sellerLevel: 'Top Rated',
    title: 'Build custom responsive React Web App with Tailwind CSS integration',
    description: 'Get a clean, high-performance, modular, and fully customized web application tailored perfectly to your target business goals. Utilizing cutting-edge React 18 hooks, TypeScript type safety, and optimal asset management.',
    category: 'Programming',
    tags: ['React', 'TypeScript', 'Tailwind', 'NextJS'],
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60'],
    packages: {
      basic: {
        title: 'Single Page MVP',
        description: 'Clean single page React component structure with static Tailwind layout',
        deliveryTime: 3,
        revisions: 2,
        price: 25,
        features: ['React Source Code', 'Tailwind styling', 'Fully Responsive']
      },
      standard: {
        title: 'Complete Functional App',
        description: 'Up to 5 custom routes/pages with modular components, local states and rich layouts',
        deliveryTime: 7,
        revisions: 5,
        price: 95,
        features: ['Up to 5 Pages', 'Framer motion transitions', 'Local state setup']
      },
      premium: {
        title: 'Fullstack Solution Integration',
        description: 'A complete custom system with Firebase DB sync, custom user profiles, and active escrow flows',
        deliveryTime: 14,
        revisions: -1, // Unlimited
        price: 240,
        features: ['Firebase Database', 'Unlimited revisions', '1-Month Maintenance Support']
      }
    },
    faq: [
      { question: 'Do you deliver custom graphics and logos?', answer: 'No, this gig focuses on clean, modular programming development. You can provide assets or I can use elegant stock alternatives.' }
    ],
    requirements: 'Please supply design wireframes, written copy specifications, and brand style guides.',
    isPaused: false,
    createdAt: new Date()
  },
  {
    id: 'gig_seed_2',
    userId: 'seller_2',
    sellerName: 'Clara UI UX',
    sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Clara',
    sellerRating: 4.8,
    sellerLevel: 'Level 2',
    title: 'Design premium modern SaaS Landing Page in Figma',
    description: 'Transform your abstract ideas into a stunning, conversion-focused layout that captures interest instantly. Dedicated custom typography pairings, structured negative spaces, and comprehensive bento-style sections.',
    category: 'Graphics',
    tags: ['Figma', 'UI UX', 'SaaS', 'Landing Page'],
    images: ['https://images.unsplash.com/photo-1541462608141-ad4979e408c9?w=800&auto=format&fit=crop&q=60'],
    packages: {
      basic: {
        title: 'Hero Section Only',
        description: 'High-fidelity Figma viewport layout of your main page visual hero',
        deliveryTime: 2,
        revisions: 3,
        price: 15,
        features: ['Figma Source File', 'Typography details', 'Responsive view']
      },
      standard: {
        title: 'Full Landing Page Design',
        description: 'A complete landing page UI with up to 6 custom bento and features blocks',
        deliveryTime: 5,
        revisions: 6,
        price: 55,
        features: ['Full layout in Figma', '6 design sections', 'Custom icons']
      },
      premium: {
        title: 'Enterprise Brand Identity System',
        description: 'Includes full landing page, dashboard wireframes, custom system ui tokens and asset exports',
        deliveryTime: 10,
        revisions: -1,
        price: 150,
        features: ['SaaS Dashboard Design', 'UI Kit / Tokens', 'Interactive Prototype']
      }
    },
    faq: [
      { question: 'Do you code the website?', answer: 'This gig strictly covers vector layouts and UI UX mockups inside Figma. Code is not included.' }
    ],
    requirements: 'Brief description of your business, competitors you appreciate, and style guide details.',
    isPaused: false,
    createdAt: new Date()
  },
  {
    id: 'gig_seed_3',
    userId: 'seller_3',
    sellerName: 'Maxim Media',
    sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Maxim',
    sellerRating: 5.0,
    sellerLevel: 'Level 1',
    title: 'Edit viral high-retention reels, shorts, and TikTok clips',
    description: 'Level up your retention rates with masterfully timed jump-cuts, kinetic dynamic text overlays, visual sound-effects, and immersive sound design. Perfectly optimized for immediate algorithms.',
    category: 'Video',
    tags: ['Video Editor', 'CapCut', 'Shorts', 'Viral Video'],
    images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60'],
    packages: {
      basic: {
        title: 'Single 30s Short',
        description: 'Dynamic typography overlays, basic zoom cuts and color graded delivery',
        deliveryTime: 2,
        revisions: 2,
        price: 10,
        features: ['Subtitles included', 'Color grading', 'Sound effects']
      },
      standard: {
        title: '3 Viral Short Edits',
        description: 'Extended motion graphics, custom b-roll insertion and high retention pacing',
        deliveryTime: 4,
        revisions: 4,
        price: 25,
        features: ['3 high retention shorts', 'B-rolls included', 'Music licensing help']
      },
      premium: {
        title: 'Enterprise Creator Bundle',
        description: '10 custom viral shorts fully polished with custom animations, loops, soundscapes and thumbnail frames',
        deliveryTime: 8,
        revisions: 10,
        price: 80,
        features: ['10 full edits', 'Thumbnails included', 'Source files delivery']
      }
    },
    faq: [],
    requirements: 'Please supply RAW footage files and clear timestamps indicating instructions.',
    isPaused: false,
    createdAt: new Date()
  }
];

interface ExploreViewProps {
  profile: FreelanceProfile;
  onSelectGig: (gig: Gig) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ profile, onSelectGig }) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Advanced filters toggling
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [maxDelivery, setMaxDelivery] = useState<number>(14);
  const [levelFilter, setLevelFilter] = useState<string>('All');

  // Favorites tracking (in local storage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('freelance_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedOnly, setSavedOnly] = useState(false);

  // Load and sync Gigs from Firestore
  const fetchGigs = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'gigs');
      const querySnap = await getDocs(colRef);
      const dbGigs = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gig[];

      if (dbGigs.length === 0) {
        // Automatically seed the gigs into Firestore to convert mock data into actual persistent database records
        const seedPromises = SEED_GIGS.map(async (gig) => {
          const gigDocRef = doc(db, 'gigs', gig.id);
          await setDoc(gigDocRef, {
            ...gig,
            createdAt: new Date().toISOString()
          });
        });
        await Promise.all(seedPromises);
        setGigs(SEED_GIGS);
      } else {
        setGigs(dbGigs.filter(g => !g.isPaused));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'gigs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  // Handle Favorites toggle
  const toggleFavorite = (gigId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(gigId)) {
      updated = favorites.filter(id => id !== gigId);
    } else {
      updated = [...favorites, gigId];
    }
    setFavorites(updated);
    localStorage.setItem('freelance_favs', JSON.stringify(updated));
  };

  // Filter computation
  const filteredGigs = gigs.filter(g => {
    // 1. Search Query
    const queryLower = search.toLowerCase();
    const titleMatch = g.title.toLowerCase().includes(queryLower);
    const descMatch = g.description.toLowerCase().includes(queryLower);
    const tagMatch = g.tags.some(t => t.toLowerCase().includes(queryLower));
    const searchMatches = !search || titleMatch || descMatch || tagMatch;

    // 2. Category Selection
    const catMatches = selectedCategory === 'All' || g.category === selectedCategory;

    // 3. Price Packages
    const priceMatches = g.packages.basic.price <= maxPrice;

    // 4. Delivery Days
    const deliveryMatches = g.packages.basic.deliveryTime <= maxDelivery;

    // 5. Level
    const levelMatches = levelFilter === 'All' || g.sellerLevel === levelFilter;

    // 6. Favorites Filter
    const favMatches = !savedOnly || favorites.includes(g.id);

    return searchMatches && catMatches && priceMatches && deliveryMatches && levelMatches && favMatches;
  });

  const categories = ['All', 'Graphics', 'Writing', 'Video', 'Programming', 'Marketing'];

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Visual Splash / Header Card */}
      <div className="relative rounded-3xl bg-slate-900 overflow-hidden border border-slate-800 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black font-mono uppercase tracking-wider text-brand">
            <Layers size={11} /> 0% Transaction Fees Always
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Sync Directly with Freelance Specialists
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium">
            Commission-free escrow release, instant file delivery checkpoints, and secure verification systems.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:block w-72 h-44 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800/60 pb-2">Cognitive Categories</div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">■ Programming</span>
            <span className="flex items-center gap-1">■ UI UX Design</span>
            <span className="flex items-center gap-1">■ Content Creator</span>
            <span className="flex items-center gap-1">■ Marketing / SEO</span>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 rounded-full bg-brand/5 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Control Panel: Search & Filter Tabs */}
      <div className="space-y-4">
        
        {/* Search Input and Filter Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What service are you tracking down today? (e.g. React Web App, Figma UI...)"
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 bg-slate-900 border rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${showFilters ? 'border-brand text-brand' : 'border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-4 py-3 bg-slate-900 border rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${savedOnly ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Heart size={14} className={savedOnly ? 'fill-red-400' : ''} /> Saved ({favorites.length})
            </button>

            <button 
              onClick={fetchGigs}
              className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh gigs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Category horizontal scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat ? 'bg-brand text-white border-brand shadow-md shadow-brand/10' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat === 'All' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Maximum Budget (USD)</label>
                <span className="text-xs font-black text-emerald-400 font-mono">${maxPrice}</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={500} 
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-brand bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Delivery Days Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Max Delivery Time (Days)</label>
                <span className="text-xs font-black text-cyan-400 font-mono">{maxDelivery === 14 ? 'Any' : `${maxDelivery} Days`}</span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={14} 
                value={maxDelivery}
                onChange={(e) => setMaxDelivery(parseInt(e.target.value))}
                className="w-full accent-brand bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Seller Level Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Seller Level</label>
              <div className="flex gap-1.5">
                {['All', 'New', 'Level 2', 'Top Rated'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold font-mono transition-all ${levelFilter === lvl ? 'bg-brand/10 border-brand text-brand' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Main Grid: Gig Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Querying active marketplace nodes...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <div 
                key={gig.id}
                onClick={() => onSelectGig(gig)}
                className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden group flex flex-col h-full hover:border-slate-700 hover:shadow-xl hover:shadow-brand/5 cursor-pointer transition-all duration-300"
              >
                {/* Visual Cover */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                  <img 
                    src={gig.images[0] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60'} 
                    alt={gig.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Chip */}
                  <span className="absolute left-3 top-3 px-2.5 py-1 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-lg text-[9px] font-mono font-black uppercase text-slate-300 tracking-wider">
                    {gig.category}
                  </span>

                  {/* Favorite heart */}
                  <button
                    onClick={(e) => toggleFavorite(gig.id, e)}
                    className="absolute right-3 top-3 p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/60 backdrop-blur-md rounded-full text-white transition-all shadow-lg active:scale-90"
                  >
                    <Heart size={12} className={favorites.includes(gig.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Seller Bio Row */}
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <img src={gig.sellerAvatar} alt={gig.sellerName} className="w-6 h-6 rounded-lg object-cover" />
                      <div className="leading-none">
                        <div className="text-[10px] font-black text-white">{gig.sellerName}</div>
                        <span className="text-[8px] font-mono text-brand font-black uppercase tracking-widest">{gig.sellerLevel}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-300 font-mono">{gig.sellerRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Gig Title */}
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed font-sans group-hover:text-brand transition-colors">
                    {gig.title}
                  </h4>

                  {/* Price Tag Footer Row */}
                  <div className="flex items-end justify-between pt-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Starting At</span>
                    <div className="flex items-baseline gap-0.5 leading-none">
                      <span className="text-[10px] text-emerald-400 font-bold">$</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">{gig.packages.basic.price}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {filteredGigs.length === 0 && (
            <div className="py-20 text-center space-y-3 bg-slate-900/40 border border-slate-850 rounded-3xl">
              <Search size={32} className="text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white">No Service Matches</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Adjust your keyword spelling, expand your category filters, or lower your seller verification levels.</p>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
