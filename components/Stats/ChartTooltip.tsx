"use client";

import React from "react";

import { formatDuration } from "@/lib/time-utils";

import type {
  AllTimeChartData,
  ChartDataPoint,
  DailyChartData,
  MonthlyChartData,
  YearlyChartData,
} from "../../types/stats";

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
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 space-y-1">{dataFormatter(data)}</div>
    );
  }
  return null;
}

export const dailyChartFormatter = (data: DailyChartData) => (
  <>
    <p className="font-semibold">
      {new Date(data.date).toLocaleDateString("vi-VN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })}
    </p>
    <p className="text-blue-600 font-semibold">Thời gian: {formatDuration(data.totalSeconds)}</p>
    <p className="text-green-600 font-semibold">Giờ: {data.hours.toFixed(2)}h</p>
    <p className="text-orange-600 font-semibold">Phiên: {data.sessionCount}</p>
  </>
);

export const monthlyChartFormatter = (data: MonthlyChartData) => (
  <>
    <p className="font-semibold">
      {new Date(data.date).toLocaleDateString("vi-VN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
    </p>
    <p className="text-blue-600 font-semibold">Thời gian: {formatDuration(data.totalSeconds)}</p>
    <p className="text-green-600 font-semibold">Giờ: {data.hours.toFixed(2)}h</p>
    <p className="text-orange-600 font-semibold">Phiên: {data.sessionCount}</p>
  </>
);

export const yearlyChartFormatter = (data: YearlyChartData) => (
  <>
    <p className="font-semibold">{data.week}</p>
    <p className="text-blue-600 font-semibold">Thời gian: {formatDuration(data.totalSeconds)}</p>
    <p className="text-green-600 font-semibold">Giờ: {data.hours.toFixed(2)}h</p>
    <p className="text-orange-600 font-semibold">Phiên: {data.sessionCount}</p>
  </>
);

export const allTimeChartFormatter = (data: AllTimeChartData) => (
  <>
    <p className="font-semibold">{data.month}</p>
    <p className="text-blue-600 font-semibold">Thời gian: {formatDuration(data.totalSeconds)}</p>
    <p className="text-green-600 font-semibold">Giờ: {data.hours.toFixed(2)}h</p>
    <p className="text-orange-600 font-semibold">Phiên: {data.sessionCount}</p>
  </>
);
