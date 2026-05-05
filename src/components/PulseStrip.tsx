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
          <div key={i} className="h-[72px] animate-pulse rounded-xl bg-bg-soft" />
        ))}
      </div>
    );
  }

  const tiles = [
    { label: "Proposals", value: pulse.pending_proposals, alert: pulse.pending_proposals > 5, color: "sage" as const },
    { label: "Tasks", value: pulse.today_tasks_open, alert: false, color: "blue" as const },
    { label: "Agents", value: pulse.agents_running, alert: false, color: "gold" as const },
    { label: "Blockers", value: pulse.blockers_open, alert: pulse.blockers_open > 0, color: "rose" as const },
    { label: "Nudges", value: pulse.relationship_nudges_due, alert: false, color: "blue" as const },
  ];

  const colorMap = {
    sage: { dot: "bg-sage", text: "text-sage" },
    blue: { dot: "bg-blue", text: "text-blue" },
    gold: { dot: "bg-gold", text: "text-gold" },
    rose: { dot: "bg-rose", text: "text-rose" },
  };

  return (
    <Link href="/pulse" className="grid grid-cols-5 gap-3 max-[700px]:grid-cols-3">
      {tiles.map((t) => {
        const colors = t.alert
          ? { bg: "bg-rose-soft border-rose/30", num: "text-rose-deep" }
          : { bg: "bg-white border-line", num: "text-ink" };
        return (
          <div
            key={t.label}
            className={`flex flex-col rounded-xl border px-4 py-3.5 transition-shadow hover:shadow-sm ${colors.bg}`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${t.alert ? "bg-rose" : colorMap[t.color].dot}`} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{t.label}</span>
            </div>
            <span className={`text-[24px] font-semibold leading-none ${colors.num}`}>
              {t.value}
            </span>
          </div>
        );
      })}
    </Link>
  );
}
