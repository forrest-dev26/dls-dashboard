import { CockpitShell } from "@/components/CockpitShell";
import { BodyManBriefing } from "@/components/BodyManBriefing";
import { DailyTaskList } from "@/components/DailyTaskList";
import { SubagentBoard } from "@/components/SubagentBoard";
import { ProposalList } from "@/components/ProposalList";

export const dynamic = "force-dynamic";

export default function PersonalPage() {
  return (
    <CockpitShell title="Personal" subtitle="Body Man cockpit — six pillars, briefing, health, relationships">
      <div className="space-y-8">
        <section>
          <BodyManBriefing />
        </section>

        <section>
          <DailyTaskList project="personal" />
        </section>

        <section>
          <SubagentBoard project="personal" />
        </section>

        <section>
          <ProposalList
            project="personal"
            title="Personal Proposals"
            emptyText="No pending personal proposals."
          />
        </section>
      </div>
    </CockpitShell>
  );
}
