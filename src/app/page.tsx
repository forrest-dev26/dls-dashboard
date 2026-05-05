// Personal OS Home — Christopher's command center
// 6 modules: Pulse strip, Today's Focus, Recommendations, Waiting on You,
// Body-Man Briefing, What's Running, Calendar (placeholder)

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
    <main className="mx-auto max-w-[1060px] px-8 pt-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="m-0 text-[28px] font-semibold tracking-tight text-ink">
          {greeting}, Christopher
        </h1>
        <p className="mt-1.5 text-[14px] text-ink-3">{dateStr} · Lakeland, FL</p>
      </div>

      {/* Pulse strip */}
      <section className="mb-10">
        <PulseStrip />
      </section>

      {/* Two-column: Today's Focus + Body-Man Briefing */}
      <section className="mb-10 grid grid-cols-[1.2fr_1fr] gap-6 max-[900px]:grid-cols-1">
        <div>
          <ProposalList
            category="today-focus"
            title="Today's Focus"
            emptyText="No focus items for today. Sarah will post them soon."
            limit={3}
          />
        </div>
        <div>
          <OsBriefingCard />
        </div>
      </section>

      {/* Two-column: Recommendations + Waiting on You */}
      <section className="mb-10 grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        <ProposalList
          category="recommendation"
          title="Sarah's Recommendations"
          emptyText="No recommendations right now."
        />
        <ProposalList
          category="waiting-on-you"
          title="Waiting on You"
          emptyText="Nothing waiting on you. Nice."
        />
      </section>

      {/* What's Running */}
      <section className="mb-10">
        <RunningTasksPanel />
      </section>

      {/* Subagent Board (aggregate) */}
      <section className="mb-10">
        <SubagentBoard />
      </section>

      {/* Calendar placeholder */}
      <section className="mb-10">
        <SectionHeader title="Calendar" />
        <div className="rounded-xl border border-dashed border-line bg-bg-card p-8 text-center">
          <p className="text-[13px] text-ink-4">
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
    <h3 className="mb-4 text-[16px] font-semibold tracking-tight text-ink">{title}</h3>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
