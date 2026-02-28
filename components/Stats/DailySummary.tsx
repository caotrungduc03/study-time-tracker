"use client";

import { Card, Row } from "antd";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell,ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatTime } from "@/lib/time-utils";
import type { DailyStat } from "@/types";

import type { DailyChartData } from "../../types/stats";
import { CustomTooltip, dailyChartFormatter } from "./ChartTooltip";
import { StatsCard } from "./StatsCard";

interface DailySummaryProps {
  stats: DailyStat[];
}

export function DailySummary({ stats }: DailySummaryProps) {
  const weekDateRange = useMemo(() => {
    if (stats.length === 0) return "";
    const firstDate = dayjs(stats[0].date);
    const lastDate = dayjs(stats[stats.length - 1].date);
    const firstDay = firstDate.format("DD/MM");
    const lastDay = lastDate.format("DD/MM");
    return `${firstDay} - ${lastDay}`;
  }, [stats]);

  const chartData = useMemo((): DailyChartData[] => {
    const last7Days = stats.slice(-7);
    return last7Days.map((stat) => {
      const date = dayjs(stat.date);
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayOfWeek = date.day();
      return {
        date: stat.date,
        label: dayNames[dayOfWeek],
        hours: Math.round((stat.totalSeconds / 3600) * 100) / 100,
        totalSeconds: stat.totalSeconds,
        sessionCount: stat.sessionCount,
      };
    });
  }, [stats]);

  const totalSeconds = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const totalSessions = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.sessionCount, 0);
  }, [stats]);

  const averagePerDay = useMemo(() => {
    const daysWithData = stats.filter((s) => s.totalSeconds > 0).length;
    return daysWithData > 0 ? totalSeconds / daysWithData : 0;
  }, [stats, totalSeconds]);

  if (stats.length === 0) {
    return (
      <Card title={`📊 Tuần (${weekDateRange})`}>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
      </Card>
    );
  }

  return (
    <Card title={`📊 Tuần (${weekDateRange})`}>
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard label="Tổng thời gian" value={formatTime(totalSeconds)} color="blue" format="number" />
        <StatsCard label="Tổng phiên" value={totalSessions} color="green" format="number" />
        <StatsCard
          label="Thời gian/ngày"
          value={formatTime(Math.floor(averagePerDay))}
          color="purple"
          format="number"
        />
      </Row>

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">Chi tiết 7 ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip dataFormatter={dailyChartFormatter} />} />
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
