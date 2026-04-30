# Build Phase 1 — Dead Letter Studio Owner Dashboard

You are building Phase 1 of the DLS owner dashboard. This is a **continuation** of an in-progress project. Most of the scaffolding is already in place. **Your job is to FINISH it.**

## Current state of `~/code/dls-dashboard`

✅ Already done:
- Next.js 16 / React 19 / TypeScript / Tailwind v4 scaffolded
- `iron-session` installed, `src/lib/session.ts`, `src/middleware.ts`, `src/app/api/auth/route.ts` working
- `src/app/login/page.tsx` works (BUT styling is dark-themed and wrong — must be reskinned to paper-cream aesthetic)
- `src/lib/shopify.ts` — has `fetchOrders`, `fetchRecentActivity`, `fetchOrderWindow`, recurring filter
- `src/lib/meta.ts` — has `fetchMetaSpend`, `fetchMetaSpendWindow`, `fetchTodaySpend`
- `src/lib/klaviyo.ts` — has `fetchFlows`
- `tailwind.config.ts` — design tokens already ported (paper-cream, ink, burgundy, gold, series colors)
- `src/app/globals.css` — CSS custom props mirror tailwind tokens
- `src/app/layout.tsx` — Inter, Lora, IBM Plex Mono fonts loaded via next/font
- `.env.local` — all credentials present (DASHBOARD_PASSWORD, SESSION_SECRET, Shopify/Meta/Klaviyo tokens)
- Git initialized, remote `origin` set to `https://github.com/forrest-dev26/dls-dashboard.git`

❌ Still TODO (this is your work):
1. **`src/lib/metrics.ts`** — `computeBlendedCAC()` ported from Python at `~/.openclaw/workspace/manhattan-project/blended-cac.py`
2. **`src/app/page.tsx`** — currently still the default Next.js template! Replace with full dashboard port of `~/Documents/Sarah/Projects/dead-letter-studio/dashboard/public/index.html`
3. **`src/app/login/page.tsx`** — restyle to match the paper-cream aesthetic (look at `~/Documents/Sarah/Projects/dead-letter-studio/dashboard/public/login.html` if it exists; otherwise use brand tokens)
4. **AI Daily Briefing** — dynamic bullets based on real data conditions
5. **Action buttons** — render but no-op with "Phase 2" toast
6. **Build, test locally, commit, deploy to Vercel**

## Reference files (READ these first, in this order)

1. `~/code/dls-dashboard/AGENTS.md` — Next.js 16 / Tailwind v4 has BREAKING CHANGES from older docs. **CHECK `node_modules/next/dist/docs/` before writing code.**
2. `~/Documents/Sarah/Projects/dead-letter-studio/dashboard/public/index.html` — full mockup (~730 lines). Port 1:1.
3. `~/Documents/Sarah/Projects/dead-letter-studio/dashboard/public/shared.css` — design system source of truth
4. `~/Documents/Sarah/Projects/dead-letter-studio/dashboard/public/login.html` — login styling reference
5. `~/.openclaw/workspace/manhattan-project/blended-cac.py` — Python reference for blended CAC math

## Phase 1 scope (READ-ONLY — no mutations)

The dashboard pulls LIVE data, but every "action" button is a no-op:
- KPI tiles (live: blended CAC, today's revenue, today's orders, active subs)
- Series performance cards · last 7 days (live: per-series spend from Meta, orders/revenue from Shopify)
- AI Daily Briefing (4-6 bullets generated from real data conditions)
- Recent activity feed (live: Shopify orders, last 8 events)
- Subscriber health card (live: count of recurring orders today/this-week as proxy)
- Klaviyo flow status (live: list of flows + status)
- Open alerts card (can be mocked/empty for Phase 1)
- Action buttons (Post / Recreate / Decline / Pause / Bump / Activate) — render, but `onClick` shows a "Phase 2 — coming soon" toast

## Blended CAC port (the critical metric)

Port `~/.openclaw/workspace/manhattan-project/blended-cac.py` to `src/lib/metrics.ts`. Key logic:
- Numerator: Meta spend for the date range (use `fetchMetaSpend` from `src/lib/meta.ts`)
- Denominator: count of NEW Shopify orders (use `fetchOrders` and `newOrders` field from `src/lib/shopify.ts`)
- Default = yesterday (prior day, Eastern time)
- Multi-day mode: sum spend / sum new-orders across the window
- Return shape: `{ date: string, days: number, spend: number, newOrders: number, recurringOrders: number, blendedCAC: number | null }`

After porting, verify against the Python:
```bash
python3 ~/.openclaw/workspace/manhattan-project/blended-cac.py
```
Your TS should match within $1.

## AI Daily Briefing — dynamic conditions

In a server function (e.g. `src/lib/briefing.ts`), build a `getBriefing(): Promise<{bullets: string[]}>` that returns 3-6 bullets based on real data:

- If `blendedCAC > 55`: `"Blended CAC ran $${cac} yesterday — above the $55 ceiling. Audit Meta delivery."`
- If `blendedCAC < 30`: `"Blended CAC ran $${cac} — well under target. Consider scaling spend."`
- If `recurringOrders > 0`: `"$X in recurring sub revenue today (${n} renewals)."`
- If a Klaviyo flow is `draft` or `manual`: `"Flow '${name}' is ${status} — review activation."`
- If today's order count > 7-day daily average: `"${n} new orders today — running ${pct}% above 7-day average."`
- (Plus any additional conditional insights you can build from the data we already have.)

Always return at least 1 bullet. If everything is healthy, surface a positive: "All KPIs within target range."

## Style requirements (NON-NEGOTIABLE)

- Background: `bg-bg` (paper-cream `#F6F1E7`)
- Body text: `text-ink` (`#1A1410`)
- Headings: `font-display` (Lora) for h1/h2/h3 in cards
- UI text: `font-ui` (Inter)
- Numbers/data: `font-mono` (IBM Plex Mono) for KPI values, money amounts
- Cards: `bg-bg-card` with `border border-line` and `shadow-sm`
- Burgundy accent for alerts/warnings, gold for highlights, series-specific colors for series cards
- **Match the mockup's layout 1:1** — sidebar nav, main content grid, all sections in the same order

## Tailwind v4 caveat (CRITICAL)

This project uses Tailwind v4 (`@tailwindcss/postcss`). The config syntax differs from v3:
- `tailwind.config.ts` is already set up — do NOT change its structure
- `globals.css` uses `@import "tailwindcss";` — do NOT switch to `@tailwind base; @tailwind components; @tailwind utilities;`
- Custom colors like `bg-bg`, `text-burgundy` should work as-is via the config

## Build steps

1. **Read reference files** (mockup HTML, shared.css, login.html, blended-cac.py)
2. **Check Next.js 16 docs** at `~/code/dls-dashboard/node_modules/next/dist/docs/` before writing routes/data fetching
3. **Write `src/lib/metrics.ts`** with `computeBlendedCAC(days = 1)`. Test it from the command line:
   ```bash
   cd ~/code/dls-dashboard && npx tsx -e "import('./src/lib/metrics').then(m => m.computeBlendedCAC(1)).then(console.log)"
   ```
   (If `tsx` not installed, use a one-off node script. If still tricky, just inline-test inside the page.)
4. **Write `src/lib/briefing.ts`** with `getBriefing()`
5. **Build `src/app/page.tsx`** as an async server component:
   - Parallel-fetch all data with `Promise.allSettled` (so a 5xx from one API doesn't kill the page)
   - Render the full dashboard layout (sidebar + main grid)
   - For graceful failure: each card shows "—" or "Unable to load" if its data source failed
6. **Build small client components for action buttons** — `'use client'` files in `src/components/` that show a toast on click
7. **Restyle `src/app/login/page.tsx`** — paper-cream background, gold mark, Lora display heading, burgundy submit button (still using inline styles or migrate to Tailwind classes — your call)
8. **Run `npm run build`** — fix all errors. Do NOT skip this. (You may need to install missing deps like `@types/node` or `tsx` — go ahead.)
9. **Run `npm run dev`** in the background, hit `http://localhost:3000`, follow the redirect, log in with password from `.env.local`, confirm the dashboard renders with live data
10. **Commit** with descriptive message: `git add -A && git commit -m "phase 1: dashboard with live data + auth"`
11. **Push** to GitHub: `git push -u origin main` (the remote is HTTPS; `gh auth` is configured so this should just work)
12. **Deploy to Vercel**:
    - `cd ~/code/dls-dashboard && vercel link` (use existing project or create new under forrestlaw-2156)
    - For each env var in `.env.local`, run: `vercel env add VARNAME production` and paste value
    - `vercel --prod`
13. **Test the production URL** — log in, verify data loads

## Failure modes to avoid

- **Don't reinvent the design.** Port the mockup. If the spec conflicts with the mockup, follow the mockup.
- **Don't tightly couple data fetching to UI.** Keep API clients in `lib/`, fetch from server components, pass props down.
- **Don't expose secrets to the client.** Every API call uses `process.env.X_TOKEN` and runs on the server.
- **Don't use `'use client'` on the dashboard page.** It must be a server component to fetch securely.
- **Don't busy-loop on `vercel` CLI.** It's interactive; if it hangs on prompts, either pre-answer them or read its docs.
- **Don't assume Next.js 14 patterns.** This is Next.js 16. Read `node_modules/next/dist/docs/` first.

## Verification checklist (must pass before reporting complete)

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run dev` starts cleanly and `/` redirects to `/login`
- [ ] Wrong password → 401, correct password → redirect to `/`
- [ ] `/` renders KPI tiles, series performance, activity feed with LIVE data (or graceful "—" if API fails)
- [ ] Blended CAC value matches Python script within $1
- [ ] Open browser devtools network tab → no `META_ACCESS_TOKEN`, `SHOPIFY_ACCESS_TOKEN`, or `KLAVIYO_PRIVATE_API_KEY` visible in any request
- [ ] Action buttons render and show toast on click (no errors)
- [ ] `git push origin main` succeeds
- [ ] `vercel --prod` succeeds, returns a URL
- [ ] Production URL: login flow works, dashboard loads with live data

## When you finish, write a report to `~/code/dls-dashboard/PHASE1_REPORT.md` with:

1. Production URL
2. Git commit hash deployed
3. Which dashboard sections are LIVE vs MOCKED (and why if mocked)
4. Any APIs that didn't connect (and the error)
5. Any blockers or open questions for Christopher
6. Time spent

Then run:
```
openclaw system event --text "Done: DLS dashboard Phase 1 deployed to <production URL>" --mode now
```

If you hit a HARD blocker (something you can't reasonably solve), write `~/code/dls-dashboard/BLOCKER.md` with the blocker, and STOP.

Good luck. Take your time. Quality over speed.
