export function Topbar({
  todaySpend,
  apiHealth,
}: {
  todaySpend: number;
  apiHealth: "ok" | "degraded";
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning, Christopher." : hour < 17 ? "Good afternoon, Christopher." : "Good evening, Christopher.";

  return (
    <div className="mb-7 flex items-center justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3">
      <div>
        <h1 className="m-0 font-display text-[26px] font-medium tracking-tight">
          {greeting}
        </h1>
        <div className="mt-0.5 text-[13px] text-ink-3">{today} · Lakeland, FL</div>
      </div>
      <div className="flex items-center gap-4 text-[13px] text-ink-3">
        <span className="flex items-center gap-1.5 rounded-full border border-line bg-bg-elev px-2.5 py-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiHealth === "ok" ? "bg-good" : "bg-warn"
            }`}
          ></span>
          {apiHealth === "ok" ? "All systems running" : "Some APIs degraded"}
        </span>
        <span className="rounded-full border border-line bg-bg-elev px-2.5 py-1">
          Spend day so far · ${todaySpend.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
