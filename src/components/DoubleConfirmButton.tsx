"use client";

import { useState } from "react";

export function DoubleConfirmButton({
  phrase,
  onConfirm,
  destructiveLabel,
  className,
}: {
  phrase: string;
  onConfirm: () => void;
  destructiveLabel: string;
  className?: string;
}) {
  const [stage, setStage] = useState<"idle" | "confirming" | "done">("idle");
  const [typed, setTyped] = useState("");

  if (stage === "done") {
    return (
      <span className="text-[12px] text-good font-medium">Confirmed</span>
    );
  }

  if (stage === "confirming") {
    return (
      <div className={`flex flex-col gap-2 ${className ?? ""}`}>
        <p className="text-[12px] text-bad font-medium">{destructiveLabel}</p>
        <p className="text-[11px] text-ink-3">
          Type <strong className="font-mono">{phrase}</strong> to confirm:
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="rounded border border-line bg-bg-soft px-3 py-1.5 font-mono text-[13px] text-ink"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            disabled={typed !== phrase}
            onClick={() => {
              onConfirm();
              setStage("done");
            }}
            className="rounded bg-bad px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-30"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              setStage("idle");
              setTyped("");
            }}
            className="rounded border border-line bg-bg-soft px-3 py-1.5 text-[12px] text-ink-3"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStage("confirming")}
      className={`rounded border border-bad/30 bg-bad-soft px-3 py-1.5 text-[12px] font-medium text-bad hover:bg-bad/20 ${className ?? ""}`}
    >
      {destructiveLabel}
    </button>
  );
}
