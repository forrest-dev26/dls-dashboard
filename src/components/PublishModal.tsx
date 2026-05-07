"use client";

import { useState } from "react";

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  series: string | null;
  platform: string | null;
  image_url: string | null;
}

interface Violation {
  pattern: string;
  reason: string;
  matches: string[];
}

type ModalState = "preview" | "posting" | "violations" | "error" | "success";

export function PublishModal({
  item,
  onClose,
  onPublished,
}: {
  item: ContentItem;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [state, setState] = useState<ModalState>("preview");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const imgSrc = item.image_url
    ? item.image_url.startsWith("http")
      ? item.image_url
      : `/api/social-image?path=${encodeURIComponent(item.image_url)}`
    : null;

  async function publish() {
    setState("posting");
    try {
      const res = await fetch(`/api/content-items/${item.id}/publish`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 422 && data.violations) {
        setViolations(data.violations);
        setState("violations");
      } else if (!res.ok) {
        setErrorMsg(data.error ?? "Publish failed");
        setState("error");
      } else {
        setState("success");
        setTimeout(() => {
          onPublished();
          onClose();
        }, 1200);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Network error");
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl border border-line bg-bg-elev p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          {item.series && (
            <span className="rounded bg-burgundy-soft px-1.5 py-0.5 text-[10px] font-medium uppercase text-burgundy">
              {item.series}
            </span>
          )}
          <span className="rounded bg-blue-soft px-1.5 py-0.5 text-[10px] font-medium text-blue">
            facebook
          </span>
        </div>

        {/* Violations state */}
        {state === "violations" && (
          <div className="mb-4 rounded-lg border border-bad/30 bg-bad-soft p-3">
            <p className="mb-2 text-[12px] font-medium text-bad">Voice audit failed</p>
            {violations.map((v, i) => (
              <div key={i} className="mb-1.5 text-[11px] text-ink-2">
                <span className="font-medium text-bad">{v.reason}</span>
                <span className="ml-1 text-ink-3">
                  (matched: {v.matches.join(", ")})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="mb-4 rounded-lg border border-bad/30 bg-bad-soft p-3">
            <p className="text-[12px] text-bad">{errorMsg}</p>
          </div>
        )}

        {/* Success state */}
        {state === "success" && (
          <div className="mb-4 rounded-lg border border-good/30 bg-good-soft p-3">
            <p className="text-[12px] font-medium text-good">Posted to Facebook!</p>
          </div>
        )}

        {/* Body preview (show in all states except success) */}
        {state !== "success" && (
          <>
            {imgSrc && (
              <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-bg-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="mb-4 max-h-48 overflow-y-auto rounded-lg bg-bg-soft p-3">
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-ink-2">
                {item.body}
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-3 hover:bg-bg-soft"
          >
            Cancel
          </button>

          {state === "violations" && (
            <button
              className="rounded-lg border border-line bg-bg-soft px-3 py-1.5 text-[12px] text-ink-3"
              // TODO: wire to content editor
            >
              Open editor
            </button>
          )}

          {state === "error" && (
            <button
              onClick={publish}
              className="rounded-lg bg-burgundy px-3 py-1.5 text-[12px] font-medium text-white hover:bg-burgundy-deep"
            >
              Retry
            </button>
          )}

          {(state === "preview" || state === "posting") && (
            <button
              disabled={state === "posting"}
              onClick={publish}
              className="rounded-lg bg-burgundy px-3 py-1.5 text-[12px] font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
            >
              {state === "posting" ? "Posting\u2026" : "Post to Facebook"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
