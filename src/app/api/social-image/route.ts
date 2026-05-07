import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const ALLOWED_PREFIXES = [
  resolve(homedir(), ".openclaw/workspace/manhattan-project/social-engine/content-library"),
  resolve(homedir(), "Code/dls-dashboard/public/ad-images"),
];

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("path");

  if (!raw) {
    return new Response("Missing path parameter", { status: 400 });
  }

  const resolved = resolve(raw);

  // Security: must be inside an allowed directory, no traversal
  const allowed = ALLOWED_PREFIXES.some((prefix) => resolved.startsWith(prefix + "/"));
  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!existsSync(resolved)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = resolved.slice(resolved.lastIndexOf(".")).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  const data = await readFile(resolved);

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
