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

import type { AllTimeChartData } from '../../types/stats';
import { allTimeChartFormatter, CustomTooltip } from './ChartTooltip';
import { StatsCard } from './StatsCard';

interface AllTimeOverviewProps {
  stats: DailyStat[];
}

export function AllTimeOverview({ stats }: AllTimeOverviewProps) {
  const chartData = useMemo((): AllTimeChartData[] => {
    if (stats.length === 0) return [];

    const now = dayjs();
    const currentYear = now.year();
    const previousYear = currentYear - 1;

    const lastTwoYearsStats = stats.filter((stat) => {
      const year = dayjs(stat.date).year();
      return year === currentYear || year === previousYear;
    });

    const monthlyData: Record<
      string,
      { totalSeconds: number; sessionCount: number }
    > = {};

    for (const year of [previousYear, currentYear]) {
      for (let month = 1; month <= 12; month++) {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        monthlyData[key] = { totalSeconds: 0, sessionCount: 0 };
      }
    }

    lastTwoYearsStats.forEach((stat) => {
      const date = dayjs(stat.date);
      const year = date.year();
      const month = date.month() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;

      monthlyData[key].totalSeconds += stat.totalSeconds;
      monthlyData[key].sessionCount += stat.sessionCount;
    });

    const result: AllTimeChartData[] = [];
    for (const year of [previousYear, currentYear]) {
      const monthNames = [
        'T1',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7',
        'T8',
        'T9',
        'T10',
        'T11',
        'T12',
      ];
      monthNames.forEach((monthName, index) => {
        const month = index + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;
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

  const allTimeTotal = useMemo(() => {
    return stats.reduce((sum, stat) => sum + stat.totalSeconds, 0);
  }, [stats]);

  const averagePerMonth = useMemo(() => {
    const thisMonth = dayjs();
    const validStats = stats.filter(
      (s) => !dayjs(s.date).isSame(thisMonth, 'month'),
    );
    const validTotalSeconds = validStats.reduce(
      (sum, stat) => sum + stat.totalSeconds,
      0,
    );
    const validMonthsWithData = new Set(
      validStats
        .filter((s) => s.totalSeconds > 0)
        .map((s) => dayjs(s.date).format('YYYY-MM')),
    ).size;
    return validMonthsWithData > 0
      ? validTotalSeconds / validMonthsWithData
      : 0;
  }, [stats]);

  const allTimeTitle = useMemo(() => {
    const now = dayjs();
    const currentYear = now.year();
    const previousYear = currentYear - 1;
    return `Năm ${previousYear} - Năm ${currentYear}`;
  }, []);

  if (stats.length === 0) {
    return (
      <Card title={`📅 ${allTimeTitle}`}>
        <p className="py-8 text-center text-gray-500">Chưa có dữ liệu</p>
      </Card>
    );
  }

  return (
    <Card title={`📅 ${allTimeTitle}`}>
      <Row gutter={[16, 16]} className="mb-6">
        <StatsCard
          label="Tổng thời gian"
          value={formatTime(allTimeTotal)}
          color="blue"
          format="number"
        />
        <StatsCard
          label="Thời gian/tháng"
          value={formatTime(Math.floor(averagePerMonth))}
          color="purple"
          format="number"
        />
      </Row>

      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 font-semibold">Chi tiết theo tháng</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                interval={Math.floor(Math.max(chartData.length / 20, 0))}
              />
              <YAxis
                label={{ value: 'Giờ', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={
                  <CustomTooltip dataFormatter={allTimeChartFormatter} />
                }
              />
              <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
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
        ) : (
          <p className="py-8 text-center text-gray-400">
            Không có dữ liệu để hiển thị
          </p>
        )}
      </div>
    </Card>
  );
}
