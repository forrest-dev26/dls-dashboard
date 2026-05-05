"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Pillar {
  pillar: string;
  status: string;
  summary: string | null;
  last_touched_at: string | null;
}

const statusDot: Record<string, string> = {
  green: "bg-good",
  yellow: "bg-warn",
  red: "bg-bad",
};

const pillarLabels: Record<string, string> = {
  work: "Work",
  physical: "Physical",
  cognitive: "Cognitive",
  relationships: "Relationships",
  hobbies: "Hobbies",
  recovery: "Recovery",
};

export function PillarStrip() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pillars")
      .then((r) => (r.ok ? r.json() : { pillars: [] }))
      .then((d) => setPillars(d.pillars ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[52px] w-32 animate-pulse rounded-lg bg-bg-soft" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {pillars.map((p) => (
        <Link
          key={p.pillar}
          href={`/projects/personal/pillars/${p.pillar}`}
          className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-line-2"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${statusDot[p.status] ?? "bg-ink-4"}`} />
          <span className="text-[13px] font-medium text-ink">{pillarLabels[p.pillar] ?? p.pillar}</span>
        </Link>
      ))}
    </div>
  );
}
