import { GoogleGenAI } from "@google/genai";
import { errorMessage, json, methodNotAllowed, readJson } from "./_shared/http.mts";

const allowedRatios = new Set(["1:1", "3:4", "4:3", "9:16", "16:9"]);

export default async (request: Request) => {
  if (request.method !== "POST") return methodNotAllowed("POST");

  try {
    const { prompt, aspectRatio } = await readJson<{ prompt?: string; aspectRatio?: string }>(request);
    if (!prompt?.trim()) return json({ error: "Prompt is required" }, 400);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: "Image generation is not configured" }, 503);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: allowedRatios.has(aspectRatio || "") ? aspectRatio : "16:9",
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData;
    if (!inlineData?.data) throw new Error("Gemini returned no image data");

    return json({ imageUrl: `data:${inlineData.mimeType || "image/png"};base64,${inlineData.data}` });
  } catch (error) {
    console.error("AI image generation failed", errorMessage(error));
    return json({ error: errorMessage(error) }, 500);
  }
};
