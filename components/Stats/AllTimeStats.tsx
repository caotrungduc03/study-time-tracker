"use client";

import React, { useMemo } from "react";
import { Card, Row } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DailyStat } from "@/types";
import { CustomTooltip, allTimeChartFormatter } from "./ChartTooltip";
import { StatsCard } from "./StatsCard";
import { formatTime } from "@/lib/time-utils";
import dayjs from "dayjs";
import type { AllTimeChartData } from "../../types/stats";

interface AllTimeStatsProps {
  stats: DailyStat[];
}

export function AllTimeStats({ stats }: AllTimeStatsProps) {
  console.log("AllTimeStats received stats:", stats.length, stats.slice(0, 3)); // Debug

  // Prepare chart data grouped by month for 2 most recent years
  const chartData = useMemo((): AllTimeChartData[] => {
    if (stats.length === 0) return [];

    const now = dayjs();
    const currentYear = now.year();
    const previousYear = currentYear - 1;

    // Filter stats from last 2 years
    const lastTwoYearsStats = stats.filter((stat) => {
      const year = dayjs(stat.date).year();
      return year === currentYear || year === previousYear;
    });
    console.log("Last two years stats:", lastTwoYearsStats.length); // Debug

    // Group by year-month
    const monthlyData: Record<string, { totalSeconds: number; sessionCount: number }> = {};

    // Initialize all 24 months (2 years)
    for (const year of [previousYear, currentYear]) {
      for (let month = 1; month <= 12; month++) {
        const key = `${year}-${String(month).padStart(2, "0")}`;
        monthlyData[key] = { totalSeconds: 0, sessionCount: 0 };
      }
    }

    lastTwoYearsStats.forEach((stat) => {
      const date = dayjs(stat.date);
      const year = date.year();
      const month = date.month() + 1; // 1-12
      const key = `${year}-${String(month).padStart(2, "0")}`;

      monthlyData[key].totalSeconds += stat.totalSeconds;
      monthlyData[key].sessionCount += stat.sessionCount;
    });

    // Create chart data for 24 months
    const result: AllTimeChartData[] = [];
    for (const year of [previousYear, currentYear]) {
      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      monthNames.forEach((monthName, index) => {
        const month = index + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        result.push({
          date: key,
          month: `${monthName}'${year.toString().slice(2)}`,
          hours: Math.round((monthlyData[key].totalSeconds / 3600) * 100) / 100,
          totalSeconds: monthlyData[key].totalSeconds,
          sessionCount: monthlyData[key].sessionCount,
        });
      });
    }

    return result;
  }, [stats]);

  // Calculate overall statistics
  const allTimeTotal = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const allTimeSessions = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.sessionCount, 0);
  }, [stats]);

  const averagePerMonth = useMemo(() => {
    const monthsWithData = chartData.filter((m) => m.totalSeconds > 0).length;
    return monthsWithData > 0 ? allTimeTotal / monthsWithData : 0;
  }, [allTimeTotal, chartData]);

  const allTimeTitle = useMemo(() => {
    const now = dayjs();
    const currentYear = now.year();
    const previousYear = currentYear - 1;
    return `Năm ${previousYear} - Năm ${currentYear}`;
  }, []);

  if (stats.length === 0) {
    return (
      <Card title={`📊 ${allTimeTitle}`}>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
      </Card>
    );
  }

  return (
    <Card title={`📊 ${allTimeTitle}`}>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard label="Tổng thời gian" value={formatTime(allTimeTotal)} color="blue" format="number" />
        <StatsCard label="Tổng phiên học" value={allTimeSessions} color="green" format="number" />
        <StatsCard
          label="Thời gian/tháng"
          value={formatTime(Math.floor(averagePerMonth))}
          color="purple"
          format="number"
        />
      </Row>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">Thống kê theo tháng</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                interval={Math.floor(Math.max(chartData.length / 20, 0))}
              />
              <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip dataFormatter={allTimeChartFormatter} />} />
              <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.totalSeconds > 0 ? "#1890ff" : "#e6e6e6"}
                    opacity={entry.totalSeconds > 0 ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">Không có dữ liệu để hiển thị</p>
        )}
      </div>
    </Card>
  );
}
