"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", href: "/" },
  { label: "DLS", href: "/projects/dls" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-line bg-bg-soft px-6 pt-2">
      {tabs.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors ${
              active
                ? "text-ink border-b-2 border-burgundy -mb-px"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <div className="ml-auto flex items-center gap-2.5 pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink font-display text-sm font-semibold italic tracking-wide text-gold">
          D
        </div>
        <span className="text-[12px] font-medium text-ink-2">Dead Letter Studio</span>
      </div>
    </nav>
  );
}
