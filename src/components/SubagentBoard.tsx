"use client";

import { useEffect, useState, useCallback } from "react";
import { EmptyState } from "./EmptyState";

interface SubagentTask {
  id: string;
  project: string;
  agent_name: string | null;
  label: string;
  description: string | null;
  status: string;
  source: string;
  estimated_minutes: number | null;
  rationale: string | null;
  log_url: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  running: "bg-sage-soft text-sage-deep",
  queued: "bg-gold-soft text-gold-deep",
  suggested: "bg-blue-soft text-blue",
};

export function SubagentBoard({ project }: { project?: string }) {
  const [tasks, setTasks] = useState<SubagentTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const url = project ? `/api/subagent-tasks?project=${project}` : "/api/subagent-tasks";
    try {
      const res = await fetch(url);
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
    await fetch(`/api/subagent-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const running = tasks.filter((t) => t.status === "running");
  const queued = tasks.filter((t) => t.status === "queued");
  const suggested = tasks.filter((t) => t.status === "suggested");

  return (
    <div>
      <h3 className="mb-4 font-display text-[16px] font-medium text-ink" style={{ letterSpacing: '-0.01em' }}>
        Subagent Board
      </h3>
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-bg-soft" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState message="No subagent activity right now." />
      ) : (
        <div className="space-y-5">
          {running.length > 0 && (
            <div>
              <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Running
              </h4>
              <div className="space-y-2.5">{running.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
          {queued.length > 0 && (
            <div>
              <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-gold-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Queued
              </h4>
              <div className="space-y-2.5">{queued.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
          {suggested.length > 0 && (
            <div>
              <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                Suggested
              </h4>
              <div className="space-y-2.5">{suggested.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onAction }: { task: SubagentTask; onAction: (id: string, status: string) => void }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-ink">{task.label}</span>
            {task.agent_name && (
              <span className="rounded-md bg-bg-soft px-1.5 py-0.5 text-[10px] font-mono text-ink-3">{task.agent_name}</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[task.status] ?? "bg-bg-soft text-ink-3"}`}>
              {task.status}
            </span>
          </div>
          {task.description && <p className="mt-1 text-[12px] text-ink-3">{task.description}</p>}
          {task.rationale && <p className="mt-0.5 text-[11px] italic text-ink-4">{task.rationale}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {task.log_url && (
            <a href={task.log_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line bg-bg-soft px-2.5 py-1 text-[11px] text-ink-3 hover:bg-line">Log</a>
          )}
          {task.status === "suggested" && (
            <button onClick={() => onAction(task.id, "queued")} className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-medium text-white hover:bg-accent-deep">Start</button>
          )}
          {(task.status === "running" || task.status === "queued") && (
            <button onClick={() => onAction(task.id, "killed")} className="rounded-lg border border-rose/30 px-2.5 py-1 text-[11px] text-rose hover:bg-rose-soft">Kill</button>
          )}
        </div>
      </div>
    </div>
  );
}
