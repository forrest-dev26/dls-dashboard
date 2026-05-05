"use client";

import { useEffect, useState } from "react";

interface Pillar {
  pillar: string;
  status: string;
  summary: string | null;
  last_touched_at: string | null;
  notes: string | null;
  updated_at: string;
}

const statusLabel: Record<string, string> = {
  green: "On Track",
  yellow: "Needs Attention",
  red: "Critical",
};

const statusColor: Record<string, string> = {
  green: "text-[#2D6B40] bg-good-soft",
  yellow: "text-[#8F6516] bg-warn-soft",
  red: "text-[#8B3A30] bg-bad-soft",
};

const pillarLabels: Record<string, string> = {
  work: "Work",
  physical: "Physical Health",
  cognitive: "Cognitive / Learning",
  relationships: "Relationships",
  hobbies: "Hobbies / Play",
  recovery: "Recovery / Sleep",
};

export function PillarDetail({ pillarId }: { pillarId: string }) {
  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pillars")
      .then((r) => (r.ok ? r.json() : { pillars: [] }))
      .then((d) => {
        const found = (d.pillars ?? []).find((p: Pillar) => p.pillar === pillarId);
        setPillar(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [pillarId]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-bg-soft" />;
  }

  if (!pillar) {
    return <p className="text-[13px] text-ink-3">Pillar &quot;{pillarId}&quot; not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-semibold">{pillarLabels[pillar.pillar] ?? pillar.pillar}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor[pillar.status] ?? "bg-bg-soft text-ink-3"}`}>
          {statusLabel[pillar.status] ?? pillar.status}
        </span>
      </div>

      {pillar.summary && (
        <div className="rounded-xl border border-line bg-white p-5">
          <h4 className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-3">Current State</h4>
          <p className="text-[14px] leading-relaxed text-ink-2">{pillar.summary}</p>
        </div>
      )}

      {pillar.notes && (
        <div className="rounded-xl border border-line bg-white p-5">
          <h4 className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-3">Sarah&apos;s Notes</h4>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">{pillar.notes}</p>
        </div>
      )}

      <div className="flex gap-6 text-[12px] text-ink-4">
        <span>Updated: {new Date(pillar.updated_at).toLocaleDateString()}</span>
        {pillar.last_touched_at && (
          <span>Last activity: {new Date(pillar.last_touched_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
