import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, project, source, priority, estimated_minutes, rationale, metadata } = body as {
    title: string;
    description?: string;
    project: string;
    source?: string;
    priority?: number;
    estimated_minutes?: number;
    rationale?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !project) {
    return Response.json({ error: "title and project are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into daily_tasks (title, description, project, source, priority, estimated_minutes, rationale, metadata)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
      [title, description ?? null, project, source ?? "sarah-suggested", priority ?? 2, estimated_minutes ?? null, rationale ?? null, JSON.stringify(metadata ?? {})]
    );
    return Response.json({ ok: true, task: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
