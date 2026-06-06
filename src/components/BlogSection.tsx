import React, { useState, useMemo } from 'react';
import postsData from '../../data/posts.json';
import { BlogCard, BlogPostType } from '../../components/BlogCard';
import { BlogPost } from '../../components/BlogPost';
import { Search, Sparkles, BookOpen, Clock, Calendar, ArrowRight, Rss } from 'lucide-react';

export function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // Parse posts list securely
  const posts: BlogPostType[] = useMemo(() => {
    return (postsData as BlogPostType[]) || [];
  }, []);

  // Filter posts based on searches
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.keywords && post.keywords.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  // Find currently active post
  const activePost = useMemo(() => {
    if (!selectedSlug) return null;
    return posts.find(p => p.slug === selectedSlug) || null;
  }, [posts, selectedSlug]);

  // Handle article view actions
  const handleViewPost = (slug: string) => {
    setSelectedSlug(slug);
    // Scroll container to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activePost) {
    return (
      <div className="w-full">
        <BlogPost post={activePost} onBack={handleBackToList} isSpaView={true} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-20">
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
          </div>
        </div>
      </div>

      {/* Featured Headline Post Block (only visible when not filtering) */}
      {!searchQuery && posts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-black flex items-center gap-2">
            <Sparkles size={13} />
            Featured Article
          </h2>
          
          <div 
            onClick={() => handleViewPost(posts[0].slug)}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0E1526]/60 rounded-3xl border border-white/5 hover:border-brand/35 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 cursor-pointer relative"
          >
            <div className="lg:col-span-7 relative overflow-hidden aspect-[16/9] lg:aspect-auto min-h-[240px] sm:min-h-[300px] bg-[#070A13]">
              <img
                src={posts[0].image}
                alt={posts[0].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#070A13]/90 via-[#070A13]/20 to-transparent pointer-events-none" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-455">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-brand" />
                    {posts[0].date}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-cyan-primary" />
                    {posts[0].readTime}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-primary transition-colors uppercase tracking-tight leading-tight">
                  {posts[0].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
                  {posts[0].excerpt}
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
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
            <BookOpen size={13} className="text-cyan-primary" />
            {searchQuery ? `Search Results (${filteredPosts.length})` : 'Knowledge Vault Catalogue'}
          </h2>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard 
                key={post.slug} 
                post={post} 
                onClick={handleViewPost} 
                isLink={false} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-white/5 rounded-3xl bg-[#0E1526]/20">
            <p className="text-slate-450 font-mono text-xs uppercase tracking-wider">No articles match your query.</p>
          </div>
        )}
      </section>
    </div>
  );
}
export default BlogSection;
