"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import type { AppState, StudySession, AppSettings, PomodoroState, DailyStat } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

// Action Types
type AppAction =
  | { type: "SET_RUNNING"; payload: boolean }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_CURRENT_SESSION"; payload: StudySession | null }
  | { type: "SET_POMODORO_STATE"; payload: PomodoroState }
  | { type: "SET_POMODORO_REMAINING"; payload: number }
  | { type: "INCREMENT_POMODORO_CYCLE" }
  | { type: "RESET_POMODORO" }
  | { type: "SET_ACTIVE_TAB"; payload: "timer" | "stats" | "history" }
  | { type: "SET_SELECTED_DATE"; payload: string }
  | { type: "SET_SESSIONS"; payload: StudySession[] }
  | { type: "ADD_SESSION"; payload: StudySession }
  | { type: "UPDATE_SESSION"; payload: StudySession }
  | { type: "REMOVE_SESSION"; payload: string }
  | { type: "SET_DAILY_STATS"; payload: DailyStat[] }
  | { type: "SET_SETTINGS"; payload: AppSettings };

// Initial State
const initialState: AppState = {
  isRunning: false,
  currentTime: 0,
  currentSession: null,
  pomodoro: {
    state: "idle",
    remainingSeconds: 1500, // 25 minutes default
    cycleCount: 0,
  },
  activeTab: "timer",
  selectedDate: new Date().toISOString().split("T")[0],
  sessions: [],
  dailyStats: [],
  settings: DEFAULT_SETTINGS,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_RUNNING":
      return { ...state, isRunning: action.payload };

    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };

    case "SET_CURRENT_SESSION":
      return { ...state, currentSession: action.payload };

    case "SET_POMODORO_STATE":
      return {
        ...state,
        pomodoro: { ...state.pomodoro, state: action.payload },
      };

    case "SET_POMODORO_REMAINING":
      return {
        ...state,
        pomodoro: { ...state.pomodoro, remainingSeconds: action.payload },
      };

    case "INCREMENT_POMODORO_CYCLE":
      return {
        ...state,
        pomodoro: { ...state.pomodoro, cycleCount: state.pomodoro.cycleCount + 1 },
      };

    case "RESET_POMODORO":
      return {
        ...state,
        pomodoro: {
          state: "idle",
          remainingSeconds: state.settings.pomodoro.workDuration,
          cycleCount: 0,
        },
      };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };

    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };

    case "ADD_SESSION":
      return { ...state, sessions: [...state.sessions, action.payload] };

    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };

    case "REMOVE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
      };

    case "SET_DAILY_STATS":
      return { ...state, dailyStats: action.payload };

    case "SET_SETTINGS":
      return { ...state, settings: action.payload };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

// Convenience hooks
export function useAppState() {
  return useAppContext().state;
}

export function useAppDispatch() {
  return useAppContext().dispatch;
}
