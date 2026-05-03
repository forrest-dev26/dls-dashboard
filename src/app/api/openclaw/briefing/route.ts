import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: briefingBody, type, metadata } = body as {
    title: string;
    body: string;
    type: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !briefingBody || !type) {
    return Response.json({ error: "title, body, and type are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("briefings")
    .insert({
      title,
      body: briefingBody,
      type,
      metadata: metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, briefing: data }, { status: 201 });
}
