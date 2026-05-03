import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("running_tasks")
    .select("*")
    .eq("status", "running")
    .order("started_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ tasks: data });
}
