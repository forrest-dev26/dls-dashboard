"use client";

import { useState } from "react";

interface Blocker {
  id: string;
  created_at: string;
  project: string;
  title: string;
  body: string | null;
}

export function BlockerCard({
  blocker,
  onResolved,
}: {
  blocker: Blocker;
  onResolved?: () => void;
}) {
  const [resolved, setResolved] = useState(false);

  async function resolve() {
    const res = await fetch("/api/blockers/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocker_id: blocker.id }),
    });
    if (res.ok) {
      setResolved(true);
      onResolved?.();
    }
  }

  if (resolved) {
    return (
      <div className="rounded-xl border border-good/30 bg-good-soft p-3 opacity-60">
        <p className="text-[13px] text-good">
          <strong>{blocker.title}</strong> — resolved
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-bad/30 bg-bad-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="m-0 text-[14px] font-medium text-bad">{blocker.title}</h4>
          {blocker.body && (
            <p className="mt-1 text-[13px] text-ink-2">{blocker.body}</p>
          )}
          <span className="mt-1 inline-block text-[11px] uppercase tracking-wide text-ink-3">
            {blocker.project}
          </span>
        </div>
        <button
          onClick={resolve}
          className="shrink-0 rounded-lg border border-good/40 bg-good-soft px-3 py-1.5 text-[12px] font-medium text-good hover:bg-good/20"
        >
          I&apos;ve handled this
        </button>
      </div>
    </div>
  );
}
