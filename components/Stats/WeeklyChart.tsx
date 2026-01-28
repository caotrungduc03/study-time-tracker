"use client";

import { Card, Col,Row } from "antd";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell,ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatDuration } from "@/lib/time-utils";
import type { DailyStat } from "@/types";

interface WeeklyChartProps {
  stats: DailyStat[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: {
      date: string;
      label: string;
      hours: number;
      totalSeconds: number;
      sessionCount: number;
    };
  }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const dateStr = date.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    });

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 space-y-1">
        <p className="font-semibold">
          {data.label.replace("\n", " ")} ({dateStr})
        </p>
        <p className="text-blue-600 font-semibold">Thời gian: {formatDuration(data.totalSeconds)}</p>
        <p className="text-green-600 font-semibold">Giờ: {data.hours.toFixed(2)}h</p>
        <p className="text-orange-600 font-semibold">Phiên: {data.sessionCount}</p>
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
        hours: Math.round((stat.totalSeconds / 3600) * 100) / 100,
        totalSeconds: stat.totalSeconds,
        sessionCount: stat.sessionCount,
      };
    });
  }, [stats]);

  // Calculate total for the week
  const weekTotal = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const weekSessions = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.sessionCount, 0);
  }, [stats]);

  const averagePerSession = useMemo(() => {
    return weekSessions > 0 ? weekTotal / weekSessions : 0;
  }, [weekTotal, weekSessions]);

  // Get week range for title
  const weekTitle = useMemo(() => {
    if (stats.length === 0) return "Tuần này";
    const firstDate = new Date(stats[0].date);
    const lastDate = new Date(stats[stats.length - 1].date);
    const firstDay = firstDate.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
    const lastDay = lastDate.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
    return `${firstDay} - ${lastDay}`;
  }, [stats]);

  // Get max value for Y axis
  const maxHours = Math.max(...chartData.map((d) => d.hours), 1);
  const yAxisMax = Math.ceil(maxHours + 1);

  return (
    <Card title={`📈 ${weekTitle}`}>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Tổng thời gian</div>
            <div className="text-2xl font-bold text-blue-600">{formatDuration(weekTotal)}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Tổng phiên</div>
            <div className="text-2xl font-bold text-green-600">{weekSessions}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">TB/phiên</div>
            <div className="text-2xl font-bold text-purple-600">{formatDuration(Math.floor(averagePerSession))}</div>
          </div>
        </Col>
      </Row>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">Chi tiết từng ngày</h3>
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
