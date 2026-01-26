import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { StudySession } from "@/types";

interface TimerState {
  isRunning: boolean;
  currentTime: number; // seconds elapsed
  currentSession: StudySession | null;
}

interface TimerActions {
  setRunning: (isRunning: boolean) => void;
  setCurrentTime: (time: number) => void;
  setCurrentSession: (session: StudySession | null) => void;
  resetTimer: () => void;
}

export type TimerStore = TimerState & TimerActions;

const initialState: TimerState = {
  isRunning: false,
  currentTime: 0,
  currentSession: null,
};

export const useTimerStore = create<TimerStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setRunning: (isRunning) => set({ isRunning }),

      setCurrentTime: (currentTime) => set({ currentTime }),

      setCurrentSession: (currentSession) => set({ currentSession }),

      resetTimer: () => set(initialState),
    }),
    { name: "TimerStore" },
  ),
);
