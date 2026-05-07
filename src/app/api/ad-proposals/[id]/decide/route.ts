import { q } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { decision, edited_fields } = body as {
    decision: "approve" | "reject" | "edit";
    edited_fields?: { headline?: string; primary_copy?: string; cta?: string };
  };

  if (!decision || !["approve", "reject", "edit"].includes(decision)) {
    return Response.json(
      { error: "decision must be approve, reject, or edit" },
      { status: 400 },
    );
  }

  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    edit: "edited",
  };

  try {
    if (decision === "edit" && edited_fields) {
      const sets: string[] = [`status = 'edited'`, `decided_at = now()`, `decided_by = 'christopher'`];
      const vals: unknown[] = [];
      let idx = 1;

      if (edited_fields.headline) {
        sets.push(`headline = $${idx++}`);
        vals.push(edited_fields.headline);
      }
      if (edited_fields.primary_copy) {
        sets.push(`primary_copy = $${idx++}`);
        vals.push(edited_fields.primary_copy);
      }
      if (edited_fields.cta) {
        sets.push(`cta = $${idx++}`);
        vals.push(edited_fields.cta);
      }

      vals.push(id);
      await q(`UPDATE ad_proposals SET ${sets.join(", ")} WHERE id = $${idx}`, vals);
    } else {
      await q(
        `UPDATE ad_proposals SET status = $1, decided_at = now(), decided_by = 'christopher' WHERE id = $2`,
        [statusMap[decision], id],
      );
    }

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
