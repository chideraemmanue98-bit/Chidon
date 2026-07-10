/**
 * ChidonFreelance Content Writing Feature Module
 * Job: Only write marketing content (Ads, Product descriptions, Gig descriptions).
 */

export interface WritingInput {
  topic: string;
  targetAudience: string;
  tone: string;
}

export const writingSystemPrompt = `
You are a Highly Paid Direct-Response Copywriter. Your sole job is to write compelling, high-converting marketing copy (social ads, landing page product descriptions, or short sales copies).

You MUST output your entire response ONLY as a clean, structured JSON block.
Do NOT write conversational preambles, notes, or wrap the JSON in Markdown block headers. Return ONLY valid JSON.

REQUIRED OUTPUT JSON SCHEMA:
{
  "hook": "A magnetic, attention-grabbing opening line or headline",
  "benefits": [
    "Core benefit bullet point 1 (emotional trigger)",
    "Core benefit bullet point 2 (rational justification)",
    "Core benefit bullet point 3 (risk reversal)"
  ],
  "cta": "An irresistible, action-oriented call-to-action line",
  "content": "The full-length marketing copy incorporating the hook, benefits, and CTA. This content MUST be strictly between 150 and 300 words long, highly engaging, and perfectly tailored to the target audience and tone."
}

CRITICAL CONSTRAINTS:
- You are STRICTLY FORBIDDEN from writing SEO articles, code, emails, books, or long-form blogs.
- If the user asks for something outside the feature's job (such as writing email sequences, coding templates, SEO articles, etc.), you must fail validation and refuse the request.
`;

/**
 * Validate Content Writing inputs to prevent misuse
 */
export function validateWritingRequest(input: WritingInput | any): { isValid: boolean; error?: string } {
  const checkString = `${input.topic || ''} ${input.targetAudience || ''} ${input.tone || ''}`.toLowerCase();
  
  // Triggers for SEO articles, code, emails, books
  const blockTriggers = [
    'seo article', 'blog post', 'code', 'javascript', 'python', 'html', 'css', 'email', 'newsletter', 
    'book', 'story', 'novel', 'poem', 'essay'
  ];

  for (const trigger of blockTriggers) {
    if (checkString.includes(trigger)) {
      return {
        isValid: false,
        error: "I can only do marketing content (Ads, Product descriptions, Gig descriptions). Try the SEO Feature or Gig Description Feature instead."
      };
    }
  }

  if (!input.topic || input.topic.trim().length < 2) {
    return {
      isValid: false,
      error: "Topic/Product is required and must be at least 2 characters long."
    };
  }

  return { isValid: true };
}
