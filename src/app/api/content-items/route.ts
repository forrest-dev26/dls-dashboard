import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get("project") ?? "dls";
  const status = url.searchParams.get("status");

  try {
    const rows = status
      ? await q(
          `select * from content_items where project = $1 and status = $2 order by created_at desc`,
          [project, status]
        )
      : await q(
          `select * from content_items where project = $1 order by created_at desc`,
          [project]
        );
    return Response.json({ items: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, body: itemBody, project, series, asset_type, platform, status, image_url, metadata } = body as {
    title: string;
    body?: string;
    project: string;
    series?: string;
    asset_type: string;
    platform?: string;
    status?: string;
    image_url?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !project || !asset_type) {
    return Response.json({ error: "title, project, and asset_type are required" }, { status: 400 });
  }

  try {
    const rows = await q(
      `insert into content_items (title, body, project, series, asset_type, platform, status, image_url, metadata)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`,
      [title, itemBody ?? null, project, series ?? null, asset_type, platform ?? null, status ?? "idea", image_url ?? null, JSON.stringify(metadata ?? {})]
    );
    return Response.json({ ok: true, item: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
