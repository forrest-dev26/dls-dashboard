import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { blocker_id, note } = body as { blocker_id: string; note?: string };

  if (!blocker_id) {
    return Response.json({ error: "blocker_id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("blockers")
    .update({
      resolved_at: new Date().toISOString(),
      resolution_note: note ?? null,
    })
    .eq("id", blocker_id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
