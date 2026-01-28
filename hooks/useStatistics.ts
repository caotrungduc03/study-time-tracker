"use client";

import { useCallback,useEffect, useState } from "react";

import { getStatsForDateRange,getTodayStats } from "@/lib/db/operations";
import { getCurrentWeekDates, getMonthDates, getYearDates } from "@/lib/time-utils";
import type { DailyStat } from "@/types";

export function useStatistics() {
  const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
  const [weekStats, setWeekStats] = useState<DailyStat[]>([]);
  const [monthStats, setMonthStats] = useState<DailyStat[]>([]);
  const [yearStats, setYearStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(false);

  // Load today's statistics
  const loadTodayStats = useCallback(async () => {
    try {
      const stats = await getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error("Failed to load today stats:", error);
    }
  }, []);

  // Load week statistics
  const loadWeekStats = useCallback(async () => {
    try {
      setLoading(true);
      const weekDates = getCurrentWeekDates(1); // Monday as first day
      const startDate = weekDates[0];
      const endDate = weekDates[weekDates.length - 1];

      const stats = await getStatsForDateRange(startDate, endDate);

      // Fill in missing dates with empty stats
      const fullWeekStats = weekDates.map((date) => {
        const existing = stats.find((s) => s.date === date);
        return (
          existing || {
            id: date,
            date,
            totalSeconds: 0,
            sessionCount: 0,
            normalSeconds: 0,
            pomodoroWorkSeconds: 0,
            pomodoroBreakSeconds: 0,
            sessions: [],
            averageSessionDuration: 0,
            longestSessionDuration: 0,
            lastUpdated: new Date().toISOString(),
          }
        );
      });

      setWeekStats(fullWeekStats);
    } catch (error) {
      console.error("Failed to load week stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load month statistics
  const loadMonthStats = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const monthDates = getMonthDates(now.getFullYear(), now.getMonth());
      const startDate = monthDates[0];
      const endDate = monthDates[monthDates.length - 1];

      const stats = await getStatsForDateRange(startDate, endDate);
      setMonthStats(stats);
    } catch (error) {
      console.error("Failed to load month stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load year statistics
  const loadYearStats = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const yearDates = getYearDates(now.getFullYear());
      const startDate = yearDates[0];
      const endDate = yearDates[yearDates.length - 1];

      const stats = await getStatsForDateRange(startDate, endDate);
      setYearStats(stats);
    } catch (error) {
      console.error("Failed to load year stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTodayStats();
    loadWeekStats();
    loadMonthStats();
    loadYearStats();
  }, [loadTodayStats, loadWeekStats, loadMonthStats, loadYearStats]);

  // Refresh function
  const refresh = useCallback(async () => {
    await Promise.all([loadTodayStats(), loadWeekStats(), loadMonthStats(), loadYearStats()]);
  }, [loadTodayStats, loadWeekStats, loadMonthStats, loadYearStats]);

  return {
    todayStats,
    weekStats,
    monthStats,
    yearStats,
    loading,
    refresh,
  };
}
