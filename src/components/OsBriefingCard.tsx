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
      <div className="rounded-md border border-line bg-ink p-5">
        <p className="text-[13px] text-gold/60">Loading briefing...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="rounded-md border border-line bg-ink p-5">
        <h3 className="m-0 mb-2 font-display text-base font-medium text-gold">
          Body-Man Briefing
        </h3>
        <p className="text-[13px] text-bg/60">No briefing yet today. Sarah will post one soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-ink p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="m-0 font-display text-base font-medium text-gold">
          {briefing.title}
        </h3>
        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">
          {briefing.type}
        </span>
      </div>
      <div className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-bg/80">
        {briefing.body}
      </div>
      <div className="mt-3 text-[11px] text-bg/40">
        {new Date(briefing.created_at).toLocaleString()}
      </div>
    </div>
  );
}
