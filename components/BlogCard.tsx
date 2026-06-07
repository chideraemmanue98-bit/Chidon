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

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Protocols' },
  { id: 'ai-basics', label: 'AI Foundations' },
  { id: 'content-strategy', label: 'Content Strategy' },
  { id: 'freelancing', label: 'Freelancing & Yield' },
  { id: 'development', label: 'Code & Systems' },
  { id: 'ethics', label: 'Ethics & Future' },
];

export function getPostCategory(slug: string) {
  const map: Record<string, { id: string; label: string; icon: string; color: string }> = {
    "what-is-ai-how-it-works-2026": { id: "ai-basics", label: "AI Foundations", icon: "🧠", color: "text-cyan-primary border-cyan-500/20 bg-cyan-950/40" },
    "ai-vs-human-writing-2026": { id: "content-strategy", label: "Content Strategy", icon: "✍️", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "top-10-free-ai-tools-2026": { id: "ai-basics", label: "AI Foundations", icon: "🛠️", color: "text-cyan-primary border-cyan-500/20 bg-cyan-950/40" },
    "how-students-can-use-ai-to-study-faster": { id: "ai-basics", label: "AI Foundations", icon: "🎓", color: "text-cyan-primary border-cyan-500/20 bg-cyan-950/40" },
    "ai-for-small-business": { id: "freelancing", label: "Freelancing & Yield", icon: "💼", color: "text-[#10B981] border-emerald-500/20 bg-emerald-950/40" },
    "is-ai-dangerous-myths-vs-facts": { id: "ethics", label: "Ethics & Future", icon: "🛡️", color: "text-pink-vibrant border-pink-500/20 bg-pink-950/40" },
    "chatgpt-vs-claude-vs-gemini": { id: "ai-basics", label: "AI Foundations", icon: "🎯", color: "text-cyan-primary border-cyan-500/20 bg-cyan-950/40" },
    "how-to-write-perfect-prompts": { id: "content-strategy", label: "Content Strategy", icon: "⚡", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "ai-image-generation-guide": { id: "content-strategy", label: "Content Strategy", icon: "🎨", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "future-of-jobs-with-ai": { id: "ethics", label: "Ethics & Future", icon: "🚀", color: "text-pink-vibrant border-pink-500/20 bg-pink-950/40" },
    "ai-for-content-creators": { id: "content-strategy", label: "Content Strategy", icon: "🎥", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "how-ai-can-help-make-money": { id: "freelancing", label: "Freelancing & Yield", icon: "💰", color: "text-[#10B981] border-emerald-500/20 bg-emerald-950/40" },
    "best-ai-tools-for-coding": { id: "development", label: "Code & Systems", icon: "💻", color: "text-amber-500 border-amber-500/20 bg-amber-955/40" },
    "ai-in-education-future": { id: "ethics", label: "Ethics & Future", icon: "🏫", color: "text-pink-vibrant border-pink-500/20 bg-pink-950/40" },
    "chatgpt-prompts-viral": { id: "content-strategy", label: "Content Strategy", icon: "📈", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "ai-ethics-need-to-know": { id: "ethics", label: "Ethics & Future", icon: "⚖️", color: "text-pink-vibrant border-pink-500/20 bg-pink-950/40" },
    "how-to-detect-ai-written-content": { id: "content-strategy", label: "Content Strategy", icon: "🔍", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" },
    "ai-for-marketing-ads-seo": { id: "freelancing", label: "Freelancing & Yield", icon: "📣", color: "text-[#10B981] border-emerald-500/20 bg-emerald-950/40" },
    "beginners-guide-machine-learning": { id: "development", label: "Code & Systems", icon: "📊", color: "text-amber-500 border-amber-500/20 bg-amber-955/40" },
    "why-everyone-should-learn-ai-in-2026": { id: "freelancing", label: "Freelancing & Yield", icon: "🔥", color: "text-[#10B981] border-emerald-500/20 bg-emerald-950/40" },
  };
  return map[slug] || { id: "content-strategy", label: "Content Strategy", icon: "✍️", color: "text-purple-vibrant border-purple-500/20 bg-purple-950/40" };
}

interface BlogCardProps {
  post: BlogPostType;
  onClick?: (slug: string) => void;
  isLink?: boolean;
  showImage?: boolean;
}

export function BlogCard({ post, onClick, isLink = true, showImage = true }: BlogCardProps) {
  const category = getPostCategory(post.slug);
  
  const contentElement = (
    <div 
      className="group bg-[#0E1526]/60 rounded-2xl border border-white/5 hover:border-brand/40 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand/5 flex flex-col h-full cursor-pointer"
      onClick={() => onClick?.(post.slug)}
      id={`blog-card-${post.slug}`}
    >
      {/* Thumbnail Aspect Ratio 16:9 safe referencing */}
      {showImage && (
        <div className={`relative overflow-hidden aspect-[16/9] border-b border-white/5 ${
          category.id === 'ai-basics' ? 'bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900/40' :
          category.id === 'content-strategy' ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900/40' :
          category.id === 'freelancing' ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/40' :
          category.id === 'development' ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900/40' :
          category.id === 'ethics' ? 'bg-gradient-to-br from-pink-950 via-slate-900 to-pink-900/40' :
          'bg-gradient-to-br from-brand/20 via-[#070A13] to-slate-900'
        }`}>
          {/* Absolute Glowing Category Badge */}
          <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 backdrop-blur-md border rounded-full text-[9px] font-mono tracking-widest font-black uppercase flex items-center gap-1 shadow-lg pointer-events-none transition-transform duration-300 group-hover:scale-102 ${category.color}`}>
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </div>

          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Instantly hide the image to keep the beautiful, stable local color gradient
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A13]/90 via-[#070A13]/25 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-15 pointer-events-none" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0">
            <span className="text-2xl mb-1.5 opacity-50 filter saturate-150">{category.icon}</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">{category.label}</span>
          </div>
        </div>
      )}

      {/* Meta & Title */}
      <div className="p-5 flex flex-col flex-grow space-y-3">
        {!showImage && (
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className={`px-2 py-0.5 border rounded-full text-[8px] font-mono tracking-widest font-black uppercase flex items-center gap-1 ${category.color}`}>
              {category.icon} {category.label}
            </span>
          </div>
        )}
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

        <p className="text-xs sm:text-sm text-neutral-50 font-bold line-clamp-3 leading-relaxed flex-grow">
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
