"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";

interface RunningTask {
  id: string;
  started_at: string;
  task_type: string;
  label: string;
  status: string;
  session_key: string | null;
}

const statusColors: Record<string, string> = {
  running: "bg-sage-soft text-sage-deep",
  completed: "bg-bg-soft text-ink-3",
  failed: "bg-rose-soft text-rose",
  killed: "bg-bg-soft text-ink-3",
};

export function RunningTasksPanel() {
  const [tasks, setTasks] = useState<RunningTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/running-tasks")
      .then((r) => (r.ok ? r.json() : { tasks: [] }))
      .then((d) => setTasks(d.tasks ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3 className="mb-4 font-display text-[16px] font-medium text-ink" style={{ letterSpacing: '-0.01em' }}>
        What&apos;s Running
      </h3>
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-soft" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState message="No background tasks running." />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-line bg-white px-5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-ink">{t.label}</span>
                <span className="text-[11px] text-ink-3">{t.task_type}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${
                  statusColors[t.status] ?? "bg-bg-soft text-ink-3"
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
