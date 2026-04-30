# Dead Letter Studio — Owner Dashboard

Live operational dashboard for Dead Letter Studio. Pulls real data from Shopify, Meta Ads, and Klaviyo. Read-only Phase 1; mutation actions land in Phase 2.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- iron-session for HTTP-only cookie auth
- Server-side API clients in `src/lib/`

## Local development

```bash
npm install
cp .env.local.example .env.local  # then fill in values
npm run dev
# open http://localhost:3000
```

## Environment variables

See `.env.local.example` for the full list. All values are private; never commit `.env.local`.

## Deployment

Pushed to Vercel via `vercel --prod`. Production env vars set via `vercel env add`.

## Architecture

- `src/lib/shopify.ts` — order fetching, recurring-sub filter
- `src/lib/meta.ts` — ad spend insights
- `src/lib/klaviyo.ts` — flow status
- `src/lib/metrics.ts` — Blended CAC computation (ported from `blended-cac.py`)
- `src/middleware.ts` — auth gate, redirects to `/login` if no session cookie
- `src/app/page.tsx` — main dashboard (server component, parallel data fetch)
- `src/components/` — UI components (KPI tiles, briefing card, etc.)

## Phase 2 todo
- Wire action buttons (Post / Pause / Bump / Activate) to real APIs
- Per-campaign spend breakdown for Series Performance
- Background cache refresh (Vercel KV)
- Better error states + skeleton loaders
