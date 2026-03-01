import Dexie, { Table } from 'dexie';

import type { AppSettings, StudySession } from '@/types';

export class StudyTrackerDB extends Dexie {
  sessions!: Table<StudySession, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('study-tracker-db');

    this.version(1).stores({
      sessions: 'id, startTime, type, status',
      settings: 'id',
    });
  }
}

export const db = new StudyTrackerDB();

export async function initializeDatabase(): Promise<void> {
  try {
    const existingSettings = await db.settings.get('global_settings');

    if (!existingSettings) {
      const defaultSettings: AppSettings = {
        id: 'global_settings',
        pomodoro: {
          workDuration: 1500,
          breakDuration: 300,
          soundEnabled: true,
          pomodoroEnabled: true,
        },
        app: {
          theme: 'auto',
          language: 'vi',
          firstDayOfWeek: 1,
          timeFormat: '24h',
        },
        notifications: {
          pomodoroEnd: true,
          dailyGoal: false,
          weeklyReport: false,
        },
      };

      await db.settings.add(defaultSettings);
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDateString(date: Date = new Date()): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}
