"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryTabs = [
  { label: "Home", href: "/" },
  { label: "Personal", href: "/projects/personal" },
  { label: "DLS", href: "/projects/dls" },
  { label: "Wellness", href: "/projects/wellness-platform" },
  { label: "Pulse", href: "/pulse" },
];

const secondaryTabs = [
  { label: "Decisions", href: "/decisions" },
  { label: "Raven Letters", href: "#" },
  { label: "Climate", href: "#" },
  { label: "Lakeland", href: "#" },
  { label: "Education", href: "#" },
  { label: "FB Group", href: "#" },
];

export function TabNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-1 border-b border-line bg-bg-soft px-6 pt-2">
      {primaryTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors ${
            isActive(tab.href)
              ? "text-ink border-b-2 border-burgundy -mb-px"
              : "text-ink-3 hover:text-ink"
          }`}
        >
          {tab.label}
        </Link>
      ))}

      {/* More dropdown */}
      <div className="relative">
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`px-3 py-2.5 text-[13px] font-medium text-ink-3 hover:text-ink ${
            secondaryTabs.some((t) => isActive(t.href)) ? "text-ink" : ""
          }`}
        >
          More {moreOpen ? "^" : "v"}
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-line bg-bg-elev py-1 shadow-md">
            {secondaryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-2 text-[13px] transition-colors ${
                  isActive(tab.href) ? "bg-bg-soft text-ink font-medium" : "text-ink-3 hover:bg-bg-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5 pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink font-display text-sm font-semibold italic tracking-wide text-gold">
          D
        </div>
        <span className="text-[12px] font-medium text-ink-2">Personal OS</span>
      </div>
    </nav>
  );
}
