const ACCOUNT = process.env.META_AD_ACCOUNT_ID!;
const TOKEN = process.env.META_ACCESS_TOKEN!;
const BASE = "https://graph.facebook.com/v21.0";
const TIMEOUT_MS = 5000;

async function metaFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("access_token", TOKEN);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Meta API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export interface MetaSpend {
  spendUsd: number;
  impressions: number;
  clicks: number;
}

export async function fetchMetaSpend(since: string, until: string): Promise<MetaSpend> {
  const data = await metaFetch<{ data: Array<{ spend: string; impressions: string; clicks: string }> }>(
    `/${ACCOUNT}/insights`,
    {
      fields: "spend,impressions,clicks",
      "time_range[since]": since,
      "time_range[until]": until,
    }
  );

  const row = data.data?.[0];
  if (!row) {
    return { spendUsd: 0, impressions: 0, clicks: 0 };
  }

  return {
    spendUsd: parseFloat(row.spend || "0"),
    impressions: parseInt(row.impressions || "0", 10),
    clicks: parseInt(row.clicks || "0", 10),
  };
}

export async function fetchMetaSpendWindow(days: number): Promise<MetaSpend> {
  const until = new Date();
  until.setDate(until.getDate() - 1);
  const since = new Date(until);
  since.setDate(since.getDate() - (days - 1));

  const sinceStr = since.toISOString().split("T")[0];
  const untilStr = until.toISOString().split("T")[0];

  return fetchMetaSpend(sinceStr, untilStr);
}

export async function fetchTodaySpend(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const result = await fetchMetaSpend(today, today);
    return result.spendUsd;
  } catch {
    return 0;
  }
}
