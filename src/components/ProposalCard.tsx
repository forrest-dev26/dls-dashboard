"use client";

import { useState } from "react";

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

export function ProposalCard({
  proposal,
  onDecided,
}: {
  proposal: Proposal;
  onDecided?: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [decided, setDecided] = useState(false);

  async function decide(decision: string) {
    setLoading(decision);
    try {
      const res = await fetch("/api/proposals/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_id: proposal.id, decision }),
      });
      if (res.ok) {
        setDecided(true);
        onDecided?.();
      }
    } finally {
      setLoading(null);
    }
  }

  if (decided) {
    return (
      <div className="rounded-md border border-line bg-bg-soft p-4 opacity-60">
        <p className="text-[13px] text-ink-3">
          <strong>{proposal.title}</strong> — done
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-bg-elev p-4">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h4 className="m-0 text-[14px] font-medium leading-snug">{proposal.title}</h4>
        {proposal.project && (
          <span className="shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
            {proposal.project}
          </span>
        )}
      </div>
      {proposal.body && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{proposal.body}</p>
      )}
      {proposal.context_url && (
        <a
          href={proposal.context_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-[12px] text-burgundy hover:underline"
        >
          View context →
        </a>
      )}
      <div className="mt-3 flex gap-2">
        <ActionBtn
          label="Yes"
          onClick={() => decide("approved")}
          loading={loading === "approved"}
          className="border border-good bg-bg-soft text-good hover:bg-good/10"
        />
        <ActionBtn
          label="No"
          onClick={() => decide("rejected")}
          loading={loading === "rejected"}
          className="border border-bad bg-bg-soft text-bad hover:bg-bad/10"
        />
        <ActionBtn
          label="Revise"
          onClick={() => decide("revising")}
          loading={loading === "revising"}
          className="border border-line bg-bg-soft text-ink hover:bg-line"
        />
        <ActionBtn
          label="Snooze"
          onClick={() => decide("snoozed")}
          loading={loading === "snoozed"}
          className="border border-line bg-bg-soft text-ink-3 hover:bg-line"
        />
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  loading,
  className,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${className} ${
        loading ? "opacity-50" : ""
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
