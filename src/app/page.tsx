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
    <main className="mx-auto max-w-[960px] px-6 pt-6 pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="m-0 font-display text-2xl font-semibold tracking-tight">
          {greeting}, Christopher
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">{dateStr}</p>
      </div>

      {/* Pulse strip */}
      <section className="mb-8">
        <PulseStrip />
      </section>

      {/* Today's Focus */}
      <section className="mb-8">
        <ProposalList
          category="today-focus"
          title="Today's Focus"
          emptyText="No focus items for today. Sarah will post them soon."
          limit={3}
        />
      </section>

      {/* Two-column: Recommendations + Waiting on You */}
      <section className="mb-8 grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
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

      {/* Body-Man Briefing */}
      <section className="mb-8">
        <OsBriefingCard />
      </section>

      {/* What's Running */}
      <section className="mb-8">
        <RunningTasksPanel />
      </section>

      {/* Subagent Board (aggregate) */}
      <section className="mb-8">
        <SubagentBoard />
      </section>

      {/* Calendar placeholder */}
      <section className="mb-8">
        <h3 className="mb-3 font-display text-base font-medium tracking-tight">Calendar</h3>
        <div className="rounded-md border border-dashed border-line bg-bg-soft p-6 text-center">
          <p className="text-[13px] text-ink-3">
            Calendar integration coming in Phase 4.
          </p>
        </div>
      </section>

      <footer className="mt-10 text-center text-[11px] text-ink-3">
        Personal OS Dashboard · Phase 1 v1 ·{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </footer>
    </main>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
