import fs from 'fs';
import path from 'path';

const DIST_PATH = path.join(process.cwd(), 'dist');

// Define SEO configurations for each static target path
const ROUTES_SEO = {
  'freelance': {
    title: 'CHIDON FREELANCE EARN - Hire Top AI Freelancers in 2026',
    desc: 'Access premium verified social media marketers, prompt engineers, and short-form video editors worldwide. Transact securely via verified Paystack escrow gateways.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "CHIDON FREELANCE EARN",
      "url": "https://chidoniq.com/freelance"
    }
  },
  'freelance/dashboard/buyer': {
    title: 'Client Dashboard | CHIDON FREELANCE EARN',
    desc: 'Lock budgets in protected vaults, view contractor delivery drafts, and confirm Paystack bank escrow releases.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Client Dashboard - Chidon Freelance",
      "description": "Lock budgets in protected vaults and confirm Paystack bank escrow releases."
    }
  },
  'freelance/dashboard/seller': {
    title: 'Seller Dashboard | CHIDON FREELANCE EARN',
    desc: 'Manage creative campaigns, review client briefings, and submit work milestones directly to Paystack escrow audits.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Seller Dashboard - Chidon Freelance",
      "description": "Manage creative campaigns, review client briefings, and submit work milestones."
    }
  },
  'freelance/proposals': {
    title: 'Job Proposals | CHIDON FREELANCE EARN',
    desc: 'View active contractor proposals, accept/decline bids, and verify talent credentials.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Job Proposals - Chidon Freelance"
    }
  },
  'freelance/earnings': {
    title: 'Earnings & Payouts | CHIDON FREELANCE EARN',
    desc: 'View cleared payouts, lock revenue ledgers, and manage direct bank deposits on Chidon Freelance.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Earnings & Payouts - Chidon Freelance"
    }
  }
};

function runPrerender() {
  const indexHtmlPath = path.join(DIST_PATH, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[Prerender] index.html not found in dist. Skipping pre-rendering.');
    return;
  }

  const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  console.log('[Prerender] Starting static file generation for search engines...');

  Object.entries(ROUTES_SEO).forEach(([routePath, seo]) => {
    const targetDir = path.join(DIST_PATH, routePath);
    
    // Ensure target folder exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Inject unique head tags
    let content = templateHtml;

    // Replace <title>
    content = content.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);

    // Injected elements
    const seoTags = `
  <title>${seo.title}</title>
  <meta name="description" content="${seo.desc}" />
  <meta property="og:title" content="${seo.title}" />
  <meta property="og:description" content="${seo.desc}" />
  <meta property="og:url" content="https://chidoniq.com/${routePath}" />
  <script type="application/ld+json">${JSON.stringify(seo.schema)}</script>
    `;

    // Insert customized tags before </head>
    content = content.replace('</head>', `${seoTags}\n</head>`);

    // Write file
    const outputFilePath = path.join(targetDir, 'index.html');
    fs.writeFileSync(outputFilePath, content, 'utf8');
    console.log(`[Prerender] Pre-rendered: /${routePath}/index.html`);
  });

  console.log('[Prerender] Pre-rendering complete! Static paths are SEO ready.');
}

runPrerender();
