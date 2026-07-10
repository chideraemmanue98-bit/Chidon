/**
 * ChidonFreelance SEO Feature Module
 * Job: Only do real SEO work for Fiverr Gigs, Websites, and Blog posts.
 */

export interface SEOInput {
  keyword: string;
  niche: string;
  platform: 'fiverr' | 'website' | 'blog' | string;
}

export const seoSystemPrompt = `
You are an Elite SEO Strategist and Search Architect. Your sole job is to perform real, high-performance SEO optimization for Fiverr Gigs, Websites, or Blog posts. 

You MUST output your entire response ONLY as a clean, structured JSON block.
Do NOT write conversational preambles, notes, or wrap the JSON in Markdown block headers unless specifically instructed. Return ONLY valid JSON.

REQUIRED OUTPUT JSON SCHEMA:
{
  "keywords": [
    { "keyword": "primary or LSI keyword", "searchVolume": "estimated monthly searches, e.g. '8,200/mo'" },
    { "keyword": "secondary keyword", "searchVolume": "e.g. '3,100/mo'" },
    { "keyword": "tertiary keyword", "searchVolume": "e.g. '1,200/mo'" }
  ],
  "title": "Optimized SEO Title (STRICTLY 60 characters max, containing the primary keyword)",
  "meta": "Optimized Meta Description (STRICTLY 155 characters max, with primary keyword and a clear call-to-action)",
  "outline": {
    "h1": "Target SEO-Optimized H1 Headline",
    "h2s": [
      "Optimized H2 Heading 1 (Keyword-Rich)",
      "Optimized H2 Heading 2 (Value-Driven)",
      "Optimized H2 Heading 3 (Conversion-focused)"
    ],
    "h3s": [
      "Optimized H3 Sub-heading under H2",
      "Optimized H3 Sub-heading under H2"
    ]
  },
  "checklist": [
    "On-page SEO checklists specific to the platform (e.g. image alt text, URL slugs, keyword density, internal linking)"
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] 
}

CRITICAL CONSTRAINTS:
- You are STRICTLY FORBIDDEN from writing books, stories, poetry, essays, or long general articles.
- You are STRICTLY FORBIDDEN from giving generic or general life/business advice.
- If the user asks for something outside the feature's job (such as "write me a book", "tell a story", "how do I cook", etc.), you must fail validation and refuse the request.
`;

/**
 * Validate SEO inputs to prevent misuse
 */
export function validateSEORequest(input: SEOInput | any): { isValid: boolean; error?: string } {
  const checkString = `${input.keyword || ''} ${input.niche || ''} ${input.platform || ''}`.toLowerCase();
  
  // Triggers for book, stories, essays, code, general non-seo requests
  const blockTriggers = [
    'write me a book', 'write a book', 'write book', 'novel', 'story', 'poetry', 'poem', 'essay', 
    'cook', 'recipe', 'general advice', 'life advice', 'how to code', 'coding', 'script writer'
  ];

  for (const trigger of blockTriggers) {
    if (checkString.includes(trigger)) {
      return {
        isValid: false,
        error: "I can only do real SEO work for Fiverr Gigs, Websites, and Blog posts. Try the Content Writing Feature instead."
      };
    }
  }

  if (!input.keyword || input.keyword.trim().length < 2) {
    return {
      isValid: false,
      error: "Keyword is required and must be at least 2 characters long."
    };
  }

  if (!input.niche || input.niche.trim().length < 2) {
    return {
      isValid: false,
      error: "Niche is required and must be at least 2 characters long."
    };
  }

  return { isValid: true };
}
