"use client";

import { useEffect, useState, useCallback } from "react";
import { ProposalCard } from "./ProposalCard";

interface Proposal {
  id: string;
  created_at: string;
  project: string | null;
  category: string | null;
  title: string;
  body: string | null;
  context_url: string | null;
  status: string;
}

export function ProposalList({
  category,
  project,
  title,
  emptyText,
  limit,
}: {
  category?: string;
  project?: string;
  title: string;
  emptyText?: string;
  limit?: number;
}) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (project) params.set("project", project);
    if (limit) params.set("limit", String(limit));
    params.set("status", "pending");

    try {
      const res = await fetch(`/api/proposals?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [category, project, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h3 className="mb-4 text-[16px] font-semibold tracking-tight text-ink">{title}</h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-bg-soft" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <p className="text-[13px] text-ink-3">{emptyText ?? "Nothing here yet."}</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} onDecided={load} />
          ))}
        </div>
      )}
    </div>
  );
}
