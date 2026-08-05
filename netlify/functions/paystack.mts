import { createHmac, timingSafeEqual } from "node:crypto";
import { errorMessage, json, methodNotAllowed, readJson } from "./_shared/http.mts";

async function exchangeRate() {
  const configuredRate = Number(process.env.USD_TO_NGN_RATE || 1500);
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(3500),
    });
    const payload = await response.json();
    return Number(payload?.rates?.NGN) || configuredRate;
  } catch {
    return configuredRate;
  }
}

async function paystackRequest(path: string, init?: RequestInit) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack is not configured");

  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || "Paystack request failed");
  }
  return payload;
}

export async function handlePaystack(request: Request, route: string) {
  try {
    if (route === "config" && request.method === "GET") {
      return json({
        success: true,
        configured: Boolean(process.env.PAYSTACK_SECRET_KEY),
        publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || "",
        exchangeRate: await exchangeRate(),
      });
    }

    if (route === "calculator" && request.method === "GET") {
      const usd = Number(new URL(request.url).searchParams.get("usd"));
      if (!Number.isFinite(usd) || usd < 0) return json({ success: false, message: "A valid USD amount is required" }, 400);
      const rate = await exchangeRate();
      const ngn = Math.round(usd * rate);
      return json({ success: true, usd, exchangeRate: rate, ngn, formattedNgn: `₦${ngn.toLocaleString("en-NG")}` });
    }

    if (route === "initialize" && request.method === "POST") {
      const { email, amount, orderId, metadata, currency = "USD" } = await readJson<any>(request);
      const numericAmount = Number(amount);
      if (!email || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return json({ success: false, message: "A valid email and amount are required" }, 400);
      }

      const rate = await exchangeRate();
      const amountInNgn = currency === "USD" ? numericAmount * rate : numericAmount;
      const amountInKobo = Math.round(amountInNgn * 100);
      const payload = await paystackRequest("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          currency: currency === "USD" ? "NGN" : currency,
          metadata: {
            orderId,
            originalAmountUsd: currency === "USD" ? numericAmount : null,
            exchangeRateUsed: currency === "USD" ? rate : null,
            ...metadata,
          },
        }),
      });
      return json({ success: true, data: { ...payload.data, exchangeRate: rate, amountInNgn, amountInKobo } });
    }

    if (route === "verify" && request.method === "POST") {
      const { reference } = await readJson<{ reference?: string }>(request);
      if (!reference) return json({ success: false, message: "Transaction reference is required" }, 400);
      const payload = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
      return json({ success: true, data: payload.data });
    }

    if (route === "webhook" && request.method === "POST") {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return json({ success: false }, 503);
      const body = await request.text();
      const supplied = request.headers.get("x-paystack-signature") || "";
      const expected = createHmac("sha512", secretKey).update(body).digest("hex");
      const suppliedBuffer = Buffer.from(supplied);
      const expectedBuffer = Buffer.from(expected);
      if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
        return json({ success: false }, 401);
      }
      return json({ success: true });
    }

    return methodNotAllowed("GET, POST");
  } catch (error) {
    console.error("Paystack request failed", errorMessage(error));
    return json({ success: false, message: errorMessage(error) }, 500);
  }
}

export default async (request: Request) => {
  const route = new URL(request.url).searchParams.get("route") || "";
  return handlePaystack(request, route);
};
