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
    <div className="flex min-h-screen">
      <main className="flex-1 mx-auto max-w-[1100px] px-8 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="m-0 text-[28px] font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] text-ink-3">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
