import { q } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { blocker_id, note } = body as { blocker_id: string; note?: string };

  if (!blocker_id) {
    return Response.json({ error: "blocker_id is required" }, { status: 400 });
  }

  try {
    await q(
      `update blockers set resolved_at = now(), resolution_note = $1 where id = $2`,
      [note ?? null, blocker_id]
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
