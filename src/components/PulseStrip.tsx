"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PulseData {
  pending_proposals: number;
  today_tasks_open: number;
  agents_running: number;
  blockers_open: number;
  ideas_rotting: number;
  relationship_nudges_due: number;
}

export function PulseStrip() {
  const [pulse, setPulse] = useState<PulseData | null>(null);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => (r.ok ? r.json() : { pulse: null }))
      .then((d) => setPulse(d.pulse ?? null));
  }, []);

  if (!pulse) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded bg-bg-soft" />
        ))}
      </div>
    );
  }

  const tiles = [
    { label: "Proposals", value: pulse.pending_proposals, alert: pulse.pending_proposals > 5 },
    { label: "Tasks", value: pulse.today_tasks_open },
    { label: "Agents", value: pulse.agents_running },
    { label: "Blockers", value: pulse.blockers_open, alert: pulse.blockers_open > 0 },
    { label: "Nudges", value: pulse.relationship_nudges_due },
  ];

  return (
    <Link href="/pulse" className="flex flex-wrap gap-2">
      {tiles.map((t) => (
        <div
          key={t.label}
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${
            t.alert ? "border-bad/40 bg-bad-soft" : "border-line bg-bg-elev"
          }`}
        >
          <span className={`font-display text-lg font-semibold ${t.alert ? "text-bad" : "text-ink"}`}>
            {t.value}
          </span>
          <span className="text-ink-3">{t.label}</span>
        </div>
      ))}
    </Link>
  );
}
