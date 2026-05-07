import { q } from "@/lib/db";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const VALID_SERIES = ["salem", "titanic", "asylum"];
const PUBLISHABLE = ["reviewed", "scheduled"];

interface ContentRow {
  id: string;
  status: string;
  series: string | null;
  body: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
}

function runPython(script: string, stdin: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = execFile("python3", [script], { timeout: 30_000 }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout, stderr });
    });
    proc.stdin?.write(stdin);
    proc.stdin?.end();
  });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Load content item
  const rows = await q<ContentRow>(`SELECT id, status, series, body, image_url, metadata FROM content_items WHERE id = $1`, [id]);
  if (rows.length === 0) {
    return Response.json({ error: "Content item not found" }, { status: 404, headers: { "Content-Type": "application/json" } });
  }
  const item = rows[0];

  // 2. Status check
  if (!PUBLISHABLE.includes(item.status)) {
    return Response.json({ error: `Cannot publish from status '${item.status}'. Must be reviewed or scheduled.` }, { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // 3. Series check
  if (!item.series || !VALID_SERIES.includes(item.series)) {
    return Response.json({ error: `Series '${item.series}' is not a supported Facebook page.` }, { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const body = item.body ?? "";

  // 4. Audit
  let auditResult: { clean: boolean; violations: unknown[]; error?: string };
  try {
    const { stdout } = await runPython("scripts/social_publish/audit.py", body);
    auditResult = JSON.parse(stdout);
  } catch {
    return Response.json({ error: "Audit script failed — refusing to publish." }, { status: 422, headers: { "Content-Type": "application/json" } });
  }

  if (!auditResult.clean) {
    return Response.json(
      { error: "Audit violations found", violations: auditResult.violations },
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

  // 5. Resolve image
  let imagePath: string | null = null;
  let tempImagePath: string | null = null;

  if (item.image_url) {
    if (item.image_url.startsWith("http://") || item.image_url.startsWith("https://")) {
      // Download to tempfile
      try {
        const resp = await fetch(item.image_url);
        if (!resp.ok) {
          return Response.json({ error: `Failed to download image: HTTP ${resp.status}` }, { status: 422, headers: { "Content-Type": "application/json" } });
        }
        const buf = Buffer.from(await resp.arrayBuffer());
        const dir = mkdtempSync(join(tmpdir(), "dls-img-"));
        tempImagePath = join(dir, "image.jpg");
        writeFileSync(tempImagePath, buf);
        imagePath = tempImagePath;
      } catch (e) {
        return Response.json({ error: `Image download failed: ${e instanceof Error ? e.message : String(e)}` }, { status: 422, headers: { "Content-Type": "application/json" } });
      }
    } else {
      // Local path
      if (!existsSync(item.image_url)) {
        return Response.json({ error: `Image file not found: ${item.image_url}` }, { status: 422, headers: { "Content-Type": "application/json" } });
      }
      imagePath = item.image_url;
    }
  }

  // 6. Publish via Python helper
  const publishInput = JSON.stringify({ series: item.series, body, image_path: imagePath });
  let publishResult: { ok: boolean; fb_post_id?: string; fb_url?: string; error?: string };

  try {
    const { stdout, stderr } = await runPython("scripts/social_publish/publish.py", publishInput);
    if (stderr) console.error("[publish.py stderr]", stderr);
    publishResult = JSON.parse(stdout);
  } catch (e) {
    console.error("[publish] Script execution failed:", e);
    return Response.json({ error: "Publish script failed" }, { status: 502, headers: { "Content-Type": "application/json" } });
  } finally {
    // Clean up temp image
    if (tempImagePath) {
      try { unlinkSync(tempImagePath); } catch { /* ignore */ }
    }
  }

  // 8. Handle Facebook API failure
  if (!publishResult.ok) {
    console.error("[publish] Facebook error:", publishResult.error);
    return Response.json({ error: publishResult.error ?? "Facebook publish failed" }, { status: 502, headers: { "Content-Type": "application/json" } });
  }

  // 7. Success — update DB
  const now = new Date().toISOString();
  const pageIds: Record<string, string> = { salem: "863547700180592", titanic: "911709382022732", asylum: "882283024959246" };
  const mergedMeta = {
    ...(item.metadata ?? {}),
    published_at: now,
    fb_post_id: publishResult.fb_post_id,
    fb_url: publishResult.fb_url,
    fb_page_id: pageIds[item.series],
  };

  await q(`UPDATE content_items SET status = 'published', metadata = $1 WHERE id = $2`, [JSON.stringify(mergedMeta), id]);
  await q(
    `INSERT INTO decisions (decision, note, decided_via) VALUES ($1, $2, $3)`,
    ["content_publish", JSON.stringify(mergedMeta), "dashboard"],
  );

  return Response.json(
    { ok: true, fb_post_id: publishResult.fb_post_id, fb_url: publishResult.fb_url },
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
