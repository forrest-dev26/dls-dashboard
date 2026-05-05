"use client";

import { useEffect, useState, useCallback } from "react";

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
  running: "bg-good-soft text-good",
  queued: "bg-warn-soft text-warn",
  suggested: "bg-gold-soft text-gold-deep",
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
      <h3 className="mb-3 font-display text-base font-medium tracking-tight">
        Subagent Board
      </h3>
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-bg-soft" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-[13px] text-ink-3">No subagent activity right now.</p>
      ) : (
        <div className="space-y-4">
          {running.length > 0 && (
            <div>
              <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-good">Running</h4>
              <div className="space-y-2">{running.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
          {queued.length > 0 && (
            <div>
              <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-warn">Queued</h4>
              <div className="space-y-2">{queued.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
          {suggested.length > 0 && (
            <div>
              <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-gold-deep">Suggested</h4>
              <div className="space-y-2">{suggested.map((t) => <TaskRow key={t.id} task={t} onAction={updateStatus} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onAction }: { task: SubagentTask; onAction: (id: string, status: string) => void }) {
  return (
    <div className="rounded-md border border-line bg-bg-elev p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium">{task.label}</span>
            {task.agent_name && (
              <span className="rounded bg-bg-soft px-1.5 py-0.5 text-[10px] font-mono text-ink-3">{task.agent_name}</span>
            )}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColors[task.status] ?? "bg-bg-soft text-ink-3"}`}>
              {task.status}
            </span>
          </div>
          {task.description && <p className="mt-0.5 text-[12px] text-ink-3">{task.description}</p>}
          {task.rationale && <p className="mt-0.5 text-[11px] italic text-ink-4">{task.rationale}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {task.log_url && (
            <a href={task.log_url} target="_blank" rel="noopener noreferrer" className="rounded border border-line bg-bg-soft px-2 py-1 text-[11px] text-ink-3 hover:bg-line">Log</a>
          )}
          {task.status === "suggested" && (
            <button onClick={() => onAction(task.id, "queued")} className="rounded bg-good px-2 py-1 text-[11px] font-medium text-white hover:bg-good/90">Start</button>
          )}
          {(task.status === "running" || task.status === "queued") && (
            <button onClick={() => onAction(task.id, "killed")} className="rounded border border-bad/30 px-2 py-1 text-[11px] text-bad hover:bg-bad-soft">Kill</button>
          )}
        </div>
      </div>
    </div>
  );
}
