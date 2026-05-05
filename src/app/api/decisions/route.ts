import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "25", 10);

  try {
    let rows;
    if (search) {
      rows = await q(
        `select d.*, p.title as proposal_title
         from decisions d
         left join proposals p on d.proposal_id = p.id
         where d.note ilike $1 or d.decision ilike $1 or p.title ilike $1
         order by d.created_at desc
         offset $2 limit $3`,
        [`%${search}%`, offset, limit]
      );
    } else {
      rows = await q(
        `select d.*, p.title as proposal_title
         from decisions d
         left join proposals p on d.proposal_id = p.id
         order by d.created_at desc
         offset $1 limit $2`,
        [offset, limit]
      );
    }
    return Response.json({ decisions: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
