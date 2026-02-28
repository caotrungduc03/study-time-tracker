import { create } from "zustand";

import type { PomodoroPhase, PomodoroState } from "@/types";

interface PomodoroStoreState {
  state: PomodoroState;
  targetCycles: number;
  currentPhase: PomodoroPhase;
  /** Milestone seconds that have already triggered an alert */
  alertedMilestones: number[];
}

interface PomodoroActions {
  setPomodoroState: (state: PomodoroState) => void;
  setTargetCycles: (cycles: number) => void;
  setCurrentPhase: (phase: PomodoroPhase) => void;
  addAlertedMilestone: (seconds: number) => void;
  resetPomodoro: () => void;
}

export type PomodoroStore = PomodoroStoreState & PomodoroActions;

const initialState: PomodoroStoreState = {
  state: "idle",
  targetCycles: 1,
  currentPhase: null,
  alertedMilestones: [],
};

export const usePomodoroStore = create<PomodoroStore>()((set) => ({
  ...initialState,

  setPomodoroState: (state) => set({ state }),

  setTargetCycles: (targetCycles) => set({ targetCycles }),

  setCurrentPhase: (currentPhase) => set({ currentPhase }),

  addAlertedMilestone: (seconds) =>
    set((prev) => ({
      alertedMilestones: [...prev.alertedMilestones, seconds],
    })),

  resetPomodoro: () =>
    set((prev) => ({
      ...initialState,
      targetCycles: prev.targetCycles, // Keep target cycles
    })),
}));
