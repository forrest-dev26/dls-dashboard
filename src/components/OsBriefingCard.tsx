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

  if (loading) {
    return (
      <div className="rounded-xl bg-sidebar-bg p-6">
        <p className="text-[13px] text-gold/60">Loading briefing...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
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
        <p className="text-[13px] leading-relaxed text-white/50">No briefing yet today. Sarah will post one soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-sidebar-bg p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <h3 className="m-0 text-[15px] font-semibold text-gold">
            {briefing.title}
          </h3>
        </div>
        <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-medium text-gold">
          {briefing.type}
        </span>
      </div>
      <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/75">
        {briefing.body}
      </div>
      <div className="mt-4 text-[11px] text-white/30">
        {new Date(briefing.created_at).toLocaleString()}
      </div>
    </div>
  );
}
