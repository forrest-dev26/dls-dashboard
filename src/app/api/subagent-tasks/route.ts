import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get("project");

  try {
    const rows = project
      ? await q(
          `select * from subagent_tasks where project = $1 and status in ('running','queued','suggested') order by case status when 'running' then 1 when 'queued' then 2 when 'suggested' then 3 end, created_at desc`,
          [project]
        )
      : await q(`select * from active_subagents`);
    return Response.json({ tasks: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
