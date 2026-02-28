/**
 * Types for Stats components
 */

export interface DailyChartData {
  date: string;
  label: string;
  hours: number;
  totalSeconds: number;
  sessionCount: number;
}

export interface MonthlyChartData {
  date: string;
  day: number;
  hours: number;
  totalSeconds: number;
  sessionCount: number;
}

export interface YearlyChartData {
  week: string;
  hours: number;
  totalSeconds: number;
  daysStudied: number;
  sessionCount: number;
}

export interface AllTimeChartData {
  date: string;
  month: string;
  hours: number;
  totalSeconds: number;
  sessionCount: number;
}

export interface ChartDataPoint {
  date?: string;
  week?: string;
  month?: string;
  day?: number;
  label?: string;
  hours: number;
  totalSeconds: number;
  sessionCount: number;
  daysStudied?: number;
}

export interface CustomTooltipPayload {
  payload: ChartDataPoint;
}

export type StatsCardColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'cyan';

export type StatsCardFormat = 'duration' | 'number' | 'hours';

export type TabKey = 'all-time' | 'week' | 'month' | 'year';

export interface MonthDateRange {
  start: number;
  end: number;
}
