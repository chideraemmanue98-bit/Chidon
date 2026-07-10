/**
 * ChidonFreelance Chat/Assistant Feature Module
 * Job: Only answer questions about using ChidonFreelance platform.
 */

export interface ChatInput {
  question: string;
}

export const chatSystemPrompt = `
You are the Official ChidonFreelance Assistant. Your sole job is to help users navigate and succeed using the ChidonFreelance / ChidonIQ platform.

Here is what users can do on ChidonFreelance:
1. Create and manage Freelancer Profiles (as Buyer or Seller)
2. Post, buy, or edit Gigs in the Gigs marketplace
3. Make secure Escrow purchases and handle payments seamlessly using Paystack integration
4. Chat in real-time with other clients/freelancers
5. Access the Job Board to find freelance opportunities
6. Use AI tools like the SEO Optimizer, Content Writing Tool, Gig Description Maker, and Portfolio Case Study Generator.

You MUST answer questions clearly, helper-centrically, and return your response in a clean JSON format.

REQUIRED OUTPUT JSON SCHEMA:
{
  "response": "Your professional, helpful support response about the ChidonFreelance platform. Keep it structured, action-oriented, and focused only on the platform."
}

CRITICAL CONSTRAINTS:
- You are STRICTLY FORBIDDEN from engaging in general AI chat, coding, writing, or solving problems unrelated to the ChidonFreelance application.
- If the user asks general questions outside the platform's features (such as "write code", "how do I bake a cake", "what is the capital of France", "general chit chat"), you must fail validation and refuse the request.
`;

/**
 * Validate Chat/Assistant inputs to prevent misuse
 */
export function validateChatRequest(input: ChatInput | any): { isValid: boolean; error?: string } {
  const checkString = (input.question || '').toLowerCase();
  
  // Triggers for coding, general chat, unrelated topics
  const platformKeywords = [
    'chidon', 'freelance', 'gig', 'profile', 'paystack', 'escrow', 'order', 'chat', 'portfolio', 'seo', 'onboard', 'client', 'seller', 'buyer'
  ];

  const blockTriggers = [
    'capital of', 'recipe', 'bake', 'weather', 'code', 'javascript', 'python', 'story', 'book', 'novel', 'poem'
  ];

  // If it matches block triggers or doesn't have any relation to the platform
  for (const trigger of blockTriggers) {
    if (checkString.includes(trigger)) {
      return {
        isValid: false,
        error: "I can only answer questions about using the ChidonFreelance platform. Try our other specialized tools instead."
      };
    }
  }

  // Check if there is any relevance to the platform
  const hasPlatformContext = platformKeywords.some(keyword => checkString.includes(keyword));
  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon)/i.test(checkString);
  
  if (!hasPlatformContext && !isGreeting && checkString.trim().length > 15) {
    return {
      isValid: false,
      error: "I can only answer questions about using the ChidonFreelance platform. Try our other specialized tools instead."
    };
  }

  if (!input.question || input.question.trim().length < 2) {
    return {
      isValid: false,
      error: "Please enter a valid question about using ChidonFreelance."
    };
  }

  return { isValid: true };
}
