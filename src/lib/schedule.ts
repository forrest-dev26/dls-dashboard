import { readFile } from "fs/promises";
import { join } from "path";

const JOBS_PATH = join(
  process.env.HOME ?? "/Users/ravenmysterygamesimac",
  ".openclaw/cron/jobs.json"
);
const STATE_PATH = join(
  process.env.HOME ?? "/Users/ravenmysterygamesimac",
  ".openclaw/cron/jobs-state.json"
);

// DLS-relevant keywords in job names
const DLS_KEYWORDS = [
  "dls",
  "meta ads",
  "daily ad",
  "social engine",
  "creative engine",
  "manhattan project",
];

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule?: { kind: string; expr?: string; tz?: string };
}

interface JobState {
  lastRunAtMs?: number;
  lastRunStatus?: string;
  nextRunAtMs?: number;
  consecutiveErrors?: number;
}

export interface ScheduleItem {
  time: string;
  label: string;
  tag: "done" | "scheduled" | "error" | "disabled";
  source: string;
}

function isDlsRelated(name: string): boolean {
  const lower = name.toLowerCase();
  return DLS_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Check if a cron expression fires on a given date.
 * Handles standard 5-field cron: min hour dom month dow
 */
function cronFiresOnDate(expr: string, date: Date, tz: string): boolean {
  // Convert date to the job's timezone
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return false;

  const [, hourExpr, domExpr, monthExpr, dowExpr] = parts;

  // Get date components in the job's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    day: "numeric",
    month: "numeric",
    weekday: "short",
    hour12: false,
  });
  const dateParts = formatter.formatToParts(date);
  const day = parseInt(dateParts.find((p) => p.type === "day")?.value ?? "0");
  const month = parseInt(dateParts.find((p) => p.type === "month")?.value ?? "0");
  const weekdayStr = dateParts.find((p) => p.type === "weekday")?.value ?? "";
  const dowMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dow = dowMap[weekdayStr] ?? 0;

  return (
    fieldMatches(domExpr, day) &&
    fieldMatches(monthExpr, month) &&
    fieldMatches(dowExpr, dow)
  );
}

function fieldMatches(expr: string, value: number): boolean {
  if (expr === "*") return true;

  // Handle step: */6
  if (expr.startsWith("*/")) {
    const step = parseInt(expr.slice(2));
    return step > 0 && value % step === 0;
  }

  // Handle comma-separated: 1,3,5
  const parts = expr.split(",");
  return parts.some((p) => parseInt(p) === value);
}

function formatCronTime(expr: string, tz: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 2) return "??:??";
  const min = parts[0].padStart(2, "0");
  const hourExpr = parts[1];

  // For */N patterns, show as recurring
  if (hourExpr.startsWith("*/")) {
    return `every ${hourExpr.slice(2)}h`;
  }

  // For comma-separated hours, show first occurrence
  const hour = hourExpr.split(",")[0];
  if (hour === "*") return `XX:${min}`;

  const h = parseInt(hour);
  const m = parseInt(min);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Sort key for time strings */
function timeSortKey(time: string): number {
  if (time.startsWith("every")) return 9999;
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 9998;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  if (match[3] === "PM" && h !== 12) h += 12;
  if (match[3] === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

export async function fetchTodaySchedule(): Promise<ScheduleItem[]> {
  let jobs: CronJob[];
  let jobStates: Record<string, JobState> = {};

  try {
    const raw = await readFile(JOBS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    jobs = parsed.jobs ?? [];
  } catch {
    return [{ time: "—", label: "Unable to read OpenClaw cron config", tag: "error", source: "system" }];
  }

  try {
    const raw = await readFile(STATE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    jobStates = parsed.jobs ?? {};
  } catch {
    // State file optional — continue without it
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const items: ScheduleItem[] = [];

  for (const job of jobs) {
    if (!isDlsRelated(job.name)) continue;
    if (!job.schedule?.expr || job.schedule.expr === "?") continue;

    const tz = job.schedule.tz ?? "America/New_York";
    if (!cronFiresOnDate(job.schedule.expr, now, tz)) continue;

    const time = formatCronTime(job.schedule.expr, tz);
    const state = jobStates[job.id];

    let tag: ScheduleItem["tag"];
    if (!job.enabled) {
      tag = "disabled";
    } else if (state?.lastRunAtMs && state.lastRunAtMs > todayStart.getTime()) {
      tag = state.lastRunStatus === "error" ? "error" : "done";
    } else {
      tag = "scheduled";
    }

    items.push({
      time,
      label: job.name,
      tag,
      source: `cron:${job.id.slice(0, 8)}`,
    });
  }

  items.sort((a, b) => timeSortKey(a.time) - timeSortKey(b.time));

  return items;
}
