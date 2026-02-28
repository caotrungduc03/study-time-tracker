import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DailyStat, StudySession } from '@/types';

interface SessionState {
  sessions: StudySession[];
  dailyStats: DailyStat[];
}

interface SessionActions {
  setSessions: (sessions: StudySession[]) => void;
  addSession: (session: StudySession) => void;
  updateSession: (session: StudySession) => void;
  removeSession: (sessionId: string) => void;
  setDailyStats: (stats: DailyStat[]) => void;
  updateDailyStat: (stat: DailyStat) => void;
}

export type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  sessions: [],
  dailyStats: [],
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((prev) => ({ sessions: [...prev.sessions, session] })),

      updateSession: (session) =>
        set((prev) => ({
          sessions: prev.sessions.map((s) =>
            s.id === session.id ? session : s,
          ),
        })),

      removeSession: (sessionId) =>
        set((prev) => ({
          sessions: prev.sessions.filter((s) => s.id !== sessionId),
        })),

      setDailyStats: (dailyStats) => set({ dailyStats }),

      updateDailyStat: (stat) =>
        set((prev) => ({
          dailyStats: prev.dailyStats.map((s) => (s.id === stat.id ? stat : s)),
        })),
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);
