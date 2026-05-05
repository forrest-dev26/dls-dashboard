import { CockpitShell } from "@/components/CockpitShell";
import { DailyTaskList } from "@/components/DailyTaskList";
import { SubagentBoard } from "@/components/SubagentBoard";
import { ProposalList } from "@/components/ProposalList";

export const dynamic = "force-dynamic";

export default function WellnessPlatformPage() {
  return (
    <CockpitShell title="Wellness Platform" subtitle="Stillwater pilot health + multi-tenant SaaS">
      <div className="space-y-8">
        {/* Pilot health placeholder */}
        <section>
          <h3 className="mb-3 font-display text-base font-medium tracking-tight">Pilot Health</h3>
          <div className="rounded-xl border border-dashed border-line bg-bg-card p-8 text-center">
            <p className="text-[13px] text-ink-3">
              Chill N Out pilot metrics will populate here when Stripe + studio data flows in.
            </p>
          </div>
        </section>

        <section>
          <DailyTaskList project="wellness-platform" />
        </section>

        <section>
          <SubagentBoard project="wellness-platform" />
        </section>

        <section>
          <ProposalList
            project="wellness-platform"
            title="Wellness Platform Proposals"
            emptyText="No pending proposals."
          />
        </section>
      </div>
    </CockpitShell>
  );
}
