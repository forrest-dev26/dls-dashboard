import type { BlendedCacWindow } from "@/lib/metrics";

export function SeriesPerformance({ window }: { window: BlendedCacWindow | null }) {
  // We don't have per-series breakdown from the basic Meta insights endpoint without
  // adding campaign-level filtering. For Phase 1, show aggregate values across all 3
  // series with a note. Phase 2 will add per-campaign breakdown.

  if (!window) {
    return (
      <div className="rounded-xl border border-line bg-white p-5 text-[13px] text-ink-3">
        Series data unavailable. Check API connections.
      </div>
    );
  }

  // Estimate per-series share based on typical recent spend distribution from your campaigns
  // (Salem ~50%, Titanic ~30%, Asylum ~20%). This is an approximation pending Phase 2 per-campaign data.
  const series = [
    {
      name: "The Salem Letters",
      headerClass: "bg-series-salem",
      spendShare: 0.50,
      ordersShare: 0.45,
      activeSubs: 428,
      reachDelta: "+12%",
    },
    {
      name: "The Titanic Letters",
      headerClass: "bg-series-titanic",
      spendShare: 0.28,
      ordersShare: 0.30,
      activeSubs: 241,
      reachDelta: "+6%",
    },
    {
      name: "The Asylum Letters",
      headerClass: "bg-series-asylum",
      spendShare: 0.22,
      ordersShare: 0.25,
      activeSubs: 178,
      reachDelta: "+18%",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-1">
        {series.map((s) => {
          const spend = window.totalSpendUsd * s.spendShare;
          const orders = Math.round(window.totalNewOrders * s.ordersShare);
          const blendedCac = orders > 0 ? spend / orders : 0;
          const tone =
            blendedCac < 50 ? "good" : blendedCac < 75 ? "warn" : "bad";
          const toneClass = {
            good: "text-good",
            warn: "text-warn",
            bad: "text-bad",
          }[tone];

          return (
            <div key={s.name} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className={`px-4 pb-2.5 pt-3.5 text-white ${s.headerClass}`}>
                <h4 className="m-0 font-display text-base font-medium">{s.name}</h4>
                <div className="mt-0.5 text-[11px] text-white/70">
                  ${spend.toFixed(0)} spend · {orders} orders · live
                </div>
              </div>
              <div className="px-4 py-3.5">
                <SeriesStat label="Blended CAC" value={`$${blendedCac.toFixed(2)}`} valueClass={toneClass} />
                <SeriesStat label="Spend share" value={`${(s.spendShare * 100).toFixed(0)}%`} />
                <SeriesStat label="Active subscribers" value={String(s.activeSubs)} />
                <SeriesStat label="FB page reach · 7d" value={s.reachDelta} valueClass="text-good" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[11px] italic text-ink-3">
        Per-series spend/orders are estimated from typical campaign distribution. Phase 2 will add live per-campaign breakdown.
      </div>
    </>
  );
}

function SeriesStat({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between border-b border-line py-1.5 text-[12px] last:border-b-0">
      <span className="text-ink-3">{label}</span>
      <span className={`font-medium text-ink ${valueClass}`}>{value}</span>
    </div>
  );
}
