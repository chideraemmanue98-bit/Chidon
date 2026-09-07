/**
 * Robots Meta & Robots.txt Dynamic Generation Utility
 * Optimizes Search Crawler paths based on application navigation state.
 */

export interface RobotsMeta {
  content: string;
  hasCanonical: boolean;
}

/**
 * Dynamically resolves crawling directions (index vs noindex)
 * based on the active routing/view state.
 *
 * @param view Current active view identifier
 * @returns RobotsMeta containing robot tags instructions
 */
export function getRobotsMetaForView(view: string): RobotsMeta {
  const normalized = (view || '').toLowerCase().trim();

  // Secure / auth / private member areas should be hidden from indexers
  const privateViews = ['auth', 'credits', 'notifications', 'dashboard-settings', 'vault'];

  if (privateViews.includes(normalized)) {
    return {
      content: 'noindex, nofollow',
      hasCanonical: false
    };
  }

  // Public marketing, blog, and service directory indices should be crawled fully
  return {
    content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    hasCanonical: true
  };
}

/**
 * Formats a dynamic robots.txt instruction output
 * (Useful for dynamic API gateways or debug setups)
 */
export function generateRobotsTxtString(options: {
  sitemapUrl?: string;
  disallowedPaths?: string[];
}): string {
  const sitemap = options.sitemapUrl || 'https://chidoniq.com.ng/sitemap.xml';
  const disallows = options.disallowedPaths || ['/api/', '/admin/', '/private/'];

  const lines = [
    'User-agent: *',
    'Allow: /',
    ...disallows.map(path => `Disallow: ${path}`),
    '',
    `Sitemap: ${sitemap}`
  ];

  return lines.join('\n');
}
