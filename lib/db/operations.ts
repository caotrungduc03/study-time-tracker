import { v4 as uuidv4 } from 'uuid';

import type { AppSettings, DailyStat, StudySession } from '@/types';

import { db, getDateString, toISOString } from './schema';

/**
 * Create a new study session
 */
export async function createSession(
  type: StudySession['type'] = 'normal',
): Promise<StudySession> {
  const now = new Date();
  const session: StudySession = {
    id: uuidv4(),
    startTime: toISOString(now),
    endTime: '', // Will be set when session ends
    type,
    status: 'in-progress',
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
  };

  await db.sessions.add(session);
  return session;
}

/**
 * Update an existing session
 */
export async function updateSession(
  id: string,
  updates: Partial<StudySession>,
): Promise<void> {
  await db.sessions.update(id, {
    ...updates,
    updatedAt: toISOString(),
  });
}

/**
 * Update session type (e.g., convert pomodoro session to normal)
 */
export async function updateSessionType(
  id: string,
  type: StudySession['type'],
): Promise<void> {
  await db.sessions.update(id, {
    type,
    updatedAt: toISOString(),
  });
}

/**
 * Complete a session (mark as completed with end time)
 */
export async function completeSession(
  id: string,
): Promise<StudySession | undefined> {
  const session = await db.sessions.get(id);
  if (!session) {
    throw new Error(`Session ${id} not found`);
  }

  const endTime = new Date();

  await db.sessions.update(id, {
    endTime: toISOString(endTime),
    status: 'completed',
    updatedAt: toISOString(),
  });

  return db.sessions.get(id);
}

/**
 * Cancel a session
 */
export async function cancelSession(id: string): Promise<void> {
  await db.sessions.update(id, {
    status: 'cancelled',
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
 * Save or update a session with accumulated duration (called on pause).
 * Creates the record if it does not exist yet; otherwise only updates endTime.
 */
export async function saveOrUpdateSession(
  session: StudySession,
  duration: number,
): Promise<void> {
  const endTime = new Date(
    new Date(session.startTime).getTime() + duration * 1000,
  ).toISOString();

  const existing = await db.sessions.get(session.id);
  if (!existing) {
    await db.sessions.add({
      ...session,
      endTime,
      updatedAt: toISOString(),
    });
  } else {
    await db.sessions.update(session.id, {
      endTime,
      updatedAt: toISOString(),
    });
  }
}

/**
 * Complete a session using an explicitly supplied accumulated duration.
 * Returns undefined (without throwing) when the session was never saved to DB.
 */
export async function completeSessionWithDuration(
  id: string,
  duration: number,
): Promise<StudySession | undefined> {
  const session = await db.sessions.get(id);
  if (!session) return undefined;

  const endTime = new Date(
    new Date(session.startTime).getTime() + duration * 1000,
  ).toISOString();

  await db.sessions.update(id, {
    endTime,
    status: 'completed',
    updatedAt: toISOString(),
  });

  return db.sessions.get(id);
}

/**
 * Get session by ID
 */
export async function getSession(
  id: string,
): Promise<StudySession | undefined> {
  return db.sessions.get(id);
}

/**
 * Get all sessions for a specific date
 */
export async function getSessionsByDate(date: string): Promise<StudySession[]> {
  return db.sessions
    .filter((session) => {
      const isStatusValid =
        session.status === 'completed' || session.status === 'in-progress';
      if (!isStatusValid) return false;

      const isStartMatch = getDateString(new Date(session.startTime)) === date;
      const isEndMatch = session.endTime
        ? getDateString(new Date(session.endTime)) === date
        : false;

      return isStartMatch || isEndMatch || session.status === 'in-progress';
    })
    .sortBy('startTime');
}

/**
 * Get sessions within a date range
 */
export async function getSessionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<StudySession[]> {
  return db.sessions
    .filter((session) => {
      // Dù qua ngày thì session đang chạy vẫn cần được lấy
      if (session.status === 'in-progress') return true;
      if (session.status !== 'completed') return false;

      const sDate = getDateString(new Date(session.startTime));
      const eDate = session.endTime
        ? getDateString(new Date(session.endTime))
        : '';

      return (
        (sDate >= startDate && sDate <= endDate) ||
        (eDate >= startDate && eDate <= endDate)
      );
    })
    .sortBy('startTime');
}

/**
 * Get any unfinished (in-progress) sessions
 */
export async function getUnfinishedSessions(): Promise<StudySession[]> {
  const sessions = await db.sessions
    .where('status')
    .equals('in-progress')
    .toArray();

  const validSessions: StudySession[] = [];
  for (const session of sessions) {
    const startTime = new Date(session.startTime).getTime();
    const MIN_VALID_TIMESTAMP = new Date('2020-01-01').getTime();
    const MAX_VALID_TIMESTAMP = new Date('2050-01-01').getTime();

    if (startTime >= MIN_VALID_TIMESTAMP && startTime <= MAX_VALID_TIMESTAMP) {
      validSessions.push(session);
    } else {
      console.warn(
        `Deleting invalid session ${session.id} with corrupted timestamp:`,
        session.startTime,
      );
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
  console.log({ today });
  return getSessionsByDate(today);
}

/**
 * Cleanup invalid sessions from database
 * This removes sessions with corrupted timestamps
 */
export async function cleanupInvalidSessions(): Promise<number> {
  const allSessions = await db.sessions.toArray();
  let deletedCount = 0;

  const MIN_VALID_TIMESTAMP = new Date('2020-01-01').getTime();
  const MAX_VALID_TIMESTAMP = new Date('2050-01-01').getTime();

  for (const session of allSessions) {
    const startTime = new Date(session.startTime).getTime();

    if (
      isNaN(startTime) ||
      startTime < MIN_VALID_TIMESTAMP ||
      startTime > MAX_VALID_TIMESTAMP
    ) {
      console.warn(`Removing invalid session:`, session);
      await deleteSession(session.id);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings | undefined> {
  return db.settings.get('global_settings');
}

/**
 * Update app settings
 */
export async function updateSettings(
  updates: Partial<Omit<AppSettings, 'id'>>,
): Promise<void> {
  const current = await getSettings();
  if (!current) {
    throw new Error('Settings not initialized');
  }

  await db.settings.update('global_settings', updates);
}

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
    let sessionDuration = 0;
    if (session.endTime && session.startTime) {
      sessionDuration = Math.max(
        0,
        Math.floor(
          (new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime()) /
            1000,
        ),
      );
    }

    stat.totalSeconds += sessionDuration;
    stat.sessions.push(session.id);

    switch (session.type) {
      case 'normal':
        stat.normalSeconds += sessionDuration;
        break;
      case 'pomodoro-work':
        stat.pomodoroWorkSeconds += sessionDuration;
        break;
      case 'pomodoro-break':
        stat.pomodoroBreakSeconds += sessionDuration;
        break;
      case 'imported':
        stat.normalSeconds += sessionDuration;
        break;
    }

    if (sessionDuration > stat.longestSessionDuration) {
      stat.longestSessionDuration = sessionDuration;
    }
  });

  if (sessions.length > 0) {
    stat.averageSessionDuration = Math.floor(
      stat.totalSeconds / sessions.length,
    );
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
export async function getStatsForDateRange(
  startDate: string,
  endDate: string,
): Promise<DailyStat[]> {
  const stats: DailyStat[] = [];
  const sessions = await getSessionsByDateRange(startDate, endDate);

  const sessionsByDate = new Map<string, StudySession[]>();
  sessions.forEach((session) => {
    const date = getDateString(new Date(session.startTime));
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  });

  for (const [date, _] of sessionsByDate) {
    const stat = await calculateDailyStats(date);
    stats.push(stat);
  }

  return stats.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Import a session with only date and duration (no specific start/end time)
 */
export async function importSession(
  date: string,
  durationSeconds: number,
): Promise<StudySession> {
  const now = new Date();

  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 12, 0, 0);
  const endTimeLocal = new Date(localDate.getTime() + durationSeconds * 1000);

  const session: StudySession = {
    id: uuidv4(),
    startTime: localDate.toISOString(),
    endTime: endTimeLocal.toISOString(),
    type: 'imported',
    status: 'completed',
    isImported: true,
    createdAt: toISOString(now),
    updatedAt: toISOString(now),
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
