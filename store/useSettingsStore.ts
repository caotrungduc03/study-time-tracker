import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AppSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  setSettings: (settings: AppSettings) => void;
  updatePomodoroSettings: (settings: Partial<AppSettings["pomodoro"]>) => void;
  updateAppSettings: (settings: Partial<AppSettings["app"]>) => void;
  updateNotificationSettings: (settings: Partial<AppSettings["notifications"]>) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setSettings: (settings) => set({ settings }),

        updatePomodoroSettings: (pomodoroSettings) =>
          set((prev) => ({
            settings: {
              ...prev.settings,
              pomodoro: { ...prev.settings.pomodoro, ...pomodoroSettings },
            },
          })),

        updateAppSettings: (appSettings) =>
          set((prev) => ({
            settings: {
              ...prev.settings,
              app: { ...prev.settings.app, ...appSettings },
            },
          })),

        updateNotificationSettings: (notificationSettings) =>
          set((prev) => ({
            settings: {
              ...prev.settings,
              notifications: {
                ...prev.settings.notifications,
                ...notificationSettings,
              },
            },
          })),

        resetSettings: () => set(initialState),
      }),
      {
        name: "settings-storage",
        partialize: (state) => ({
          settings: state.settings,
        }),
      },
    ),
    { name: "SettingsStore" },
  ),
);
