import { computeYesterdayCac, computeBlendedCacWindow } from "./metrics";
import { fetchOrderWindow } from "./shopify";
import { fetchTodaySpend } from "./meta";
import { fetchFlows } from "./klaviyo";

export interface Briefing {
  bullets: string[];
}

export async function getBriefing(): Promise<Briefing> {
  const bullets: string[] = [];

  const [cacResult, cac7dResult, todaySpend, flows, todayOrders, weekOrders] =
    await Promise.allSettled([
      computeYesterdayCac(),
      computeBlendedCacWindow(7),
      fetchTodaySpend(),
      fetchFlows(),
      fetchOrderWindow(1),
      fetchOrderWindow(7),
    ]);

  // CAC checks (yesterday)
  if (cacResult.status === "fulfilled") {
    const cac = cacResult.value;
    if (cac.blendedCac !== null) {
      if (cac.blendedCac > 55) {
        bullets.push(
          `Blended CAC ran $${cac.blendedCac.toFixed(2)} yesterday \u2014 above the $55 ceiling. Audit Meta delivery.`
        );
      } else if (cac.blendedCac < 30) {
        bullets.push(
          `Blended CAC ran $${cac.blendedCac.toFixed(2)} \u2014 well under target. Consider scaling spend.`
        );
      } else {
        bullets.push(
          `Yesterday\u2019s Blended CAC was $${cac.blendedCac.toFixed(2)} on $${cac.metaSpendUsd.toFixed(0)} spend (${cac.newOrders} new orders).`
        );
      }
    }

    if (cac.recurringOrders > 0) {
      bullets.push(
        `${cac.recurringOrders} recurring subscription renewal${cac.recurringOrders !== 1 ? "s" : ""} yesterday.`
      );
    }
  }

  // 7-day CAC context
  if (cac7dResult.status === "fulfilled") {
    const cac7d = cac7dResult.value;
    if (cac7d.blendedCacWindow !== null && cac7d.blendedCacWindow > 55) {
      bullets.push(
        `7-day Blended CAC is $${cac7d.blendedCacWindow.toFixed(2)} over $${cac7d.totalSpendUsd.toFixed(0)} spend (${cac7d.totalNewOrders} new orders).`
      );
    }
  }

  // Today's orders vs 7-day average
  if (
    todayOrders.status === "fulfilled" &&
    weekOrders.status === "fulfilled"
  ) {
    const todayCount = todayOrders.value.newOrders;
    const dailyAvg = weekOrders.value.newOrders / 7;
    if (dailyAvg > 0 && todayCount > dailyAvg) {
      const pct = Math.round(((todayCount - dailyAvg) / dailyAvg) * 100);
      bullets.push(
        `${todayCount} new orders today \u2014 running ${pct}% above the 7-day daily average.`
      );
    }
  }

  // Klaviyo flow status
  if (flows.status === "fulfilled") {
    for (const flow of flows.value) {
      const s = flow.status.toLowerCase();
      if (s === "draft" || s === "manual") {
        bullets.push(
          `Flow \u201C${flow.name}\u201D is ${s} \u2014 review activation.`
        );
      }
    }
  }

  // Today's spend
  if (todaySpend.status === "fulfilled" && todaySpend.value > 0) {
    bullets.push(
      `Meta spend so far today: $${todaySpend.value.toFixed(2)}.`
    );
  }

  // Fallback
  if (bullets.length === 0) {
    bullets.push("All KPIs within target range.");
  }

  return { bullets };
}
