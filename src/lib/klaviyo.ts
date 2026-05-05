const TOKEN = process.env.KLAVIYO_PRIVATE_API_KEY;
const BASE = "https://a.klaviyo.com/api";
const REVISION = "2025-10-15";
// Klaviyo's CDN can be slow to respond on /flows/ during incidents; bumping the
// timeout from 5s -> 8s keeps the page snappy without giving up on transient blips.
const TIMEOUT_MS = 8000;

async function klaviyoFetch<T>(path: string): Promise<T> {
  if (!TOKEN) {
    throw new Error(
      "Klaviyo API: KLAVIYO_PRIVATE_API_KEY env var is missing.",
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        Authorization: `Klaviyo-API-Key ${TOKEN}`,
        revision: REVISION,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      // Surface the upstream status code in the error so callers (and the
      // server log) can distinguish auth failures (401/403), rate limits (429),
      // and Cloudflare upstream timeouts (5xx) from a missing key.
      throw new Error(
        `Klaviyo API ${res.status} ${res.statusText}: ${body.slice(0, 200)}`,
      );
    }

    return res.json() as Promise<T>;
  } catch (err) {
    // Log so the dashboard's launchd error log captures upstream issues. Without
    // this, Promise.allSettled in the page swallowed the rejection and the UI
    // silently rendered "0 flows" — indistinguishable from a real zero.
    if (err instanceof Error && err.name === "AbortError") {
      console.error(
        `[klaviyo] timeout after ${TIMEOUT_MS}ms hitting ${BASE}${path}`,
      );
    } else {
      console.error(`[klaviyo] ${BASE}${path} ->`, err);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface KlaviyoFlow {
  id: string;
  name: string;
  status: string;
  actionCount: number;
}

/**
 * Fetch result that distinguishes "Klaviyo is up but has zero flows" from
 * "Klaviyo couldn't be reached / auth failed." Callers used to see only `[]`
 * and could not tell the difference, so the DLS page silently rendered
 * "0 flows · 0 in draft" during outages.
 */
export interface KlaviyoFlowsResult {
  ok: boolean;
  flows: KlaviyoFlow[];
  error?: string;
}

export async function fetchFlows(): Promise<KlaviyoFlow[]> {
  const data = await klaviyoFetch<{
    data: Array<{
      id: string;
      attributes: {
        name: string;
        status: string;
        action_ids_included: string[];
      };
    }>;
  }>("/flows/?fields[flow]=name,status,action_ids_included");

  return (data.data || []).map((f) => ({
    id: f.id,
    name: f.attributes.name,
    status: f.attributes.status,
    actionCount: f.attributes.action_ids_included?.length || 0,
  }));
}

/**
 * Reachability-aware variant. Use this from server components that want to
 * show an explicit "Klaviyo unreachable" state instead of an ambiguous zero.
 */
export async function fetchFlowsResult(): Promise<KlaviyoFlowsResult> {
  try {
    const flows = await fetchFlows();
    return { ok: true, flows };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, flows: [], error: message };
  }
}
