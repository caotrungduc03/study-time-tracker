export interface StudySession {
  id: string; // UUID v4
  startTime: string; // ISO 8601: "2024-01-20T14:30:00.000Z"
  endTime: string; // ISO 8601
  duration: number; // seconds
  type: 'normal' | 'pomodoro-work' | 'pomodoro-break' | 'imported';
  status: 'completed' | 'cancelled' | 'in-progress';
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  startDate?: string; // YYYY-MM-DD format for date-based queries
  isImported?: boolean;
}

export interface AppSettings {
  id: 'global_settings';
  pomodoro: {
    workDuration: number; // seconds, default: 1500 (25m)
    breakDuration: number; // seconds, default: 300 (5m)
    soundEnabled: boolean;
    pomodoroEnabled: boolean;
  };
  app: {
    theme: 'light' | 'dark' | 'auto';
    language: 'vi' | 'en';
    firstDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
    timeFormat: '12h' | '24h';
    weekStartDate?: string;
  };
  notifications: {
    pomodoroEnd: boolean;
    dailyGoal: boolean;
    weeklyReport: boolean;
  };
}

export interface DailyStat {
  id: string; // "YYYY-MM-DD"
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  sessionCount: number;
  normalSeconds: number;
  pomodoroWorkSeconds: number;
  pomodoroBreakSeconds: number;
  sessions: string[];
  averageSessionDuration: number;
  longestSessionDuration: number;
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

export type PomodoroState = 'idle' | 'running' | 'paused';

export type PomodoroPhase = 'study' | 'break' | 'completed' | null;

export interface AppState {
  isRunning: boolean;
  currentTime: number; // seconds elapsed
  currentSession: StudySession | null;
  pomodoroState: PomodoroState;
  activeTab: 'timer' | 'stats' | 'history';
  selectedDate: string;
  sessions: StudySession[];
  dailyStats: DailyStat[];
  settings: AppSettings;
}

export interface TimelineEventPosition {
  startPosition: number;
  length: number;
  color: string;
  session: StudySession;
}

export interface ChartDataPoint {
  date: string;
  hours: number;
  seconds: number;
  label: string;
}
export const DEFAULT_SETTINGS: AppSettings = {
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

export const EVENT_COLORS = {
  normal: '#52c41a',
  'pomodoro-work': '#fa8c16',
  'pomodoro-break': '#722ed1',
  imported: '#13c2c2',
  active: '#1890ff',
} as const;

export const TIME_CONSTANTS = {
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  SLOTS_PER_HOUR: 60,
  TOTAL_SLOTS: 1440,
  SLOT_DURATION_MINUTES: 1,
} as const;
