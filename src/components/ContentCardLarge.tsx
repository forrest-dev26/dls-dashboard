"use client";

import { useState } from "react";
import { PublishModal } from "./PublishModal";

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  series: string | null;
  asset_type: string;
  platform: string | null;
  status: string;
  image_url: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  idea: "IDEAS",
  drafted: "DRAFTED",
  reviewed: "REVIEWED",
  scheduled: "SCHEDULED",
  published: "PUBLISHED",
};

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-bg-soft text-ink-3",
  drafted: "bg-warn-soft text-warn",
  reviewed: "bg-good-soft text-good",
  scheduled: "bg-warn-soft text-ink-3",
  published: "bg-burgundy-soft text-burgundy",
};

export function ContentCardLarge({
  item,
  onUpdate,
}: {
  item: ContentItem;
  onUpdate?: () => void;
}) {
  const [acting, setActing] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  async function decide(decision: string) {
    setActing(true);
    try {
      const res = await fetch(`/api/content-items/${item.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) onUpdate?.();
    } finally {
      setActing(false);
    }
  }

  const canPublish = item.status === "reviewed" || item.status === "scheduled";

  const imgSrc = item.image_url
    ? item.image_url.startsWith("http")
      ? item.image_url
      : `/api/social-image?path=${encodeURIComponent(item.image_url)}`
    : null;

  return (
    <>
      <div className="rounded-xl border border-line bg-white p-5">
        <div className="flex gap-5">
          {imgSrc && (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={item.title}
                className="rounded-lg bg-bg-soft object-contain"
                style={{ maxWidth: 480, maxHeight: 480 }}
              />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COLORS[item.status] ?? "bg-bg-soft text-ink-3"}`}>
                {STATUS_LABELS[item.status] ?? item.status.toUpperCase()}
              </span>
              {item.series && (
                <span className="rounded bg-bg-soft px-1.5 py-0.5 text-[11px] uppercase text-ink-4">{item.series}</span>
              )}
              <span className="rounded bg-bg-soft px-1.5 py-0.5 text-[11px] text-ink-4">{item.asset_type}</span>
              {item.platform && (
                <span className="rounded bg-bg-soft px-1.5 py-0.5 text-[11px] text-ink-4">{item.platform}</span>
              )}
            </div>
            <h4 className="mb-2 text-base font-semibold leading-snug">{item.title}</h4>
            {item.body && (
              <p className="mb-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">{item.body}</p>
            )}
            <div className="mt-auto flex gap-2">
              {item.status === "drafted" && (
                <>
                  <button disabled={acting} onClick={() => decide("approved")} className="rounded-lg bg-good px-3 py-1 text-[12px] font-medium text-white hover:bg-good/90">Approve</button>
                  <button disabled={acting} onClick={() => decide("edit")} className="rounded-lg border border-line bg-bg-soft px-3 py-1 text-[12px] text-ink-3 hover:bg-line">Edit</button>
                  <button disabled={acting} onClick={() => decide("rejected")} className="rounded-lg border border-bad/30 px-3 py-1 text-[12px] text-bad hover:bg-bad-soft">Reject</button>
                </>
              )}
              {canPublish && (
                <button
                  onClick={() => setShowPublish(true)}
                  className="rounded-lg bg-burgundy px-4 py-1.5 text-[12px] font-medium text-white hover:bg-burgundy-deep"
                >
                  Post to Facebook
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPublish && (
        <PublishModal
          item={item}
          onClose={() => setShowPublish(false)}
          onPublished={() => onUpdate?.()}
        />
      )}
    </>
  );
}
