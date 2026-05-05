import { q } from "@/lib/db";

export async function GET() {
  try {
    const rows = await q(`select * from pulse`);
    return Response.json({ pulse: rows[0] ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
