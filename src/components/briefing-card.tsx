"use client";

import { useState } from "react";

type Insight = {
  kind: "risk" | "opportunity" | "suggest" | "celebrate";
  title: string;
  body: string;
  actions: Array<{ label: string; primary?: boolean }>;
};

const badgeClass = {
  risk: "bg-bad/30 text-[#f0bdb5]",
  opportunity: "bg-good/25 text-[#c2dcb2]",
  suggest: "bg-gold/22 text-gold",
  celebrate: "bg-gold/22 text-gold",
};

const badgeLabel = {
  risk: "Action needed",
  opportunity: "Opportunity",
  suggest: "Suggested",
  celebrate: "Notable",
};

export function BriefingCard({ insights }: { insights: Insight[] }) {
  const [toast, setToast] = useState<string | null>(null);

  function handleAction(label: string) {
    if (label.toLowerCase().startsWith("phase 2")) {
      setToast(`${label}: wired in Phase 2 (read-only for now).`);
      setTimeout(() => setToast(null), 3500);
      return;
    }
    if (label === "Jump to posts") {
      document.querySelector("[data-kanban]")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const stamp = new Date().toLocaleTimeString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="relative rounded-xl border border-sidebar-bg bg-sidebar-bg p-5 px-6 text-bg">
      <div className="flex items-baseline justify-between">
        <h3 className="m-0 font-display text-lg font-medium text-gold">Today&apos;s briefing</h3>
        <span className="text-[11px] italic text-ink-4">{stamp}</span>
      </div>
      <p className="mb-4 mt-1 text-[13px] italic text-ink-4">
        Insights pulled live from Shopify, Meta, and Klaviyo. Action buttons execute against real services in Phase 2.
      </p>
      {insights.map((ins, i) => (
        <div key={i} className="border-t border-gold/[0.18] py-3.5">
          <span
            className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${badgeClass[ins.kind]}`}
          >
            {badgeLabel[ins.kind]}
          </span>
          <h4 className="m-0 mb-1 font-display text-[15px] font-medium text-[#f8f1e2]">
            {ins.title}
          </h4>
          <p className="m-0 mb-3 text-[13px] leading-relaxed text-ink-4">{ins.body}</p>
          {ins.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ins.actions.map((a, j) => (
                <button
                  key={j}
                  onClick={() => handleAction(a.label)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    a.primary
                      ? "border-gold bg-gold text-ink hover:bg-gold/80"
                      : "border-white/20 bg-transparent text-ink-4 hover:border-white/40 hover:text-[#f8f1e2]"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {toast && (
        <div className="absolute bottom-4 right-4 rounded-md border border-gold bg-ink px-3 py-2 text-[12px] text-gold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
