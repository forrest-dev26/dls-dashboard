import { q } from "@/lib/db";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const rows = await q(
      `select * from briefings where type in ('body-man', 'morning') and created_at >= $1 order by created_at desc limit 1`,
      [todayStart.toISOString()]
    );
    return Response.json({ briefing: rows[0] ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
