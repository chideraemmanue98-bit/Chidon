/**
 * ChidonFreelance Gig Description Feature Module
 * Job: Only write Fiverr/Upwork Gig descriptions that convert.
 */

export interface GigDescriptionInput {
  serviceName: string;
  niche: string;
  uniqueSellingPoint: string;
}

export const gigDescriptionSystemPrompt = `
You are an Elite Freelancing Mentor. Your sole job is to write high-converting Fiverr or Upwork Gig descriptions.

You MUST output your entire response ONLY as a clean, structured JSON block.
Do NOT write conversational preambles, notes, or wrap the JSON in Markdown block headers. Return ONLY valid JSON.

REQUIRED OUTPUT JSON SCHEMA:
{
  "problem": "A brief, highly relatable statement of the client's problem or paint point",
  "solution": "A powerful statement showing how your freelance service solves that exact problem",
  "whatsIncluded": [
    "Deliverable 1: What is included in your service package",
    "Deliverable 2: Quality standards / file formats provided",
    "Deliverable 3: Extra values or fast delivery commitments"
  ],
  "whyMe": [
    "Reason 1: Why the buyer should trust and hire you over competitors",
    "Reason 2: Experience / quality reassurance / support guarantee"
  ],
  "cta": "A clear, professional call-to-action urging the client to contact you or place an order",
  "fullDescription": "The fully formatted Gig Description merging the Problem, Solution, What's Included, Why Me, and CTA into a readable, persuasive pitch of around 250-400 words."
}

CRITICAL CONSTRAINTS:
- You are STRICTLY FORBIDDEN from writing blogs, articles, long-form stories, or executing SEO keyword-stuffing. Embed target words naturally and focus purely on converting visitors to buyers.
- If the user asks for something outside the feature's job (such as blog posts, SEO articles, etc.), you must fail validation and refuse the request.
`;

/**
 * Validate Gig Description inputs to prevent misuse
 */
export function validateGigDescriptionRequest(input: GigDescriptionInput | any): { isValid: boolean; error?: string } {
  const checkString = `${input.serviceName || ''} ${input.niche || ''} ${input.uniqueSellingPoint || ''}`.toLowerCase();
  
  // Triggers for blog posts, SEO articles, books, code
  const blockTriggers = [
    'blog post', 'blog article', 'seo article', 'code', 'story', 'novel', 'poem', 'essay', 'write a book'
  ];

  for (const trigger of blockTriggers) {
    if (checkString.includes(trigger)) {
      return {
        isValid: false,
        error: "I can only do high-converting Fiverr/Upwork Gig descriptions. Try the SEO Feature or Content Writing Feature instead."
      };
    }
  }

  // Check for obvious keyword stuffing (too many repetitive keywords, e.g. "seo seo seo seo")
  const words = checkString.split(/\s+/);
  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] > 8) {
        return {
          isValid: false,
          error: "I can only do high-converting Fiverr/Upwork Gig descriptions. Keyword stuffing is prohibited. Try the SEO Feature instead."
        };
      }
    }
  }

  if (!input.serviceName || input.serviceName.trim().length < 2) {
    return {
      isValid: false,
      error: "Service Name/Title is required and must be at least 2 characters long."
    };
  }

  return { isValid: true };
}
