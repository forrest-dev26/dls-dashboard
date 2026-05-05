import { CockpitShell } from "@/components/CockpitShell";
import { PillarDetail } from "@/components/PillarDetail";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pillarLabels: Record<string, string> = {
  work: "Work",
  physical: "Physical Health",
  cognitive: "Cognitive / Learning",
  relationships: "Relationships",
  hobbies: "Hobbies / Play",
  recovery: "Recovery / Sleep",
};

export default async function PillarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const label = pillarLabels[id] ?? id;

  return (
    <CockpitShell title={label} subtitle="Body Man pillar detail">
      <div className="mb-4">
        <Link href="/projects/personal" className="text-[12px] text-accent-deep hover:underline">
          &larr; Back to Personal
        </Link>
      </div>
      <PillarDetail pillarId={id} />
    </CockpitShell>
  );
}
