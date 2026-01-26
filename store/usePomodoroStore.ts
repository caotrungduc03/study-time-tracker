import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PomodoroState } from "@/types";

interface PomodoroStoreState {
  state: PomodoroState;
  remainingSeconds: number;
  cycleCount: number;
  currentSessionId?: string;
}

interface PomodoroActions {
  setPomodoroState: (state: PomodoroState) => void;
  setPomodoroRemaining: (seconds: number) => void;
  setCurrentSessionId: (sessionId: string | undefined) => void;
  incrementPomodoroCycle: () => void;
  resetPomodoro: (workDuration: number) => void;
}

export type PomodoroStore = PomodoroStoreState & PomodoroActions;

const initialState: PomodoroStoreState = {
  state: "idle",
  remainingSeconds: 1500, // 25 minutes default
  cycleCount: 0,
  currentSessionId: undefined,
};

export const usePomodoroStore = create<PomodoroStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setPomodoroState: (state) => set({ state }),

      setPomodoroRemaining: (remainingSeconds) => set({ remainingSeconds }),

      setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),

      incrementPomodoroCycle: () => set((prev) => ({ cycleCount: prev.cycleCount + 1 })),

      resetPomodoro: (workDuration) =>
        set({
          state: "idle",
          remainingSeconds: workDuration,
          cycleCount: 0,
          currentSessionId: undefined,
        }),
    }),
    { name: "PomodoroStore" },
  ),
);
