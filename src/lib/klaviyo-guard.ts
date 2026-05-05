import { q } from "./db";

const BLOCKED_PATTERNS = [
  /\/api\/v[12]\/flows\/[^/]+\/status/i,
  /\/api\/v[12]\/flows\/[^/]+\/activate/i,
];

const BLOCKED_STATUSES = ["live", "active"];

export async function assertNoActivation(
  payload: Record<string, unknown> | null,
  endpoint: string,
  userAgent?: string
): Promise<void> {
  const patternMatch = BLOCKED_PATTERNS.some((p) => p.test(endpoint));
  const statusMatch = payload && typeof payload.status === "string" && BLOCKED_STATUSES.includes(payload.status);

  if (patternMatch || statusMatch) {
    const reason = patternMatch
      ? `Blocked endpoint pattern: ${endpoint}`
      : `Blocked payload status: ${payload?.status}`;

    await q(
      `insert into klaviyo_activation_attempts (endpoint, payload, refused_reason, user_agent) values ($1, $2, $3, $4)`,
      [endpoint, JSON.stringify(payload), reason, userAgent ?? null]
    );

    throw new Error(`KLAVIYO ACTIVATION BLOCKED: ${reason}`);
  }
}

export async function getRecentAttempts(limit = 10) {
  return q(
    `select * from klaviyo_activation_attempts order by attempted_at desc limit $1`,
    [limit]
  );
}
