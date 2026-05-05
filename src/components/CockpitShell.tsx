"use client";

export function CockpitShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      <main className="flex-1 mx-auto max-w-[1100px] px-6 pt-6 pb-12">
        <div className="mb-6">
          <h1 className="m-0 font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>}
        </div>
        {children}
      </main>

      {/* Chat sidebar slot — Phase 3 */}
      <aside className="hidden w-[320px] shrink-0 border-l border-line bg-bg-soft xl:block">
        <div className="flex h-full items-center justify-center p-6">
          <p className="text-center text-[12px] text-ink-4">
            Ask Sarah sidebar — Phase 3
          </p>
        </div>
      </aside>
    </div>
  );
}
