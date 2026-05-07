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

export function ContentCard({
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

  return (
    <>
      <div className="rounded-xl border border-line bg-white p-3">
        {item.image_url && (
          <div className="mb-2 aspect-video overflow-hidden rounded bg-bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
          </div>
        )}
        <p className="text-[12px] font-medium leading-snug">{item.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {item.series && (
            <span className="rounded bg-bg-soft px-1 py-0.5 text-[9px] uppercase text-ink-4">{item.series}</span>
          )}
          <span className="rounded bg-bg-soft px-1 py-0.5 text-[9px] text-ink-4">{item.asset_type}</span>
          {item.platform && (
            <span className="rounded bg-bg-soft px-1 py-0.5 text-[9px] text-ink-4">{item.platform}</span>
          )}
        </div>
        {item.body && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-3 line-clamp-3">{item.body}</p>
        )}
        {item.status === "drafted" && (
          <div className="mt-2 flex gap-1">
            <button disabled={acting} onClick={() => decide("approved")} className="rounded bg-good px-2 py-0.5 text-[10px] font-medium text-white hover:bg-good/90">Approve</button>
            <button disabled={acting} onClick={() => decide("edit")} className="rounded border border-line bg-bg-soft px-2 py-0.5 text-[10px] text-ink-3 hover:bg-line">Edit</button>
            <button disabled={acting} onClick={() => decide("rejected")} className="rounded border border-bad/30 px-2 py-0.5 text-[10px] text-bad hover:bg-bad-soft">Reject</button>
          </div>
        )}
        {canPublish && (
          <div className="mt-2">
            <button
              onClick={() => setShowPublish(true)}
              className="rounded bg-burgundy px-2 py-0.5 text-[10px] font-medium text-white hover:bg-burgundy-deep"
            >
              Post to Facebook
            </button>
          </div>
        )}
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
