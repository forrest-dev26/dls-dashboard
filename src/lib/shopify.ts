const SHOP = process.env.SHOPIFY_STORE!;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN!;
const BASE = `https://${SHOP}/admin/api/2024-10`;
const TIMEOUT_MS = 5000;

export interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  total_price: string;
  financial_status: string;
  tags: string;
  line_items: Array<{ title: string; quantity: number }>;
  billing_address?: { city?: string; province?: string };
  customer?: { first_name?: string; last_name?: string };
}

const RECURRING_INDICATORS = [
  "appstle_subscription_recurring_orde",
  "appstle_subscription",
  "subscription_recurring",
];

export function isRecurringOrder(order: ShopifyOrder): boolean {
  const tags = (order.tags || "").toLowerCase();
  return RECURRING_INDICATORS.some((ind) => tags.includes(ind));
}

async function shopifyFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Shopify API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export interface OrdersResult {
  orders: ShopifyOrder[];
  newOrders: ShopifyOrder[];
  recurringOrders: ShopifyOrder[];
}

export async function fetchOrders(
  dateIso: string,
  tz = "-04:00"
): Promise<OrdersResult> {
  const start = `${dateIso}T00:00:00${tz}`;
  const end = `${dateIso}T23:59:59${tz}`;

  const params = new URLSearchParams({
    status: "any",
    created_at_min: start,
    created_at_max: end,
    limit: "250",
    fields: "id,name,created_at,total_price,tags,line_items,financial_status,billing_address,customer",
  });

  const data = await shopifyFetch<{ orders: ShopifyOrder[] }>(
    `/orders.json?${params}`
  );

  const orders = data.orders || [];
  const newOrders = orders.filter((o) => !isRecurringOrder(o));
  const recurringOrders = orders.filter((o) => isRecurringOrder(o));

  return { orders, newOrders, recurringOrders };
}

export interface RecentActivityItem {
  id: number;
  type: "order" | "payment" | "cancel";
  when: string;
  what: string;
  amount: string;
}

export async function fetchRecentActivity(limit = 8): Promise<RecentActivityItem[]> {
  const params = new URLSearchParams({
    status: "any",
    limit: String(limit * 2),
    fields: "id,name,created_at,total_price,tags,financial_status,billing_address,customer,line_items",
  });

  const data = await shopifyFetch<{ orders: ShopifyOrder[] }>(
    `/orders.json?${params}`
  );

  const orders = data.orders || [];
  const items: RecentActivityItem[] = [];

  for (const order of orders) {
    const isRecurring = isRecurringOrder(order);
    const name = order.customer
      ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
      : "Customer";
    const location = order.billing_address?.city
      ? `${order.billing_address.city}${order.billing_address.province ? ` ${order.billing_address.province}` : ""}`
      : "";
    const series =
      order.line_items?.[0]?.title?.includes("Salem")
        ? "The Salem Letters"
        : order.line_items?.[0]?.title?.includes("Titanic")
        ? "The Titanic Letters"
        : order.line_items?.[0]?.title?.includes("Asylum")
        ? "The Asylum Letters"
        : order.line_items?.[0]?.title || "Unknown";

    // Pass through the ISO timestamp; the ActivityFeed component handles relative formatting.
    // (Previously this lib returned a pre-formatted string like "5 hours ago", but the
    // ActivityFeed was then re-parsing it via `new Date(...)`, producing "Invalid Date".)
    const when = order.created_at;

    if (isRecurring) {
      items.push({
        id: order.id,
        type: "payment",
        when,
        what: `Recurring sub · ${series} · billing`,
        amount: `$${parseFloat(order.total_price).toFixed(2)}`,
      });
    } else if (
      order.financial_status === "refunded" ||
      order.financial_status === "voided"
    ) {
      items.push({
        id: order.id,
        type: "cancel",
        when,
        what: `Sub cancelled · ${series}`,
        amount: "—",
      });
    } else {
      items.push({
        id: order.id,
        type: "order",
        when,
        what: `New order · ${series}${name ? ` · ${name}` : ""}${location ? `, ${location}` : ""}`,
        amount: `$${parseFloat(order.total_price).toFixed(2)}`,
      });
    }

    if (items.length >= limit) break;
  }

  return items;
}

export interface OrderWindow {
  totalOrders: number;
  newOrders: number;
  recurringOrders: number;
  newRevenue: number;
}

export type SeriesKey = "Salem" | "Titanic" | "Asylum" | "Other";

export interface SeriesNewOrdersResult {
  date: string; // YYYY-MM-DD
  series: Record<SeriesKey, { count: number; orders: ShopifyOrder[] }>;
  total: number;
}

function getSeriesKey(order: ShopifyOrder): SeriesKey {
  const title = order.line_items?.[0]?.title || "";
  if (title.includes("Salem")) return "Salem";
  if (title.includes("Titanic")) return "Titanic";
  if (title.includes("Asylum")) return "Asylum";
  return "Other";
}

export async function fetchYesterdaysSeriesNewOrders(): Promise<SeriesNewOrdersResult> {
  const empty: SeriesNewOrdersResult = {
    date: "",
    series: {
      Salem: { count: 0, orders: [] },
      Titanic: { count: 0, orders: [] },
      Asylum: { count: 0, orders: [] },
      Other: { count: 0, orders: [] },
    },
    total: 0,
  };

  if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) {
    return empty;
  }

  // Yesterday in America/New_York
  const nowNy = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const yesterday = new Date(nowNy);
  yesterday.setDate(yesterday.getDate() - 1);
  const yyyy = yesterday.getFullYear();
  const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
  const dd = String(yesterday.getDate()).padStart(2, "0");
  const dateIso = `${yyyy}-${mm}-${dd}`;

  // Determine current ET offset (-04:00 EDT or -05:00 EST)
  const jan = new Date(yesterday.getFullYear(), 0, 1);
  const jul = new Date(yesterday.getFullYear(), 6, 1);
  const stdOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  );
  const isDst = nowNy.getTimezoneOffset() < stdOffset;
  const tz = isDst ? "-04:00" : "-05:00";

  const { newOrders } = await fetchOrders(dateIso, tz);

  const result: SeriesNewOrdersResult = { date: dateIso, series: empty.series, total: 0 };

  for (const order of newOrders) {
    const key = getSeriesKey(order);
    result.series[key].count++;
    result.series[key].orders.push(order);
  }

  result.total = newOrders.length;
  return result;
}

export async function fetchOrderWindow(days: number): Promise<OrderWindow> {
  const results: OrderWindow = {
    totalOrders: 0,
    newOrders: 0,
    recurringOrders: 0,
    newRevenue: 0,
  };

  const promises = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    const iso = d.toISOString().split("T")[0];
    return fetchOrders(iso);
  });

  const dayResults = await Promise.allSettled(promises);

  for (const r of dayResults) {
    if (r.status === "fulfilled") {
      results.totalOrders += r.value.orders.length;
      results.newOrders += r.value.newOrders.length;
      results.recurringOrders += r.value.recurringOrders.length;
      results.newRevenue += r.value.newOrders.reduce(
        (sum, o) => sum + parseFloat(o.total_price || "0"),
        0
      );
    }
  }

  return results;
}
