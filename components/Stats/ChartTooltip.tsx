'use client';

import React from 'react';

import { formatDuration } from '@/lib/time-utils';

import type {
  AllTimeChartData,
  ChartDataPoint,
  DailyChartData,
  MonthlyChartData,
  YearlyChartData,
} from '../../types/stats';

interface CustomTooltipProps<T extends ChartDataPoint = ChartDataPoint> {
  active?: boolean;
  payload?: {
    payload: T;
  }[];
  dataFormatter?: (data: T) => React.ReactNode;
}

export function CustomTooltip<T extends ChartDataPoint = ChartDataPoint>({
  active,
  payload,
  dataFormatter,
}: CustomTooltipProps<T>) {
  if (active && payload && payload.length && dataFormatter) {
    const data = payload[0].payload;

    return (
      <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        {dataFormatter(data)}
      </div>
    );
  }
  return null;
}

export const dailyChartFormatter = (data: DailyChartData) => (
  <>
    <p className="font-semibold">
      {new Date(data.date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })}
    </p>
    <p className="font-semibold text-blue-600">
      Thời gian: {formatDuration(data.totalSeconds)}
    </p>
    <p className="font-semibold text-green-600">
      Giờ: {data.hours.toFixed(2)}h
    </p>
  </>
);

export const monthlyChartFormatter = (data: MonthlyChartData) => (
  <>
    <p className="font-semibold">
      {new Date(data.date).toLocaleDateString('vi-VN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })}
    </p>
    <p className="font-semibold text-blue-600">
      Thời gian: {formatDuration(data.totalSeconds)}
    </p>
    <p className="font-semibold text-green-600">
      Giờ: {data.hours.toFixed(2)}h
    </p>
  </>
);

export const yearlyChartFormatter = (data: YearlyChartData) => (
  <>
    <p className="font-semibold">{data.week}</p>
    <p className="font-semibold text-blue-600">
      Thời gian: {formatDuration(data.totalSeconds)}
    </p>
    <p className="font-semibold text-green-600">
      Giờ: {data.hours.toFixed(2)}h
    </p>
  </>
);

export const allTimeChartFormatter = (data: AllTimeChartData) => (
  <>
    <p className="font-semibold">{data.month}</p>
    <p className="font-semibold text-blue-600">
      Thời gian: {formatDuration(data.totalSeconds)}
    </p>
    <p className="font-semibold text-green-600">
      Giờ: {data.hours.toFixed(2)}h
    </p>
  </>
);
