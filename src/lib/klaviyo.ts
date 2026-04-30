const TOKEN = process.env.KLAVIYO_PRIVATE_API_KEY!;
const BASE = "https://a.klaviyo.com/api";
const REVISION = "2025-10-15";
const TIMEOUT_MS = 5000;

async function klaviyoFetch<T>(path: string): Promise<T> {
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
      throw new Error(`Klaviyo API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
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
