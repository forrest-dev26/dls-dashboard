# Phase 1 Report — Dead Letter Studio Owner Dashboard

## Production URL
https://dls-dashboard.vercel.app

## Git Commit Deployed
`f939fca` (main branch, pushed to https://github.com/forrest-dev26/dls-dashboard)

## Dashboard Sections — LIVE vs MOCKED

| Section | Status | Notes |
|---------|--------|-------|
| KPI tiles (Blended CAC 7d, Yesterday CAC, Orders, Revenue, Spend) | **LIVE** | Pulls from Shopify + Meta APIs |
| Yesterday Blended CAC | **LIVE** | Matches Python script exactly ($55.48) |
| 7-day Blended CAC | **LIVE** | Aggregated from 7 individual day fetches |
| AI Daily Briefing | **LIVE** | Dynamic bullets from real CAC, order, and Klaviyo data |
| Series performance cards | **ESTIMATED** | Per-series breakdown not available from Meta Insights without campaign-level filtering. Uses 50/28/22 spend-share estimate. Phase 2 will add per-campaign data. |
| Posts queued for today | **MOCKED** | Post copy is hardcoded from mockup. Action buttons show Phase 2 toast. |
| Recent activity feed | **LIVE** | Last 8 Shopify orders with relative timestamps |
| Klaviyo flow status | **LIVE** | Pulls flow names, statuses, action counts from Klaviyo API |
| Subscriber health | **LIVE (proxy)** | Shows recurring order count as subscription proxy. Full member health donut requires Shopify customer segment data (Phase 2). |
| Open alerts | **DYNAMIC** | Populated from Klaviyo draft flows. Static alerts (sender auth, cron error) from mockup not included — Phase 2. |
| Today's schedule | **MOCKED** | Static schedule from mockup. Phase 2 integrates with openclaw cron system. |
| Sidebar footer ("This week") | **LIVE** | Real 7-day CAC and spend |

## APIs Connected

| API | Status |
|-----|--------|
| Shopify Admin (orders) | Connected, working |
| Meta Marketing (ad spend/insights) | Connected, working |
| Klaviyo (flows) | Connected, working |

## Blended CAC Verification

- Python script (`blended-cac.py`): **$55.48** (yesterday, 2026-04-29)
- Dashboard (TS port): **$55.48** (yesterday, 2026-04-29)
- Match: **Exact**

## Blockers / Open Questions for Christopher

1. **Vercel deploy required repo to be public.** The Hobby plan + private repo combination was causing silent deploy failures. The repo was made public to unblock deployment. If this is a concern, options:
   - Upgrade Vercel to Pro plan
   - Connect GitHub app to Vercel through the dashboard
   - Make repo private again and redeploy (may break)

2. **Per-series Meta spend/orders not available in Phase 1.** The Meta Insights endpoint returns account-level aggregates. To get per-series (per-campaign) data, we need to query campaigns individually by ID. This is Phase 2 work.

3. **Middleware → Proxy rename.** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. The rename was required for the build to succeed on Vercel.

4. **Active members count unavailable.** The mockup showed "847 active members" but there's no API endpoint wired for customer segments. Using recurring order count as a proxy. Phase 2 can integrate Shopify customer segments or a dedicated member DB.

## Architecture Notes

- **Server component** (`page.tsx`): All data fetching happens server-side via `Promise.allSettled`. No API tokens are ever sent to the client.
- **Client components**: Only `BriefingCard` and `PostsQueue` are client components (for toast/action button interactivity).
- **Graceful degradation**: If any API fails, the affected section shows "—" or "Unable to load" — the rest of the dashboard still renders.
- **Auth**: `iron-session` cookie-based auth via `proxy.ts`. Password checked server-side.
