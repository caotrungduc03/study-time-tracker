'use client';

import { Card, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatTime } from '@/lib/time-utils';
import type { DailyStat } from '@/types';

import type { DailyChartData } from '../../types/stats';
import { CustomTooltip, dailyChartFormatter } from './ChartTooltip';
import { StatsCard } from './StatsCard';

interface WeeklyOverviewProps {
  stats: DailyStat[];
}

export function WeeklyOverview({ stats }: WeeklyOverviewProps) {
  const weekDateRange = useMemo(() => {
    if (stats.length === 0) return '';
    const firstDate = dayjs(stats[0].date);
    const lastDate = dayjs(stats[stats.length - 1].date);
    const firstDay = firstDate.format('DD/MM');
    const lastDay = lastDate.format('DD/MM');
    return `${firstDay} - ${lastDay}`;
  }, [stats]);

  const chartData = useMemo((): DailyChartData[] => {
    const last7Days = stats.slice(-7);
    return last7Days.map((stat) => {
      const date = dayjs(stat.date);
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
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

  const averagePerDay = useMemo(() => {
    const today = dayjs();
    const validStats = stats.filter((s) => !dayjs(s.date).isSame(today, 'day'));
    const validTotalSeconds = validStats.reduce(
      (sum, stat) => sum + stat.totalSeconds,
      0,
    );
    const validDaysWithData = validStats.filter(
      (s) => s.totalSeconds > 0,
    ).length;
    return validDaysWithData > 0 ? validTotalSeconds / validDaysWithData : 0;
  }, [stats]);

  if (stats.length === 0) {
    return (
      <Card title={`📅 Tuần (${weekDateRange})`}>
        <p className="py-8 text-center text-gray-500">Chưa có dữ liệu</p>
      </Card>
    );
  }

  return (
    <Card title={`📅 Tuần (${weekDateRange})`}>
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard
          label="Tổng thời gian"
          value={formatTime(totalSeconds)}
          color="blue"
          format="number"
        />
        <StatsCard
          label="Thời gian/ngày"
          value={formatTime(Math.floor(averagePerDay))}
          color="purple"
          format="number"
        />
      </Row>

      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 font-semibold">Chi tiết theo ngày</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              label={{ value: 'Giờ', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip dataFormatter={dailyChartFormatter} />}
            />
            <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.totalSeconds > 0 ? '#1890ff' : '#e6e6e6'}
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
