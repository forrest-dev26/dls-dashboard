import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get the latest body-man or morning briefing from today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("briefings")
    .select("*")
    .in("type", ["body-man", "morning"])
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ briefing: data });
}
