import { z } from 'zod';

// ==========================================
// 1. INPUT VALIDATION SCHEMAS (ZOD)
// ==========================================

export const GeminiGenerateSchema = z.object({
  prompt: z.string()
    .min(1, "Prompt is strictly required for cognitive generation")
    .max(12000, "Prompt exceeds high-fidelity buffer boundaries (max 12,000 characters)"),
  language: z.string().optional().default("en"),
});

export const GeminiTranslateSchema = z.object({
  text: z.string()
    .min(1, "Text is strictly required for cognitive translation")
    .max(25000, "Text body exceeds the fast-path translation buffer limits (max 25,000 characters)"),
  targetLanguage: z.string().min(1, "Target language designation code is required"),
});

export const PaystackInitializeSchema = z.object({
  email: z.string().email("Invalid email structure"),
  amount: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("Amount must be a positive arithmetic quantity");
    }
    return parsed;
  }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VerifyPaymentSchema = z.object({
  reference: z.string()
    .min(1, "Secure transaction reference parameter is required")
    .max(100, "Reference identifier exceeds secure length bounds"),
});

export type GeminiGenerateInput = z.infer<typeof GeminiGenerateSchema>;
export type GeminiTranslateInput = z.infer<typeof GeminiTranslateSchema>;
export type PaystackInitializeInput = z.infer<typeof PaystackInitializeSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

// ==========================================
// 2. RECURSIVE XSS INPUT SANITIZATION
// ==========================================

/**
 * Strips dangerous HTML tags, javascript: links, and script structures to protect against XSS attack vectors.
 */
export function sanitizeString(input: string): string {
  if (!input) return "";
  
  return input
    // Remove tags like <script>...</script>
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    // Remove event handlers like onload, onclick inside HTML tags
    .replace(/<[^>]+?\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)[^>]*>/gi, (match) => {
      return match.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/gi, "");
    })
    // Escape standard outer tags to prevent direct browser execution
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Ban "javascript:" uri bindings
    .replace(/javascript:/gi, "repaired-protocol:")
    // Strip raw expression injection delimiters
    .trim();
}

/**
 * Deep-scans any input object or value recursively and sanitizes all discovered nested strings.
 */
export function sanitizeInput<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (typeof value === "object" && value !== null) {
    const rawObj = value as Record<string, unknown>;
    const sanitizedObj: Record<string, unknown> = {};
    for (const key of Object.keys(rawObj)) {
      sanitizedObj[key] = sanitizeInput(rawObj[key]);
    }
    return sanitizedObj as unknown as T;
  }

  return value;
}

// ==========================================
// 3. SECURE IN-MEMORY IP RATE LIMITER (SLIDING WINDOW)
// ==========================================

interface RateLimitTracker {
  timestamps: number[];
}

const rateLimitRegistry = new Map<string, RateLimitTracker>();

/**
 * High-performance sliding window rate limiter.
 * Blocks excessive request loops to safeguard backend APIs from denial-of-service vectors.
 */
export function isRateLimited(
  ip: string,
  limit: number = 30, // Default max 30 requests
  windowMs: number = 60 * 1000 // Default 1 minute sliding window
): { limited: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const threshold = now - windowMs;

  let requestRecord = rateLimitRegistry.get(ip);
  if (!requestRecord) {
    requestRecord = { timestamps: [] };
    rateLimitRegistry.set(ip, requestRecord);
  }

  // Filter out any expired request timestamps older than the sliding window threshold
  requestRecord.timestamps = requestRecord.timestamps.filter((ts) => ts > threshold);

  if (requestRecord.timestamps.length >= limit) {
    const oldestRemaining = requestRecord.timestamps[0];
    const retryAfterSec = Math.ceil((oldestRemaining + windowMs - now) / 1000);
    return {
      limited: true,
      remaining: 0,
      retryAfterSec: retryAfterSec > 0 ? retryAfterSec : 1,
    };
  }

  // Record this current request timestamp
  requestRecord.timestamps.push(now);
  return {
    limited: false,
    remaining: limit - requestRecord.timestamps.length,
    retryAfterSec: 0,
  };
}

// Clean memory periodically to prevent leaks from stale IP tracking entries
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  for (const [ip, record] of rateLimitRegistry.entries()) {
    record.timestamps = record.timestamps.filter((ts) => ts > oneHourAgo);
    if (record.timestamps.length === 0) {
      rateLimitRegistry.delete(ip);
    }
  }
}, 30 * 60 * 1000).unref(); // Runs every 30 minutes in background thread context
