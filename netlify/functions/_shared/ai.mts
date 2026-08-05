import { GoogleGenAI } from "@google/genai";

const supportedGeminiModels = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-flash-latest",
]);

export function resolveGeminiModel(requestedModel?: string) {
  return requestedModel && supportedGeminiModels.has(requestedModel)
    ? requestedModel
    : "gemini-3.5-flash";
}

function extractOpenAIText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const textParts = payload?.output
    ?.flatMap((item: any) => item?.content || [])
    ?.filter((item: any) => item?.type === "output_text")
    ?.map((item: any) => item?.text);
  return Array.isArray(textParts) ? textParts.join("\n") : "";
}

async function generateWithOpenAI(prompt: string, instructions: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No server-side AI provider is configured");

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      instructions,
      input: prompt,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI request failed");
  }

  const text = extractOpenAIText(payload);
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

export async function generateText(
  prompt: string,
  instructions: string,
  requestedModel?: string,
) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: resolveGeminiModel(requestedModel),
        contents: prompt,
        config: {
          temperature: 0.8,
          systemInstruction: instructions,
        },
      });
      if (response.text) return response.text;
      throw new Error("Gemini returned an empty response");
    } catch (error) {
      if (!process.env.OPENAI_API_KEY) throw error;
    }
  }

  return generateWithOpenAI(prompt, instructions);
}
