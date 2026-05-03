import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: proposalBody, project, category, context_url, metadata } = body as {
    title: string;
    body?: string;
    project?: string;
    category?: string;
    context_url?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      title,
      body: proposalBody ?? null,
      project: project ?? null,
      category: category ?? "recommendation",
      context_url: context_url ?? null,
      metadata: metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, proposal: data }, { status: 201 });
}
