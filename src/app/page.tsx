// Server component — fetches all dashboard data on render.
// Read-only Phase 1: no mutation actions.

import { fetchDashboardMetrics } from "@/lib/metrics";
import { fetchRecentActivity } from "@/lib/shopify";
import { fetchFlows } from "@/lib/klaviyo";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { KpiTile } from "@/components/kpi-tile";
import { BriefingCard } from "@/components/briefing-card";
import { SeriesPerformance } from "@/components/series-performance";
import { ActivityFeed } from "@/components/activity-feed";
import { FlowStatus } from "@/components/flow-status";
import { PostsQueue } from "@/components/posts-queue";

// Force dynamic rendering — we need fresh data on every request
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch everything in parallel; each handles its own errors.
  const [metricsResult, activityResult, flowsResult] = await Promise.allSettled([
    fetchDashboardMetrics(),
    fetchRecentActivity(8),
    fetchFlows(),
  ]);

  const metrics = metricsResult.status === "fulfilled" ? metricsResult.value : null;
  const activity = activityResult.status === "fulfilled" ? activityResult.value : [];
  const flows = flowsResult.status === "fulfilled" ? flowsResult.value : [];

  const todayCac = metrics?.cac7d.blendedCacWindow ?? null;
  const yesterdayCac = metrics?.yesterdayCac.blendedCac ?? null;
  const cacPrior7d = metrics?.cacPrior7d.blendedCacWindow ?? null;
  const newOrders7d = metrics?.cac7d.totalNewOrders ?? 0;
  const newOrdersPrior7d = metrics?.cacPrior7d.totalNewOrders ?? 0;
  const revenue7d = metrics?.cac7d.totalNewRevenueUsd ?? 0;
  const revenuePrior7d = metrics?.cacPrior7d.totalNewRevenueUsd ?? 0;
  const spend7d = metrics?.cac7d.totalSpendUsd ?? 0;
  const spendPrior7d = metrics?.cacPrior7d.totalSpendUsd ?? 0;
  const todaySpend = metrics?.todaySpendUsd ?? 0;

  // Compute deltas
  const cacDeltaVsTarget = todayCac !== null ? Math.round(((todayCac - 55) / 55) * 100) : null;
  const cacDeltaYesterdayVs7d =
    yesterdayCac !== null && todayCac !== null
      ? Math.round(((yesterdayCac - todayCac) / todayCac) * 100)
      : null;
  const ordersDelta =
    newOrdersPrior7d > 0
      ? Math.round(((newOrders7d - newOrdersPrior7d) / newOrdersPrior7d) * 100)
      : 0;
  const revenueDelta =
    revenuePrior7d > 0
      ? Math.round(((revenue7d - revenuePrior7d) / revenuePrior7d) * 100)
      : 0;
  const spendDelta =
    spendPrior7d > 0 ? Math.round(((spend7d - spendPrior7d) / spendPrior7d) * 100) : 0;

  // Build briefing insights from real data
  const insights = buildInsights({
    cac7d: todayCac,
    yesterdayCac,
    flows,
  });

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-bg max-[1100px]:grid-cols-1">
      <Sidebar cac7d={todayCac} spendThisWeek={spend7d} />

      <main className="px-8 pt-7 pb-10 max-w-[1400px] max-[1100px]:px-4">
        <Topbar todaySpend={todaySpend} apiHealth={metrics ? "ok" : "degraded"} />

        {/* KPI strip */}
        <section className="grid grid-cols-6 gap-3 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
          <KpiTile
            label="Blended CAC · 7d"
            value={todayCac !== null ? `$${todayCac.toFixed(2)}` : "—"}
            delta={
              cacDeltaVsTarget !== null
                ? cacDeltaVsTarget > 0
                  ? `▲ vs $55 target · over by ${cacDeltaVsTarget}%`
                  : `▼ vs $55 target · under by ${Math.abs(cacDeltaVsTarget)}%`
                : "no data"
            }
            deltaTone={
              cacDeltaVsTarget !== null && cacDeltaVsTarget <= 0 ? "good" : "bad"
            }
          />
          <KpiTile
            label="Yesterday CAC"
            value={yesterdayCac !== null ? `$${yesterdayCac.toFixed(2)}` : "—"}
            delta={
              cacDeltaYesterdayVs7d !== null
                ? cacDeltaYesterdayVs7d < 0
                  ? `▼ vs 7d avg · ${cacDeltaYesterdayVs7d}%`
                  : `▲ vs 7d avg · +${cacDeltaYesterdayVs7d}%`
                : "no data"
            }
            deltaTone={
              cacDeltaYesterdayVs7d !== null && cacDeltaYesterdayVs7d <= 0 ? "good" : "bad"
            }
          />
          <KpiTile
            label="New orders · 7d"
            value={String(newOrders7d)}
            delta={`${ordersDelta >= 0 ? "▲ +" : "▼ "}${Math.abs(ordersDelta)}% vs prior 7d`}
            deltaTone={ordersDelta >= 0 ? "good" : "bad"}
          />
          <KpiTile
            label="Revenue · 7d"
            value={`$${(revenue7d / 1000).toFixed(1)}k`}
            delta={`${revenueDelta >= 0 ? "▲ +" : "▼ "}${Math.abs(revenueDelta)}% vs prior`}
            deltaTone={revenueDelta >= 0 ? "good" : "bad"}
          />
          <KpiTile
            label="Ad spend · 7d"
            value={`$${(spend7d / 1000).toFixed(1)}k`}
            delta={
              Math.abs(spendDelta) < 5
                ? "≈ flat vs prior"
                : `${spendDelta > 0 ? "▲ +" : "▼ "}${Math.abs(spendDelta)}% vs prior`
            }
            deltaTone="flat"
          />
          <KpiTile
            label="Active flows"
            value={String(flows.filter((f) => f.status === "live").length)}
            delta={`${flows.filter((f) => f.status === "draft").length} in draft`}
            deltaTone="flat"
          />
        </section>

        {/* AI Briefing + schedule grid */}
        <section className="mt-5 grid grid-cols-[1.4fr_1fr] gap-4 max-[1100px]:grid-cols-1">
          <BriefingCard insights={insights} />

          <div className="space-y-4">
            <ScheduleCard />
            <AlertsCard flows={flows} />
          </div>
        </section>

        {/* Series performance */}
        <SectionTitle title="Series performance · last 7 days" link="View all metrics →" />
        <SeriesPerformance window={metrics?.cac7d ?? null} />

        {/* Posts queue */}
        <SectionTitle title="Posts queued for today" subtitle="3 drafted · ready for your review" />
        <PostsQueue />

        {/* Activity feed + flow status */}
        <section className="mt-6 grid grid-cols-[1.4fr_1fr] gap-4 max-[1100px]:grid-cols-1">
          <ActivityFeed items={activity} />
          <FlowStatus flows={flows} />
        </section>

        <footer className="mt-10 text-center text-[11px] text-ink-3">
          Dead Letter Studio · Owner Dashboard · Phase 1 · live data ·{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </footer>
      </main>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle?: string;
  link?: string;
}) {
  return (
    <div className="mt-7 mb-3.5 flex items-baseline justify-between">
      <h2 className="m-0 font-display text-lg font-medium tracking-tight">{title}</h2>
      {subtitle && <span className="text-[12px] text-ink-3">{subtitle}</span>}
      {link && <a className="text-[12px] text-burgundy">{link}</a>}
    </div>
  );
}

function ScheduleCard() {
  const items = [
    { time: "9:00 AM", what: "Social engine posted", tag: "done" },
    { time: "10:00 AM", what: "Creative engine ran", tag: "done" },
    { time: "2:00 PM", what: "Meta Ads Daily Review", tag: "scheduled" },
    { time: "3:00 PM", what: "Manhattan Project check", tag: "scheduled" },
    { time: "11:00 PM", what: "Daily journal entry", tag: "scheduled" },
  ];

  const tagClass: Record<string, string> = {
    done: "bg-good-soft text-good",
    scheduled: "bg-gold-soft text-gold-deep",
    error: "bg-bad-soft text-bad",
  };

  return (
    <div className="rounded-md border border-line bg-bg-elev p-4 px-5">
      <h3 className="m-0 mb-3 font-display text-base font-medium">Today&apos;s schedule</h3>
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[80px_1fr] items-center gap-3.5 border-b border-line py-2 last:border-b-0 text-[13px]"
        >
          <div className="font-mono text-[12px] text-ink-3">{it.time}</div>
          <div>
            {it.what}{" "}
            <span
              className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] ${tagClass[it.tag]}`}
            >
              {it.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsCard({ flows }: { flows: Array<{ name: string; status: string }> }) {
  const draftFlows = flows.filter((f) => f.status === "draft");
  const alertCount = draftFlows.length > 0 ? Math.min(draftFlows.length, 3) : 0;

  return (
    <div className="rounded-md border border-line bg-bg-elev p-4 px-5 border-l-[3px] border-l-burgundy">
      <h3 className="m-0 mb-3 font-display text-base font-medium text-burgundy">
        Open alerts · {alertCount}
      </h3>
      <div className="space-y-2.5 text-[13px]">
        {draftFlows.slice(0, 3).map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div>
              <strong>{f.name}</strong>
              <div className="mt-0.5 text-[12px] text-ink-3">Flow in draft. Review before activating.</div>
            </div>
            <button className="rounded-sm border border-line bg-bg-soft px-3 py-1.5 text-[12px] font-medium hover:bg-line">
              Review
            </button>
          </div>
        ))}
        {alertCount === 0 && (
          <div className="text-[12px] text-ink-3">No open alerts. All flows accounted for.</div>
        )}
      </div>
    </div>
  );
}

function buildInsights(args: {
  cac7d: number | null;
  yesterdayCac: number | null;
  flows: Array<{ name: string; status: string }>;
}) {
  const insights = [];

  if (args.cac7d !== null && args.cac7d > 55) {
    insights.push({
      kind: "risk" as const,
      title: `Blended CAC came in at $${args.cac7d.toFixed(2)} over the last 7 days, against a $55 target.`,
      body: `That's ${(((args.cac7d - 55) / 55) * 100).toFixed(0)}% over target. Worth drilling into which series is dragging — recent days suggest Salem may be the heaviest weight.`,
      actions: [
        { label: "Phase 2: Show kill list", primary: true },
        { label: "Snooze 24h" },
      ],
    });
  }

  if (args.yesterdayCac !== null && args.cac7d !== null && args.yesterdayCac < args.cac7d * 0.85) {
    insights.push({
      kind: "celebrate" as const,
      title: `Yesterday's CAC of $${args.yesterdayCac.toFixed(2)} was strong.`,
      body: `Below your 7-day average of $${args.cac7d.toFixed(2)}. Worth investigating what was different — the pattern may be repeatable.`,
      actions: [{ label: "Phase 2: Show what worked", primary: true }],
    });
  }

  const draftFlows = args.flows.filter((f) => f.status === "draft");
  if (draftFlows.length > 0) {
    insights.push({
      kind: "opportunity" as const,
      title: `${draftFlows.length} Klaviyo flow${draftFlows.length === 1 ? "" : "s"} in draft.`,
      body: `${draftFlows
        .slice(0, 3)
        .map((f) => f.name)
        .join(", ")}${draftFlows.length > 3 ? ", and others" : ""}. Activating these unlocks recovery revenue from cart, checkout, and win-back paths.`,
      actions: [{ label: "Phase 2: Walk through activation", primary: true }],
    });
  }

  insights.push({
    kind: "suggest" as const,
    title: "Three social posts queued for today.",
    body: "Each Facebook page has a draft post with branded imagery. Approve, recreate, or decline below.",
    actions: [{ label: "Jump to posts", primary: true }],
  });

  if (insights.length < 5) {
    insights.push({
      kind: "suggest" as const,
      title: "Phase 2 actions are wired but disabled.",
      body: "The buttons render but execute is gated. When you flip the Phase 2 switch, Pause/Bump/Activate calls go live against Meta and Klaviyo.",
      actions: [],
    });
  }

  return insights.slice(0, 5);
}
