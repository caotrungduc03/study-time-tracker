import { useEffect, useState } from "react";

import { cleanupInvalidSessions, getSettings, getTodaySessions, getTodayStats } from "@/lib/db/operations";
import { initializeDatabase } from "@/lib/db/schema";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { DailyStat,StudySession } from "@/types";

interface UseAppInitializationReturn {
  isLoading: boolean;
  error: Error | null;
  sessions: StudySession[];
  todayStats: DailyStat | null;
  refreshData: () => Promise<void>;
}

/**
 * Initialize app and load data from database
 * Handles database setup, cleanup, settings, and today's data
 */
export function useAppInitialization(): UseAppInitializationReturn {
  const setSettings = useSettingsStore((state) => state.setSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);

  const loadTodayData = async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([getTodaySessions(), getTodayStats()]);
      setSessions(sessionsData);
      setTodayStats(statsData);
    } catch (err) {
      console.error("Failed to load today data:", err);
      throw err;
    }
  };

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        await initializeDatabase();

        await cleanupInvalidSessions();

        const settings = await getSettings();
        if (settings) {
          setSettings(settings);
        }

        await loadTodayData();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize app");
        console.error("App initialization error:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [setSettings]);

  const refreshData = async () => {
    try {
      await loadTodayData();
    } catch (err) {
      console.error("Failed to refresh data:", err);
      throw err;
    }
  };

  return {
    isLoading,
    error,
    sessions,
    todayStats,
    refreshData,
  };
}
