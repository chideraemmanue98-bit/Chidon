// @ts-nocheck
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://chidoniq.com/sitemap.xml',
  };
}
