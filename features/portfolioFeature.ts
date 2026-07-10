/**
 * ChidonFreelance Portfolio Feature Module
 * Job: Only generate Portfolio project case studies from user inputs.
 */

export interface PortfolioInput {
  projectName: string;
  niche: string;
  role: string;
  projectOverview: string;
}

export const portfolioSystemPrompt = `
You are a Professional Portfolio Architect. Your sole job is to generate a highly compelling, professional, structured project Case Study from the user's inputs.

You MUST output your entire response ONLY as a clean, structured JSON block.
Do NOT write conversational preambles, notes, or wrap the JSON in Markdown block headers. Return ONLY valid JSON.

REQUIRED OUTPUT JSON SCHEMA:
{
  "title": "A punchy, professional title for the portfolio case study",
  "problem": "A descriptive overview of the challenges, bottlenecks, or requirements of the project",
  "solution": "A detailed explanation of how you strategically solved the challenge and built the project deliverables",
  "result": "A clear description of the qualitative and quantitative success outcomes achieved",
  "toolsUsed": ["Tool/Tech 1", "Tool/Tech 2", "Tool/Tech 3", "Tool/Tech 4"],
  "bulletPoints": [
    "Key achievement metrics bullet point 1 (e.g. Improved loading speed by 40%)",
    "Key achievement metrics bullet point 2 (e.g. Generated $5,000+ in sales in 14 days)",
    "Key achievement metrics bullet point 3 (e.g. Received a 5-star rating for design excellence)"
  ]
}

CRITICAL CONSTRAINTS:
- You are STRICTLY FORBIDDEN from writing the actual portfolio website code, HTML templates, CSS styles, or writing the entire portfolio for the user. Only generate the structured textual case study content.
- If the user asks for something outside the feature's job (such as "write HTML code for my portfolio", "build a website", etc.), you must fail validation and refuse the request.
`;

/**
 * Validate Portfolio inputs to prevent misuse
 */
export function validatePortfolioRequest(input: PortfolioInput | any): { isValid: boolean; error?: string } {
  const checkString = `${input.projectName || ''} ${input.niche || ''} ${input.role || ''} ${input.projectOverview || ''}`.toLowerCase();
  
  // Triggers for coding, HTML, website builders, general writing
  const blockTriggers = [
    'write html', 'write css', 'react component', 'portfolio code', 'build website', 'coding', 'javascript code',
    'book', 'story', 'novel'
  ];

  for (const trigger of blockTriggers) {
    if (checkString.includes(trigger)) {
      return {
        isValid: false,
        error: "I can only generate Portfolio project case studies from user inputs. Try the Content Writing Feature instead."
      };
    }
  }

  if (!input.projectName || input.projectName.trim().length < 2) {
    return {
      isValid: false,
      error: "Project Name is required and must be at least 2 characters long."
    };
  }

  return { isValid: true };
}
