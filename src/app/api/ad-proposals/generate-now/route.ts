import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { resolve } from "node:path";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const series = (body as { series?: string }).series;

  const projectRoot = resolve(homedir(), "Code/dls-dashboard");
  const env: NodeJS.ProcessEnv = { ...process.env };

  if (series && ["salem", "titanic", "asylum"].includes(series)) {
    env.DLS_AD_SERIES = series;
  }

  try {
    const output = await new Promise<string>((res, rej) => {
      execFile(
        "python3",
        ["scripts/ad_engine/generate_daily_ad.py"],
        { cwd: projectRoot, env, timeout: 120_000 },
        (err: Error | null, stdout: string, stderr: string) => {
          if (err) {
            rej(new Error(stderr || err.message));
            return;
          }
          res(stdout);
        },
      );
    });

    const result = JSON.parse(output.trim());
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
