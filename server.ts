import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { QueryClient } from "@tanstack/query-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PERF: Backend TanStack Query Client for caching API requests and generative computations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Caching responses for 5 minutes server-side
      gcTime: 10 * 60 * 1000,  // Garbage collection interval of 10 minutes
    },
  },
});

// PERF: Lazy-initialized Gemini client to speed up container startup and prevent crashing if key is not yet set
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing from server configuration");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // Basic API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      system: "CHIDON IQ Neural OS",
      protocol: "v4.0.8",
      backend: "Node.js/Express"
    });
  });

  // PERF: Server-side Gemini proxy backed by TanStack Query client caching to reuse previous outputs and minimize upstream API request latency to ~0ms
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        zh: "Chinese Simplified (简体中文)",
        hi: "Hindi (हिन्दी)",
        ar: "Arabic (العربية)",
        pt: "Portuguese (Português)",
        fr: "French (Français)",
        ru: "Russian (Русский)",
        de: "German (Deutsch)",
        ja: "Japanese (日本語)"
      };

      const langCode = (language || "").split("-")[0].toLowerCase();
      const languageName = languageMap[langCode] || "English";

      const text = await queryClient.fetchQuery({
        queryKey: ["gemini-generate", prompt, language],
        queryFn: async () => {
          const ai = getGeminiClient();
          const systemInstruction = `You are a professional social media optimizer. Output your entire response exclusively in public human ${languageName}. Always maintain perfect native slang, correct localization, and natural phrasing appropriate for ${languageName}. NEVER output any part of your answer in English or any other language, unless the requested language name itself is English, or the user specifically requests translation to other tongues. All titles, scripts, hashtags, strategy documents, lists, schedules, analyses, and tables MUST be in ${languageName} completely. Keep formatting beautiful with clean markdown.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { 
              temperature: 0.8,
              systemInstruction: systemInstruction
            }
          });
          if (!response || !response.text) {
            throw new Error("No text response received from Gemini.");
          }
          return response.text;
        }
      });

      res.json({ text });
    } catch (error: any) {
      console.error("Gemini server error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // PERF: Server-side translation proxy to dynamically translate existing content assets when language mode is switched
  app.post("/api/gemini/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        zh: "Chinese Simplified (简体中文)",
        hi: "Hindi (हिन्दी)",
        ar: "Arabic (العربية)",
        pt: "Portuguese (Português)",
        fr: "French (Français)",
        ru: "Russian (Русский)",
        de: "German (Deutsch)",
        ja: "Japanese (日本語)"
      };

      const langCode = (targetLanguage || "").split("-")[0].toLowerCase();
      const languageName = languageMap[langCode] || "English";

      const translatedText = await queryClient.fetchQuery({
        queryKey: ["gemini-translate", text, targetLanguage],
        queryFn: async () => {
          const ai = getGeminiClient();
          const systemInstruction = `You are a high-speed, military-grade translating interface. Translate the given text directly and professionally into public human ${languageName}. Always maintain formatting, markdown tables, checklist styles, layout, brackets, and line spacing exactly. Do not summarize, alter, or add commentary. Only return the direct translation in ${languageName}.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Translate the following content to ${languageName}:\n\n${text}`,
            config: { 
              temperature: 0.3,
              systemInstruction: systemInstruction
            }
          });
          if (!response || !response.text) {
            throw new Error("No translation text response received.");
          }
          return response.text;
        }
      });

      res.json({ text: translatedText });
    } catch (error: any) {
      console.error("Gemini translation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during translation." });
    }
  });

  // Qualities of the App API (Static for now, but cached dynamically via backend TanStack)
  app.get("/api/chidon_iq/qualities", async (req, res) => {
    try {
      const qualities = await queryClient.fetchQuery({
        queryKey: ["app-qualities"],
        queryFn: async () => {
          return [
            { id: "realtime", label: "Real-time Intelligence", description: "Hyper-speed neural synchronization across global nodes." },
            { id: "ai-native", label: "Gemini-Native", description: "Deep integration with Google's most advanced AI models." },
            { id: "tactical", label: "Tactical Design", description: "Military-grade UX for high-performance content operations." },
            { id: "secure", label: "Secure Vault", description: "Fragmented intelligence storage with encrypted signal protocols." }
          ];
        }
      });
      res.json({ qualities });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CHIDON IQ Neural Backend listening on http://localhost:${PORT}`);
  });
}

startServer();
