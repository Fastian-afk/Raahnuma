# Raahnuma — API & Deployment Setup Guide

This guide walks you through setting up the external APIs Raahnuma needs and deploying to production.

**Recommended platform: Vercel** (already in use). Raahnuma is a Next.js app with serverless API routes — Vercel is the best fit: zero-config Next.js deploy, free tier, edge network, and environment variable management.

Alternatives: **Railway** or **Render** work if you prefer a single long-running Node server (`npm run build && npm start`), but Vercel is already configured and optimal for this stack.

---

## Prerequisites

- Node.js 18+ installed globally
- A GitHub account (repo: `Fastian-afk/Raahnuma` or your fork)
- Vercel account (free): https://vercel.com

---

## Step 1: Clone & Install

```bash
git clone https://github.com/Fastian-afk/Raahnuma.git
cd Raahnuma
npm install
cp .env.example .env.local
```

---

## Step 2: Groq API (Required — AI Chat)

Raahnuma uses **Groq** with `llama-3.3-70b-versatile` for NLP profile extraction and conversational follow-ups.

1. Go to https://console.groq.com
2. Sign up (free tier available)
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key into `.env.local`:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

**Free tier limits:** Generous for hackathon demos; monitor usage at console.groq.com.

**What breaks without it:** AI Navigator chat returns 503 — Quick Checker still works (rules engine only).

---

## Step 3: Google Gemini API (Required for Document OCR)

Document upload uses **Gemini Vision** to extract CNIC/province from uploaded images.

1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click **Create API Key**
4. Add to `.env.local`:

```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxx
```

**Free tier:** Gemini 2.0 Flash has a free tier suitable for demos.

**What breaks without it:** OCR upload shows a friendly message asking user to type details manually.

---

## Step 4: ElevenLabs API (Optional — Voice Output)

Text-to-speech for reading assistant responses aloud.

1. Go to https://elevenlabs.io
2. Sign up → **Profile** → **API Keys**
3. Add to `.env.local`:

```
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxx
```

**What breaks without it:** Falls back to browser `speechSynthesis` (works in Chrome, limited Urdu support).

---

## Step 5: Local Development

```bash
npm run dev
```

Open http://localhost:3000

Test checklist:
- [ ] AI Navigator responds to a situation description
- [ ] Quick Checker returns program results
- [ ] Document upload extracts CNIC (needs GEMINI_API_KEY)
- [ ] Voice input works in Chrome
- [ ] Share/Print buttons on results panel

---

## Step 6: Deploy to Vercel (Recommended)

### Option A: Vercel Dashboard (easiest)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. **Root Directory:** set to `raahnuma` if repo root is the parent folder, or leave as `/` if repo IS the Next.js project
5. Add Environment Variables:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY` (optional)
6. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
cd raahnuma
vercel login
vercel --prod
```

When prompted, add environment variables via:
```bash
vercel env add GROQ_API_KEY
vercel env add GEMINI_API_KEY
vercel env add ELEVENLABS_API_KEY
```

---

## Step 7: Deploy to Railway (Alternative)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select repo, set root directory
3. Add environment variables in **Variables** tab
4. Railway auto-detects Next.js; build command: `npm run build`, start: `npm start`

---

## Step 8: Deploy to Render (Alternative)

1. Go to https://render.com → New **Web Service**
2. Connect GitHub repo
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars in **Environment** section

---

## Database & Rate Limiting (Not Required for MVP)

Raahnuma currently uses **static program rules** (no database). This is intentional for the hackathon — eligibility rules are compiled from official sources in `src/lib/rules-engine/programs.ts`.

### If you add a database later (production roadmap):

| Service | Use Case | Recommendation |
|---------|----------|----------------|
| **Supabase** (PostgreSQL) | User sessions, audit logs, admin dashboard for program updates | Free tier, easy Vercel integration |
| **Upstash Redis** | Rate limiting API routes | Free tier, `@upstash/ratelimit` package |

### Rate limiting (recommended before public launch):

Add Upstash Redis + rate limit on `/api/chat` (e.g. 20 requests/minute/IP):

1. Create free Redis at https://upstash.com
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel
3. Wrap API routes with `@upstash/ratelimit`

This is **not required for the hackathon demo** but mentioned for production readiness.

---

## Resource Data Freshness

Program eligibility rules are versioned in code with `lastUpdated` fields per program. For production:

- **Phase 1 (current):** Manual updates when BISP circulars change
- **Phase 2:** Admin dashboard for partner NGOs to update listings (qualifier feedback)
- **Phase 3:** Scheduled sync from official BISP/government feeds

Document this in your Devpost submission under "Data Disclosure."

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chat returns 503 | Add `GROQ_API_KEY` to Vercel env vars, redeploy |
| OCR not working | Add `GEMINI_API_KEY`, ensure image < 5MB |
| Voice input fails | Use Chrome/Edge; Safari has limited Web Speech API |
| Build fails on Vercel | Ensure Node 18+ in `engines` field of package.json |
| Urdu text broken | Font loads via Noto Naskh Arabic in layout.tsx |

---

## Environment Variable Summary

| Variable | Required | Service | Cost |
|----------|----------|---------|------|
| `GROQ_API_KEY` | Yes (for AI chat) | Groq | Free tier |
| `GEMINI_API_KEY` | Yes (for OCR) | Google AI Studio | Free tier |
| `ELEVENLABS_API_KEY` | No | ElevenLabs | Free tier (limited chars) |

---

*After setup, redeploy on Vercel whenever you change environment variables.*
