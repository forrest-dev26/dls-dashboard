// Personal OS Home — Christopher's command center
// Multi-zone composition: KPI strip → 2-col (Focus + Briefing) → 2-col (Recs + Waiting) → full-width modules

import { ProposalList } from "@/components/ProposalList";
import { RunningTasksPanel } from "@/components/RunningTasksPanel";
import { OsBriefingCard } from "@/components/OsBriefingCard";
import { PulseStrip } from "@/components/PulseStrip";
import { SubagentBoard } from "@/components/SubagentBoard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const greeting = getGreeting();
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-[1120px] px-8 pt-8 pb-16">
      {/* Header — Lora display greeting */}
      <div className="mb-7">
        <h1 className="m-0 font-display text-[28px] font-medium text-ink" style={{ letterSpacing: '-0.015em' }}>
          {greeting}, Christopher
        </h1>
        <p className="mt-1.5 font-display text-[14px] font-normal text-ink-3">{dateStr} · Lakeland, FL</p>
      </div>

      {/* Zone 1: KPI strip */}
      <section className="mb-8">
        <PulseStrip />
      </section>

      {/* Zone 2: Two-column — Today's Focus (left, wider) + AI Briefing (right) */}
      <section className="mb-8 grid grid-cols-[1.4fr_1fr] gap-[18px] max-[900px]:grid-cols-1">
        <div>
          <SectionHeader title="Today's Focus" />
          <ProposalList
            category="today-focus"
            title=""
            emptyText="No focus items for today. Sarah will post them soon."
            limit={3}
          />
        </div>
        <div>
          <SectionHeader title="Today's Briefing" />
          <OsBriefingCard />
        </div>
      </section>

      {/* Zone 3: Two-column — Recommendations + Waiting on You */}
      <section className="mb-8 grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
        <div>
          <SectionHeader title="Sarah's Recommendations" />
          <ProposalList
            category="recommendation"
            title=""
            emptyText="No recommendations right now."
          />
        </div>
        <div>
          <SectionHeader title="Waiting on You" />
          <ProposalList
            category="waiting-on-you"
            title=""
            emptyText="Nothing waiting on you. Nice."
          />
        </div>
      </section>

      {/* Zone 4: Full-width — What's Running */}
      <section className="mb-8">
        <RunningTasksPanel />
      </section>

      {/* Zone 5: Full-width — Subagent Board */}
      <section className="mb-8">
        <SubagentBoard />
      </section>

      {/* Calendar placeholder */}
      <section className="mb-8">
        <SectionHeader title="Calendar" />
        <div className="rounded-lg border border-dashed border-line-2 bg-bg-soft p-8 text-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-ink-4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-[13px] text-ink-3">
            Calendar integration coming in Phase 4.
          </p>
        </div>
      </section>

      <footer className="mt-12 text-center text-[11px] text-ink-4">
        Personal OS Dashboard · Phase 1 v1.5 ·{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </footer>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-4 font-display text-[16px] font-medium text-ink" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
