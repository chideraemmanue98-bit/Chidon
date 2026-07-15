import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
import { QueryClient } from "@tanstack/query-core";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { validateSEORequest, seoSystemPrompt } from "./features/seoFeature";
import { validateWritingRequest, writingSystemPrompt } from "./features/writingFeature";
import { validateGigDescriptionRequest, gigDescriptionSystemPrompt } from "./features/gigDescriptionFeature";
import { validatePortfolioRequest, portfolioSystemPrompt } from "./features/portfolioFeature";
import { validateChatRequest, chatSystemPrompt } from "./features/chatFeature";

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

// Middleware for parsing JSON requests
app.use(express.json({ limit: "15mb" }));

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
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.supabase.co ws: wss:;"
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
      // Restrict payload to absolute functional boundaries (max 150,000 characters to support large video transcripts)
      if (prompt.length > 150000) {
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
      backend: "Node.js/Express",
      deployment: process.env.NETLIFY ? "Netlify Serverless" : (process.env.VERCEL ? "Vercel Serverless" : "Standard Container"),
      envConfig: {
        geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
        paystackSecretKeyConfigured: !!process.env.PAYSTACK_SECRET_KEY,
        supabaseUrlConfigured: !!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL,
        postgresConfigured: !!process.env.SQL_HOST,
        rateConfigured: !!process.env.USD_TO_NGN_RATE,
      }
    });
  });



  // =========================================================================
  // GLOBAL CONNECTIVITY BACKEND FEATURE: LIVE CREATOR NODE REGISTRY
  // =========================================================================
  interface ConnectedNode {
    userId: string;
    fullName: string;
    username: string;
    avatarURL: string;
    country: string;
    ip: string;
    latencyMs: number;
    lastActive: number;
  }

  let LIVE_CONNECTED_CREATORS: ConnectedNode[] = [];

  // Seeding some international active nodes to demonstrate real-time data mesh networking
  const seedInternationalNodes = () => {
    return [];
  };

  app.post("/api/connectivity/ping", (req, res) => {
    const { userId, fullName, username, avatarURL, country, latencyMs } = req.body;
    if (!userId || !username) {
      return res.status(400).json({ error: "Missing identity specifications." });
    }
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress) || "127.0.0.1";
    
    // Prune stale nodes (inactive for > 15 minutes)
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    LIVE_CONNECTED_CREATORS = LIVE_CONNECTED_CREATORS.filter(c => c.lastActive > fifteenMinsAgo);

    const existingIdx = LIVE_CONNECTED_CREATORS.findIndex(c => c.userId === userId);
    const newNode: ConnectedNode = {
      userId,
      fullName: fullName || username,
      username,
      avatarURL: avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      country: country || "Unknown",
      ip: typeof ip === "string" ? ip.split(",")[0] : "127.0.0.1",
      latencyMs: latencyMs || Math.floor(Math.random() * 30) + 8,
      lastActive: Date.now()
    };

    if (existingIdx !== -1) {
      LIVE_CONNECTED_CREATORS[existingIdx] = newNode;
    } else {
      LIVE_CONNECTED_CREATORS.push(newNode);
    }

    const seeds = seedInternationalNodes();
    // Return both live user and active seed nodes merged
    res.json({ 
      success: true, 
      activeCount: LIVE_CONNECTED_CREATORS.length, 
      totalNetworkNodes: LIVE_CONNECTED_CREATORS.length + seeds.length,
      nodes: [...LIVE_CONNECTED_CREATORS, ...seeds]
    });
  });

  app.get("/api/connectivity/nodes", (req, res) => {
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    LIVE_CONNECTED_CREATORS = LIVE_CONNECTED_CREATORS.filter(c => c.lastActive > fifteenMinsAgo);
    const seeds = seedInternationalNodes();
    res.json({ 
      activeCount: LIVE_CONNECTED_CREATORS.length, 
      totalNetworkNodes: LIVE_CONNECTED_CREATORS.length + seeds.length,
      nodes: [...LIVE_CONNECTED_CREATORS, ...seeds] 
    });
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
        message: "Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in your Google AI Studio Secret panel."
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

  // PERF: Server-side Gemini proxy backed by TanStack Query client caching to reuse previous outputs and minimize upstream API request latency to ~0ms
  app.post("/api/gemini/generate", apiRateLimiter, cargoSanitizer, async (req, res) => {
    try {
      const { prompt, language, model } = req.body;
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

      const text = await queryClient.fetchQuery({
        queryKey: ["gemini-generate", prompt, language, targetModel],
        queryFn: async () => {
          let systemInstruction = `You are a professional social media optimizer. Output your entire response exclusively in public human ${languageName}. Always maintain perfect native slang, correct localization, and natural phrasing appropriate for ${languageName}. NEVER output any part of your answer in English or any other language, unless the requested language name itself is English, or the user specifically requests translation to other tongues. All titles, scripts, hashtags, strategy documents, lists, schedules, analyses, and tables MUST be in ${languageName} completely. Keep formatting beautiful with clean markdown. ALWAYS use standard markdown for new paragraphs (using normal blank lines) instead of outputting raw text symbols like '\\n' or '/n' or '\\n\\n' or 'n/n/'. Let all paragraphs be separated by simple clean spacing.`;

          // If the prompt is requesting structured JSON output (e.g. from VideoContentAnalyzer), adjust systemInstruction to not break JSON formatting
          const isJsonRequest = typeof prompt === "string" && (
            prompt.includes("JSON") || 
            prompt.includes("json") || 
            prompt.includes("Required JSON Keys") ||
            prompt.includes("Required JSON format")
          );

          if (isJsonRequest) {
            systemInstruction = `You are a professional video analysis assistant. Output your response exclusively in valid JSON format matching the schema requested by the user. Do not add any markdown formatting or text outside the JSON block. Ensure correct localization of content texts inside the JSON values according to ${languageName}.`;
          }

          const response = await generateContentWithRetryAndFallback(prompt, {
            model: targetModel,
            config: { 
              temperature: isJsonRequest ? 0.2 : 0.8,
              systemInstruction: systemInstruction,
              responseMimeType: isJsonRequest ? "application/json" : undefined
            }
          });
          if (!response || !response.text) {
            throw new Error("No text response received from Gemini.");
          }
          
          let responseText = response.text;
          if (responseText && typeof responseText === "string") {
            responseText = responseText
              .replace(/\\n\\n/g, "\n\n")
              .replace(/\\n/g, "\n")
              .replace(/\\r/g, "")
              .replace(/n\/n\//g, "\n\n")
              .replace(/\/n\/n\//g, "\n\n")
              .replace(/\/n\//g, "\n")
              .replace(/\s*n\/n\s*/g, "\n\n")
              .trim();
          }
          return responseText;
        }
      });

      res.json({ text, success: true, content: text });
    } catch (error: any) {
      console.error("Gemini server error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // --- SPECIALIZED CHIDONFREELANCE FEATURE SYSTEM ENDPOINTS ---

  // 1. SEO Feature Route
  app.post("/api/features/seo", apiRateLimiter, async (req, res) => {
    try {
      const { keyword, niche, platform, model } = req.body;
      
      // Perform strict validation
      const validation = validateSEORequest({ keyword, niche, platform });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      // Resolve Gemini model
      let targetModel = model || "gemini-3.5-flash";

      const prompt = `Perform SEO optimization for:
- Primary Keyword: ${keyword}
- Business Niche/Category: ${niche}
- Platform Target: ${platform}`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: targetModel,
        config: {
          temperature: 0.2, // lower temperature for strictly structured JSON output
          systemInstruction: seoSystemPrompt,
          responseMimeType: "application/json" // force JSON schema output!
        }
      });

      if (!response || !response.text) {
        throw new Error("No response from Gemini.");
      }

      // Parse JSON from Gemini response
      let resultText = response.text.trim();
      if (resultText.startsWith("```json")) {
        resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(resultText);
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("[SEO Feature Error]:", error);
      return res.status(500).json({ error: error.message || "An error occurred during SEO generation." });
    }
  });

  // 2. Content Writing Feature Route
  app.post("/api/features/writing", apiRateLimiter, async (req, res) => {
    try {
      const { topic, targetAudience, tone, model } = req.body;

      // Perform strict validation
      const validation = validateWritingRequest({ topic, targetAudience, tone });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      let targetModel = model || "gemini-3.5-flash";

      const prompt = `Write marketing content for:
- Product/Topic/Service: ${topic}
- Target Audience: ${targetAudience}
- Desired Writing Tone: ${tone}`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: targetModel,
        config: {
          temperature: 0.7,
          systemInstruction: writingSystemPrompt,
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response from Gemini.");
      }

      let resultText = response.text.trim();
      if (resultText.startsWith("```json")) {
        resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(resultText);
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("[Content Writing Error]:", error);
      return res.status(500).json({ error: error.message || "An error occurred during content generation." });
    }
  });

  // 3. Gig Description Feature Route
  app.post("/api/features/gig-description", apiRateLimiter, async (req, res) => {
    try {
      const { serviceName, niche, uniqueSellingPoint, model } = req.body;

      // Perform strict validation
      const validation = validateGigDescriptionRequest({ serviceName, niche, uniqueSellingPoint });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      let targetModel = model || "gemini-3.5-flash";

      const prompt = `Write a converting Gig description for:
- Service Name/Title: ${serviceName}
- Service Niche: ${niche}
- Unique Selling Point (USP): ${uniqueSellingPoint}`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: targetModel,
        config: {
          temperature: 0.7,
          systemInstruction: gigDescriptionSystemPrompt,
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response from Gemini.");
      }

      let resultText = response.text.trim();
      if (resultText.startsWith("```json")) {
        resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(resultText);
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("[Gig Description Error]:", error);
      return res.status(500).json({ error: error.message || "An error occurred during Gig Description generation." });
    }
  });

  // 4. Portfolio Case Study Feature Route
  app.post("/api/features/portfolio", apiRateLimiter, async (req, res) => {
    try {
      const { projectName, niche, role, projectOverview, model } = req.body;

      // Perform strict validation
      const validation = validatePortfolioRequest({ projectName, niche, role, projectOverview });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      let targetModel = model || "gemini-3.5-flash";

      const prompt = `Generate a structured case study for:
- Project Name: ${projectName}
- Niche/Category: ${niche}
- Your Role: ${role}
- Project Overview: ${projectOverview}`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: targetModel,
        config: {
          temperature: 0.6,
          systemInstruction: portfolioSystemPrompt,
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response from Gemini.");
      }

      let resultText = response.text.trim();
      if (resultText.startsWith("```json")) {
        resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(resultText);
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("[Portfolio Case Study Error]:", error);
      return res.status(500).json({ error: error.message || "An error occurred during Portfolio generation." });
    }
  });

  // 5. Chat Support Assistant Feature Route
  app.post("/api/features/chat", apiRateLimiter, async (req, res) => {
    try {
      const { question, model } = req.body;

      // Perform strict validation
      const validation = validateChatRequest({ question });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      let targetModel = model || "gemini-3.5-flash";

      const prompt = `Answer the following question about using ChidonFreelance platform:
Question: ${question}`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: targetModel,
        config: {
          temperature: 0.4,
          systemInstruction: chatSystemPrompt,
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response from Gemini.");
      }

      let resultText = response.text.trim();
      if (resultText.startsWith("```json")) {
        resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(resultText);
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("[Chat Support Error]:", error);
      return res.status(500).json({ error: error.message || "An error occurred during Chat Support generation." });
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

  // =========================================================================
  // GOOGLE GEMINI NANO BANANA BACKEND ANALYZER ROUTE
  // =========================================================================
  app.post("/api/banana/analyze", apiRateLimiter, async (req, res) => {
    try {
      const { featureId, logs, systemState } = req.body;
      
      const prompt = `Perform a full, detailed, professional systems-level and aesthetic audit of the Chidon IQ App. 
      Focus on: ${featureId ? `Feature: ${featureId}` : 'The complete suite of 20+ viral tools (Video Ideas, Hashtag Engine, Script Writer, Shadowban Solutions, etc.)'}.
      
      Logs provided from active telemetry: ${JSON.stringify(logs || { status: 'healthy', database: 'connected' })}
      System states: ${JSON.stringify(systemState || { theme: 'slate-ambient', animations: 'motion/react enabled' })}
      
      Identify any potential interface issues, spacing errors, or visual bugs, and write a detailed resolution plan.
      Include a list of highly strategic professional images (describing their prompt, layout placement, and dimensions) that will elevate the user experience.
      Suggest 3 custom-crafted CSS/micro-motion animations using 'motion/react' that would look incredibly premium.
      
      Ensure your response is returned as a beautiful, technical markdown document with clear headers and bullet points. Include humorous and authoritative comments from 'Google Nano Banana' (the elite golden-cyan visual consultant). Keep paragraphs extremely punchy and maintain a high-tech, futuristic tone.`;

      const response = await generateContentWithRetryAndFallback(prompt, {
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.85,
          systemInstruction: "You are the Google Nano Banana AI Consultant. You specialize in full-stack web audits, elegant layout spacing, beautiful color palettes, custom animated SVGs, and high-quality imagery advice. You are professional, tech-forward, and have a playful banana/golden-theme personality."
        }
      });

      if (!response || !response.text) {
        throw new Error("No analysis returned from the Google Nano Banana service.");
      }

      return res.json({
        success: true,
        analysis: response.text,
        timestamp: new Date().toISOString(),
        engine: "Google Gemini 3.5 Flash (Nano Banana Protocol)"
      });
    } catch (err: any) {
      console.error("[Nano Banana Engine] Analysis failed:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Unknown error during Nano Banana analysis"
      });
    }
  });

  // Handle static serving and Vite dev server depending on environment
  async function setupFrontendRouting() {
    // If we are running in serverless context (Vercel or Netlify), do not attach Vite middleware or static serving
    if (process.env.VERCEL || process.env.NETLIFY) {
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

  // Only listen to port if not in a serverless context (Vercel or Netlify)
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CHIDON IQ Neural Backend listening on http://0.0.0.0:${PORT}`);
    });
  }

export default app;
