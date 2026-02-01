import { v4 as uuidv4 } from "uuid";

import type { AppSettings, DailyStat, StudySession } from "@/types";

import { db, getDateString, toISOString } from "./schema";

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Create a new study session
 */
export async function createSession(type: StudySession["type"] = "normal"): Promise<StudySession> {
  const now = new Date();
  const session: StudySession = {
    id: uuidv4(),
    startTime: toISOString(now),
    endTime: "", // Will be set when session ends
    duration: 0,
    type,
    status: "in-progress",
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
    startDate: getDateString(now),
  };

  await db.sessions.add(session);
  return session;
}

/**
 * Update an existing session
 */
export async function updateSession(id: string, updates: Partial<StudySession>): Promise<void> {
  await db.sessions.update(id, {
    ...updates,
    updatedAt: toISOString(),
  });
}

/**
 * Complete a session (mark as completed with end time)
 */
export async function completeSession(id: string): Promise<StudySession | undefined> {
  const session = await db.sessions.get(id);
  if (!session) {
    throw new Error(`Session ${id} not found`);
  }

  const endTime = new Date();
  const startTime = new Date(session.startTime);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  await db.sessions.update(id, {
    endTime: toISOString(endTime),
    duration,
    status: "completed",
    updatedAt: toISOString(),
  });

  return db.sessions.get(id);
}

/**
 * Cancel a session
 */
export async function cancelSession(id: string): Promise<void> {
  await db.sessions.update(id, {
    status: "cancelled",
    updatedAt: toISOString(),
  });
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

/**
 * Get session by ID
 */
export async function getSession(id: string): Promise<StudySession | undefined> {
  return db.sessions.get(id);
}

/**
 * Get all sessions for a specific date
 */
export async function getSessionsByDate(date: string): Promise<StudySession[]> {
  return db.sessions
    .where("startDate")
    .equals(date)
    .and((session) => session.status === "completed")
    .sortBy("startTime");
}

/**
 * Get sessions within a date range
 */
export async function getSessionsByDateRange(startDate: string, endDate: string): Promise<StudySession[]> {
  return db.sessions
    .where("startDate")
    .between(startDate, endDate, true, true)
    .and((session) => session.status === "completed")
    .sortBy("startTime");
}

/**
 * Get any unfinished (in-progress) sessions
 */
export async function getUnfinishedSessions(): Promise<StudySession[]> {
  const sessions = await db.sessions.where("status").equals("in-progress").toArray();

  // Validate sessions - remove any with invalid timestamps
  const validSessions: StudySession[] = [];
  for (const session of sessions) {
    const startTime = new Date(session.startTime).getTime();
    // Check if timestamp is reasonable (not corrupted)
    // A valid timestamp should be between 2020 and 2050
    const MIN_VALID_TIMESTAMP = new Date("2020-01-01").getTime();
    const MAX_VALID_TIMESTAMP = new Date("2050-01-01").getTime();

    if (startTime >= MIN_VALID_TIMESTAMP && startTime <= MAX_VALID_TIMESTAMP) {
      validSessions.push(session);
    } else {
      // Delete invalid session
      console.warn(`Deleting invalid session ${session.id} with corrupted timestamp:`, session.startTime);
      await deleteSession(session.id);
    }
  }

  return validSessions;
}

/**
 * Get today's sessions
 */
export async function getTodaySessions(): Promise<StudySession[]> {
  const today = getDateString();
  return getSessionsByDate(today);
}

/**
 * Cleanup invalid sessions from database
 * This removes sessions with corrupted timestamps
 */
export async function cleanupInvalidSessions(): Promise<number> {
  const allSessions = await db.sessions.toArray();
  let deletedCount = 0;

  const MIN_VALID_TIMESTAMP = new Date("2020-01-01").getTime();
  const MAX_VALID_TIMESTAMP = new Date("2050-01-01").getTime();

  for (const session of allSessions) {
    const startTime = new Date(session.startTime).getTime();

    // Check for invalid timestamp or invalid date
    if (isNaN(startTime) || startTime < MIN_VALID_TIMESTAMP || startTime > MAX_VALID_TIMESTAMP) {
      console.warn(`Removing invalid session:`, session);
      await deleteSession(session.id);
      deletedCount++;
    }
  }

  return deletedCount;
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings | undefined> {
  return db.settings.get("global_settings");
}

/**
 * Update app settings
 */
export async function updateSettings(updates: Partial<Omit<AppSettings, "id">>): Promise<void> {
  const current = await getSettings();
  if (!current) {
    throw new Error("Settings not initialized");
  }

  await db.settings.update("global_settings", updates);
}

// ============================================================================
// STATISTICS OPERATIONS
// ============================================================================

/**
 * Calculate daily statistics for a specific date (no database save)
 */
export async function calculateDailyStats(date: string): Promise<DailyStat> {
  const sessions = await getSessionsByDate(date);

  const stat: DailyStat = {
    id: date,
    date,
    totalSeconds: 0,
    sessionCount: sessions.length,
    normalSeconds: 0,
    pomodoroWorkSeconds: 0,
    pomodoroBreakSeconds: 0,
    sessions: [],
    averageSessionDuration: 0,
    longestSessionDuration: 0,
    lastUpdated: toISOString(),
  };

  sessions.forEach((session) => {
    stat.totalSeconds += session.duration;
    stat.sessions.push(session.id);

    switch (session.type) {
      case "normal":
        stat.normalSeconds += session.duration;
        break;
      case "pomodoro-work":
        stat.pomodoroWorkSeconds += session.duration;
        break;
      case "pomodoro-break":
        stat.pomodoroBreakSeconds += session.duration;
        break;
      case "imported":
        // Count imported sessions as normal sessions for stats
        stat.normalSeconds += session.duration;
        break;
    }

    if (session.duration > stat.longestSessionDuration) {
      stat.longestSessionDuration = session.duration;
    }
  });

  if (sessions.length > 0) {
    stat.averageSessionDuration = Math.floor(stat.totalSeconds / sessions.length);
  }

  return stat;
}

/**
 * Get daily statistics (always calculated fresh from sessions)
 */
export async function getDailyStat(date: string): Promise<DailyStat> {
  return calculateDailyStats(date);
}

/**
 * Get statistics for today
 */
export async function getTodayStats(): Promise<DailyStat> {
  const today = getDateString();
  return calculateDailyStats(today);
}

/**
 * Get statistics for a date range
 */
export async function getStatsForDateRange(startDate: string, endDate: string): Promise<DailyStat[]> {
  const stats: DailyStat[] = [];
  const sessions = await getSessionsByDateRange(startDate, endDate);

  // Group sessions by date
  const sessionsByDate = new Map<string, StudySession[]>();
  sessions.forEach((session) => {
    const date = session.startDate!;
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  });

  // Calculate stats for each date
  for (const [date, _] of sessionsByDate) {
    const stat = await calculateDailyStats(date);
    stats.push(stat);
  }

  return stats.sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// IMPORT OPERATIONS
// ============================================================================

/**
 * Import a session with only date and duration (no specific start/end time)
 * The date is expected to be in YYYY-MM-DD format representing a LOCAL date
 * We need to store it correctly so that queries by startDate work properly
 */
export async function importSession(date: string, durationSeconds: number): Promise<StudySession> {
  const now = new Date();

  // Parse the date string (YYYY-MM-DD) and create a date at noon local time
  // Using noon avoids edge cases where timezone conversion might shift the day
  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day, 12, 0, 0);

  // Create imported session with minimal time information
  const session: StudySession = {
    id: uuidv4(),
    startTime: localDate.toISOString(), // This will be stored as UTC
    endTime: localDate.toISOString(), // Same as start since we don't know actual time
    duration: durationSeconds,
    type: "imported",
    status: "completed",
    isImported: true,
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
    // Keep the original local date string for startDate (used for date-based queries)
    startDate: date,
  };

  await db.sessions.add(session);

  return session;
}

/**
 * Batch import multiple sessions
 */
export async function importMultipleSessions(
  imports: Array<{ date: string; durationSeconds: number }>,
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of imports) {
    try {
      await importSession(item.date, item.durationSeconds);
      success++;
    } catch (error) {
      failed++;
      errors.push(`Failed to import ${item.date}: ${error}`);
    }
  }

  return { success, failed, errors };
}
