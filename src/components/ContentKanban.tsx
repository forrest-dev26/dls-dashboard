"use client";

import { useEffect, useState, useCallback } from "react";
import { ContentCard } from "./ContentCard";
import { ContentCardLarge } from "./ContentCardLarge";

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

const KANBAN_THRESHOLD = 4;

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

const STATUS_PRIORITY: Record<string, number> = {
  reviewed: 0,
  scheduled: 1,
  drafted: 2,
  idea: 3,
  published: 4,
};

const PILL_COLORS: Record<string, { active: string; inactive: string }> = {
  idea: { active: "bg-ink-4 text-white", inactive: "bg-bg-soft text-ink-3" },
  drafted: { active: "bg-warn text-white", inactive: "bg-warn-soft text-warn" },
  reviewed: { active: "bg-good text-white", inactive: "bg-good-soft text-good" },
  scheduled: { active: "bg-gold text-white", inactive: "bg-bg-soft text-ink-3" },
  published: { active: "bg-burgundy text-white", inactive: "bg-burgundy-soft text-burgundy" },
};

export function ContentKanban({ project }: { project?: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  // Determine whether any column exceeds the threshold
  const useKanban = COLUMNS.some(
    (col) => items.filter((i) => i.status === col).length > KANBAN_THRESHOLD
  );

  // Column counts for status bar
  const counts: Record<string, number> = {};
  for (const col of COLUMNS) {
    counts[col] = items.filter((i) => i.status === col).length;
  }

  return (
    <div data-kanban>
      <h3 className="mb-3 font-display text-base font-medium tracking-tight">Content Pipeline</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-3">No content items yet. Sarah will populate the pipeline.</p>
      ) : useKanban ? (
        /* ── Kanban mode (>4 cards in any column) ── */
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
      ) : (
        /* ── List mode (<=4 cards per column) ── */
        <div>
          {/* Status pill bar */}
          <div className="mb-4 flex flex-wrap gap-2">
            {COLUMNS.map((col) => {
              const isActive = statusFilter === col;
              const colors = PILL_COLORS[col];
              return (
                <button
                  key={col}
                  onClick={() => setStatusFilter(isActive ? null : col)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${isActive ? colors.active : colors.inactive}`}
                >
                  {counts[col]} {COLUMN_LABELS[col]}
                </button>
              );
            })}
          </div>
          {/* Large card list */}
          <div className="space-y-3">
            {items
              .filter((i) => (statusFilter ? i.status === statusFilter : true))
              .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99))
              .map((item) => (
                <ContentCardLarge key={item.id} item={item} onUpdate={load} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
