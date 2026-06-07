// @ts-nocheck
import React from 'react';
import postsData from '../../data/posts.json';
import { BlogCard } from '../../components/BlogCard';
import { ResumeReadingBridge } from '../../components/ResumeReadingBridge';
import { RecentlyReadSection } from '../../components/RecentlyReadSection';

export const metadata = {
  title: 'Chidon Iq Blog - Advanced AI Content Optimization and Marketing',
  description: 'Master AI content writing, growth strategies, and automated video workflows with expert tutorials, prompt guides, and marketing articles from the Chidon IQ team.',
  openGraph: {
    title: 'Chidon Iq Blog - Advanced AI Content Optimization and Marketing',
    description: 'Master AI content writing, growth strategies, and automated video workflows with expert tutorials and prompt guides from Chidon IQ.',
    url: 'https://chidoniq.com/blog',
    siteName: 'Chidon IQ',
    type: 'website',
    images: [
      {
        url: 'https://chidoniq.com/blog/blog-01-what-is-ai.png',
        width: 1200,
        height: 630,
        alt: 'Chidon IQ AI Blog',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chidon Iq Blog - Advanced AI Content Optimization',
    description: 'Master AI content writing, growth strategies, and AI automation guides.',
    images: ['https://chidoniq.com/blog/blog-01-what-is-ai.png'],
  }
};

export default function BlogListPage() {
  const posts = postsData || [];

  // Generate collection schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Chidon Iq AI Intelligence Blog",
    "description": "Master AI content writing, growth strategies, and automated video workflows.",
    "publisher": {
      "@type": "Organization",
      "name": "Chidon IQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://chidoniq.com/favicon.png"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "image": `https://chidoniq.com${post.image}`,
      "url": `https://chidoniq.com/blog/${post.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans relative pb-24">
      {/* Structural background patterns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_right,rgba(56,189,248,0.03),transparent_50%)] pointer-events-none" />

      {/* SEO schema script injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16 relative z-10 space-y-12">
        {/* Resume Reading Bridge Popup */}
        <ResumeReadingBridge />

        {/* Banner Headers */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-8 border-b border-white/5 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full text-[10px] font-mono uppercase tracking-widest font-black">
            Niche Intelligence Portal
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
            CHIDON IQ BLOG
          </h1>
          
          <p className="text-slate-350 text-sm max-w-lg mx-auto sm:text-base leading-relaxed">
            Gain tactical insights and expert guidance on maximizing your algorithmic social reach, prompt design systems, and freelance income vectors in 2026.
          </p>
        </div>

        {/* Recent Reading History Section */}
        <RecentlyReadSection posts={posts} />

        {/* Catalog Catalog List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Catalogue Hub
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} isLink={true} />
            ))}
          </div>
        </div>

        {/* Static home directory button */}
        <div className="mt-16 text-center border-t border-white/5 pt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-450 hover:text-white transition-colors uppercase tracking-widest border border-white/5 bg-[#0E1526]/40 px-6 py-3.5 rounded-xl hover:bg-brand/10 hover:border-brand/35"
          >
            ← Back to Dashboard Overview
          </a>
        </div>
      </main>
    </div>
  );
}
