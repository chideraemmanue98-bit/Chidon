"use client";

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { BlogCard, BlogPostType } from './BlogCard';

interface RecentlyReadSectionProps {
  posts: BlogPostType[];
  onPostClick?: (slug: string) => void;
}

export function RecentlyReadSection({ posts, onPostClick }: RecentlyReadSectionProps) {
  const [recentPosts, setRecentPosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('chidoniq_recent');
      if (data) {
        const recentSlugs = JSON.parse(data);
        if (Array.isArray(recentSlugs)) {
          // Map to actual post details, and filter out any unmatched slugs
          const mapped = recentSlugs
            .map(slug => posts.find(p => p.slug === slug))
            .filter(Boolean) as BlogPostType[];
          setRecentPosts(mapped);
        }
      }
    } catch (e) {
      console.warn("Recently read parse failed:", e);
    }
  }, [posts]);

  if (recentPosts.length === 0) return null;

  return (
    <section className="space-y-6 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-black flex items-center gap-2">
          <Clock size={13} className="text-[#10B981]" />
          Recently Read Intel
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPosts.map((post) => (
          <BlogCard 
            key={post.slug} 
            post={post} 
            onClick={onPostClick}
            isLink={!onPostClick} 
          />
        ))}
      </div>
    </section>
  );
}
