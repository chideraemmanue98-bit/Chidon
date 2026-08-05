import { generateText } from "./_shared/ai.mts";
import { errorMessage, json, methodNotAllowed, readJson } from "./_shared/http.mts";

export default async (request: Request) => {
  if (request.method !== "POST") return methodNotAllowed("POST");

  try {
    const { platform = "all", category = "general", searchQuery = "" } = await readJson<{
      platform?: string;
      category?: string;
      searchQuery?: string;
    }>(request);

    const prompt = `Create a JSON array of 5 currently relevant social-video trend ideas for ${platform} in the ${category} category.${searchQuery ? ` Focus on: ${searchQuery}.` : ""}
Each object must contain platform, title, creator, views, url, summary, tactics (two strings), viralityScore (0-100), and publishedTime. Return only valid JSON. Do not invent a claim that a URL was verified in real time.`;
    const raw = await generateText(
      prompt,
      "You are a social trend analyst. Return only valid JSON without Markdown fences.",
      "gemini-3.5-flash",
    );
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const videos = JSON.parse(cleaned);
    if (!Array.isArray(videos)) throw new Error("Trend provider returned invalid data");

    return json({ success: true, videos });
  } catch (error) {
    console.error("Trend lookup failed", errorMessage(error));
    return json({ success: false, error: errorMessage(error) }, 500);
  }
};
