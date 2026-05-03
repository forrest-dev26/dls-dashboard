export function requireOpenclawToken(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.OPENCLAW_WEBHOOK_TOKEN}`;
  return !!process.env.OPENCLAW_WEBHOOK_TOKEN && auth === expected;
}
