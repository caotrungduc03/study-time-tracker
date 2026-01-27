"use client";

import React, { useMemo } from "react";
import { Card, Row, Col, Statistic } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyStat } from "@/types";
import { secondsToHours, formatDuration } from "@/lib/time-utils";

interface MonthlyOverviewProps {
  stats: DailyStat[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyStat & { hours: number; day: number } }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold mb-1">Ngày {data.day}</p>
        <p className="text-blue-600 font-semibold">{formatDuration(data.totalSeconds)}</p>
      </div>
    );
  }
  return null;
};

export function MonthlyOverview({ stats }: MonthlyOverviewProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return stats.map((stat) => {
      const date = new Date(stat.date);
      return {
        date: stat.date,
        day: date.getDate(),
        hours: secondsToHours(stat.totalSeconds),
        totalSeconds: stat.totalSeconds,
      };
    });
  }, [stats]);

  // Calculate monthly totals
  const monthTotal = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const daysStudied = useMemo(() => {
    return stats.filter((s) => s.totalSeconds > 0).length;
  }, [stats]);

  const bestDay = useMemo(() => {
    if (stats.length === 0) return null;
    return stats.reduce((best, current) => (current.totalSeconds > best.totalSeconds ? current : best));
  }, [stats]);

  const averagePerDay = useMemo(() => {
    return daysStudied > 0 ? monthTotal / daysStudied : 0;
  }, [monthTotal, daysStudied]);

  const currentMonth =
    stats.length > 0 ? new Date(stats[0].date).toLocaleDateString("vi-VN", { month: "long", year: "numeric" }) : "";

  return (
    <Card title={`📅 Tháng ${currentMonth}`}>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <div className="text-blue-500 text-xl font-semibold">
            <Statistic title="Tổng thời gian" value={formatDuration(monthTotal)} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="text-xl font-semibold">
            <Statistic
              title="Ngày đã học"
              value={daysStudied}
              suffix={`/ ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}`}
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="text-xl font-semibold">
            <Statistic title="Trung bình/ngày" value={formatDuration(Math.floor(averagePerDay))} />
          </div>
          <Col xs={12} sm={6}>
            <div className="text-green-600 text-xl font-semibold">
              <Statistic title="Ngày học nhiều nhất" value={bestDay ? formatDuration(bestDay.totalSeconds) : "0s"} />
            </div>
          </Col>
        </Col>
      </Row>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              label={{ value: "Ngày", position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ fill: "#1890ff", r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Best Day Info */}
      {bestDay && bestDay.totalSeconds > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ngày học hiệu quả nhất:</span>
            <span className="font-semibold">
              {new Date(bestDay.date).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
