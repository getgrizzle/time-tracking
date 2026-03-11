import { TimeEntry, DateRange, DatePreset } from "./types";

export function msToHours(ms: number): number {
  return ms / 1000 / 3600;
}

export function formatHours(ms: number): string {
  return msToHours(ms).toFixed(1) + "h";
}

export function getDateRange(preset: DatePreset, custom?: { start: number; end: number }): DateRange {
  const now = Date.now();
  if (preset === "7d") return { start: now - 7 * 864e5, end: now, preset };
  if (preset === "30d") return { start: now - 30 * 864e5, end: now, preset };
  if (preset === "90d") return { start: now - 90 * 864e5, end: now, preset };
  return { start: custom?.start ?? now - 30 * 864e5, end: custom?.end ?? now, preset: "custom" };
}

export function filterByUsers(entries: TimeEntry[], users: string[]): TimeEntry[] {
  if (!users.length) return entries;
  return entries.filter((e) => users.includes(e.user.username));
}

// Get week-commencing (Monday) date string for a timestamp
export function weekCommencing(ts: number): string {
  const d = new Date(ts);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function uniqueValues<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] ?? []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function sumDuration(entries: TimeEntry[]): number {
  return entries.reduce((s, e) => s + e.duration, 0);
}
