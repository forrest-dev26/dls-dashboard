import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const project = url.searchParams.get("project");
  const status = url.searchParams.get("status") ?? "pending";
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

  const conditions: string[] = ["status = $1"];
  const params: unknown[] = [status];
  let idx = 2;

  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (project) {
    conditions.push(`project = $${idx++}`);
    params.push(project);
  }

  params.push(limit);
  const sql = `select * from proposals where ${conditions.join(" and ")} order by created_at desc limit $${idx}`;

  try {
    const rows = await q(sql, params);
    return Response.json({ proposals: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
