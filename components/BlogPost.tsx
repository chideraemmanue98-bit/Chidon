"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook, Copy, Check, ArrowLeft } from 'lucide-react';

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
}

export function BlogPost({ post, onBack, isSpaView = false }: BlogPostProps) {
  const [copied, setCopied] = useState(false);

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
    <article className="relative min-h-screen text-slate-100 pb-20" id={`blog-post-${post.slug}`}>
      {/* Background ambient lighting anchors */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.04),transparent_50%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Back navigation buttons */}
        <div className="mb-8 pt-4">
          {isSpaView ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-450 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-4 py-2.5 rounded-xl hover:bg-brand/10 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Back to Blog Catalog
            </button>
          ) : (
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-450 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-4 py-2.5 rounded-xl hover:bg-brand/10"
            >
              <ArrowLeft size={12} />
              Back to blog list
            </a>
          )}
        </div>

        {/* Article Headers */}
        <header className="space-y-6 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-mono uppercase tracking-widest font-black">
            Expert Intelligence
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-2 border-b border-white/5 pb-6">
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
              <Clock size={13} className="text-emerald-400 shrink-0" />
              {post.readTime || "4 min read"}
            </span>
          </div>
        </header>

        {/* Featured Image Frame */}
        <div className="relative mb-12 rounded-3xl overflow-hidden border border-white/5 bg-[#070A13] aspect-[16/9] shadow-2xl hover:border-white/10 transition-colors">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.slug}/1200/630`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content & Sharing flex grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main content flow */}
          <div className="lg:col-span-9 space-y-6">
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-h2:text-2xl prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2 prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-bold prose-code:text-cyan-primary prose-code:font-mono prose-a:text-brand prose-a:underline hover:prose-a:text-cyan-primary">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            
            {/* Call to action card */}
            <div className="mt-16 bg-gradient-to-r from-[#0E1526]/80 to-[#121A2F]/80 border border-brand/20 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" />
              <div className="space-y-2 text-center sm:text-left relative z-10">
                <h4 className="text-lg font-black text-white uppercase tracking-wide">Ready to Scale Your Visual Content?</h4>
                <p className="text-xs text-slate-350 max-w-md">Launch your content optimization campaigns, generate viral hooks, and earn remote payouts today with the Chidon IQ matrix suite.</p>
              </div>
              <a 
                href="/" 
                className="inline-flex items-center gap-2 bg-brand text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-brand-vibrant shadow-lg hover:shadow-brand/20 transition-all text-center shrink-0 relative z-10 cursor-pointer"
              >
                Go to Workspace
              </a>
            </div>
          </div>

          {/* Floating Share columns */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#0E1526]/45 border border-white/5 rounded-2xl p-5 sticky top-24 space-y-4 backdrop-blur-sm">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-405 font-bold border-b border-white/5 pb-2">
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
                      <Check size={14} className="text-emerald-450 shrink-0 animate-ping" />
                      <span className="text-emerald-455 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-slate-450 shrink-0" />
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
