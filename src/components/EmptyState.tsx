import { type ReactNode } from "react";

export function EmptyState({
  icon,
  message,
  phase,
}: {
  icon?: ReactNode;
  message: string;
  phase?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line-2 py-8 px-6 text-center">
      {icon ? (
        <span className="mb-2 text-ink-4">{icon}</span>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2 text-ink-4"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )}
      <p className="text-[13px] text-ink-3">{message}</p>
      {phase && (
        <span className="mt-1.5 text-[11px] font-medium text-ink-4">{phase}</span>
      )}
    </div>
  );
}
