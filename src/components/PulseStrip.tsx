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
      <div className="grid grid-cols-5 gap-3 max-[700px]:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-lg bg-bg-soft" />
        ))}
      </div>
    );
  }

  const tiles = [
    { label: "Proposals", value: pulse.pending_proposals, alert: pulse.pending_proposals > 5, color: "accent" as const },
    { label: "Tasks", value: pulse.today_tasks_open, alert: false, color: "blue" as const },
    { label: "Agents", value: pulse.agents_running, alert: false, color: "gold" as const },
    { label: "Blockers", value: pulse.blockers_open, alert: pulse.blockers_open > 0, color: "bad" as const },
    { label: "Nudges", value: pulse.relationship_nudges_due, alert: false, color: "blue" as const },
  ];

  const colorMap = {
    accent: { dot: "bg-accent" },
    blue: { dot: "bg-blue" },
    gold: { dot: "bg-gold" },
    bad: { dot: "bg-bad" },
  };

  return (
    <Link href="/pulse" className="grid grid-cols-5 gap-3 max-[700px]:grid-cols-3">
      {tiles.map((t) => {
        const colors = t.alert
          ? { bg: "bg-bad-soft border-bad/30", num: "text-rose-deep" }
          : { bg: "bg-white border-line shadow-sm", num: "text-ink" };
        return (
          <div
            key={t.label}
            className={`flex flex-col rounded-lg border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors.bg}`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${t.alert ? "bg-bad" : colorMap[t.color].dot}`} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{t.label}</span>
            </div>
            <span className={`font-display text-[26px] font-semibold leading-none ${colors.num}`} style={{ letterSpacing: '-0.02em' }}>
              {t.value}
            </span>
          </div>
        );
      })}
    </Link>
  );
}
