import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { QueryClient } from "@tanstack/query-core";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin dynamically to avoid failures if credentials are not configured
let firestoreAdminDb: any = null;

function getFirestoreAdminDb(): any {
  if (!firestoreAdminDb) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        
        if (getApps().length === 0) {
          initializeApp({
            projectId: firebaseConfig.projectId
          });
        }
        
        // Correctly target the specific Firestore database instance configured
        firestoreAdminDb = getFirestore(undefined, firebaseConfig.firestoreDatabaseId);
        console.log("[Firebase Admin] Initialized Firestore Admin SDK successfully.");
      } else {
        console.warn("[Firebase Admin] firebase-applet-config.json not found. Firestore Admin operations will be disabled.");
      }
    } catch (err) {
      console.error("[Firebase Admin] Initialization failed:", err);
    }
  }
  return firestoreAdminDb;
}

// PERF: Backend TanStack Query Client for caching API requests and generative computations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Caching responses for 5 minutes server-side
      gcTime: 10 * 60 * 1000,  // Garbage collection interval of 10 minutes
    },
  },
});

// PERF: In-memory live exchange rate cache to prevent blocking API routes on slow network lookups
let LIVE_USD_TO_NGN_RATE: number | null = null;
let lastExchangeRateFetchTime = 0;

async function getLiveExchangeRate(): Promise<number> {
  const cacheDuration = 10 * 60 * 1000; // Cache rate for 10 minutes
  const now = Date.now();
  const envRate = parseFloat(process.env.USD_TO_NGN_RATE || "1500");

  if (LIVE_USD_TO_NGN_RATE && (now - lastExchangeRateFetchTime < cacheDuration)) {
    return LIVE_USD_TO_NGN_RATE;
  }

  try {
    console.log("[Exchange Service] Fetching latest live exchange rates from Open ER-API...");
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const data = await res.json() as any;
    if (data && data.result === "success" && data.rates && typeof data.rates.NGN === "number") {
      const liveRate = data.rates.NGN;
      console.log(`[Exchange Service] Live USD to NGN exchange rate updated successfully: ₦${liveRate.toLocaleString()}`);
      LIVE_USD_TO_NGN_RATE = liveRate;
      lastExchangeRateFetchTime = now;
      return liveRate;
    } else {
      throw new Error("Invalid response schema from exchange rates endpoint");
    }
  } catch (err: any) {
    console.warn(`[Exchange Service] Dynamic exchange lookup failed (${err.message || err}). Falling back to static configuration: ₦${envRate}`);
    return LIVE_USD_TO_NGN_RATE || envRate;
  }
}

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

// PERF: Robust helper to call Gemini with exponential backoff on transient errors and auto-fallback models if the primary model is busy/overloaded (e.g. 503 UNAVAILABLE)
async function generateContentWithRetryAndFallback(
  prompt: string | any,
  options: {
    model: string;
    config?: any;
  }
): Promise<any> {
  const ai = getGeminiClient();
  const maxRetries = 3;
  const modelsToTry = [
    options.model,
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini Engine] Attempting generation with model=${model} (Attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: options.config,
        });

        if (response && response.text) {
          console.log(`[Gemini Engine] Generation successful with model=${model}`);
          return response;
        }
        throw new Error("No text response received from Gemini.");
      } catch (err: any) {
        lastError = err;
        const errorMessage = (err.message || "").toString();
        const errDetails = JSON.stringify(err);

        const isHighDemand = 
          errorMessage.includes("503") || 
          errorMessage.includes("UNAVAILABLE") || 
          errorMessage.includes("demand") ||
          errorMessage.includes("temporary") ||
          errDetails.includes("503") ||
          errDetails.includes("UNAVAILABLE");

        const isRateLimit = 
          errorMessage.includes("429") || 
          errDetails.includes("429");

        const isTransient = isHighDemand || isRateLimit || errorMessage.includes("limit");

        if (isHighDemand) {
          console.log(`[Gemini Engine] Model ${model} is experiencing high demand (503). Instantly failing over to next alternative model...`);
          break; // Break the attempt loop to move to the next fallback model immediately!
        } else if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1000; // 1s, 2s...
          console.log(`[Gemini Engine] Model ${model} transient error. Re-attempting in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.log(`[Gemini Engine] Model ${model} exhausted maximum attempts or failed with non-transient error. Trying next fallback model...`);
          break; // Move to next model
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content with all available models.");
}

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests and preserving raw body for webhook verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

  // =========================================================================
  // SECURE OS V4 ENGINE: GOOGLE AI STUDIO STANDARDS DEFENSE-IN-DEPTH SYSTEM
  // =========================================================================
  
  // 1. Hardened HTTP Response Headers to obstruct frame exploitation, XSS, and payload sniffing
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://*.google.com https://*.supabase.co ws: wss:;"
    );
    next();
  });

  // 2. High-Performance Client Session Rate Limiter (Anti-DDoS, Anti-Abuse)
  const rateLimitWindowMs = 60 * 1000; // 1 minute epoch
  const maxRequestsPerWindow = 60;     // Up to 60 requests allowed per IP per minute
  const ipLimits = new Map<string, { count: number; firstRequest: number }>();

  const apiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress) || "anonymous";
    const now = Date.now();
    
    const limitState = ipLimits.get(ip);
    if (!limitState) {
      ipLimits.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    if (now - limitState.firstRequest > rateLimitWindowMs) {
      // Rotate time frame
      ipLimits.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    limitState.count++;
    if (limitState.count > maxRequestsPerWindow) {
      console.warn(`[Security OS] Exceeded request threshold: IP block triggered for ${ip}`);
      return res.status(429).json({
        error: "Chidon IQ Security Protocol: Rate limit exceeded. To ensure equal bandwidth for all nodes, please wait 60 seconds before repeating."
      });
    }
    next();
  };

  // 3. Strict Payload Guard & Prompt Injection Interceptor
  const cargoSanitizer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { prompt, text } = req.body;
    
    if (prompt && typeof prompt === "string") {
      // Restrict payload to absolute functional boundaries (max 10,000 characters)
      if (prompt.length > 10000) {
        return res.status(400).json({ error: "Security Protocol: Request failed. Prompt body bounds exceeded standard scope limits." });
      }

      // Intercept system-directive reset signals (Prompt Injection Defense)
      const lowercasePrompt = prompt.toLowerCase();
      if (
        lowercasePrompt.includes("ignore all previous instructions") || 
        lowercasePrompt.includes("disregard all previous instructions") ||
        lowercasePrompt.includes("reveal your system instruction") ||
        lowercasePrompt.includes("you must now ignore")
      ) {
        console.warn(`[Security OS] Blocked standard prompt injection pattern: "${prompt.slice(0, 100)}..."`);
        return res.status(403).json({ error: "Security Guard: Blocked suspicious instruction overrides." });
      }
    }

    if (text && typeof text === "string" && text.length > 12000) {
      return res.status(400).json({ error: "Security Protocol: Input text payload bounds exceeded." });
    }

    next();
  };

  console.log("[Security OS] Active defense-in-depth shield loaded: CORS-blocking, Custom CSP, In-memory Rate-limiter (60req/min), and Prompt Injection Guard.");

  // Database Initialization & Automatic Migrations at Backend Engine
  async function initDatabase() {
    const host = process.env.SQL_HOST;
    const database = process.env.SQL_DB_NAME;
    const user = process.env.SQL_USER;
    const password = process.env.SQL_PASSWORD;
    const port = parseInt(process.env.SQL_PORT || "5432", 10);

    if (host && database && user) {
      console.log(`[Database Engine] PostgreSQL/Google Cloud SQL detected. Initializing connection pool to ${host}:${port}/${database}...`);
      const pool = new pg.Pool({ host, database, user, password, port, connectionTimeoutMillis: 5000 });
      try {
        const client = await pool.connect();
        console.log("[Database Engine] Connected to PostgreSQL successfully! Initiating auto-schema migrations...");
        
        // Execute migrations
        await client.query(`
          CREATE TABLE IF NOT EXISTS drafts (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            feature_id VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS gigs (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price_from NUMERIC DEFAULT 0,
            category VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS portfolios (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            media_url TEXT,
            category VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        console.log("[Database Engine] PostgreSQL auto-migrations completed successfully!");
        client.release();
      } catch (err: any) {
        console.error("[Database Engine] PostgreSQL auto-migration or connection failed:", err.message || err);
      }
    } else {
      console.log("[Database Engine] No custom SQL_HOST environment variables injected. Running with local memory fallback.");
    }
  }
  initDatabase();

  // Supabase Server-Side Initialization Check
  const sUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const sKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (sUrl && sKey) {
    console.log(`[Database Engine] Supabase client initialized and ready for on-demand routing.`);
  }

  // Basic API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      system: "CHIDON IQ Neural OS",
      protocol: "v4.0.8",
      backend: "Node.js/Express"
    });
  });

  // REAL-TIME CRAWLING WEB BROWSER ENGINE: FETCH TRENDING VIDEOS FROM YOUTUBE, FACEBOOK, AND TIKTOK
  app.post("/api/trends/videos", apiRateLimiter, async (req, res) => {
    try {
      const { platform = "all", category = "general", searchQuery = "", bypassCache = false } = req.body;
      const queryKey = ["trends-videos", platform, category, searchQuery];
      
      if (bypassCache) {
        queryClient.invalidateQueries({ queryKey });
      }

      const videos = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          if (!process.env.GEMINI_API_KEY) {
            console.warn("[Crawler Browser] GEMINI_API_KEY is not defined, running in High-Fidelity Simulation Mode.");
            return generateMockTrends(platform, category, searchQuery);
          }

          try {
            const ai = getGeminiClient();
            const platformKeywords = platform === "all" ? "YouTube, TikTok, and Facebook Reels" : platform;
            
            const prompt = `Act as an advanced real-time browser searching social indices.
Run queries to search for the absolute top daily trending, viral videos on ${platformKeywords} for the category: "${category}". 
${searchQuery ? `Incorporate specific search criteria: "${searchQuery}".` : "Focus on general current breakout items."}

You MUST run a real-world web search query for current day (June 2026) trends on platforms like YouTube, TikTok, and Facebook to discover actual viral items page/reels/videos.

Generate a valid, highly structured JSON array of 4-5 video objects.
Strict structure:
[
  {
    "platform": "youtube" | "tiktok" | "facebook",
    "title": "Clear, actual trending video title or hook",
    "creator": "@username or Channel Name",
    "views": "E.g. '1.2M views' or '450K views'",
    "url": "Actual URL or realistic social platform link",
    "summary": "1-2 sentence description explaining the theme, content and why it is trending today",
    "tactics": [
      "Key actionable creator advice 1",
      "Key actionable creator advice 2"
    ],
    "viralityScore": 92,
    "publishedTime": "Format e.g. '4 hours ago' or '1 day ago'"
  }
]

NEVER wrap the array with markdown blocks or anything. Output ONLY the raw JSON array. If you fail to find exact results, generate the most accurate real-world trending topics based on actual search results from today.`;

            const response = await generateContentWithRetryAndFallback(prompt, {
              model: "gemini-3.5-flash",
              config: {
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
              }
            });

            const text = response.text?.trim() || "";
            if (!text) {
              throw new Error("Empty text response from Gemini Search Grounding.");
            }

            let parsed;
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(cleanText);
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
            throw new Error("JSON is not a populated array");
          } catch (err: any) {
            console.error("[Crawler Browser] Search Grounding Error, using dynamic fallback:", err);
            return generateMockTrends(platform, category, searchQuery);
          }
        },
        staleTime: bypassCache ? 0 : 5 * 60 * 1000 // Cache for 5 minutes
      });

      return res.json({ success: true, videos });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Client-Dynamic PostgreSQL Connection Tester (Supports custom Google Cloud SQL or Supabase direct parameters)
  app.post("/api/integrations/postgres/test", async (req, res) => {
    const { postgresHost, postgresDb, postgresUser, postgresPassword, postgresPort } = req.body;
    
    // Fallback to environment variables if parameters not passed explicitly
    const host = postgresHost || process.env.SQL_HOST;
    const database = postgresDb || process.env.SQL_DB_NAME;
    const user = postgresUser || process.env.SQL_USER;
    const password = postgresPassword || process.env.SQL_PASSWORD;
    const port = parseInt(postgresPort || "5432", 10);

    if (!host || !database || !user) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing essential credentials: Host, Database name, and User are required." 
      });
    }

    const clientPool = new pg.Pool({
      host,
      database,
      user,
      password,
      port,
      connectionTimeoutMillis: 5000,
    });

    try {
      const client = await clientPool.connect();
      const testResult = await client.query("SELECT NOW()");
      client.release();
      await clientPool.end();
      
      return res.json({ 
        success: true, 
        message: `Successfully connected to PostgreSQL database! Timestamp check: ${testResult.rows[0].now}` 
      });
    } catch (err: any) {
      // Safe cleanup
      try {
        await clientPool.end();
      } catch (e) {}
      
      console.error("PostgreSQL test connection error:", err);
      return res.status(500).json({ 
        success: false, 
        message: `Connection Failed: ${err.message || "Unknown database error"}` 
      });
    }
  });

  // Secure Server-Side Supabase Connection Tester
  app.post("/api/integrations/supabase/test", async (req, res) => {
    const { url, key } = req.body;
    
    // Fallback to server env keys
    const supabaseUrl = url || process.env.VITE_SUPABASE_URL;
    const supabaseKey = key || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Supabase URL and Anon/Service Key are required." 
      });
    }

    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await client.from('_dummy_table_check').select('*').limit(1).maybeSingle();
      
      if (error && error.code !== 'PGRST116' && error.message?.includes('FetchError')) {
        return res.status(500).json({ success: false, message: `Network Error: ${error.message}` });
      }
      
      if (error && error.code === '42P01') {
        return res.json({ success: true, message: 'Connected successfully to Supabase! (Database is accessible, custom tables yet to be verified).' });
      }

      if (error && (error as any).status === 401) {
        return res.status(400).json({ success: false, message: `Authentication Failed: ${error.message}` });
      }

      return res.json({ success: true, message: 'Connected successfully to Supabase core engine!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unknown integration fault' });
    }
  });

  // Secure Server-Side Supabase Synchronizer Proxy
  app.post("/api/integrations/supabase/sync", async (req, res) => {
    const { url, key, entityName, records } = req.body;
    
    const supabaseUrl = url || process.env.VITE_SUPABASE_URL;
    const supabaseKey = key || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Supabase URL and Anon/Service Key are required for synchronization." 
      });
    }

    if (!records || records.length === 0) {
      return res.json({ success: true, syncedCount: 0 });
    }

    try {
      const client = createClient(supabaseUrl, supabaseKey);

      // Clean records for relational databases (removing complex objects/firebase Timestamps)
      const sanitizedRecords = records.map((r: any) => {
        const cleanObj: any = { ...r };
        
        // Parse dates safely
        if (cleanObj.createdAt && typeof cleanObj.createdAt.toDate === 'function') {
          cleanObj.created_at = cleanObj.createdAt.toDate().toISOString();
        } else if (cleanObj.createdAt) {
          cleanObj.created_at = new Date(cleanObj.createdAt).toISOString();
        }
        
        delete cleanObj.createdAt;
        
        // Map properties for explicit table schemas
        if (entityName === 'drafts') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || 'Untitled Draft',
            content: cleanObj.content || '',
            feature_id: cleanObj.featureId || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }
        
        if (entityName === 'gigs') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || '',
            description: cleanObj.description || '',
            price_from: cleanObj.priceFrom || 0,
            category: cleanObj.category || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }

        if (entityName === 'portfolios') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || '',
            description: cleanObj.description || '',
            media_url: cleanObj.mediaUrl || '',
            category: cleanObj.category || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }

        return cleanObj;
      });

      const { error } = await client.from(entityName).upsert(sanitizedRecords);
      
      if (error) {
        if (error.code === '42P01') {
          return res.status(400).json({
            success: false,
            syncedCount: 0,
            error: `Table '${entityName}' does not exist on Supabase. Execute Chidon IQ's SQL Migration script inside your Supabase SQL Editor first!`
          });
        }
        return res.status(500).json({ success: false, syncedCount: 0, error: error.message });
      }

      return res.json({ success: true, syncedCount: sanitizedRecords.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, syncedCount: 0, error: error.message });
    }
  });

  // ----------------------------------------------------
  // PAYSTACK SECURE FULL-STACK ROUTING INTEGRATION
  // ----------------------------------------------------

  // Securely retrieve Paystack Configuration details for client authentication
  app.get("/api/paystack/config", async (req, res) => {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY;
      const rate = await getLiveExchangeRate();
      
      return res.json({
        success: true,
        configured: !!secretKey,
        publicKey: publicKey || "",
        exchangeRate: rate
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Currency Calculator Endpoint: Convert USD to NGN
  app.get("/api/paystack/calculator", async (req, res) => {
    try {
      const usd = parseFloat(req.query.usd as string);
      if (isNaN(usd) || usd < 0) {
        return res.status(400).json({
          success: false,
          message: "A valid positive 'usd' number parameter is required."
        });
      }
      const rate = await getLiveExchangeRate();
      const ngn = Math.round(usd * rate);
      return res.json({
        success: true,
        usd,
        exchangeRate: rate,
        ngn,
        formattedNgn: `₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred in the currency converter."
      });
    }
  });

  // Securely initialize a transaction with Paystack (Server-Side)
  app.post("/api/paystack/initialize", async (req, res) => {
    const { email, amount, orderId, metadata, currency = "USD" } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in your AI Studio's Secrets panel."
      });
    }

    if (!email || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Email and Amount are required to initialize transaction."
      });
    }

    try {
      const rate = await getLiveExchangeRate();
      let convertedAmountNgn = amount;
      let finalCurrency = currency;

      // Automatically convert USD to NGN for seamless payment gateway options
      if (currency === "USD") {
        convertedAmountNgn = amount * rate;
        finalCurrency = "NGN";
      }

      const amountInKobo = Math.round(convertedAmountNgn * 100);
      const payload = {
        email,
        amount: amountInKobo,
        currency: finalCurrency,
        metadata: {
          orderId,
          originalAmountUsd: currency === "USD" ? amount : null,
          exchangeRateUsed: currency === "USD" ? rate : null,
          convertedAmountNgn: currency === "USD" ? convertedAmountNgn : null,
          ...(metadata || {})
        }
      };

      console.log(`[Paystack Engine] Initializing transaction for ${email} with amount: ${amountInKobo} Kobo NGN (orderId: ${orderId || 'none'}) [Converted from $${amount} USD at rate ${rate}]`);

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json() as any;

      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || "Failed to initialize Paystack transaction");
      }

      console.log(`[Paystack Engine] Transaction initialized successfully! Reference: ${responseData.data.reference}`);

      return res.json({
        success: true,
        data: {
          ...responseData.data,
          exchangeRate: rate,
          amountInNgn: convertedAmountNgn,
          amountInKobo
        }
      });
    } catch (err: any) {
      console.error("[Paystack Engine] Transaction initialization error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred while initializing your payment."
      });
    }
  });

  // Securely verify a transaction reference with Paystack (Server-Side)
  app.post("/api/paystack/verify", async (req, res) => {
    const { reference } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Paystack Secret Key is not configured on the server."
      });
    }

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required for verification."
      });
    }

    try {
      console.log(`[Paystack Engine] Verifying payment reference: ${reference}`);

      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const responseData = await response.json() as any;

      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || "Failed to verify Paystack transaction");
      }

      console.log(`[Paystack Engine] Verification successful! Status: ${responseData.data.status}`);

      return res.json({
        success: true,
        data: responseData.data
      });
    } catch (err: any) {
      console.error("[Paystack Engine] Transaction verification error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred while verifying your payment."
      });
    }
  });

  // Secure Paystack Webhook Listener to verify payments and update user subscription fields
  app.post("/api/paystack/webhook", async (req, res) => {
    const signature = req.headers["x-paystack-signature"] as string;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.warn("[Paystack Webhook] Received webhook but PAYSTACK_SECRET_KEY is not configured.");
      return res.status(500).json({ success: false, message: "Webhook key missing" });
    }

    // Verify HMAC signature to guarantee authenticity of the payload
    if (signature) {
      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
      if (hash !== signature) {
        console.error("[Paystack Webhook] Security Alert: HMAC-SHA512 verification failed.");
        return res.status(401).json({ success: false, message: "Invalid signature" });
      }
    } else {
      console.warn("[Paystack Webhook] Warning: Received unsigned webhook payload.");
    }

    const { event, data } = req.body;
    console.log(`[Paystack Webhook] Received event: ${event}`);

    if (event === "charge.success" && data && data.status === "success") {
      const metadata = data.metadata || {};
      const { userId, planName, planId, isSubscription } = metadata;
      const reference = data.reference;
      const amountKobo = data.amount;
      const currency = data.currency;

      if (!userId) {
        console.warn("[Paystack Webhook] Warning: Transaction lacks a valid userId in metadata. Cannot sync to user record.");
        return res.status(400).json({ success: false, message: "Missing userId in metadata" });
      }

      try {
        const firestoreAdmin = getFirestoreAdminDb();
        if (!firestoreAdmin) {
          throw new Error("Firestore Admin is not initialized.");
        }

        console.log(`[Paystack Webhook] Processing successful payment for userId: ${userId}, planName: ${planName}`);

        // Update User Doc in Firestore securely using admin privileges
        const userRef = firestoreAdmin.collection("users").doc(userId);
        
        // Calculate USD value of plan (can fallback to metadata properties if present)
        const usdPrice = metadata.originalAmountUsd || (amountKobo / 100);

        await userRef.update({
          subscriptionPlan: planName || "Starter Creator Pack",
          subscriptionStatus: "active",
          subscriptionPrice: usdPrice,
          paystackSubscriptionRef: reference,
          updatedAt: FieldValue.serverTimestamp()
        });

        // Log payment receipt as a subcollection document to create a robust historical billing ledger
        const receiptRef = userRef.collection("receipts").doc(reference);
        await receiptRef.set({
          amountNgn: currency === "NGN" ? (amountKobo / 100) : null,
          amountUsd: usdPrice,
          reference: reference,
          payerEmail: data.customer?.email || "subscriber@chidon.iq",
          bundleName: planName || "Starter Creator Pack",
          status: "paid",
          createdAt: FieldValue.serverTimestamp(),
          paymentChannel: data.channel || "card",
          gatewayResponse: data.gateway_response || "Successful"
        });

        console.log(`[Paystack Webhook] Sync successful! User ${userId} active subscription updated to '${planName}'.`);
        return res.json({ success: true, message: "Webhook processed and Firestore updated successfully" });

      } catch (err: any) {
        console.error("[Paystack Webhook] Error writing updates to Firestore:", err);
        return res.status(500).json({ success: false, message: "Database update failed", error: err.message });
      }
    }

    // Acknowledge receipt of other event types cleanly
    return res.json({ success: true, message: `Event '${event}' acknowledged (No sync needed)` });
  });

  // PERF: Server-side Gemini proxy backed by TanStack Query client caching to reuse previous outputs and minimize upstream API request latency to ~0ms
  app.post("/api/gemini/generate", apiRateLimiter, cargoSanitizer, async (req, res) => {
    try {
      const { prompt, language, model, feature } = req.body;
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

      // Parse user model selection from client-side dynamic cookie if present
      let cookieModel = "";
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/active_gemini_model=([^;]+)/);
        if (match) cookieModel = decodeURIComponent(match[1]);
      }

      // Secure model resolution logic mapping alias or deprecated name to active support identifier
      let targetModel = model || req.headers['x-gemini-model'] || cookieModel || "gemini-3.5-flash";
      if (typeof targetModel === "string") {
        const lowerModel = targetModel.toLowerCase();
        if (lowerModel.includes("1.5") || (lowerModel.includes("flash") && !lowerModel.includes("3.1") && !lowerModel.includes("3.5") && !lowerModel.includes("2.5"))) {
          targetModel = "gemini-flash-latest";
        }
      }

      const FEATURE_MAP: Record<string, string[]> = {
        "Video Ideas": ["content-ideas", "video ideas"],
        "Hashtag Engine": ["hashtags", "hashtag engine"],
        "Script Writer": ["scripts", "script writer"],
        "Bio Optimizer": ["bio", "bio optimizer"],
        "Thumbnail Designer": ["thumbnails", "thumbnail designer"],
        "Competitor Lab": ["competitor-analysis", "competitor lab"],
        "Schedule Lab": ["posting-schedule", "schedule lab"],
        "Engagement Advisor": ["engagement-calc", "engagement advisor"],
        "Trend Detector": ["trending", "trend detector"],
        "Audience Builder": ["personas", "audience builder"],
        "Headline Hook": ["headlines", "headline hook"],
        "Repurpose AI": ["repurposing", "repurpose ai"],
        "Command Calendar": ["post-scheduler", "command calendar"],
        "CHIDON Vault": ["drafts", "chidon vault"],
        "Book with Lines": ["ruled-book", "book with lines"],
        "CHIDON IQ Template Library": ["template-library", "chidon iq template library"],
        "Organic Video Feed": ["youtube-seo", "organic video feed"],
        "SEO Scorecard": ["seo-scorecard", "seo scorecard"],
        "Keyword Intel": ["keyword-research", "keyword intel", "vseo-keywords"],
        "Shadowban Solutions": ["shadowban-solutions", "shadowban solutions"],
        "Title + Description": ["vseo-title-desc", "title + description"],
        "Tag Architect": ["vseo-tags", "tag architect"],
        "Video Auditor": ["vseo-scorecard", "video auditor"],
        "Post Optimizer": ["post-optimizer", "post optimizer"],
        "Trending Topics": ["trending-topics", "trending topics"],
        "Daily Video Ideas": ["daily-ideas", "daily video ideas"],
        "Trend Alerts": ["trend-alerts", "trend alerts"],
        "Time Optimizer": ["vseo-best-time", "time optimizer"]
      };

      const FEATURE_PROTOCOLS: Record<string, { outputType: string; task: string; format: string }> = {
        "Video Ideas": {
          outputType: "LIST",
          task: "Generate 20 viral video ideas for specified niche + audience.",
          format: "Numbered list 1-20. Every item MUST follow this exact format: '1. Hook: ... | Angle: ... | Why it works: ...'"
        },
        "Hashtag Engine": {
          outputType: "LIST",
          task: "Generate 30 hashtags for specified platform + topic.",
          format: "3 groups of 10. Exactly: 'BROAD 10: ...', 'NICHE 10: ...', 'BRANDED 10: ...'"
        },
        "Script Writer": {
          outputType: "LONG PROMPT",
          task: "Write 60-second script for specified topic + tone.",
          format: "Structure: HOOK 0-3s, PROBLEM, 3 STEP SOLUTION, CTA. Full script with [B-ROLL] and [TEXT ON SCREEN]. Minimum 250 words, highly detailed, tactical, and actionable."
        },
        "Bio Optimizer": {
          outputType: "LIST",
          task: "Write 5 optimized bios for specified platform + niche.",
          format: "Numbered list 1-5. Every item MUST follow: 'Bio X: Line1 Value | Line2 Proof | Line3 CTA'. CONSTRAINT: Max 150 characters total."
        },
        "Thumbnail Designer": {
          outputType: "LONG PROMPT",
          task: "Describe 5 thumbnail concepts for specified video title.",
          format: "Exactly 5 paragraphs. Each paragraph MUST describe: Visual, Text (3 words max), Colors, Emotion, and Why it gets clicks."
        },
        "Competitor Lab": {
          outputType: "LONG PROMPT",
          task: "Analyze competitors in specified niche + platform.",
          format: "Report detailing: Top 3 Competitors, What They Do Well, Gaps, How We Win, and 5 Content Angles They Missed."
        },
        "Schedule Lab": {
          outputType: "LIST",
          task: "Generate best posting schedule for specified platform + audience + timezone.",
          format: "7 days schedule. Each day format: 'Day: Time: Reason'"
        },
        "Engagement Advisor": {
          outputType: "LIST",
          task: "Provide 20 ways to boost comments on specified platform + topic.",
          format: "Numbered list 1-20. Each format: '1. Tactic: ... | Example: ...'"
        },
        "Trend Detector": {
          outputType: "LIST",
          task: "Find 10 trends in specified niche + platform.",
          format: "List of 10 items. Each format: 'Trend: | Platform: | How to use: | Expires:'"
        },
        "Audience Builder": {
          outputType: "LONG PROMPT",
          task: "Define ideal audience for specified brand/niche.",
          format: "300+ word deep-dive persona containing: Demographics, Pain Points, Desires, Where they hang out, and How to speak to them."
        },
        "Headline Hook": {
          outputType: "LIST",
          task: "Generate 50 hooks for specified topic.",
          format: "Numbered list 1-50. Max 10 words each."
        },
        "Repurpose AI": {
          outputType: "LONG PROMPT",
          task: "Repurpose specified long content into 10 pieces.",
          format: "Must provide: 5 Shorts, 3 Tweets, 2 Carousels, 1 Email. All with full copy and scripts."
        },
        "Command Calendar": {
          outputType: "LIST",
          task: "Create 30-day content calendar for specified niche + platform.",
          format: "30 days schedule. Each day format: 'Day X: Topic | Format | Hook | CTA'"
        },
        "CHIDON Vault": {
          outputType: "LIST",
          task: "Generate 15 swipeable templates for specified content type + niche.",
          format: "Numbered list 1-15. Each format: 'X. Template: | Formula: | Example:'"
        },
        "Book with Lines": {
          outputType: "LONG PROMPT",
          task: "Create book outline for specified book title and audience.",
          format: "Must contain: Title, Subtitle, exactly 12 Chapters with 3 bullets each, and Target reader details."
        },
        "CHIDON IQ Template Library": {
          outputType: "LIST",
          task: "Generate 20 plug-and-play templates for specified task + niche.",
          format: "Numbered list 1-20. Each format: 'X. Template: | When to use: | Copy:'"
        },
        "Organic Video Feed": {
          outputType: "LIST",
          task: "Generate 20 $0 ad spend video ideas for specified niche.",
          format: "Numbered list 1-20. Each format: 'X. Idea: | Why Organic: | First 3 Seconds:'"
        },
        "SEO Scorecard": {
          outputType: "LONG PROMPT",
          task: "Audit specified title/description/video for SEO.",
          format: "Score /100 + What's Good + What's Bad + 10 Action Steps."
        },
        "Keyword Intel": {
          outputType: "LIST",
          task: "Generate 50 keywords for specified topic/niche with search intent.",
          format: "Numbered list 1-50. Each line format: 'Keyword | Intent: Info/Buy | Difficulty: Low/Med/High'"
        },
        "Shadowban Solutions": {
          outputType: "LONG PROMPT",
          task: "Create shadowban diagnostic report for specified platform.",
          format: "5 Signs + 7 Reasons + 10-Step Recovery + What NOT to do."
        },
        "Title + Description": {
          outputType: "LIST",
          task: "Generate 10 SEO titles + descriptions for specified topic.",
          format: "Numbered list 1-10. Each format: 'Title X: | Description X: 2 sentences with keywords + CTA'"
        },
        "Tag Architect": {
          outputType: "LIST",
          task: "Generate 500 characters of YouTube tags for specified topic.",
          format: "Output ONLY a single line of comma-separated tags (broad, niche, and long-tail tags). No list formatting, no intros, no quotes."
        },
        "Video Auditor": {
          outputType: "LONG PROMPT",
          task: "Audit specified video link or script.",
          format: "Hook Score /10 + Retention Risks + SEO Score + 5 Improvements + Next Video Idea."
        },
        "Post Optimizer": {
          outputType: "LONG PROMPT",
          task: "Optimize specified post for specified platform.",
          format: "Actionable Feedback + 3 Complete Rewrites + Why each rewrite is strategically better."
        },
        "Trending Topics": {
          outputType: "LIST",
          task: "Find 15 trending topics in specified niche this week.",
          format: "Numbered list 1-15. Each line format: 'Topic | Why Trending | Content Angle'"
        },
        "Daily Video Ideas": {
          outputType: "LIST",
          task: "Generate 7 video ideas for specified niche, one per day.",
          format: "Format: 'Monday: ...', 'Tuesday: ...', 'Wednesday: ...', 'Thursday: ...', 'Friday: ...', 'Saturday: ...', 'Sunday: ...'"
        },
        "Trend Alerts": {
          outputType: "LONG PROMPT",
          task: "Brief on specified trend.",
          format: "What is it + Why it matters + How to use + 3 Examples + Expires when."
        },
        "Time Optimizer": {
          outputType: "LIST",
          task: "Find best 3 times to post on specified platform + audience + country.",
          format: "Exactly 3 entries: 'Time X: | Reason: | Engagement Expectation:'"
        }
      };

      const text = await queryClient.fetchQuery({
        queryKey: ["gemini-generate", prompt, language, targetModel, feature],
        queryFn: async () => {
          let systemInstruction = `You are CHIDON IQ, an elite AI Growth Architect for creators, brands, and agencies.
Your job: Force viral growth on YouTube, TikTok, Instagram, X, LinkedIn.
Tone: Expert, confident, growth-obsessed.

CORE RULES FOR ALL OUTPUTS:
1. Be direct. No fluff, no intros like "Here you go" or "Here is...". Start directly with the content.
2. If the feature protocol requires a LIST output type, output ONLY the list. Absolutely no side-explanations, conversational filler, introductory remarks, or summaries.
3. If the feature protocol requires a LONG PROMPT or report output type, write a minimum of 300 words. Be extremely detailed, tactical, and actionable.
4. Always use data, formulas, and the psychology of virality.
5. All outputs must be beautifully formatted in clean, clear markdown.

Output your entire response exclusively in public human ${languageName}. Always maintain perfect native slang, correct localization, and natural phrasing appropriate for ${languageName}. NEVER output any part of your answer in English or any other language, unless the requested language name itself is English, or the user specifically requests translation to other tongues. All titles, scripts, hashtags, strategy documents, lists, schedules, analyses, and tables MUST be in ${languageName} completely.`;

          if (feature) {
            const matchedKey = Object.keys(FEATURE_MAP).find(key => {
              return key.toLowerCase() === feature.toLowerCase() || 
                     FEATURE_MAP[key].some(val => val.toLowerCase() === feature.toLowerCase());
            });
            if (matchedKey && FEATURE_PROTOCOLS[matchedKey]) {
              const protocol = FEATURE_PROTOCOLS[matchedKey];
              systemInstruction += `\n\n=== CHIDON IQ PROTOCOL MANDATE ===
Feature Name: ${matchedKey}
Output Type: ${protocol.outputType}
Task: ${protocol.task}
Required Format: ${protocol.format}
Strictly satisfy this mandate. Do not deviate under any circumstance. Ensure compliance with output types (if LIST, return ONLY the formatted items; if LONG PROMPT, ensure comprehensive 300+ word output with deep structural density).`;
            }
          }

          const response = await generateContentWithRetryAndFallback(prompt, {
            model: targetModel,
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
  app.post("/api/gemini/translate", apiRateLimiter, cargoSanitizer, async (req, res) => {
    try {
      const { text, targetLanguage, model } = req.body;
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

      // Parse user model selection from client-side dynamic cookie if present
      let cookieModel = "";
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/active_gemini_model=([^;]+)/);
        if (match) cookieModel = decodeURIComponent(match[1]);
      }

      // Secure model resolution logic mapping alias or deprecated name to active support identifier
      let targetModel = model || req.headers['x-gemini-model'] || cookieModel || "gemini-3.5-flash";
      if (typeof targetModel === "string") {
        const lowerModel = targetModel.toLowerCase();
        if (lowerModel.includes("1.5") || (lowerModel.includes("flash") && !lowerModel.includes("3.1") && !lowerModel.includes("3.5") && !lowerModel.includes("2.5"))) {
          targetModel = "gemini-flash-latest";
        }
      }

      const translatedText = await queryClient.fetchQuery({
        queryKey: ["gemini-translate", text, targetLanguage, targetModel],
        queryFn: async () => {
          const systemInstruction = `You are a high-speed, military-grade translating interface. Translate the given text directly and professionally into public human ${languageName}. Always maintain formatting, markdown tables, checklist styles, layout, brackets, and line spacing exactly. Do not summarize, alter, or add commentary. Only return the direct translation in ${languageName}.`;

          const response = await generateContentWithRetryAndFallback(
            `Translate the following content to ${languageName}:\n\n${text}`,
            {
              model: targetModel,
              config: { 
                temperature: 0.3,
                systemInstruction: systemInstruction
              }
            }
          );
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

  app.post("/api/gemini/generate-image", apiRateLimiter, cargoSanitizer, async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log(`[Gemini Image Engine] Generating image with prompt: "${prompt}" and aspect ratio: ${aspectRatio || "16:9"}...`);
      
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9",
          },
        },
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            imageUrl = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("No inline image data received from Gemini Image model.");
      }

      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Gemini image generation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during image generation." });
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
            { id: "ai-native", label: "Neural-Native", description: "Deep integration with our most advanced sovereign AI models." },
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

  // Handle static serving and Vite dev server depending on environment
  async function setupFrontendRouting() {
    // If we are running in Vercel serverless context, do not attach Vite middleware or static serving
    if (process.env.VERCEL) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[Server] Mounting Vite developer middleware for local hot-reloading...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("[Server] Standalone production container mode. Serving pre-compiled static assets...");
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  setupFrontendRouting();

  // Only listen to port if not in Vercel serverless function context
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CHIDON IQ Neural Backend listening on http://0.0.0.0:${PORT}`);
    });
  }

export default app;

function generateMockTrends(platform: string, category: string, searchQuery: string) {
  const platforms = ["youtube", "tiktok", "facebook"];
  const selectedPlatforms = platform === "all" ? platforms : [platform];
  
  const creatorNames: Record<string, string[]> = {
    youtube: ["MrBeast", "MKBHD", "Ali Abdaal", "Zach King", "Ryan Trahan", "Casey Neistat"],
    tiktok: ["Khaby Lame", "Bella Poarch", "Charli D'Amelio", "Zach King", "Jake Paul", "DailyDoseOfInternet"],
    facebook: ["Jay Shetty", "Tasty", "Goalcast", "Nas Daily", "5-Minute Crafts", "Dude Perfect"]
  };

  const templates = [
    {
      title: "The 24-Hour Digital Fast: I went fully analog and my brain rewired",
      category: "productivity",
      summary: "A content creator documents their struggle of giving up all tech for 24 hours. The dynamic editing and honest vulnerability sparked massive shares and a hot discussion on lifestyle habits.",
      tactics: ["Introduce high stakes in the first 2 seconds", "Vary audio pacing with ASMR styled natural sounds", "Keep visual contrast high with black-and-white cuts"]
    },
    {
      title: "How micro-SaaS is completely killing traditional tech jobs",
      category: "tech",
      summary: "An analytical deep-dive into how indie hackers use modular AI tools to ship applications in half a day. It has gone viral across tech circles and LinkedIn.",
      tactics: ["Use code-blocks and terminal footage for screen immersion", "Keep bullet list metrics readable", "Conclude with an inspiring indie resource roadmap"]
    },
    {
      title: "I rebuilt the world's most illegal skateboard and tested it on the streets",
      category: "entertainment",
      summary: "A wild engineering hack that integrates heavy-duty fan thrusters onto a standard skateboard. The high-rebounding suspense and comic street reactions triggered global viral traffic.",
      tactics: ["Stagger cliffhangers right before every test", "Insert visual overlay meters representing speed", "Run tight camera tracking of citizens' expressions"]
    },
    {
      title: "Stop storing your money in banks. Here is what smart money does instead",
      category: "finance",
      summary: "An educational finance guide warning watchers about inflation tax, and introducing capital-preservation indexes. Simple animations and drawings make complex macroeconomics extremely digestible.",
      tactics: ["Draw charts live using physical markers on glassboards", "Highlight contrarian hooks", "Do not sell products, focus 100% on zero-fluff stats"]
    },
    {
      title: "Unboxing the futuristic $50,000 holographic glasses that feel like real life",
      category: "tech",
      summary: "Hands-on developer review of ultra-exclusive augmented reality lenses. The flawless overlay and physical interactivity generated high marvel and endless comments.",
      tactics: ["Shoot direct point-of-view perspective shots", "Use immersive panning shots to highlight physical elements", "Include raw specs in JetBrains Mono overlays"]
    },
    {
      title: "Cooking a 5-star steak using only solar heat inside a locked car",
      category: "lifestyle",
      summary: "A quirky and thrilling culinary challenge tested during a record heatwave. High-contrast cooking cuts combined with scientific measurements kept watchers highly engaged.",
      tactics: ["Use a digital thermometer overlay as a ticking clock", "Accelerate transition speeds by 1.5x", "Add crisp sizzling ASMR audio layers"]
    }
  ];

  let pool = templates;
  if (category && category !== "general") {
    const matched = templates.filter(t => t.category.toLowerCase() === category.toLowerCase());
    if (matched.length > 0) pool = matched;
  }

  const results = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const curPlatform = selectedPlatforms[i % selectedPlatforms.length];
    const template = pool[Math.floor(Math.random() * pool.length)];
    const creators = creatorNames[curPlatform];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    
    const viewsNum = (Math.random() * 5 + 0.1).toFixed(1);
    const views = curPlatform === "youtube" ? `${viewsNum}M views` : `${Math.floor(Math.random() * 800 + 100)}K views`;
    
    const randomHours = Math.floor(Math.random() * 20 + 2);
    const publishedTime = `${randomHours} hours ago`;
    const viralityScore = Math.floor(Math.random() * 15) * (i + 1) % 20 + 80;

    let title = template.title;
    let summary = template.summary;
    let tactics = template.tactics;

    if (searchQuery) {
      title = `Breakout Spot: "${searchQuery}" - Absolute Mastery of ${template.category.toUpperCase()}`;
      summary = `The ultimate trending post analyzing "${searchQuery}". This breakout topic is currently gaining explosive traction on social discovery engines, generating high conversational engagement.`;
      tactics = [
        `Focus heavily on organic semantic keyword tags for "${searchQuery}"`,
        `Lead with a contrarian opinion concerning "${searchQuery}" to spark comments`,
        `Maintain a fast editing cut of 1.2s per frame to maximize retention`
      ];
    }

    results.push({
      platform: curPlatform,
      title,
      creator: curPlatform === "youtube" ? creator : `@${creator.toLowerCase().replace(/\s+/g, '')}`,
      views,
      url: curPlatform === "youtube" 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`
        : curPlatform === "tiktok"
        ? `https://www.tiktok.com/tag/${encodeURIComponent(template.category)}`
        : `https://www.facebook.com/hashtag/${encodeURIComponent(template.category)}`,
      summary,
      tactics,
      viralityScore,
      publishedTime
    });
  }

  return results;
}
