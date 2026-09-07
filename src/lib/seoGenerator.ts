/**
 * SEO Generator & Content Metadata Extractor
 * Automatically extracts high-performing SEO tags from AI generated content scripts.
 */

export interface ExtractedSEO {
  title: string;
  description: string;
  canonicalUrl: string;
}

/**
 * Parses raw AI generated content to extract structural title and summary.
 * If headings or summaries are not found, falls back gracefully to smart semantic highlights.
 *
 * @param content Raw generated markdown/text from the AI pipeline
 * @param featureId Active feature identifier to build customized metadata
 * @returns ExtractedSEO containing title, meta description and canonical targets
 */
export function extractSEOFromAIContent(content: string, featureId: string = "general"): ExtractedSEO {
  if (!content) {
    return {
      title: "AI Social Growth Optimization - ChidonIQ",
      description: "Optimize your social growth and reach with ChidonIQ's professional AI social suite.",
      canonicalUrl: "https://chidoniq.com.ng"
    };
  }

  // 1. Title Extraction
  let title = "";
  // Check for markdown headers (e.g., "# Title" or "## Title" or "Title:")
  const titlePatterns = [
    /#\s*(Title|Header|Subject|Topic):\s*(.*)/i,
    /^(Title|Header|Topic):\s*(.*)/im,
    /#\s*([^\n]+)/, // The first H1 markdown tag
    /##\s*([^\n]+)/ // The first H2 markdown tag
  ];

  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      const candidate = match[2] ? match[2].trim() : match[1].trim();
      // Ensure the title is not just helper formatting or metadata
      if (candidate.length > 3 && candidate.length < 100 && !candidate.startsWith('//')) {
        title = candidate;
        break;
      }
    }
  }

  // Clean title strings of trailing brackets/symbols
  if (title) {
    title = title.replace(/[#*`_\[\]]/g, '').trim();
  } else {
    // Fallback based on feature category
    const category = (featureId || "").toLowerCase().replace(/[^a-z0-9]/g, ' ');
    title = `AI Optimized ${category.charAt(0).toUpperCase() + category.slice(1)} - ChidonIQ`;
  }

  // 2. Description Extraction
  let description = "";
  const descPatterns = [
    /(?:Description|Summary|Excerpt|Introduction|Hook):\s*([^\n]+)/i,
    /^[A-Za-z0-9][^\n.]{30,160}\./m // First robust sentence that looks natural
  ];

  for (const pattern of descPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    } else if (match && match[0]) {
      description = match[0].trim();
      break;
    }
  }

  // Clean description of special characters
  if (description) {
    description = description.replace(/[#*`_\[\]]/g, '').trim();
    // Cap description at 160 characters for standard SEO snippets
    if (description.length > 157) {
      description = description.substring(0, 155) + "...";
    }
  } else {
    // Elegant dynamic summary backup
    description = `Unlock actionable insights and professional scripts for ${featureId.toUpperCase()} with our AI social optimization engine.`;
  }

  // 3. Dynamic Canonical build
  const safeSlug = (featureId || "general").toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const canonicalUrl = `https://chidoniq.com.ng/analytics/${safeSlug}`;

  return {
    title: `${title} | ChidonIQ`,
    description,
    canonicalUrl
  };
}
