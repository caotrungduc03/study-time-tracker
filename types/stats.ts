/**
 * Types for Stats components
 */

// Chart data types
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

// Base chart data (used generically)
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

// Custom Tooltip props
export interface CustomTooltipPayload {
  payload: ChartDataPoint;
}

// Stats Card color types
export type StatsCardColor = "blue" | "green" | "orange" | "purple" | "red" | "cyan";

// Stats Card format types
export type StatsCardFormat = "duration" | "number" | "hours";

// Tab keys
export type TabKey = "all-time" | "week" | "month" | "year";

// Month date range
export interface MonthDateRange {
  start: number;
  end: number;
}
