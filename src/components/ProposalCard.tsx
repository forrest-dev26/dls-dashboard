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
      <div className="rounded-lg border border-line bg-bg-soft p-4 opacity-60">
        <p className="text-[13px] text-ink-3">
          <strong>{proposal.title}</strong> — done
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <h4 className="m-0 text-[14px] font-semibold leading-snug text-ink">{proposal.title}</h4>
        {proposal.project && (
          <span className="shrink-0 rounded-full bg-bg-soft px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
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
          className="mt-1.5 inline-block text-[12px] text-accent-deep hover:underline"
        >
          View context →
        </a>
      )}
      <div className="mt-4 flex gap-2">
        <ActionBtn
          label="Yes"
          onClick={() => decide("approved")}
          loading={loading === "approved"}
          className="border border-good bg-good-soft text-[#2D6B40] hover:bg-good/10"
        />
        <ActionBtn
          label="No"
          onClick={() => decide("rejected")}
          loading={loading === "rejected"}
          className="border border-bad bg-bad-soft text-rose-deep hover:bg-bad/10"
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
      className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-colors ${className} ${
        loading ? "opacity-50" : ""
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
