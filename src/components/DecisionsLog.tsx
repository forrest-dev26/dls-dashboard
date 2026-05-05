"use client";

import { useEffect, useState, useCallback } from "react";

interface Decision {
  id: string;
  created_at: string;
  proposal_id: string | null;
  decision: string;
  note: string | null;
  decided_via: string;
  proposal_title?: string;
}

const decisionColors: Record<string, string> = {
  approved: "text-sage-deep bg-sage-soft",
  rejected: "text-rose bg-rose-soft",
  snoozed: "text-gold-deep bg-gold-soft",
  revising: "text-blue bg-blue-soft",
};

export function DecisionsLog() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decisions?search=${encodeURIComponent(search)}&offset=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search decisions..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-4 focus:border-sage focus:ring-1 focus:ring-sage/20"
        />
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bg-soft" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <p className="text-[13px] text-ink-3">No decisions found.</p>
      ) : (
        <div className="space-y-2.5">
          {decisions.map((d) => (
            <div key={d.id} className="rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${decisionColors[d.decision] ?? "bg-bg-soft text-ink-3"}`}>
                      {d.decision}
                    </span>
                    <span className="text-[13px] font-medium text-ink">{d.proposal_title ?? `Proposal ${d.proposal_id?.slice(0, 8) ?? "—"}`}</span>
                    <span className="text-[10px] text-ink-4">via {d.decided_via}</span>
                  </div>
                  {d.note && <p className="mt-1 text-[12px] text-ink-3">{d.note}</p>}
                </div>
                <span className="shrink-0 text-[11px] text-ink-4">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {decisions.length > 0 && <div className="mt-5 flex justify-center gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-[12px] text-ink-3 transition-colors hover:bg-bg-soft disabled:opacity-30"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-[12px] text-ink-4">Page {page + 1}</span>
        <button
          disabled={decisions.length < PAGE_SIZE}
          onClick={() => setPage(page + 1)}
          className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-[12px] text-ink-3 transition-colors hover:bg-bg-soft disabled:opacity-30"
        >
          Next
        </button>
      </div>}
    </div>
  );
}
