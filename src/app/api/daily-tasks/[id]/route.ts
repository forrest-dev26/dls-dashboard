import { q } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: string };

  if (!status) {
    return Response.json({ error: "status is required" }, { status: 400 });
  }

  const valid = ["pending", "approved", "started", "completed", "deferred", "killed"];
  if (!valid.includes(status)) {
    return Response.json({ error: `status must be one of: ${valid.join(", ")}` }, { status: 400 });
  }

  try {
    const setFields: string[] = ["status = $1"];
    const values: unknown[] = [status];

    if (status === "started") {
      setFields.push("started_at = now()");
    } else if (status === "completed") {
      setFields.push("completed_at = now()");
    }

    values.push(id);
    await q(
      `update daily_tasks set ${setFields.join(", ")} where id = $${values.length}`,
      values
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
