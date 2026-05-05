import type { KlaviyoFlow } from "@/lib/klaviyo";

export function FlowStatus({
  flows,
  reachable = true,
  error,
}: {
  flows: KlaviyoFlow[];
  reachable?: boolean;
  error?: string;
}) {
  if (!reachable) {
    return (
      <div className="rounded-xl border border-line bg-white p-5 border-l-[3px] border-l-bad">
        <h3 className="m-0 mb-2 font-display text-base font-medium text-bad">
          Klaviyo flow status
        </h3>
        <div className="text-[13px] text-ink-2">
          Klaviyo API is currently unreachable.
        </div>
        {error && (
          <div className="mt-1 font-mono text-[11px] text-ink-3 break-all">
            {error.length > 180 ? `${error.slice(0, 180)}…` : error}
          </div>
        )}
        <div className="mt-2 text-[11px] italic text-ink-3">
          Cached flow status will resume once Klaviyo responds. Active flow KPI is shown as — not 0.
        </div>
      </div>
    );
  }

  if (flows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="m-0 mb-3 font-display text-base font-medium">Klaviyo flow status</h3>
        <div className="text-[13px] text-ink-3">
          Klaviyo returned an empty flow list. (Either there really are zero flows, or your
          API key has read scope but no flow access.)
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="m-0 font-display text-base font-medium">Klaviyo flow status</h3>
        <span className="text-[12px] text-ink-3">{flows.length} flows</span>
      </div>
      <div className="text-[12px]">
        {flows.slice(0, 12).map((f) => {
          const tone =
            f.status === "live" ? "good" : f.status === "draft" ? "gold" : "ink-3";
          const tagClass = {
            good: "bg-good-soft text-good",
            gold: "bg-gold-soft text-gold-deep",
            "ink-3": "bg-bg-soft text-ink-3",
          }[tone];

          return (
            <div
              key={f.id}
              className="flex items-center justify-between border-b border-line py-1.5 last:border-b-0"
            >
              <span className="text-ink-2 truncate">{f.name}</span>
              <span
                className={`ml-3 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] ${tagClass}`}
              >
                {f.status} · {f.actionCount} action{f.actionCount === 1 ? "" : "s"}
              </span>
            </div>
          );
        })}
        {flows.length > 12 && (
          <div className="mt-2 text-[11px] italic text-ink-3">
            ... {flows.length - 12} more flows
          </div>
        )}
      </div>
    </div>
  );
}
