"use client";

import React, { useState } from "react";
import { Tabs, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { DailySummary } from "./DailySummary";
import { WeeklyChart } from "./WeeklyChart";
import { MonthlyOverview } from "./MonthlyOverview";
import { useStatistics } from "@/hooks/useStatistics";

type TabKey = "today" | "week" | "month";

export function StatsDashboard() {
  const { todayStats, weekStats, monthStats, loading, refresh } = useStatistics();
  const [activeTab, setActiveTab] = useState<TabKey>("today");

  const items = [
    {
      key: "today",
      label: "Hôm nay",
      children: <DailySummary stats={todayStats} dailyGoal={14400} />,
    },
    {
      key: "week",
      label: "Tuần này",
      children: <WeeklyChart stats={weekStats} />,
    },
    {
      key: "month",
      label: "Tháng này",
      children: <MonthlyOverview stats={monthStats} />,
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
