export function Sidebar({
  cac7d,
  spendThisWeek,
}: {
  cac7d: number | null;
  spendThisWeek: number;
}) {
  return (
    <aside className="flex flex-col bg-bg-soft border-r border-line p-6 max-[1100px]:hidden">
      <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-lg font-semibold italic tracking-wide text-gold">
          D
        </div>
        <div>
          <div className="font-display text-base font-semibold leading-tight tracking-tight">Dead Letter</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-ink-3">Studio · Owner</div>
        </div>
      </div>
      <nav className="flex flex-col gap-px">
        <NavItem icon={DashIcon} label="Dashboard" active />
        <NavItem icon={UsersIcon} label="Subscribers" />
        <NavItem icon={DollarIcon} label="Revenue" />
        <NavItem icon={ChartIcon} label="Ad performance" />

        <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-ink-3">Series</div>
        <NavItem icon={DocIcon} label="Salem" />
        <NavItem icon={DocIcon} label="Titanic" />
        <NavItem icon={DocIcon} label="Asylum" />
        <NavItem icon={DocIcon} label="Raven" tag="draft" />

        <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-ink-3">Marketing</div>
        <NavItem icon={MailIcon} label="Klaviyo flows" />
        <NavItem icon={ShareIcon} label="Social posts" />
        <NavItem icon={ChartIcon} label="Creative engine" />

        <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase tracking-widest text-ink-3">Operations</div>
        <NavItem icon={BoxIcon} label="Fulfillment" />
        <NavItem icon={AlertIcon} label="Alerts" tag="?" />
        <NavItem icon={GearIcon} label="Settings" />
      </nav>
      <div className="mt-4 rounded-md bg-ink p-3.5 text-[12px] leading-snug text-bg">
        <strong className="mb-1 block font-display italic text-gold">This week</strong>
        Blended CAC ${cac7d !== null ? cac7d.toFixed(2) : "—"} over $
        {(spendThisWeek / 1000).toFixed(1)}k spend. Target $55.
      </div>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  tag,
}: {
  icon: () => React.JSX.Element;
  label: string;
  active?: boolean;
  tag?: string;
}) {
  const cls = active
    ? "bg-ink text-gold"
    : "text-ink-2 hover:bg-burgundy/10 hover:text-ink";
  return (
    <a
      href="#"
      className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors ${cls}`}
    >
      <Icon />
      {label}
      {tag && (
        <span className="ml-auto rounded-full bg-bg-soft px-2 py-0.5 text-[10px] text-ink-2">
          {tag}
        </span>
      )}
    </a>
  );
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6" />
    </svg>
  );
}
