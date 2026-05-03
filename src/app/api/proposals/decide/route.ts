import { supabase } from "@/lib/supabase";

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

  // Update the proposal
  const updateData: Record<string, unknown> = {
    status: decision,
    decided_at: new Date().toISOString(),
  };
  if (note) updateData.decision_note = note;
  if (decision === "snoozed") {
    updateData.snooze_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { error: updateError } = await supabase
    .from("proposals")
    .update(updateData)
    .eq("id", proposal_id);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  // Append to decisions log
  const { error: logError } = await supabase.from("decisions").insert({
    proposal_id,
    decision,
    note: note ?? null,
    decided_via: "dashboard",
  });

  if (logError) {
    return Response.json({ error: logError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
