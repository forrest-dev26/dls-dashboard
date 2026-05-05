export function KpiTile({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "good" | "bad" | "flat";
}) {
  const toneClass = {
    good: "text-good",
    bad: "text-bad",
    flat: "text-ink-3",
  }[deltaTone];

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-white px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className="font-display text-2xl font-medium leading-none tracking-tight text-ink">
        {value}
      </div>
      <div className={`text-[11px] ${toneClass}`}>{delta}</div>
    </div>
  );
}
