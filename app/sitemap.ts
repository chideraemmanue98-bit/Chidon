// @ts-nocheck
import postsData from '../data/posts.json';

export default async function sitemap() {
  const dynamicPosts = postsData || [];
  
  const blogUrls = dynamicPosts.map((post) => ({
    url: `https://chidoniq.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: 'https://chidoniq.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://chidoniq.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://chidoniq.com/terms',
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://chidoniq.com/refund-policy',
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ];

  return [...staticUrls, ...blogUrls];
}
