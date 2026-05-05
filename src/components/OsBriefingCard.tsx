"use client";

import { useEffect, useState } from "react";

interface Briefing {
  id: string;
  created_at: string;
  type: string;
  title: string;
  body: string;
}

export function OsBriefingCard() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefings/latest")
      .then((r) => (r.ok ? r.json() : { briefing: null }))
      .then((d) => setBriefing(d.briefing ?? null))
      .finally(() => setLoading(false));
  }, []);

  // Dark briefing card — matches the AI Briefing pattern from the mockup
  const darkCardBase = "relative overflow-hidden rounded-lg p-6 shadow-lg";
  const darkCardBg = "bg-gradient-to-b from-[#1F2421] to-[#2A3330]";

  if (loading) {
    return (
      <div className={`${darkCardBase} ${darkCardBg}`}>
        <p className="text-[13px] text-[#C9A96E]/60">Loading briefing...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className={`${darkCardBase} ${darkCardBg}`}>
        {/* Radial gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(74,139,130,0.18),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(201,169,110,0.10),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#C9A96E]">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5z" />
              <path d="M19 3v4M5 17v4M3 5h4M17 19h4" strokeLinecap="round" />
            </svg>
            <h3 className="m-0 font-display text-[18px] font-medium text-[#FAF7F2]">
              Today&apos;s Briefing
            </h3>
          </div>
          <div className="rounded-md border border-white/6 bg-white/4 p-4">
            <p className="text-[13px] leading-relaxed text-[#B8B2A2]">No briefing yet today. Sarah will post one soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkCardBase} ${darkCardBg}`}>
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(74,139,130,0.18),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(201,169,110,0.10),transparent_50%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#C9A96E]">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5z" />
              <path d="M19 3v4M5 17v4M3 5h4M17 19h4" strokeLinecap="round" />
            </svg>
            <h3 className="m-0 font-display text-[18px] font-medium text-[#FAF7F2]">
              {briefing.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#8F8A7A]">
              {briefing.type}
            </span>
          </div>
        </div>
        <div className="rounded-md border border-white/6 bg-white/4 p-4">
          <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#E8E3D6]/75">
            {briefing.body}
          </div>
        </div>
        <div className="mt-4 text-[11px] text-[#8F8A7A]">
          {new Date(briefing.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
