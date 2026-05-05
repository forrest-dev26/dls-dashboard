import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, task_type, session_key, metadata } = body as {
    label: string;
    task_type: string;
    session_key?: string;
    metadata?: Record<string, unknown>;
  };

  if (!label || !task_type) {
    return Response.json({ error: "label and task_type are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into running_tasks (label, task_type, session_key, metadata) values ($1, $2, $3, $4) returning *`,
      [label, task_type, session_key ?? null, JSON.stringify(metadata ?? {})]
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
    const endedAt = ["completed", "failed", "killed"].includes(status) ? "now()" : "ended_at";
    const metaClause = metadata ? `, metadata = $3` : "";
    const params: unknown[] = [status, session_key];
    if (metadata) params.push(JSON.stringify(metadata));

    await q(
      `update running_tasks set status = $1, ended_at = ${endedAt}${metaClause} where session_key = $2`,
      params
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
