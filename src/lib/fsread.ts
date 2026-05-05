import { readFile, readdir } from "fs/promises";
import { join, resolve, relative } from "path";
import { homedir } from "os";

const WORKSPACE_ROOT = join(homedir(), ".openclaw", "workspace");
const ALLOWED_ROOTS = ["state/", "memory/", "playbooks/", "procedural/"];

function validatePath(relativePath: string): string {
  const full = resolve(WORKSPACE_ROOT, relativePath);
  const rel = relative(WORKSPACE_ROOT, full);

  // Block path traversal
  if (rel.startsWith("..") || resolve(full) !== full) {
    throw new Error("Path escapes workspace root");
  }

  // Check allow-list
  const allowed = ALLOWED_ROOTS.some((root) => rel.startsWith(root));
  if (!allowed) {
    throw new Error(`Path not in allowed roots: ${ALLOWED_ROOTS.join(", ")}`);
  }

  return full;
}

export async function readWorkspaceFile(relativePath: string): Promise<string> {
  const fullPath = validatePath(relativePath);
  return readFile(fullPath, "utf-8");
}

export async function listWorkspaceDir(relativePath: string): Promise<string[]> {
  const fullPath = validatePath(relativePath);
  const entries = await readdir(fullPath, { withFileTypes: true });
  return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
}
