"use client";

import { Card, Row } from "antd";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell,ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatTime } from "@/lib/time-utils";
import type { DailyStat } from "@/types";

import type { MonthDateRange,MonthlyChartData } from "../../types/stats";
import { CustomTooltip, monthlyChartFormatter } from "./ChartTooltip";
import { StatsCard } from "./StatsCard";

interface MonthlyOverviewProps {
  stats: DailyStat[];
}

export function MonthlyOverview({ stats }: MonthlyOverviewProps) {
  // Get current month (always show current month, not data month)
  const monthDateRange = useMemo((): MonthDateRange => {
    const now = dayjs();
    return { start: now.year(), end: now.month() };
  }, []);

  // Fill in missing dates with empty stats
  const completeStats = useMemo(() => {
    const startOfMonth = dayjs().year(monthDateRange.start).month(monthDateRange.end).startOf("month");
    const daysInMonth = startOfMonth.daysInMonth();
    const monthDates: string[] = [];

    for (let day = 0; day < daysInMonth; day++) {
      monthDates.push(startOfMonth.add(day, "day").format("YYYY-MM-DD"));
    }

    const statsMap = new Map(stats.map((s) => [s.date, s]));

    return monthDates.map((date) => {
      return (
        statsMap.get(date) || {
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
  }, [stats, monthDateRange]);

  // Prepare chart data
  const chartData = useMemo((): MonthlyChartData[] => {
    return completeStats.map((stat) => {
      const date = dayjs(stat.date);
      return {
        date: stat.date,
        day: date.date(),
        hours: Math.round((stat.totalSeconds / 3600) * 100) / 100,
        totalSeconds: stat.totalSeconds,
        sessionCount: stat.sessionCount,
      };
    });
  }, [completeStats]);

  // Calculate monthly totals
  const monthTotal = useMemo(() => {
    return completeStats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [completeStats]);

  const monthSessions = useMemo(() => {
    return completeStats.reduce((sum, stat) => sum + stat.sessionCount, 0);
  }, [completeStats]);

  const averagePerDay = useMemo(() => {
    const daysWithData = completeStats.filter((s) => s.totalSeconds > 0).length;
    return daysWithData > 0 ? monthTotal / daysWithData : 0;
  }, [monthTotal, completeStats]);

  const monthTitle = useMemo(() => {
    const now = dayjs();
    const month = now.month() + 1;
    const daysInMonth = now.daysInMonth();
    return `1 - ${daysInMonth} (Tháng ${month})`;
  }, []);

  return (
    <Card title={`📅 ${monthTitle}`}>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard label="Tổng thời gian" value={formatTime(monthTotal)} color="blue" format="number" />
        <StatsCard label="Tổng phiên" value={monthSessions} color="green" format="number" />
        <StatsCard
          label="Thời gian/ngày"
          value={formatTime(Math.floor(averagePerDay))}
          color="purple"
          format="number"
        />
      </Row>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">Chi tiết từng ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={Math.floor(chartData.length / 15)} />
            <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip dataFormatter={monthlyChartFormatter} />} />
            <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
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
      </div>
    </Card>
  );
}
