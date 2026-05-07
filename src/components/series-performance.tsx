import type { BlendedCacWindow } from "@/lib/metrics";
import type { CampaignSeriesSpend, SeriesKey } from "@/lib/meta";

const SERIES_CONFIG: Array<{ key: SeriesKey; name: string; headerClass: string }> = [
  { key: "Salem", name: "The Salem Letters", headerClass: "bg-series-salem" },
  { key: "Titanic", name: "The Titanic Letters", headerClass: "bg-series-titanic" },
  { key: "Asylum", name: "The Asylum Letters", headerClass: "bg-series-asylum" },
];

export function SeriesPerformance({
  window,
  campaignData,
}: {
  window: BlendedCacWindow | null;
  campaignData: Record<SeriesKey, CampaignSeriesSpend> | null;
}) {
  if (!window || !campaignData) {
    return (
      <div className="rounded-xl border border-line bg-white p-5 text-[13px] text-ink-3">
        Series data unavailable. Check API connections.
      </div>
    );
  }

  const totalSpend =
    campaignData.Salem.spend + campaignData.Titanic.spend + campaignData.Asylum.spend + campaignData.Other.spend;

  return (
    <div className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-1">
      {SERIES_CONFIG.map((s) => {
        const cd = campaignData[s.key];
        const spend = cd.spend;
        const spendShare = totalSpend > 0 ? spend / totalSpend : 0;
        // Proportional order estimate from total new orders based on spend share
        const orders = Math.round(window.totalNewOrders * spendShare);
        const blendedCac = orders > 0 ? spend / orders : 0;
        const tone =
          blendedCac < 50 ? "good" : blendedCac < 75 ? "warn" : "bad";
        const toneClass = {
          good: "text-good",
          warn: "text-warn",
          bad: "text-bad",
        }[tone];

        return (
          <div key={s.key} className="overflow-hidden rounded-xl border border-line bg-white">
            <div className={`px-4 pb-2.5 pt-3.5 text-white ${s.headerClass}`}>
              <h4 className="m-0 font-display text-base font-medium">{s.name}</h4>
              <div className="mt-0.5 text-[11px] text-white/70">
                {spend > 0 ? `$${spend.toFixed(0)} spend · ${orders} orders · live` : "No active campaigns"}
              </div>
            </div>
            <div className="px-4 py-3.5">
              <SeriesStat
                label="Blended CAC"
                value={spend > 0 ? `$${blendedCac.toFixed(2)}` : "—"}
                valueClass={spend > 0 ? toneClass : ""}
              />
              <SeriesStat label="Spend share" value={spend > 0 ? `${(spendShare * 100).toFixed(0)}%` : "—"} />
              <SeriesStat label="Impressions" value={cd.impressions > 0 ? cd.impressions.toLocaleString() : "—"} />
              <SeriesStat label="Clicks" value={cd.clicks > 0 ? cd.clicks.toLocaleString() : "—"} />
            </div>
          </div>
        );
      })}
    </div>
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
