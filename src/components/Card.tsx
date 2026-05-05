import { type ReactNode } from "react";

type CardVariant = "standard" | "soft" | "dark" | "alert";

const variantStyles: Record<CardVariant, string> = {
  standard:
    "bg-white border border-line rounded-lg shadow-sm",
  soft:
    "bg-bg-soft rounded-lg",
  dark:
    "relative overflow-hidden rounded-lg bg-gradient-to-b from-[#1F2421] to-[#2A3330] text-[#E8E3D6] shadow-lg",
  alert:
    "bg-warn-soft border border-warn/30 rounded-lg shadow-sm",
};

export function Card({
  variant = "standard",
  className = "",
  hover = false,
  children,
}: {
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  children: ReactNode;
}) {
  const hoverClass = hover
    ? "transition-all hover:-translate-y-0.5 hover:shadow-md"
    : "";

  return (
    <div className={`${variantStyles[variant]} ${hoverClass} ${className}`}>
      {variant === "dark" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(74,139,130,0.18),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(201,169,110,0.10),transparent_50%)]" />
      )}
      <div className={variant === "dark" ? "relative" : ""}>
        {children}
      </div>
    </div>
  );
}

/** Section header with uppercase label — used inside cards */
export function CardTitle({
  children,
  meta,
}: {
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[14px] font-semibold uppercase tracking-wide text-ink">
        {children}
      </h2>
      {meta && <div className="text-[12px] text-ink-3">{meta}</div>}
    </div>
  );
}
