import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { StudySession } from "@/types";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // seconds elapsed
  currentSession: StudySession | null;
  pauseTimestamp: number; // timestamp when paused
}

interface TimerActions {
  setRunning: (isRunning: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setCurrentTime: (time: number) => void;
  setCurrentSession: (session: StudySession | null) => void;
  setPauseTimestamp: (timestamp: number) => void;
  resetTimer: () => void;
}

export type TimerStore = TimerState & TimerActions;

const initialState: TimerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  currentSession: null,
  pauseTimestamp: 0,
};

export const useTimerStore = create<TimerStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setRunning: (isRunning) => set({ isRunning }),

      setPaused: (isPaused) => set({ isPaused }),

      setCurrentTime: (currentTime) => set({ currentTime }),

      setCurrentSession: (currentSession) => set({ currentSession }),

      setPauseTimestamp: (pauseTimestamp) => set({ pauseTimestamp }),

      resetTimer: () => set(initialState),
    }),
    { name: "TimerStore" },
  ),
);
