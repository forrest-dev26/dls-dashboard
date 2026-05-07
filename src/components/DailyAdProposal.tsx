"use client";

import { useCallback, useEffect, useState } from "react";

interface AdProposal {
  id: string;
  series: string;
  status: string;
  headline: string;
  primary_copy: string;
  cta: string;
  placement: string;
  hook_label: string | null;
  image_path: string | null;
  image_prompt: string | null;
  copy_prompt_version: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

const SERIES_COLORS: Record<string, string> = {
  salem: "bg-amber-900/10 text-amber-800",
  titanic: "bg-blue-900/10 text-blue-800",
  asylum: "bg-emerald-900/10 text-emerald-800",
};

const SERIES_LABELS: Record<string, string> = {
  salem: "Salem",
  titanic: "Titanic",
  asylum: "Asylum",
};

export function DailyAdProposal() {
  const [ad, setAd] = useState<AdProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ headline: "", primary_copy: "", cta: "" });
  const [copied, setCopied] = useState(false);

  const fetchAd = useCallback(async () => {
    try {
      // Try proposed first
      let res = await fetch("/api/ad-proposals?status=proposed&limit=1");
      let data = await res.json();
      if (data.proposals?.length > 0) {
        setAd(data.proposals[0]);
        return;
      }
      // Fall back to most recent overall
      res = await fetch("/api/ad-proposals?limit=1");
      data = await res.json();
      setAd(data.proposals?.[0] ?? null);
    } catch {
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAd(); }, [fetchAd]);

  async function decide(decision: "approve" | "reject") {
    if (!ad) return;
    setActing(true);
    try {
      await fetch(`/api/ad-proposals/${ad.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (decision === "reject") {
        // Trigger regeneration after reject
        setGenerating(true);
        await fetch("/api/ad-proposals/generate-now", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        setGenerating(false);
      }
      await fetchAd();
    } finally {
      setActing(false);
    }
  }

  async function saveEdit() {
    if (!ad) return;
    setActing(true);
    try {
      await fetch(`/api/ad-proposals/${ad.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "edit", edited_fields: editFields }),
      });
      setEditing(false);
      await fetchAd();
    } finally {
      setActing(false);
    }
  }

  async function generateNow() {
    setGenerating(true);
    try {
      await fetch("/api/ad-proposals/generate-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchAd();
    } finally {
      setGenerating(false);
    }
  }

  function copyAdText() {
    if (!ad) return;
    const imagePath = ad.image_path
      ? `${window.location.origin}/${ad.image_path}`
      : "(no image)";
    const text = [
      `HEADLINE: ${ad.headline}`,
      `PRIMARY: ${ad.primary_copy}`,
      `CTA: ${ad.cta}`,
      `SERIES: ${ad.series}`,
      `HOOK: ${ad.hook_label ?? "—"}`,
      `IMAGE: ${imagePath}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEdit() {
    if (!ad) return;
    setEditFields({
      headline: ad.headline,
      primary_copy: ad.primary_copy,
      cta: ad.cta,
    });
    setEditing(true);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-48 rounded bg-bg-soft" />
          <div className="h-24 rounded bg-bg-soft" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="rounded-xl border border-line bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="m-0 font-display text-base font-medium">Daily Ad Proposal</h3>
          <button
            onClick={generateNow}
            disabled={generating}
            className="rounded-lg bg-burgundy px-3 py-1.5 text-[12px] font-medium text-white hover:bg-burgundy-deep disabled:opacity-50"
          >
            {generating ? "Generating\u2026" : "Generate now"}
          </button>
        </div>
        <p className="text-[13px] text-ink-3">No ad proposals yet. Generate one to get started.</p>
      </div>
    );
  }

  const hasAuditWarning = ad.metadata?.audit_warning === true;
  const imgSrc = ad.image_path ? `/${ad.image_path}` : null;

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="m-0 font-display text-base font-medium">Daily Ad Proposal</h3>
        <button
          onClick={generateNow}
          disabled={generating}
          className="rounded-lg bg-burgundy px-3 py-1.5 text-[12px] font-medium text-white hover:bg-burgundy-deep disabled:opacity-50"
        >
          {generating ? "Generating\u2026" : "Generate now"}
        </button>
      </div>

      {/* Audit warning banner */}
      {hasAuditWarning && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2.5 text-[13px] text-yellow-800">
          Warning: Copy may contain voice-rule violations — review before approving.
        </div>
      )}

      {/* Content */}
      <div className="flex gap-5 max-[700px]:flex-col">
        {/* Left: image */}
        {imgSrc && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={ad.headline}
              className="rounded-lg bg-bg-soft object-contain"
              style={{ maxWidth: 320, maxHeight: 320 }}
            />
          </div>
        )}

        {/* Right: copy */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tags */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SERIES_COLORS[ad.series] ?? "bg-bg-soft text-ink-3"}`}>
              {SERIES_LABELS[ad.series] ?? ad.series}
            </span>
            {ad.hook_label && (
              <span className="rounded-full bg-bg-soft px-2 py-0.5 text-[11px] text-ink-4">
                {ad.hook_label}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              ad.status === "proposed" ? "bg-blue-50 text-blue-700" :
              ad.status === "approved" ? "bg-good-soft text-good" :
              ad.status === "rejected" ? "bg-bad-soft text-bad" :
              "bg-warn-soft text-warn"
            }`}>
              {ad.status}
            </span>
          </div>

          {editing ? (
            /* Edit form */
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase text-ink-3">Headline</label>
                <input
                  value={editFields.headline}
                  onChange={(e) => setEditFields((f) => ({ ...f, headline: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-1.5 text-[14px]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase text-ink-3">Primary copy</label>
                <textarea
                  value={editFields.primary_copy}
                  onChange={(e) => setEditFields((f) => ({ ...f, primary_copy: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-line px-3 py-1.5 text-[13px] leading-relaxed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase text-ink-3">CTA</label>
                <input
                  value={editFields.cta}
                  onChange={(e) => setEditFields((f) => ({ ...f, cta: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-1.5 text-[14px]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={acting}
                  className="rounded-lg bg-good px-3 py-1 text-[12px] font-medium text-white hover:bg-good/90 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-line bg-bg-soft px-3 py-1 text-[12px] text-ink-3 hover:bg-line"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Display copy */}
              <h4 className="mb-2 font-display text-lg font-semibold leading-snug">{ad.headline}</h4>
              <p className="mb-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">{ad.primary_copy}</p>
              <div className="mb-4">
                <span className="inline-block rounded-full bg-burgundy/10 px-3 py-1 text-[12px] font-medium text-burgundy">
                  {ad.cta}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-auto flex flex-wrap gap-2">
                {ad.status === "proposed" && (
                  <>
                    <button
                      onClick={() => decide("approve")}
                      disabled={acting}
                      className="rounded-lg bg-good px-3 py-1.5 text-[12px] font-medium text-white hover:bg-good/90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={startEdit}
                      disabled={acting}
                      className="rounded-lg border border-line bg-bg-soft px-3 py-1.5 text-[12px] text-ink-3 hover:bg-line"
                    >
                      Edit copy
                    </button>
                    <button
                      onClick={() => decide("reject")}
                      disabled={acting || generating}
                      className="rounded-lg border border-bad/30 px-3 py-1.5 text-[12px] text-bad hover:bg-bad-soft disabled:opacity-50"
                    >
                      {generating ? "Regenerating\u2026" : "Reject + regenerate"}
                    </button>
                  </>
                )}
                <button
                  onClick={copyAdText}
                  className="rounded-lg border border-line bg-bg-soft px-3 py-1.5 text-[12px] text-ink-3 hover:bg-line"
                >
                  {copied ? "Copied" : "Copy ad text"}
                </button>
                {imgSrc && (
                  <a
                    href={imgSrc}
                    download
                    className="rounded-lg border border-line bg-bg-soft px-3 py-1.5 text-[12px] text-ink-3 hover:bg-line inline-block"
                  >
                    Download image
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer: timestamp */}
      <div className="mt-4 border-t border-line pt-3 text-[11px] text-ink-3">
        Generated {new Date(ad.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
        {ad.decided_at && ` · ${ad.status} by ${ad.decided_by ?? "unknown"} on ${new Date(ad.decided_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      </div>
    </div>
  );
}
