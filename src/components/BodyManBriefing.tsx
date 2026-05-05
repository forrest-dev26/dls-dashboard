"use client";

import { useEffect, useState } from "react";
import { PillarStrip } from "./PillarStrip";

interface Briefing {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
}

export function BodyManBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefings/latest")
      .then((r) => (r.ok ? r.json() : { briefing: null }))
      .then((d) => setBriefing(d.briefing ?? null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {/* Pillar status */}
      <div>
        <h3 className="mb-3 font-display text-base font-medium tracking-tight">Six Pillars</h3>
        <PillarStrip />
      </div>

      {/* Briefing */}
      <div className="rounded-md border border-line bg-ink p-5">
        <h3 className="m-0 mb-2 font-display text-base font-medium text-gold">
          Body-Man Briefing
        </h3>
        {loading ? (
          <p className="text-[13px] text-bg/60">Loading briefing...</p>
        ) : briefing ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[14px] font-medium text-bg/90">{briefing.title}</span>
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">
                {briefing.type}
              </span>
            </div>
            <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-bg/80">
              {briefing.body}
            </div>
            <div className="mt-3 text-[11px] text-bg/40">
              {new Date(briefing.created_at).toLocaleString()}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-bg/60">
            No body-man briefing for today yet — Sarah will populate during the morning sequence.
          </p>
        )}
      </div>

      {/* Schedule placeholder */}
      <div className="rounded-md border border-line bg-bg-elev p-4">
        <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-3">Today&apos;s Schedule</h4>
        <div className="space-y-1.5 text-[13px]">
          <div>
            <span>Tuesday 11:15 AM — Injection appointment</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink-4">Calendar integration — Phase 4</p>
      </div>
    </div>
  );
}
