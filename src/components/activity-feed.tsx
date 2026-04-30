import type { RecentActivityItem } from "@/lib/shopify";

export function ActivityFeed({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="rounded-md border border-line bg-bg-elev p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="m-0 font-display text-base font-medium">Recent activity</h3>
        <span className="text-[12px] text-ink-3">last 24h · {items.length} events</span>
      </div>

      {items.length === 0 ? (
        <div className="py-4 text-[13px] text-ink-3">No activity in the last 24 hours.</div>
      ) : (
        <div className="flex flex-col">
          {items.map((it) => (
            <FeedRow key={String(it.id)} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedRow({ item }: { item: RecentActivityItem }) {
  const iconClass = {
    order: "bg-good-soft text-good",
    payment: "bg-gold-soft text-gold-deep",
    cancel: "bg-bad-soft text-bad",
  }[item.type];

  const iconChar = {
    order: "🆕",
    payment: "↻",
    cancel: "×",
  }[item.type];

  // Convert ISO timestamp to "X ago"
  const when = formatRelative(item.when);

  return (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-b-0 text-[13px]">
      <div
        className={`flex h-6.5 w-6.5 flex-shrink-0 items-center justify-center rounded-md ${iconClass}`}
        style={{ width: "26px", height: "26px" }}
      >
        {iconChar}
      </div>
      <div className="flex-1">
        <div className="text-[11px] text-ink-3">{when}</div>
        <div className="mt-0.5 text-ink">{item.what}</div>
      </div>
      <div className="whitespace-nowrap font-mono text-[12px] text-ink-2">
        {item.amount || "—"}
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - then.getTime();
  const min = Math.floor(ms / 60000);
  const hr = Math.floor(min / 60);

  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString();
}
