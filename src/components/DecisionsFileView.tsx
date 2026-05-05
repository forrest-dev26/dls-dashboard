"use client";

import { useEffect, useState } from "react";

export function DecisionsFileView() {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files/workspace?path=state/personal-os-dashboard/DECISIONS.md")
      .then((r) => {
        if (!r.ok) throw new Error("File not found");
        return r.json();
      })
      .then((d) => setContent(d.content ?? null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-bg-soft" />;
  }

  if (error || !content) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-bg-card p-6 text-center">
        <p className="text-[13px] text-ink-3">
          No DECISIONS.md file found in workspace. Decisions will appear here when the file is created.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink-2">
        {content}
      </pre>
    </div>
  );
}
