import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: briefingBody, type, metadata } = body as {
    title: string;
    body: string;
    type: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !briefingBody || !type) {
    return Response.json({ error: "title, body, and type are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into briefings (title, body, type, metadata) values ($1, $2, $3, $4) returning *`,
      [title, briefingBody, type, JSON.stringify(metadata ?? {})]
    );
    return Response.json({ ok: true, briefing: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
