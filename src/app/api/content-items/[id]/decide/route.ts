import { q } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { decision } = body as { decision: string };

  if (!decision) {
    return Response.json({ error: "decision is required" }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    approved: "reviewed",
    rejected: "rejected",
    edit: "drafted",
  };

  const newStatus = statusMap[decision];
  if (!newStatus) {
    return Response.json({ error: "decision must be approved, rejected, or edit" }, { status: 400 });
  }

  try {
    await q(`update content_items set status = $1 where id = $2`, [newStatus, id]);
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
