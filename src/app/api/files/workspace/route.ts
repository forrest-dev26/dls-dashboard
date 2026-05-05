import { readWorkspaceFile } from "@/lib/fsread";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return Response.json({ error: "path query parameter is required" }, { status: 400 });
  }

  try {
    const content = await readWorkspaceFile(path);
    return Response.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
