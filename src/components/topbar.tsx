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
    <div className="mb-8 flex items-center justify-between max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3">
      <div>
        <h1 className="m-0 text-[28px] font-semibold tracking-tight text-ink">
          {greeting}
        </h1>
        <div className="mt-1.5 text-[14px] text-ink-3">{today} · Lakeland, FL</div>
      </div>
      <div className="flex items-center gap-3 text-[13px] text-ink-3">
        <span className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiHealth === "ok" ? "bg-sage" : "bg-gold"
            }`}
          ></span>
          {apiHealth === "ok" ? "All systems running" : "Some APIs degraded"}
        </span>
        <span className="rounded-full border border-line bg-white px-3 py-1.5">
          Spend today · ${todaySpend.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
