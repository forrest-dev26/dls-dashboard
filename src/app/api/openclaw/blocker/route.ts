import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { q } from "@/lib/db";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: blockerBody, project } = body as {
    title: string;
    body?: string;
    project: string;
  };

  if (!title || !project) {
    return Response.json({ error: "title and project are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into blockers (title, body, project) values ($1, $2, $3) returning *`,
      [title, blockerBody ?? null, project]
    );
    return Response.json({ ok: true, blocker: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
