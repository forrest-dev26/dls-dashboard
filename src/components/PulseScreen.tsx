"use client";

import { useEffect, useState } from "react";

interface PulseData {
  pending_proposals: number;
  today_tasks_open: number;
  agents_running: number;
  blockers_open: number;
  ideas_rotting: number;
  relationship_nudges_due: number;
}

const TILE_CONFIG = [
  {
    key: "pending_proposals",
    label: "Pending Proposals",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    color: "sage" as const,
  },
  {
    key: "today_tasks_open",
    label: "Today's Tasks",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    color: "blue" as const,
  },
  {
    key: "agents_running",
    label: "Agents Running",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    color: "gold" as const,
  },
  {
    key: "blockers_open",
    label: "Blockers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    color: "rose" as const,
  },
  {
    key: "ideas_rotting",
    label: "Ideas Rotting",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 12 18.469c-.874 0-1.67.346-2.252.902l-.284.284" />
      </svg>
    ),
    color: "gold" as const,
  },
  {
    key: "relationship_nudges_due",
    label: "Nudges Due",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: "blue" as const,
  },
] as const;

const colorMap = {
  sage: { bg: "bg-sage-soft", icon: "text-sage", soft: "bg-sage/10" },
  blue: { bg: "bg-blue-soft", icon: "text-blue", soft: "bg-blue/10" },
  gold: { bg: "bg-gold-soft", icon: "text-gold-deep", soft: "bg-gold/10" },
  rose: { bg: "bg-rose-soft", icon: "text-rose", soft: "bg-rose/10" },
};

export function PulseScreen() {
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => (r.ok ? r.json() : { pulse: null }))
      .then((d) => setPulse(d.pulse ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-2">
        {TILE_CONFIG.map((t) => (
          <div key={t.key} className="h-32 animate-pulse rounded-xl bg-bg-soft" />
        ))}
      </div>
    );
  }

  if (!pulse) {
    return <p className="text-[13px] text-ink-3">Unable to load pulse data.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-2">
      {TILE_CONFIG.map((tile) => {
        const value = pulse[tile.key];
        const isAlert = tile.key === "blockers_open" && value > 0;
        const colors = colorMap[tile.color];
        return (
          <div
            key={tile.key}
            className={`rounded-xl border p-5 transition-shadow hover:shadow-sm ${
              isAlert ? "border-rose/30 bg-rose-soft" : "border-line bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isAlert ? "bg-rose/10 text-rose" : `${colors.soft} ${colors.icon}`}`}>
                {tile.icon}
              </span>
              <span className="text-[12px] font-medium text-ink-3">{tile.label}</span>
            </div>
            <div className={`text-[32px] font-semibold leading-none tracking-tight ${isAlert ? "text-rose-deep" : "text-ink"}`}>
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
