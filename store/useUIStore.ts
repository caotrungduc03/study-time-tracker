import { create } from "zustand";

interface UIState {
  activeTab: "timer" | "stats" | "history";
  selectedDate: string; // ISO date YYYY-MM-DD
}

interface UIActions {
  setActiveTab: (tab: "timer" | "stats" | "history") => void;
  setSelectedDate: (date: string) => void;
}

export type UIStore = UIState & UIActions;

const initialState: UIState = {
  activeTab: "timer",
  selectedDate: new Date().toISOString().split("T")[0],
};

export const useUIStore = create<UIStore>()((set) => ({
  ...initialState,

  setActiveTab: (activeTab) => set({ activeTab }),

  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
