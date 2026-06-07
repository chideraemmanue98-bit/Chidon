import React, { useState, useMemo } from 'react';
import postsData from '../../data/posts.json';
import { BlogCard, BlogPostType, BLOG_CATEGORIES, getPostCategory } from '../../components/BlogCard';
import { BlogPost } from '../../components/BlogPost';
import { ResumeReadingBridge } from '../../components/ResumeReadingBridge';
import { RecentlyReadSection } from '../../components/RecentlyReadSection';
import { Search, Sparkles, BookOpen, Clock, Calendar, ArrowRight, Rss, Image as ImageIcon } from 'lucide-react';

export function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showImages, setShowImages] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chidoniq_blog_show_images');
      return saved !== 'false';
    }
    return true;
  });

  const handleToggleImages = () => {
    const newVal = !showImages;
    setShowImages(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chidoniq_blog_show_images', String(newVal));
    }
  };

  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        return path.replace('/blog/', '');
      }
    }
    return null;
  });

  // Keep state in sync with URL changes (browser back/forward or programmatic navigation)
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        setSelectedSlug(path.replace('/blog/', ''));
      } else {
        setSelectedSlug(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Parse posts list securely
  const posts: BlogPostType[] = useMemo(() => {
    return (postsData as BlogPostType[]) || [];
  }, []);

  // Filter posts based on searches and category
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory !== 'all') {
      result = posts.filter(post => getPostCategory(post.slug).id === selectedCategory);
    }
    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase();
    return result.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.keywords && post.keywords.toLowerCase().includes(query))
    );
  }, [posts, searchQuery, selectedCategory]);

  // Find currently active post
  const activePost = useMemo(() => {
    if (!selectedSlug) return null;
    return posts.find(p => p.slug === selectedSlug) || null;
  }, [posts, selectedSlug]);

  // Handle article view actions
  const handleViewPost = (slug: string, autoResume?: boolean) => {
    setSelectedSlug(slug);
    if (typeof window !== 'undefined') {
      const searchSuffix = autoResume ? '?resume=true' : window.location.search;
      const url = `/blog/${slug}` + searchSuffix;
      window.history.pushState({}, document.title, url);
    }
    // Skip scroll-to-top if we are trying to restore their progress
    if (!autoResume) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, document.title, '/blog' + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredPost = posts[0];
  const featuredCategory = featuredPost ? getPostCategory(featuredPost.slug) : null;

  if (activePost) {
    return (
      <div className="w-full">
        <BlogPost post={activePost} onBack={handleBackToList} isSpaView={true} showImage={showImages} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-20">
      {/* Resume Progress Bridge Node */}
      <ResumeReadingBridge onResume={(slug) => handleViewPost(slug, true)} />

      {/* Editorial Hub Masthead Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#0E1526]/40 p-8 sm:p-12 mb-8 backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-60 h-60 bg-cyan-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-black">
              Chidon IQ Knowledge Network
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none">
            Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan-primary">Digest</span>
          </h1>

          <p className="text-sm text-slate-350 max-w-2xl leading-relaxed">
            Master local and global traffic channels. Learn how to craft perfect prompts, automate production pipelines, maximize Google SEO indexing and earn multi-currency freelance income with the Chidon IQ matrix protocols.
          </p>

          {/* Search bar inside Masthead */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-lg">
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials, keywords, prompt tactics..."
                className="w-full bg-[#070A13]/80 text-white pl-11 pr-4 py-3.5 rounded-2xl text-xs border border-white/5 focus:border-brand/40 outline-none transition-all focus:ring-1 focus:ring-brand/30"
              />
            </div>
            
            <a 
              href="/rss.xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-white/[0.02] border border-white/5 hover:border-brand/30 text-xs font-mono font-bold text-slate-350 hover:text-white rounded-2xl inline-flex items-center justify-center gap-2 transition-all"
            >
              <Rss size={13} className="text-brand" />
              <span>RSS FEEDS</span>
            </a>

            <button 
              onClick={handleToggleImages}
              className="px-5 py-3.5 bg-white/[0.02] border border-white/5 hover:border-brand/30 text-xs font-mono font-bold text-slate-350 hover:text-white rounded-2xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Toggle featured image visibility for full reader mode optimization"
            >
              <ImageIcon size={13} className={showImages ? "text-cyan-primary" : "text-slate-500"} />
              <span>IMAGES: {showImages ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Headline Post Block (only visible when not filtering) */}
      {!searchQuery && selectedCategory === 'all' && featuredPost && featuredCategory && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-black flex items-center gap-2">
            <Sparkles size={13} />
            Featured Article
          </h2>
          
          <div 
            onClick={() => handleViewPost(featuredPost.slug)}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0E1526]/60 rounded-3xl border border-white/5 hover:border-brand/35 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 cursor-pointer relative"
          >
            {showImages && (
              <div className={`lg:col-span-7 relative overflow-hidden aspect-[16/9] lg:aspect-auto min-h-[240px] sm:min-h-[300px] ${
                featuredCategory.id === 'ai-basics' ? 'bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900/40' :
                featuredCategory.id === 'content-strategy' ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900/40' :
                featuredCategory.id === 'freelancing' ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/40' :
                featuredCategory.id === 'development' ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900/40' :
                featuredCategory.id === 'ethics' ? 'bg-gradient-to-br from-pink-950 via-slate-900 to-pink-900/40' :
                'bg-gradient-to-br from-brand/20 via-[#070A13] to-slate-900'
              }`}>
                {/* Glowing featured category pill overlay */}
                <div className={`absolute top-4 left-4 z-20 px-2.5 py-1 backdrop-blur-md border rounded-full text-[9px] font-mono tracking-widest font-black uppercase flex items-center gap-1 shadow-lg pointer-events-none transition-all duration-300 group-hover:scale-102 ${featuredCategory.color}`}>
                  <span>{featuredCategory.icon}</span>
                  <span>{featuredCategory.label}</span>
                </div>

                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Instantly hide the image to keep the beautiful, stable local color gradient
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#070A13]/90 via-[#070A13]/25 to-transparent pointer-events-none z-15" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
                  <span className="text-4xl mb-3 opacity-50 filter saturate-150">{featuredCategory.icon}</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">{featuredCategory.label}</span>
                </div>
              </div>
            )}

            <div className={showImages ? "lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6" : "lg:col-span-12 p-6 sm:p-8 flex flex-col justify-between space-y-6"}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-455">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-brand" />
                    {featuredPost.date}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-cyan-primary" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-primary transition-colors uppercase tracking-tight leading-tight">
                  {featuredPost.title}
                </h3>

                <p className="text-sm text-neutral-50 font-bold leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] font-bold text-brand group-hover:text-cyan-primary transition-colors uppercase tracking-widest border-t border-white/5">
                <span>Engage Strategic Briefing</span>
                <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Grid block */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
            <BookOpen size={13} className="text-cyan-primary" />
            {searchQuery ? `Search Results (${filteredPosts.length})` : 'Knowledge Vault Catalogue'}
          </h2>

          {/* Dynamic counter */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-black">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} index
          </span>
        </div>

        {/* Category Filtration Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-[10.5px] font-mono font-black uppercase rounded-2xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand/10 border-brand/40 text-brand shadow-md shadow-brand/10'
                    : 'bg-[#0E1526]/30 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard 
                key={post.slug} 
                post={post} 
                onClick={handleViewPost} 
                isLink={false} 
                showImage={showImages}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-white/5 rounded-3xl bg-[#0E1526]/20">
            <p className="text-slate-450 font-mono text-xs uppercase tracking-wider">No articles match your query.</p>
          </div>
        )}
      </section>

      {/* Recently Read dynamic list */}
      <RecentlyReadSection posts={posts} onPostClick={(slug) => handleViewPost(slug)} />
    </div>
  );
}
export default BlogSection;
