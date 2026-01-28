"use client";

import { Col } from "antd";
import React from "react";

import { formatDuration } from "@/lib/time-utils";

import type { StatsCardColor, StatsCardFormat } from "../../types/stats";

interface StatsCardProps {
  label: string;
  value: number | string;
  color: StatsCardColor;
  format?: StatsCardFormat;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  cyan: "bg-cyan-50 text-cyan-600",
};

export function StatsCard({ label, value, color, format = "number" }: StatsCardProps) {
  let displayValue: string;

  if (format === "duration") {
    displayValue = formatDuration(typeof value === "number" ? value : 0);
  } else if (format === "hours") {
    displayValue = `${typeof value === "number" ? (value / 3600).toFixed(2) : value}h`;
  } else {
    displayValue = String(value);
  }

  return (
    <Col xs={24} sm={8}>
      <div className={`${colorMap[color]} p-4 rounded-lg`}>
        <div className="text-xs text-gray-600 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${colorMap[color].split(" ")[1]}`}>{displayValue}</div>
      </div>
    </Col>
  );
}
