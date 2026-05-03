import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: blockerBody, project } = body as {
    title: string;
    body?: string;
    project: string;
  };

  if (!title || !project) {
    return Response.json({ error: "title and project are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("blockers")
    .insert({
      title,
      body: blockerBody ?? null,
      project,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, blocker: data }, { status: 201 });
}
