import { requireOpenclawToken } from "@/lib/openclaw-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, task_type, session_key, metadata } = body as {
    label: string;
    task_type: string;
    session_key?: string;
    metadata?: Record<string, unknown>;
  };

  if (!label || !task_type) {
    return Response.json({ error: "label and task_type are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("running_tasks")
    .insert({
      label,
      task_type,
      session_key: session_key ?? null,
      metadata: metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, task: data }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!requireOpenclawToken(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { session_key, status, metadata } = body as {
    session_key: string;
    status: string;
    metadata?: Record<string, unknown>;
  };

  if (!session_key || !status) {
    return Response.json({ error: "session_key and status are required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "completed" || status === "failed" || status === "killed") {
    updateData.ended_at = new Date().toISOString();
  }
  if (metadata) updateData.metadata = metadata;

  const { error } = await supabase
    .from("running_tasks")
    .update(updateData)
    .eq("session_key", session_key);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
