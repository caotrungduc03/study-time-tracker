import Dexie, { Table } from "dexie";
import type { StudySession, AppSettings } from "@/types";

export class StudyTrackerDB extends Dexie {
  sessions!: Table<StudySession, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("study-tracker-db");

    this.version(1).stores({
      sessions: "id, startTime, type, startDate, status",
      settings: "id",
    });
  }
}

// Create database instance
export const db = new StudyTrackerDB();

// Initialize database with default settings
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if settings exist
    const existingSettings = await db.settings.get("global_settings");

    if (!existingSettings) {
      // Create default settings
      const defaultSettings: AppSettings = {
        id: "global_settings",
        pomodoro: {
          workDuration: 1500,
          breakDuration: 300,
          autoStartBreak: true,
          soundEnabled: true,
        },
        app: {
          theme: "auto",
          language: "vi",
          firstDayOfWeek: 1,
          timeFormat: "24h",
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
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Helper function to get date string in YYYY-MM-DD format
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

// Helper function to format ISO string
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}
