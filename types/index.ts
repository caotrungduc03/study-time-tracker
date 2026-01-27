// Core Session Interface
export interface StudySession {
  // Primary key
  id: string; // UUID v4

  // Time information
  startTime: string; // ISO 8601: "2024-01-20T14:30:00.000Z"
  endTime: string; // ISO 8601
  duration: number; // seconds

  // Metadata
  type: "normal" | "pomodoro-work" | "pomodoro-break" | "imported";
  status: "completed" | "cancelled" | "in-progress";

  // Optional fields
  notes?: string;
  tags?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // For indexing
  startDate?: string; // YYYY-MM-DD format for date-based queries

  // For imported sessions (when startTime and endTime are not known)
  isImported?: boolean; // Flag to indicate this is an imported session
}

// Settings Interface
export interface AppSettings {
  id: "global_settings";

  // Pomodoro Settings
  pomodoro: {
    workDuration: number; // seconds, default: 1500 (25m)
    breakDuration: number; // seconds, default: 300 (5m)
    autoStartBreak: boolean; // default: true
    soundEnabled: boolean; // default: true
    soundFile?: string; // URL to audio file
  };

  // App Settings
  app: {
    theme: "light" | "dark" | "auto";
    language: "vi" | "en";
    firstDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
    timeFormat: "12h" | "24h";
    weekStartDate?: string; // ISO date for custom week start
  };

  // Notification Settings
  notifications: {
    pomodoroEnd: boolean;
    dailyGoal: boolean;
    weeklyReport: boolean;
  };
}

// Statistics Interfaces
export interface DailyStat {
  id: string; // Format: "YYYY-MM-DD"
  date: string; // YYYY-MM-DD

  // Summary
  totalSeconds: number;
  sessionCount: number;

  // Breakdown by type
  normalSeconds: number;
  pomodoroWorkSeconds: number;
  pomodoroBreakSeconds: number;

  // Session details
  sessions: string[]; // Array of session IDs

  // Calculations
  averageSessionDuration: number;
  longestSessionDuration: number;

  // Metadata
  lastUpdated: string;
}

export interface WeeklyStat {
  id: string; // Format: "YYYY-Www"
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD

  dailyStats: {
    [date: string]: {
      totalSeconds: number;
      completed: boolean; // Achieved daily goal
    };
  };

  totalSeconds: number;
  averageDailySeconds: number;
  streak: number; // Number of consecutive study days
}

// Pomodoro State Machine
export type PomodoroState =
  | "idle"
  | "work" // Working
  | "work-paused" // Work paused
  | "break" // Break time
  | "break-paused" // Break paused
  | "completed"; // Cycle completed

export interface PomodoroContext {
  state: PomodoroState;
  remainingSeconds: number;
  currentSessionId?: string;
  cycleCount: number;
}

// App State
export interface AppState {
  // Timer state
  isRunning: boolean;
  currentTime: number; // seconds elapsed
  currentSession: StudySession | null;

  // Pomodoro state
  pomodoro: PomodoroContext;

  // UI state
  activeTab: "timer" | "stats" | "history";
  selectedDate: string; // ISO date

  // Data state
  sessions: StudySession[];
  dailyStats: DailyStat[];
  settings: AppSettings;
}

// Timeline Event Position
export interface TimelineEventPosition {
  startPosition: number; // 0-95 (slot index)
  length: number; // number of slots
  color: string;
  session: StudySession;
}

// Chart Data
export interface ChartDataPoint {
  date: string;
  hours: number;
  seconds: number;
  label: string;
}

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  id: "global_settings",
  pomodoro: {
    workDuration: 1500, // 25 minutes
    breakDuration: 300, // 5 minutes
    autoStartBreak: true,
    soundEnabled: true,
  },
  app: {
    theme: "auto",
    language: "vi",
    firstDayOfWeek: 1, // Monday
    timeFormat: "24h",
  },
  notifications: {
    pomodoroEnd: true,
    dailyGoal: false,
    weeklyReport: false,
  },
};

// Constants
export const EVENT_COLORS = {
  normal: "#52c41a", // Green
  "pomodoro-work": "#fa8c16", // Orange
  "pomodoro-break": "#722ed1", // Purple
  imported: "#13c2c2", // Cyan
  active: "#1890ff", // Blue (currently studying)
} as const;

export const TIME_CONSTANTS = {
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  SLOTS_PER_HOUR: 60, // 1-minute slots (changed from 12)
  TOTAL_SLOTS: 1440, // 24 hours * 60 slots (changed from 288)
  SLOT_DURATION_MINUTES: 1, // Changed from 5
} as const;
