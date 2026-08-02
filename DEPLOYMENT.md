# 🚀 Deploying Chidon IQ to Netlify

This project is fully optimized for **Netlify** with a production-grade serverless architecture. By deploying, your application's front-end will be hosted on Netlify's high-performance CDN, while the Express server API endpoints will be automatically hosted as Netlify Serverless Functions.

---

## 🛠️ Step-by-Step Deployment Instructions

### 1. Push Code to GitHub / GitLab / Bitbucket
Ensure your latest changes from Google AI Studio are pushed to your remote repository.

### 2. Connect Your Repository to Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** ➔ **Import an existing project**.
3. Authorize and select your Git provider, then choose the repository for `chidon-iq`.

### 3. Build & Deploy Settings (Automated via `netlify.toml`)
Netlify will automatically detect and apply the configuration from the included `netlify.toml` file:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **Edge/Serverless Routing**: All `/api/*` traffic is proxied directly to your serverless Express backend.

---

## 🔑 Connecting Your Environment Variables

To force Netlify to automatically connect your secrets to Chidon IQ, you must define them in your Netlify Site Settings:

1. In your Netlify Dashboard, navigate to **Site configuration** ➔ **Environment variables**.
2. Click **Add a variable** (choose *Import from .env* or enter them individually).
3. Add the following variables (exactly as defined in Google AI Studio and `.env.example`):

| Variable Name | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API Key (Required for AI features) |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (Optional) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key (Optional) |
| `PAYSTACK_SECRET_KEY` | Paystack private key for secure payments (Optional) |
| `VITE_PAYSTACK_PUBLIC_KEY`| Paystack public key for web payments (Optional) |
| `SQL_HOST` | Google Cloud SQL or PostgreSQL database host (Optional) |
| `SQL_DB_NAME` | Database Name (Optional) |
| `SQL_USER` | Database Username (Optional) |
| `SQL_PASSWORD` | Database Password (Optional) |
| `SQL_PORT` | Database Port (Defaults to `5432`) |
| `USD_TO_NGN_RATE` | USD to NGN fallback exchange rate (Defaults to `1500`) |

4. Click **Save**.
5. Go to the **Deploys** tab and click **Trigger deploy** ➔ **Deploy site** to apply the environment variables!

---

## ⚡ Architecture Highlights
- **Vite Frontend**: Served statically for near-instant client page loads.
- **Serverless API Layer**: The Node/Express server is run on-demand using Netlify Serverless Functions (`serverless-http`), meaning zero idle-hosting costs.
- **Auto-Injection**: Vite is configured via `vite.config.ts` to securely load env variables at build time and expose only designated client keys.
