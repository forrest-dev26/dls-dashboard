import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const project = url.searchParams.get("project");
  const status = url.searchParams.get("status") ?? "pending";
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

  let query = supabase
    .from("proposals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);
  if (project) query = query.eq("project", project);

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ proposals: data });
}
