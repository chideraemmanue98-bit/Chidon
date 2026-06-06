import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

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

interface BlogCardProps {
  post: BlogPostType;
  onClick?: (slug: string) => void;
  isLink?: boolean;
}

export function BlogCard({ post, onClick, isLink = true }: BlogCardProps) {
  const contentElement = (
    <div 
      className="group bg-[#0E1526]/60 rounded-2xl border border-white/5 hover:border-brand/40 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand/5 flex flex-col h-full cursor-pointer"
      onClick={() => onClick?.(post.slug)}
      id={`blog-card-${post.slug}`}
    >
      {/* Thumbnail Aspect Ratio 16:9 safe referencing */}
      <div className="relative overflow-hidden aspect-[16/9] bg-[#070A13] border-b border-white/5">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // High fidelity dark neon gradient background fallback on load fail
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.slug}/1200/630`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/90 via-[#070A13]/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Meta & Title */}
      <div className="p-5 flex flex-col flex-grow space-y-3">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-450">
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-brand" />
            {post.date}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-cyan-primary" />
            {post.readTime || "4 min read"}
          </span>
        </div>

        <h3 className="text-base font-black text-white group-hover:text-cyan-primary transition-colors line-clamp-2 uppercase tracking-wide leading-snug">
          {post.title}
        </h3>

        <p className="text-xs text-slate-350 line-clamp-3 leading-relaxed flex-grow">
          {post.excerpt}
        </p>

        <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-brand group-hover:text-cyan-primary transition-colors uppercase tracking-widest mt-auto border-t border-white/5 pt-2">
          <span>Read Article</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  if (isLink && !onClick) {
    return (
      <a href={`/blog/${post.slug}`} className="block h-full text-left">
        {contentElement}
      </a>
    );
  }

  return contentElement;
}
