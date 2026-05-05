import { CockpitShell } from "@/components/CockpitShell";
import { DecisionsLog } from "@/components/DecisionsLog";
import { DecisionsFileView } from "@/components/DecisionsFileView";

export const dynamic = "force-dynamic";

export default function DecisionsPage() {
  return (
    <CockpitShell title="Decisions Log" subtitle="Every decision Christopher makes, automatically captured.">
      <div className="space-y-8">
        <section>
          <h3 className="mb-3 font-display text-base font-medium tracking-tight">Database Decisions</h3>
          <DecisionsLog />
        </section>

        <section>
          <h3 className="mb-3 font-display text-base font-medium tracking-tight">DECISIONS.md (Workspace)</h3>
          <DecisionsFileView />
        </section>
      </div>
    </CockpitShell>
  );
}
