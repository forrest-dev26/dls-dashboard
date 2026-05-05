import { q } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: string };

  if (!status) {
    return Response.json({ error: "status is required" }, { status: 400 });
  }

  try {
    const setFields: string[] = ["status = $1"];
    if (status === "running") setFields.push("started_at = now()");
    if (["completed", "failed", "killed"].includes(status)) setFields.push("ended_at = now()");

    await q(
      `update subagent_tasks set ${setFields.join(", ")} where id = $2`,
      [status, id]
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
