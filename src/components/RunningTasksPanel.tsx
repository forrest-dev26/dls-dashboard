"use client";

import { useEffect, useState } from "react";

interface RunningTask {
  id: string;
  started_at: string;
  task_type: string;
  label: string;
  status: string;
  session_key: string | null;
}

const statusColors: Record<string, string> = {
  running: "bg-good-soft text-good",
  completed: "bg-bg-soft text-ink-3",
  failed: "bg-bad-soft text-bad",
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
      <h3 className="mb-3 font-display text-base font-medium tracking-tight">
        What&apos;s Running
      </h3>
      {loading ? (
        <p className="text-[13px] text-ink-3">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-[13px] text-ink-3">No background tasks running.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md border border-line bg-bg-elev px-4 py-2.5"
            >
              <div>
                <span className="text-[13px] font-medium">{t.label}</span>
                <span className="ml-2 text-[11px] text-ink-3">{t.task_type}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
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
