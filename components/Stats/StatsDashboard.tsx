"use client";

import { useState, useEffect } from "react";
import { Tabs, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { AllTimeStats } from "./AllTimeStats";
import { DailySummary } from "./DailySummary";
import { MonthlyOverview } from "./MonthlyOverview";
import { YearlyOverview } from "./YearlyOverview";
import { useStatistics } from "@/hooks/useStatistics";
import { getSessionsByDateRange } from "@/lib/db/operations";
import type { DailyStat } from "@/types";
import type { TabKey } from "../../types/stats";
import dayjs from "dayjs";

export function StatsDashboard() {
  const { weekStats, monthStats, yearStats, loading, refresh } = useStatistics();
  const [activeTab, setActiveTab] = useState<TabKey>("week");
  const [allTimeStats, setAllTimeStats] = useState<DailyStat[]>([]);

  // Load all time stats
  useEffect(() => {
    const loadAllTimeStats = async () => {
      try {
        // Get stats for the entire database
        const now = dayjs();
        const startDate = "2020-01-01"; // Start from a past date to get all records
        const endDate = now.format("YYYY-MM-DD");

        const stats = await getSessionsByDateRange(startDate, endDate);
        console.log("Loaded sessions:", stats.length, stats.slice(0, 5)); // Debug log

        // Group by date and calculate stats
        const dailyStats = new Map<string, DailyStat>();

        stats.forEach((session) => {
          const date = session.startDate!;
          if (!dailyStats.has(date)) {
            dailyStats.set(date, {
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
            });
          }

          const stat = dailyStats.get(date)!;
          stat.totalSeconds += session.duration;
          stat.sessionCount += 1;
          stat.sessions.push(session.id);

          if (session.duration > stat.longestSessionDuration) {
            stat.longestSessionDuration = session.duration;
          }
        });

        const result = Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));
        console.log("Grouped daily stats:", result.length, result.slice(0, 5)); // Debug log
        setAllTimeStats(result);
      } catch (error) {
        console.error("Failed to load all time stats:", error);
      }
    };

    loadAllTimeStats();
  }, []);

  const items = [
    {
      key: "week",
      label: "Tuần",
      children: <DailySummary stats={weekStats} />,
    },
    {
      key: "month",
      label: "Tháng",
      children: <MonthlyOverview stats={monthStats} />,
    },
    {
      key: "year",
      label: "Năm",
      children: <YearlyOverview stats={yearStats} />,
    },
    {
      key: "all-time",
      label: "Toàn bộ thời gian",
      children: <AllTimeStats stats={allTimeStats} />,
    },
  ];

  return (
    <div className="stats-dashboard">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📊 Thống kê học tập</h2>
        <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
          Cập nhật dữ liệu
        </Button>
      </div>

      <Tabs activeKey={activeTab} items={items} onChange={(key) => setActiveTab(key as TabKey)} size="large" />
    </div>
  );
}
