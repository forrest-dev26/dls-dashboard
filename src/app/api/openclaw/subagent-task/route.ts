import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, description, project, agent_name, status, source, estimated_minutes, session_key, rationale, log_url, metadata } = body as {
    label: string;
    description?: string;
    project: string;
    agent_name?: string;
    status?: string;
    source?: string;
    estimated_minutes?: number;
    session_key?: string;
    rationale?: string;
    log_url?: string;
    metadata?: Record<string, unknown>;
  };

  if (!label || !project) {
    return Response.json({ error: "label and project are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into subagent_tasks (label, description, project, agent_name, status, source, estimated_minutes, session_key, rationale, log_url, metadata)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *`,
      [label, description ?? null, project, agent_name ?? null, status ?? "queued", source ?? "sarah-suggested", estimated_minutes ?? null, session_key ?? null, rationale ?? null, log_url ?? null, JSON.stringify(metadata ?? {})]
    );
    return Response.json({ ok: true, task: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { session_key, status, metadata } = body as {
    session_key: string;
    status: string;
    metadata?: Record<string, unknown>;
  };

  if (!session_key || !status) {
    return Response.json({ error: "session_key and status are required" }, { status: 400 });
  }

  try {
    const setFields = ["status = $1"];
    if (status === "running") setFields.push("started_at = now()");
    if (["completed", "failed", "killed"].includes(status)) setFields.push("ended_at = now()");
    if (metadata) setFields.push(`metadata = $3`);

    const values: unknown[] = [status, session_key];
    if (metadata) values.push(JSON.stringify(metadata));

    await q(
      `update subagent_tasks set ${setFields.join(", ")} where session_key = $2`,
      values
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
