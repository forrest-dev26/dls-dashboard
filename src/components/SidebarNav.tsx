"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Pulse",
    href: "/pulse",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Decisions",
    href: "/decisions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const projectItems = [
  {
    label: "Personal",
    href: "/projects/personal",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Dead Letter Studio",
    href: "/projects/dls",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Wellness Platform",
    href: "/projects/wellness-platform",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

const futureItems = [
  { label: "Raven Letters", href: "#" },
  { label: "Climate", href: "#" },
  { label: "Lakeland", href: "#" },
  { label: "Education", href: "#" },
];

export function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-[#1F2421] text-[#E8E3D6] max-[900px]:hidden">
      {/* Brand header */}
      <div className="flex items-center gap-[10px] border-b border-white/8 px-4 py-5 pb-6">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-display text-[14px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #4A8B82 0%, #C9A96E 100%)' }}
        >
          S
        </div>
        <div>
          <div className="font-display text-[18px] font-medium leading-tight text-[#FAF7F2]">
            Stillwater
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-[#8F8A7A]">
            Christopher
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} active={isActive(item.href)} icon={item.icon} label={item.label} />
          ))}
        </div>

        {/* Section divider */}
        <div className="my-4">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-widest text-[#6E6A60]">
            Projects
          </div>
          <div className="space-y-0.5">
            {projectItems.map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>

        {/* Section divider */}
        <div className="my-4">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-widest text-[#6E6A60]">
            Coming Soon
          </div>
          <div className="space-y-0.5">
            {futureItems.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-[10px] rounded-sm px-3 py-2 text-[13px] text-white/25 cursor-default"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* Status footer */}
      <div className="border-t border-white/8 px-4 py-3">
        <div className="rounded-md bg-white/4 px-3 py-2.5 text-[12px] text-[#C8C2B3]">
          <strong className="mb-1 block font-semibold text-[#FAF7F2]">Phase 1 v1.5</strong>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B9D6E]" />
            <span className="text-[11px]">system: ok</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-[10px] rounded-sm px-3 py-[9px] text-[13px] font-medium transition-colors ${
        active
          ? "bg-[rgba(74,139,130,0.18)] text-white"
          : "text-[#C8C2B3] hover:bg-white/5 hover:text-[#FAF7F2]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
