import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setActiveTab: (activeTab) => set({ activeTab }),

      setSelectedDate: (selectedDate) => set({ selectedDate }),
    }),
    { name: "UIStore" },
  ),
);
