import { TIME_CONSTANTS } from "@/types";

/**
 * Format seconds to human-readable duration (e.g., "1h 30m", "45m", "30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((val) => val.toString().padStart(2, "0")).join(":");
}

/**
 * Format seconds to hours (decimal)
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get time string in HH:MM format
 */
export function getTimeString(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Parse ISO string to Date
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Calculate timeline position for a session
 * Returns position (0-95) and length (number of 15-min slots)
 */
export function calculateTimelinePosition(startTime: string, duration: number) {
  const start = new Date(startTime);
  const startHour = start.getHours();
  const startMinute = start.getMinutes();

  // Position in grid (0-95)
  const startPosition =
    startHour * TIME_CONSTANTS.SLOTS_PER_HOUR + Math.floor(startMinute / TIME_CONSTANTS.SLOT_DURATION_MINUTES);

  // Length (number of slots)
  const durationInMinutes = duration / 60;
  const length = Math.max(1, Math.ceil(durationInMinutes / TIME_CONSTANTS.SLOT_DURATION_MINUTES));

  return { startPosition, length };
}

/**
 * Get week number for a date
 */
export function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

/**
 * Get start and end dates for a week
 */
export function getWeekDates(weekNumber: number, year: number): { start: Date; end: Date } {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const start = new Date(simple);
  start.setDate(simple.getDate() - dow + (dow === 0 ? -6 : 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

/**
 * Get array of dates for the current week
 */
export function getCurrentWeekDates(firstDayOfWeek: 0 | 1 = 1): string[] {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = currentDay - firstDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (diff < 0 ? diff + 7 : diff));

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(getDateString(date));
  }

  return weekDates;
}

/**
 * Get array of dates for a specific month
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(getDateString(date));
  }

  return dates;
}

/**
 * Calculate study streak (consecutive days with sessions)
 */
export function calculateStreak(dailyStats: Array<{ date: string; totalSeconds: number }>): number {
  if (dailyStats.length === 0) return 0;

  // Sort by date descending
  const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  const today = getDateString();
  const currentDate = new Date(today);

  for (const stat of sorted) {
    const statDate = getDateString(new Date(stat.date));
    const expectedDate = getDateString(currentDate);

    if (statDate === expectedDate && stat.totalSeconds > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format date to Vietnamese locale
 */
export function formatDateVN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get relative date string (Today, Yesterday, etc.)
 */
export function getRelativeDateString(date: string): string {
  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  if (date === today) return "Hôm nay";
  if (date === yesterday) return "Hôm qua";

  return formatDateVN(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  return getDateString(d1) === getDateString(d2);
}
