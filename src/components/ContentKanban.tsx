"use client";

import { useEffect, useState, useCallback } from "react";
import { ContentCard } from "./ContentCard";

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  project: string;
  series: string | null;
  asset_type: string;
  platform: string | null;
  status: string;
  image_url: string | null;
  created_at: string;
}

const COLUMNS = ["idea", "drafted", "reviewed", "scheduled", "published"];
const COLUMN_LABELS: Record<string, string> = {
  idea: "Ideas",
  drafted: "Drafted",
  reviewed: "Reviewed",
  scheduled: "Scheduled",
  published: "Published",
};
const COLUMN_COLORS: Record<string, string> = {
  idea: "border-t-ink-4",
  drafted: "border-t-warn",
  reviewed: "border-t-good",
  scheduled: "border-t-gold",
  published: "border-t-burgundy",
};

export function ContentKanban({ project }: { project?: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/content-items?project=${project ?? "dls"}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div>
        <h3 className="mb-3 font-display text-base font-medium tracking-tight">Content Pipeline</h3>
        <div className="grid grid-cols-5 gap-3 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
          {COLUMNS.map((c) => (
            <div key={c} className="h-32 animate-pulse rounded-xl bg-bg-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-kanban>
      <h3 className="mb-3 font-display text-base font-medium tracking-tight">Content Pipeline</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-3">No content items yet. Sarah will populate the pipeline.</p>
      ) : (
        <div className="grid grid-cols-5 gap-3 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
          {COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.status === col);
            return (
              <div key={col} className={`rounded-xl border border-line border-t-2 ${COLUMN_COLORS[col]} bg-bg-soft p-2`}>
                <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                  {COLUMN_LABELS[col]} ({colItems.length})
                </h4>
                <div className="space-y-2">
                  {colItems.map((item) => (
                    <ContentCard key={item.id} item={item} onUpdate={load} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
