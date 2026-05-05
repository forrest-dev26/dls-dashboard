import { q } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { proposal_id, decision, note } = body as {
    proposal_id: string;
    decision: string;
    note?: string;
  };

  if (!proposal_id || !decision) {
    return Response.json({ error: "proposal_id and decision required" }, { status: 400 });
  }

  const validDecisions = ["approved", "rejected", "snoozed", "revising"];
  if (!validDecisions.includes(decision)) {
    return Response.json({ error: `decision must be one of: ${validDecisions.join(", ")}` }, { status: 400 });
  }

  try {
    // Update the proposal
    const snoozeUntil = decision === "snoozed"
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await q(
      `update proposals set status = $1, decided_at = now(), decision_note = $2, snooze_until = $3 where id = $4`,
      [decision, note ?? null, snoozeUntil, proposal_id]
    );

    // Append to decisions log
    await q(
      `insert into decisions (proposal_id, decision, note, decided_via) values ($1, $2, $3, 'dashboard')`,
      [proposal_id, decision, note ?? null]
    );

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
