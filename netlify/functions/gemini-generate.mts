import { generateText } from "./_shared/ai.mts";
import { errorMessage, json, methodNotAllowed, readJson } from "./_shared/http.mts";

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  zh: "Simplified Chinese",
  hi: "Hindi",
  ar: "Arabic",
  pt: "Portuguese",
  fr: "French",
  ru: "Russian",
  de: "German",
  ja: "Japanese",
};

export default async (request: Request) => {
  if (request.method !== "POST") return methodNotAllowed("POST");

  try {
    const { prompt, language, model } = await readJson<{
      prompt?: string;
      language?: string;
      model?: string;
    }>(request);

    if (!prompt?.trim()) return json({ error: "Prompt is required" }, 400);
    if (prompt.length > 40_000) return json({ error: "Prompt is too long" }, 413);

    const languageCode = (language || "en").split("-")[0].toLowerCase();
    const languageName = languageNames[languageCode] || "English";
    const instructions = `You are a professional social media optimizer. Respond entirely in ${languageName}, unless the user explicitly requests another language. Preserve clean Markdown formatting and provide practical, specific guidance.`;
    const text = await generateText(prompt, instructions, model);

    return json({ text });
  } catch (error) {
    console.error("AI generation failed", errorMessage(error));
    return json({ error: errorMessage(error) }, 500);
  }
};
