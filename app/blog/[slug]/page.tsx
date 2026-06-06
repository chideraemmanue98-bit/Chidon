// @ts-nocheck
import React from 'react';
import postsData from '../../../data/posts.json';
import { BlogPost } from '../../../components/BlogPost';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const post = postsData.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found - Chidon IQ',
    };
  }

  return {
    title: `${post.title} | Chidon IQ`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://chidoniq.com/blog/${post.slug}`,
      siteName: 'Chidon IQ',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'Chidon Iq Team'],
      images: [
        {
          url: `https://chidoniq.com${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`https://chidoniq.com${post.image}`],
    },
  };
}

export async function generateStaticParams() {
  return postsData.map((post) => ({
    slug: post.slug,
  }));
}

export default function SinglePostPage({ params }) {
  const { slug } = params;
  const post = postsData.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Create article scheme JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": post.author || "Chidon Iq Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Chidon IQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://chidoniq.com/favicon.png"
      }
    },
    "image": `https://chidoniq.com${post.image}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://chidoniq.com/blog/${post.slug}`
    },
    "articleBody": post.content
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans relative py-16">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative z-10">
        <BlogPost post={post} isSpaView={false} />
      </main>
    </div>
  );
}
