import { BodyManBriefing } from "@/components/BodyManBriefing";
import { DailyTaskList } from "@/components/DailyTaskList";
import { SubagentBoard } from "@/components/SubagentBoard";
import { ProposalList } from "@/components/ProposalList";

export const dynamic = "force-dynamic";

export default function PersonalPage() {
  return (
    <main className="mx-auto max-w-[1120px] px-8 pt-8 pb-16">
      {/* Header */}
      <div className="mb-7">
        <h1 className="m-0 font-display text-[28px] font-medium text-ink" style={{ letterSpacing: '-0.015em' }}>
          Personal
        </h1>
        <p className="mt-1.5 font-display text-[14px] font-normal text-ink-3">
          Body Man cockpit — six pillars, briefing, health, relationships
        </p>
      </div>

      {/* Zone 1: Pillar strip + Briefing in 2-col */}
      <section className="mb-8">
        <BodyManBriefing />
      </section>

      {/* Zone 2: Full-width — Daily Tasks */}
      <section className="mb-8">
        <DailyTaskList project="personal" />
      </section>

      {/* Zone 3: Full-width — Subagent Board */}
      <section className="mb-8">
        <SubagentBoard project="personal" />
      </section>

      {/* Zone 4: Full-width — Proposals */}
      <section className="mb-8">
        <ProposalList
          project="personal"
          title="Personal Proposals"
          emptyText="No pending personal proposals."
        />
      </section>
    </main>
  );
}
