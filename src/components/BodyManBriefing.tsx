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
    <div className="space-y-6">
      {/* Pillar status */}
      <div>
        <h3 className="mb-4 font-display text-[16px] font-medium text-ink">Six Pillars</h3>
        <PillarStrip />
      </div>

      {/* Briefing */}
      <div className="rounded-xl bg-sidebar-bg p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <h3 className="m-0 text-[15px] font-semibold text-gold">
            Body-Man Briefing
          </h3>
        </div>
        {loading ? (
          <p className="text-[13px] text-white/50">Loading briefing...</p>
        ) : briefing ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[14px] font-medium text-white/90">{briefing.title}</span>
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-medium text-gold">
                {briefing.type}
              </span>
            </div>
            <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/70">
              {briefing.body}
            </div>
            <div className="mt-4 text-[11px] text-white/30">
              {new Date(briefing.created_at).toLocaleString()}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-white/50">
            No body-man briefing for today yet — Sarah will populate during the morning sequence.
          </p>
        )}
      </div>

      {/* Schedule placeholder */}
      <div className="rounded-xl border border-line bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h4 className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Today&apos;s Schedule</h4>
        </div>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-ink-4">11:15 AM</span>
            <span>Injection appointment</span>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-4">Calendar integration — Phase 4</p>
      </div>
    </div>
  );
}
