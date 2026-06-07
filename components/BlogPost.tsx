"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook, Copy, Check, ArrowLeft, ThumbsUp, MessageSquare } from 'lucide-react';
import { NewsletterSubscription } from './NewsletterSubscription';
import { getPostCategory } from './BlogCard';

export interface BlogPostType {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
  keywords: string;
  content: string;
}

interface BlogPostProps {
  post: BlogPostType;
  onBack?: () => void;
  isSpaView?: boolean;
  showImage?: boolean;
}

const SEEDED_COMMENTS: Record<string, { author: string; handle: string; text: string; date: string; avatar: string }[]> = {};

export function BlogPost({ post, onBack, isSpaView = false, showImage = true }: BlogPostProps) {
  const [copied, setCopied] = useState(false);
  const scrollYRef = useRef(0);
  const category = getPostCategory(post.slug);
  const didScrollRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Micro-emoji claps tracking
  const [reactions, setReactions] = useState<Record<string, number>>(() => {
    try {
      const data = localStorage.getItem(`chidoniq_reacts_${post.slug}`);
      return data ? JSON.parse(data) : { claps: 12, mindblown: 8, loves: 5, fire: 14 };
    } catch {
      return { claps: 12, mindblown: 8, loves: 5, fire: 14 };
    }
  });

  // Comments state
  const [comments, setComments] = useState<{ author: string; handle: string; text: string; date: string; avatar: string }[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentAvatar, setCommentAvatar] = useState('💬');

  // Track active scroll height for reading progress bar
  useEffect(() => {
    const handleScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  // Parse header outline anchors dynamically on the fly
  const parsedHeadings = useMemo(() => {
    if (!post.content) return [];
    const lines = post.content.split('\n');
    return lines
      .filter(line => line.startsWith('## ') || line.startsWith('### '))
      .map((line) => {
        const isSub = line.startsWith('### ');
        const text = line.replace(/^##+\s+/, '').replace(/\*+/g, '').replace(/_+/g, '');
        const anchorId = text.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return { text, isSub, anchorId };
      })
      .slice(0, 10); // Limit to top 10 core landmarks
  }, [post.content]);

  // Sync click to specific coordinate anchor
  const scrollToAnchor = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reactions increase handler
  const handleReact = (type: string) => {
    setReactions(prev => {
      const next = { ...prev, [type]: prev[type] + 1 };
      try {
        localStorage.setItem(`chidoniq_reacts_${post.slug}`, JSON.stringify(next));
      } catch (err) {
        // Safe check
      }
      return next;
    });
  };

  // Populate comments block
  useEffect(() => {
    const seeded = SEEDED_COMMENTS[post.slug] || [
      { author: "Marcus Vance", handle: "@mvance", text: "Phenomenal editorial. Clear, actionable instructions that deliver on prompt parameters.", date: "3 days ago", avatar: "🛡️" },
      { author: "Isabella Cruz", handle: "@isac", text: "The presentation logic and negative grid layout of this blog is absolutely gorgeous.", date: "4 days ago", avatar: "💻" }
    ];

    try {
      const stored = localStorage.getItem(`chidoniq_comments_${post.slug}`);
      if (stored) {
        setComments([...seeded, ...JSON.parse(stored)]);
      } else {
        setComments(seeded);
      }
    } catch {
      setComments(seeded);
    }
  }, [post.slug]);

  // Handle human additions of comments
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      author: commentName.trim(),
      handle: `@${commentName.trim().toLowerCase().replace(/\s+/g, '')}`,
      text: commentText.trim(),
      date: "Just now",
      avatar: commentAvatar
    };

    try {
      const stored = localStorage.getItem(`chidoniq_comments_${post.slug}`);
      const storedList = stored ? JSON.parse(stored) : [];
      const updatedList = [...storedList, newComment];
      localStorage.setItem(`chidoniq_comments_${post.slug}`, JSON.stringify(updatedList));
      
      const seeded = SEEDED_COMMENTS[post.slug] || [
        { author: "Marcus Vance", handle: "@mvance", text: "Phenomenal editorial. Clear, actionable instructions that deliver on prompt parameters.", date: "3 days ago", avatar: "🛡️" },
        { author: "Isabella Cruz", handle: "@isac", text: "The presentation logic and negative grid layout of this blog is absolutely gorgeous.", date: "4 days ago", avatar: "💻" }
      ];
      setComments([...seeded, ...updatedList]);
      setCommentText('');
      setCommentName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Resume reading auto-scroll and Track recently opened articles
  useEffect(() => {
    if (typeof window === 'undefined' || !post || !post.slug) return;

    // Check if '?resume=true' query parameter is present to auto-scroll
    const queryParams = new URLSearchParams(window.location.search);
    const resumeParam = queryParams.get('resume') === 'true';

    if (resumeParam) {
      try {
        const data = localStorage.getItem('chidoniq_progress');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && parsed.slug === post.slug && typeof parsed.y === 'number') {
            setTimeout(() => {
              window.scrollTo({
                top: parsed.y,
                behavior: 'smooth'
              });
            }, 100);
          }
        }
      } catch (err) {
        console.warn("Could not auto-scroll:", err);
      }
    }

    // Update Recently Read articles (limited to last 3 unique articles)
    try {
      const data = localStorage.getItem('chidoniq_recent');
      let recentSlugs: string[] = [];
      if (data) {
        recentSlugs = JSON.parse(data);
        if (!Array.isArray(recentSlugs)) recentSlugs = [];
      }
      
      recentSlugs = recentSlugs.filter(slug => slug !== post.slug);
      recentSlugs.unshift(post.slug);
      localStorage.setItem('chidoniq_recent', JSON.stringify(recentSlugs.slice(0, 3)));
    } catch (err) {
      console.warn("Failed saving recently read item:", err);
    }
  }, [post.slug]);

  // Track scroll position every 2 seconds while scrolling
  useEffect(() => {
    if (typeof window === 'undefined' || !post || !post.slug) return;

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      didScrollRef.current = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const saveInterval = setInterval(() => {
      if (didScrollRef.current) {
        try {
          const progress = {
            slug: post.slug,
            title: post.title,
            y: scrollYRef.current,
            timestamp: Date.now()
          };
          localStorage.setItem('chidoniq_progress', JSON.stringify(progress));
          didScrollRef.current = false;
        } catch (err) {
          console.warn("Progress sync error:", err);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(saveInterval);
      if (didScrollRef.current) {
        try {
          const progress = {
            slug: post.slug,
            title: post.title,
            y: scrollYRef.current,
            timestamp: Date.now()
          };
          localStorage.setItem('chidoniq_progress', JSON.stringify(progress));
        } catch (err) {
          // Ignore
        }
      }
    };
  }, [post.slug, post.title]);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${post.slug}`;
    }
    return `https://chidoniq.com/blog/${post.slug}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this amazing article: ${post.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedin = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <article className="relative min-h-screen text-slate-100 pb-20 mt-1" id={`blog-post-${post.slug}`}>
      {/* Scroll Reading Progress tracker */}
      <div className="sticky top-0 left-0 right-0 h-[3.5px] bg-[#111827] z-50 overflow-hidden">
        <div 
          className="h-full bg-cyan-primary transition-all duration-150 relative shadow-lg shadow-cyan-500/50" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background ambient lighting anchors */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.04),transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-4">
        
        {/* Back navigation buttons */}
        <div className="mb-6">
          {isSpaView ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-4 py-2.5 rounded-xl hover:bg-brand/10 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Back to Blog Catalog
            </button>
          ) : (
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-4 py-2.5 rounded-xl hover:bg-brand/10"
            >
              <ArrowLeft size={12} />
              Back to blog list
            </a>
          )}
        </div>

        {/* Article Headers */}
        <header className="space-y-5 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-mono uppercase tracking-widest font-black">
            Expert Intelligence
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-1 border-b border-white/5 pb-5">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-brand shrink-0" />
              {post.author || "Chidon Iq Team"}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-cyan-primary shrink-0" />
              {post.date}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-emerald-450 shrink-0" />
              {post.readTime || "4 min read"}
            </span>
          </div>
        </header>

        {/* Featured Image Frame */}
        {showImage && (
          <div className={`relative mb-10 rounded-2xl overflow-hidden border border-white/5 aspect-[16/9] shadow-2xl hover:border-white/10 transition-colors ${
            category.id === 'ai-basics' ? 'bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900/40' :
            category.id === 'content-strategy' ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900/40' :
            category.id === 'freelancing' ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/40' :
            category.id === 'development' ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900/40' :
            category.id === 'ethics' ? 'bg-gradient-to-br from-pink-950 via-slate-900 to-pink-900/40' :
            'bg-gradient-to-br from-brand/20 via-[#070A13] to-slate-900'
          }`}>
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover z-10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Instantly hide the image to keep the beautiful, stable local color gradient
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Ambient inner overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/70 via-[#070A13]/25 to-transparent z-15 pointer-events-none" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-0">
              <span className="text-4xl mb-3 opacity-60 filter saturate-150">{category.icon}</span>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">{category.label} Resource</span>
            </div>
          </div>
        )}

        {/* Content, TOC & Sharing flex grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT/RIGHT SIDEBAR: Immersive Table of Contents Outline */}
          <div className="lg:col-span-3 order-last lg:order-first">
            <div className="sticky top-20 space-y-6">
              {parsedHeadings.length > 0 && (
                <div className="bg-[#0E1526]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm space-y-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black border-b border-white/5 pb-2">
                    Tutorial Landmarks
                  </span>
                  <nav className="space-y-2">
                    {parsedHeadings.map((head, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToAnchor(head.anchorId)}
                        className={`block text-left text-xs uppercase cursor-pointer hover:text-cyan-primary transition-all line-clamp-1 py-0.5 ${
                          head.isSub 
                            ? 'pl-3 text-slate-450 border-l border-white/5 text-[11px]' 
                            : 'text-slate-350 font-semibold'
                        }`}
                      >
                        {head.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Emoji Microclaps Interaction Console */}
              <div className="bg-[#0E1526]/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm space-y-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black border-b border-white/5 pb-2">
                  Verify Article Value
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button 
                    onClick={() => handleReact('claps')}
                    className="flex flex-col items-center justify-center p-2.5 bg-white/[0.02] border border-white/5 hover:border-brand/40 rounded-xl transition-all hover:bg-brand/5 cursor-pointer"
                  >
                    <span className="text-lg">👏</span>
                    <span className="text-[10px] text-slate-450 mt-1">Claps {reactions.claps || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleReact('mindblown')}
                    className="flex flex-col items-center justify-center p-2.5 bg-white/[0.02] border border-white/5 hover:border-[#F59E0B]/40 rounded-xl transition-all hover:bg-[#F59E0B]/5 cursor-pointer"
                  >
                    <span className="text-lg">🤯</span>
                    <span className="text-[10px] text-slate-450 mt-1">Epic {reactions.mindblown || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleReact('loves')}
                    className="flex flex-col items-center justify-center p-2.5 bg-white/[0.02] border border-white/5 hover:border-[#EF4444]/40 rounded-xl transition-all hover:bg-[#EF4444]/5 cursor-pointer"
                  >
                    <span className="text-lg">❤️</span>
                    <span className="text-[10px] text-slate-450 mt-1">Love {reactions.loves || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleReact('fire')}
                    className="flex flex-col items-center justify-center p-2.5 bg-white/[0.02] border border-white/5 hover:border-[#10B981]/40 rounded-xl transition-all hover:bg-[#10B981]/5 cursor-pointer"
                  >
                    <span className="text-lg">🔥</span>
                    <span className="text-[10px] text-slate-450 mt-1">Hot {reactions.fire || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content flow */}
          <div className="lg:col-span-6 space-y-10">
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-p:text-white prose-p:font-bold prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black prose-code:text-cyan-primary prose-code:font-mono prose-a:text-brand prose-a:underline hover:prose-a:text-cyan-primary">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => {
                    return <h1 className="text-2xl sm:text-3xl font-black text-white mt-10 mb-4 uppercase tracking-tight">{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const text = React.Children.toArray(children).join('');
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h2 id={id} className="text-xl sm:text-2xl font-black text-white mt-8 mb-4 border-b border-white/20 pb-2 uppercase tracking-wide scroll-mt-24">{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const text = React.Children.toArray(children).join('');
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h3 id={id} className="text-lg font-black text-white mt-6 mb-3 uppercase tracking-wider scroll-mt-24">{children}</h3>;
                  },
                  p: ({ children }) => {
                    return <p className="text-sm sm:text-base text-neutral-50 font-bold leading-relaxed mb-5">{children}</p>;
                  },
                  ul: ({ children }) => {
                    return <ul className="list-disc pl-5 space-y-2 mb-4 text-sm sm:text-base text-neutral-50 font-bold">{children}</ul>;
                  },
                  ol: ({ children }) => {
                    return <ol className="list-decimal pl-5 space-y-2 mb-4 text-sm sm:text-base text-neutral-50 font-bold">{children}</ol>;
                  },
                  li: ({ children }) => {
                    return <li className="leading-relaxed text-sm sm:text-base text-neutral-50 font-bold">{children}</li>;
                  },
                  blockquote: ({ children }) => {
                    return <blockquote className="border-l-4 border-brand bg-[#0E1526]/50 px-4 py-3 rounded-r-xl italic my-6 text-neutral-50 font-black text-sm sm:text-base leading-relaxed">{children}</blockquote>;
                  },
                  code: ({ children }) => {
                    return <code className="bg-brand/10 text-cyan-primary px-1.5 py-0.5 rounded font-mono text-[11px] font-black">{children}</code>;
                  },
                  pre: ({ children }) => {
                    return <pre className="bg-[#070A13] border border-white/5 rounded-2xl p-4 overflow-x-auto text-[11px] font-mono text-slate-300 my-6 scrollbar-thin">{children}</pre>;
                  },
                  table: ({ children }) => {
                    return (
                      <div className="overflow-x-auto my-6 border border-white/5 rounded-2xl bg-[#0E1526]/30">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
                      </div>
                    );
                  },
                  thead: ({ children }) => {
                    return <thead className="bg-brand/5 border-b border-white/5 text-[11px] text-slate-400 font-mono uppercase tracking-wider">{children}</thead>;
                  },
                  tbody: ({ children }) => {
                    return <tbody className="divide-y divide-white/5">{children}</tbody>;
                  },
                  th: ({ children }) => {
                    return <th className="p-3 font-semibold">{children}</th>;
                  },
                  td: ({ children }) => {
                    return <td className="p-3 text-neutral-50 font-bold text-sm sm:text-base">{children}</td>;
                  }
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
            
            {/* Call to action card */}
            <div className="mt-16 bg-gradient-to-r from-[#0E1526]/80 to-[#121A2F]/80 border border-brand/20 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" />
              <div className="space-y-2 text-center sm:text-left relative z-10">
                <h4 className="text-base font-black text-white uppercase tracking-wide">Ready to Scale Your Visual Content?</h4>
                <p className="text-xs text-slate-350 max-w-md">Launch your content optimization campaigns, generate viral hooks, and earn remote payouts today with the Chidon IQ matrix suite.</p>
              </div>
              <a 
                href="/" 
                className="inline-flex items-center gap-2 bg-brand text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-brand-vibrant shadow-lg hover:shadow-brand/20 transition-all text-center shrink-0 relative z-10 cursor-pointer text-center"
              >
                Go to Workspace
              </a>
            </div>

            {/* Micro Human Comments Module */}
            <section className="space-y-5 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#10B981] font-black">
                <MessageSquare size={14} />
                <span>Verified Reader Musings ({comments.length})</span>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostComment} className="bg-[#0E1526]/30 border border-white/5 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Your HandleName</label>
                    <input 
                      type="text" 
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="e.g., Jane Cooper"
                      required
                      className="w-full bg-[#070A13]/80 text-white px-3.5 py-2.5 rounded-xl text-xs border border-white/5 focus:border-brand/40 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Select Icon Identifier</label>
                    <select 
                      value={commentAvatar}
                      onChange={(e) => setCommentAvatar(e.target.value)}
                      className="w-full bg-[#070A13]/80 text-white px-3.5 py-2.5 rounded-xl text-xs border border-white/5 focus:border-brand/40 outline-none"
                    >
                      <option value="💬">💬 standard chat</option>
                      <option value="🧠">🧠 algorithm designer</option>
                      <option value="💻">💻 core software</option>
                      <option value="🚀">🚀 tech launcher</option>
                      <option value="🛡️">🛡️ risk audit</option>
                      <option value="✍️">✍️ write scribe</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Musing reflection</label>
                  <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Contribute your insight on this protocol..."
                    required
                    rows={3}
                    className="w-full bg-[#070A13]/80 text-white px-3.5 py-2.5 rounded-xl text-xs border border-white/5 focus:border-brand/40 outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white text-[10px] font-mono font-bold rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
                >
                  Publish Musing
                </button>
              </form>

              {/* Render musings catalog */}
              <div className="space-y-4">
                {comments.map((comm, index) => (
                  <div key={index} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 text-base">
                      {comm.avatar || '💬'}
                    </div>
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white uppercase">{comm.author}</span>
                          <span className="text-[10px] font-mono text-slate-450">{comm.handle}</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-wide text-slate-455">{comm.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal">{comm.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter Subscription Form */}
            <NewsletterSubscription />
          </div>

          {/* Floating Share columns */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#0E1526]/40 border border-white/5 rounded-2xl p-5 sticky top-20 space-y-4 backdrop-blur-sm">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-black border-b border-white/5 pb-2">
                Share Intelligence
              </span>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={shareOnTwitter}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-brand/10 hover:border-brand/35 transition-all text-left font-semibold cursor-pointer"
                >
                  <Twitter size={14} className="text-cyan-primary shrink-0" />
                  <span>X / Twitter</span>
                </button>
                
                <button
                  onClick={shareOnLinkedin}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-[#0A66C2]/15 hover:border-[#0A66C2]/35 transition-all text-left font-semibold cursor-pointer"
                >
                  <Linkedin size={14} className="text-[#0A66C2] shrink-0" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-[#1877F2]/15 hover:border-[#1877F2]/35 transition-all text-left font-semibold cursor-pointer"
                >
                  <Facebook size={14} className="text-[#1877F2] shrink-0" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/25 transition-all text-left font-semibold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-slate-400 shrink-0" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
