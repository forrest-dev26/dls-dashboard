"use client";

import { useEffect, useState, useCallback } from "react";
import { EmptyState } from "./EmptyState";

interface DailyTask {
  id: string;
  title: string;
  description: string | null;
  project: string;
  source: string;
  status: string;
  priority: number;
  estimated_minutes: number | null;
  rationale: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-gold-soft text-gold-deep",
  approved: "bg-sage-soft text-sage-deep",
  started: "bg-blue-soft text-blue",
  completed: "bg-bg-soft text-ink-3 line-through",
  deferred: "bg-bg-soft text-ink-4",
  killed: "bg-bg-soft text-ink-4 line-through",
};

export function DailyTaskList({ project }: { project: string }) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/daily-tasks?project=${project}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/daily-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h3 className="mb-4 font-display text-[16px] font-medium text-ink" style={{ letterSpacing: '-0.01em' }}>
        Daily Tasks
      </h3>
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-bg-soft" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks for today. Sarah will post them during the morning sequence." />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-lg border border-line bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">{t.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[t.status] ?? "bg-bg-soft text-ink-3"}`}>
                      {t.status}
                    </span>
                    {t.estimated_minutes && (
                      <span className="text-[10px] text-ink-4">{t.estimated_minutes}m</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-1 text-[12px] text-ink-3">{t.description}</p>
                  )}
                  {t.rationale && (
                    <p className="mt-0.5 text-[11px] italic text-ink-4">{t.rationale}</p>
                  )}
                </div>
                {t.status === "pending" && (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => updateStatus(t.id, "approved")} className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white hover:bg-accent-deep">Approve</button>
                    <button onClick={() => updateStatus(t.id, "started")} className="rounded-lg bg-gold px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-gold/90">Start</button>
                    <button onClick={() => updateStatus(t.id, "deferred")} className="rounded-lg border border-line bg-bg-soft px-2.5 py-1 text-[11px] text-ink-3 hover:bg-line">Defer</button>
                    <button onClick={() => updateStatus(t.id, "killed")} className="rounded-lg border border-rose/30 px-2.5 py-1 text-[11px] text-rose hover:bg-rose-soft">Kill</button>
                  </div>
                )}
                {t.status === "approved" && (
                  <button onClick={() => updateStatus(t.id, "started")} className="rounded-lg bg-gold px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-gold/90 shrink-0">Start</button>
                )}
                {t.status === "started" && (
                  <button onClick={() => updateStatus(t.id, "completed")} className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white hover:bg-accent-deep shrink-0">Done</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
