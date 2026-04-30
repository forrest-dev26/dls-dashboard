// Blended CAC and related metrics
// Ported from ~/.openclaw/workspace/manhattan-project/blended-cac.py

import { fetchMetaSpend } from "./meta";
import { fetchOrders } from "./shopify";

export interface BlendedCacResult {
  date: string;
  blendedCac: number | null;
  metaSpendUsd: number;
  newOrders: number;
  recurringOrders: number;
  newRevenueUsd: number;
  spendToRevenueRatio: number | null;
}

export interface BlendedCacWindow {
  windowDays: number;
  totalSpendUsd: number;
  totalNewOrders: number;
  totalNewRevenueUsd: number;
  blendedCacWindow: number | null;
  rows: BlendedCacResult[];
}

function isoDay(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function computeBlendedCacForDay(dateIso: string): Promise<BlendedCacResult> {
  const [spend, ordersResult] = await Promise.all([
    fetchMetaSpend(dateIso, dateIso).catch(() => ({ spendUsd: 0, impressions: 0, clicks: 0 })),
    fetchOrders(dateIso).catch(() => ({ orders: [], newOrders: [], recurringOrders: [] })),
  ]);

  const newOrders = ordersResult.newOrders.length;
  const newRevenue = ordersResult.newOrders.reduce(
    (s, o) => s + parseFloat(o.total_price || "0"),
    0
  );

  return {
    date: dateIso,
    blendedCac: newOrders > 0 ? +(spend.spendUsd / newOrders).toFixed(2) : null,
    metaSpendUsd: +spend.spendUsd.toFixed(2),
    newOrders,
    recurringOrders: ordersResult.recurringOrders.length,
    newRevenueUsd: +newRevenue.toFixed(2),
    spendToRevenueRatio: newRevenue > 0 ? +(spend.spendUsd / newRevenue).toFixed(3) : null,
  };
}

export async function computeBlendedCacWindow(days: number, offsetDays = 1): Promise<BlendedCacWindow> {
  // offsetDays: how many days back the window ENDS
  // offsetDays=1 means window ends yesterday (last 7 days = 1..7)
  // offsetDays=8 means window ends 8 days ago (prior 7 days = 8..14)
  const today = new Date();
  const dates: string[] = [];
  for (let i = offsetDays; i < offsetDays + days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(isoDay(d));
  }

  const rows = await Promise.all(dates.map((d) => computeBlendedCacForDay(d)));

  const totalSpend = rows.reduce((s, r) => s + r.metaSpendUsd, 0);
  const totalNewOrders = rows.reduce((s, r) => s + r.newOrders, 0);
  const totalNewRevenue = rows.reduce((s, r) => s + r.newRevenueUsd, 0);

  return {
    windowDays: days,
    totalSpendUsd: +totalSpend.toFixed(2),
    totalNewOrders,
    totalNewRevenueUsd: +totalNewRevenue.toFixed(2),
    blendedCacWindow: totalNewOrders > 0 ? +(totalSpend / totalNewOrders).toFixed(2) : null,
    rows,
  };
}

export async function computeYesterdayCac(): Promise<BlendedCacResult> {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return computeBlendedCacForDay(isoDay(y));
}

export interface DashboardMetrics {
  yesterdayCac: BlendedCacResult;
  cac7d: BlendedCacWindow;
  cacPrior7d: BlendedCacWindow;
  todaySpendUsd: number;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [yesterdayCac, cac7d, cacPrior7d] = await Promise.all([
    computeYesterdayCac(),
    computeBlendedCacWindow(7, 1),
    computeBlendedCacWindow(7, 8),
  ]);

  const today_iso = isoDay(new Date());
  const todaySpend = await fetchMetaSpend(today_iso, today_iso).catch(() => ({ spendUsd: 0 }));

  return {
    yesterdayCac,
    cac7d,
    cacPrior7d,
    todaySpendUsd: +todaySpend.spendUsd.toFixed(2),
  };
}
