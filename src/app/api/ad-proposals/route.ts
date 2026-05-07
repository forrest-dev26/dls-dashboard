import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);

  try {
    const rows = status
      ? await q(
          `SELECT * FROM ad_proposals WHERE status = $1 ORDER BY created_at DESC LIMIT $2`,
          [status, limit],
        )
      : await q(
          `SELECT * FROM ad_proposals ORDER BY created_at DESC LIMIT $1`,
          [limit],
        );
    return Response.json({ proposals: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
