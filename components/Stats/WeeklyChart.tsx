"use client";

import React, { useMemo } from "react";
import { Card } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DailyStat } from "@/types";
import { secondsToHours, formatDuration } from "@/lib/time-utils";

interface WeeklyChartProps {
  stats: DailyStat[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyStat & { label: string; hours: number } }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold mb-1">{data.label.replace("\n", " ")}</p>
        <p className="text-blue-600 font-semibold">{formatDuration(data.totalSeconds)}</p>
        <p className="text-sm text-gray-600">{data.sessionCount} phiên học</p>
      </div>
    );
  }
  return null;
};

export function WeeklyChart({ stats }: WeeklyChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return stats.map((stat) => {
      const date = new Date(stat.date);
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayName = dayNames[date.getDay()];
      const shortDate = `${date.getDate()}/${date.getMonth() + 1}`;

      return {
        date: stat.date,
        label: `${dayName}\n${shortDate}`,
        hours: secondsToHours(stat.totalSeconds),
        totalSeconds: stat.totalSeconds,
        sessionCount: stat.sessionCount,
      };
    });
  }, [stats]);

  // Calculate total for the week
  const weekTotal = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const weekAverage = useMemo(() => {
    const daysWithData = stats.filter((s) => s.totalSeconds > 0).length;
    return daysWithData > 0 ? weekTotal / daysWithData : 0;
  }, [stats, weekTotal]);

  // Get max value for Y axis
  const maxHours = Math.max(...chartData.map((d) => d.hours), 1);
  const yAxisMax = Math.ceil(maxHours + 1);

  return (
    <Card
      title="📈 Thống kê tuần này"
      extra={
        <div className="text-sm">
          <span className="text-gray-600">Tổng: </span>
          <span className="font-semibold text-blue-600">{formatDuration(weekTotal)}</span>
        </div>
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Tổng thời gian</div>
          <div className="text-xl font-bold text-blue-600">{formatDuration(weekTotal)}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Trung bình/ngày</div>
          <div className="text-xl font-bold text-green-600">{formatDuration(Math.floor(weekAverage))}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
          <YAxis
            label={{ value: "Giờ", angle: -90, position: "insideLeft" }}
            domain={[0, yAxisMax]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.totalSeconds > 0 ? "#1890ff" : "#e5e7eb"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Days Active */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Số ngày đã học:</span>
          <span className="font-semibold">{stats.filter((s) => s.totalSeconds > 0).length} / 7 ngày</span>
        </div>
      </div>
    </Card>
  );
}
