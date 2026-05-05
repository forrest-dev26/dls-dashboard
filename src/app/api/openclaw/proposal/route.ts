import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: proposalBody, project, category, context_url, metadata } = body as {
    title: string;
    body?: string;
    project?: string;
    category?: string;
    context_url?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into proposals (title, body, project, category, context_url, metadata) values ($1, $2, $3, $4, $5, $6) returning *`,
      [title, proposalBody ?? null, project ?? null, category ?? "recommendation", context_url ?? null, JSON.stringify(metadata ?? {})]
    );
    return Response.json({ ok: true, proposal: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
