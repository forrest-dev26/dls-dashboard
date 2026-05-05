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
      {/* Pillar strip */}
      <div>
        <h3 className="mb-4 font-display text-[16px] font-medium text-ink" style={{ letterSpacing: '-0.01em' }}>Six Pillars</h3>
        <PillarStrip />
      </div>

      {/* 2-col: Briefing (left) + Schedule (right) */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-[900px]:grid-cols-1">
        {/* Dark briefing card */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#1F2421] to-[#2A3330] p-6 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(74,139,130,0.18),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(201,169,110,0.10),transparent_50%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#C9A96E]">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5z" />
                <path d="M19 3v4M5 17v4M3 5h4M17 19h4" strokeLinecap="round" />
              </svg>
              <h3 className="m-0 font-display text-[18px] font-medium text-[#FAF7F2]">
                Body-Man Briefing
              </h3>
            </div>
            {loading ? (
              <p className="text-[13px] text-[#B8B2A2]">Loading briefing...</p>
            ) : briefing ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-medium text-white/90">{briefing.title}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[11px] uppercase tracking-widest text-[#8F8A7A]">{briefing.type}</span>
                  </span>
                </div>
                <div className="rounded-md border border-white/6 bg-white/4 p-4">
                  <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#E8E3D6]/75">
                    {briefing.body}
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-[#8F8A7A]">
                  {new Date(briefing.created_at).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="rounded-md border border-white/6 bg-white/4 p-4">
                <p className="text-[13px] text-[#B8B2A2]">
                  No body-man briefing for today yet — Sarah will populate during the morning sequence.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule card */}
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h4 className="text-[14px] font-semibold uppercase tracking-wide text-ink">Today&apos;s Schedule</h4>
          </div>
          <div className="space-y-2.5 text-[13px]">
            <div className="flex items-center gap-3 rounded-md bg-bg-soft px-3 py-2">
              <span className="font-mono text-[12px] text-ink-3">11:15 AM</span>
              <span className="text-ink">Injection appointment</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-ink-4">Full calendar integration — Phase 4</p>
        </div>
      </div>
    </div>
  );
}
