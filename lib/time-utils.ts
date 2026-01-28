import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";

import { TIME_CONSTANTS } from "@/types";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);

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
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * Get time string in HH:MM format
 */
export function getTimeString(date: Date = new Date()): string {
  return dayjs(date).format("HH:mm");
}

/**
 * Parse ISO string to Date
 */
export function parseISODate(isoString: string): Date {
  return dayjs(isoString).toDate();
}

/**
 * Calculate timeline position for a session
 * Returns position (0-95) and length (number of 15-min slots)
 */
export function calculateTimelinePosition(startTime: string, duration: number) {
  const start = dayjs(startTime);
  const startHour = start.hour();
  const startMinute = start.minute();

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
  const d = dayjs(date);
  return { week: d.isoWeek(), year: d.year() };
}

/**
 * Get start and end dates for a week
 */
export function getWeekDates(weekNumber: number, year: number): { start: Date; end: Date } {
  const startOfYear = dayjs().year(year).startOf("year");
  const start = startOfYear.isoWeek(weekNumber).startOf("isoWeek");
  const end = start.endOf("isoWeek");
  return { start: start.toDate(), end: end.toDate() };
}

/**
 * Get array of dates for the current week (Monday to Sunday)
 */
export function getCurrentWeekDates(firstDayOfWeek: 0 | 1 = 1): string[] {
  const today = dayjs();
  const startOfWeek = firstDayOfWeek === 1 ? today.startOf("isoWeek") : today.startOf("week");

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(startOfWeek.add(i, "day").format("YYYY-MM-DD"));
  }

  return weekDates;
}

/**
 * Get array of dates for a specific month
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const startOfMonth = dayjs().year(year).month(month).startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();

  for (let day = 0; day < daysInMonth; day++) {
    dates.push(startOfMonth.add(day, "day").format("YYYY-MM-DD"));
  }

  return dates;
}

/**
 * Get array of dates for a specific year
 */
export function getYearDates(year: number): string[] {
  const dates: string[] = [];
  const startOfYear = dayjs().year(year).startOf("year");
  const daysInYear = dayjs().year(year).endOf("year").dayOfYear();

  for (let day = 0; day < daysInYear; day++) {
    dates.push(startOfYear.add(day, "day").format("YYYY-MM-DD"));
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
  let currentDate = dayjs();

  for (const stat of sorted) {
    const statDate = dayjs(stat.date);
    const expectedDate = currentDate.format("YYYY-MM-DD");

    if (statDate.format("YYYY-MM-DD") === expectedDate && stat.totalSeconds > 0) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
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
  return dayjs(date).format("DD MMMM YYYY");
}

/**
 * Get relative date string (Today, Yesterday, etc.)
 */
export function getRelativeDateString(date: string): string {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (date === today) return "Hôm nay";
  if (date === yesterday) return "Hôm qua";

  return formatDateVN(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).format("YYYY-MM-DD") === dayjs(date2).format("YYYY-MM-DD");
}
