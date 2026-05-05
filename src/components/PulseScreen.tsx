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
  { key: "pending_proposals", label: "Pending Proposals", icon: "?" },
  { key: "today_tasks_open", label: "Today's Tasks", icon: "#" },
  { key: "agents_running", label: "Agents Running", icon: ">" },
  { key: "blockers_open", label: "Blockers", icon: "!" },
  { key: "ideas_rotting", label: "Ideas Rotting", icon: "~" },
  { key: "relationship_nudges_due", label: "Nudges Due", icon: "@" },
] as const;

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
          <div key={t.key} className="h-28 animate-pulse rounded-lg bg-bg-soft" />
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
        return (
          <div
            key={tile.key}
            className={`rounded-lg border bg-bg-elev p-5 ${
              isAlert ? "border-bad/40 bg-bad-soft" : "border-line"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-bg-soft font-mono text-[14px] text-ink-3">
                {tile.icon}
              </span>
              <span className="text-[12px] text-ink-3">{tile.label}</span>
            </div>
            <div className={`mt-3 font-display text-3xl font-semibold ${isAlert ? "text-bad" : "text-ink"}`}>
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
