import { q } from "@/lib/db";

export async function GET() {
  try {
    const rows = await q(`select * from pillar_state order by pillar`);
    return Response.json({ pillars: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
