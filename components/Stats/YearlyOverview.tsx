"use client";

import { Card, Row, Select } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell,ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatTime } from "@/lib/time-utils";
import type { DailyStat } from "@/types";

import type { YearlyChartData } from "../../types/stats";
import { CustomTooltip, yearlyChartFormatter } from "./ChartTooltip";
import { StatsCard } from "./StatsCard";

dayjs.extend(isoWeek);

interface YearlyOverviewProps {
  stats: DailyStat[];
}

export function YearlyOverview({ stats }: YearlyOverviewProps) {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    stats.forEach((stat) => {
      years.add(dayjs(stat.date).year());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [stats]);

  const [selectedYear, setSelectedYear] = React.useState<number>(availableYears[0] || dayjs().year());

  const yearStats = useMemo(() => {
    return stats.filter((stat) => dayjs(stat.date).year() === selectedYear);
  }, [stats, selectedYear]);

  const chartData = useMemo((): YearlyChartData[] => {
    const weeklyData: Record<number, { totalSeconds: number; daysStudied: number; sessionCount: number }> = {};
    const weekInfo: Record<number, string> = {};

    yearStats.forEach((stat) => {
      const date = dayjs(stat.date);
      const weekNum = date.isoWeek();

      if (!weeklyData[weekNum]) {
        weeklyData[weekNum] = { totalSeconds: 0, daysStudied: 0, sessionCount: 0 };
        weekInfo[weekNum] = `T${weekNum}`;
      }

      weeklyData[weekNum].totalSeconds += stat.totalSeconds;
      weeklyData[weekNum].sessionCount += stat.sessionCount;
      if (stat.totalSeconds > 0) {
        weeklyData[weekNum].daysStudied += 1;
      }
    });

    const weeks: YearlyChartData[] = [];
    for (let w = 1; w <= 52; w++) {
      weeks.push({
        week: `T${w}`,
        hours: weeklyData[w] ? Math.round((weeklyData[w].totalSeconds / 3600) * 100) / 100 : 0,
        totalSeconds: weeklyData[w]?.totalSeconds ?? 0,
        daysStudied: weeklyData[w]?.daysStudied ?? 0,
        sessionCount: weeklyData[w]?.sessionCount ?? 0,
      });
    }
    return weeks;
  }, [yearStats]);

  const yearTotal = useMemo(() => {
    return yearStats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [yearStats]);

  const weeksWithData = useMemo(() => {
    return chartData.filter((w) => w.totalSeconds > 0).length;
  }, [chartData]);

  const totalSessions = useMemo(() => {
    return yearStats.reduce((sum, stat) => sum + stat.sessionCount, 0);
  }, [yearStats]);

  const averagePerWeek = useMemo(() => {
    return weeksWithData > 0 ? yearTotal / weeksWithData : 0;
  }, [yearTotal, weeksWithData]);

  const yearTitle = useMemo(() => {
    return `Tuần 1 - 52 (Năm ${selectedYear})`;
  }, [selectedYear]);

  return (
    <Card
      title={`📅 ${yearTitle}`}
      extra={
        availableYears.length > 1 && (
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={availableYears.map((year) => ({
              label: `Năm ${year}`,
              value: year,
            }))}
            style={{ width: 120 }}
          />
        )
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard label="Tổng thời gian" value={formatTime(yearTotal)} color="blue" format="number" />
        <StatsCard label="Tổng phiên" value={totalSessions} color="green" format="number" />
        <StatsCard
          label="Thời gian/tuần"
          value={formatTime(Math.floor(averagePerWeek))}
          color="purple"
          format="number"
        />
      </Row>

      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">Chi tiết từng tuần</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 15)} />
            <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip dataFormatter={yearlyChartFormatter} />} />
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
