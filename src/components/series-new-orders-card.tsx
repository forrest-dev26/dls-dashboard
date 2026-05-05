import { SeriesNewOrdersResult, SeriesKey } from "@/lib/shopify";

const SERIES_LABELS: Record<Exclude<SeriesKey, "Other">, string> = {
  Salem: "The Salem Letters",
  Titanic: "The Titanic Letters",
  Asylum: "The Asylum Letters",
};

export function SeriesNewOrdersCard({ data }: { data: SeriesNewOrdersResult }) {
  const dateLabel = data.date
    ? new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  const seriesKeys: Exclude<SeriesKey, "Other">[] = ["Salem", "Titanic", "Asylum"];

  return (
    <div className="rounded-xl border border-line bg-white px-5 py-4">
      <div className="mb-3.5">
        <h3 className="m-0 font-display text-base font-medium">New orders yesterday</h3>
        <span className="text-[11px] text-ink-3">{dateLabel}</span>
      </div>

      <div className="space-y-2">
        {seriesKeys.map((key) => {
          const { count, orders } = data.series[key];
          const latest = orders[0];
          const glimpse = latest?.customer
            ? `${latest.customer.first_name || ""} ${latest.customer.last_name || ""}`.trim()
            : null;

          return (
            <div
              key={key}
              className="flex items-center justify-between border-b border-line pb-2 last:border-b-0 last:pb-0"
            >
              <div>
                <div className="text-[13px] font-medium">{SERIES_LABELS[key]}</div>
                {glimpse && count > 0 && (
                  <div className="text-[11px] text-ink-3 mt-0.5">Latest: {glimpse}</div>
                )}
              </div>
              <div
                className={`font-display text-lg font-medium ${
                  count > 0 ? "text-ink" : "text-ink-3"
                }`}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <div className="text-[12px] font-medium uppercase tracking-wider text-ink-3">Total</div>
        <div className="font-display text-lg font-medium text-ink">{data.total}</div>
      </div>
    </div>
  );
}
