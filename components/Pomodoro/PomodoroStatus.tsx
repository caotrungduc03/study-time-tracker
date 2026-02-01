"use client";

import { Progress } from "antd";
import { memo } from "react";

import { formatTime } from "@/lib/time-utils";

interface PomodoroStatusProps {
  state: string;
  remainingSeconds: number;
  workDuration: number;
  breakDuration: number;
}

function PomodoroStatus({ state, remainingSeconds, workDuration, breakDuration }: PomodoroStatusProps) {
  const isWork = state === "work" || state === "work-paused";
  const isPaused = state === "work-paused" || state === "break-paused";
  const totalDuration = isWork ? workDuration : breakDuration;
  const progressPercent = ((totalDuration - remainingSeconds) / totalDuration) * 100;

  const statusColor = isWork ? "#fa8c16" : "#722ed1";
  const statusBgColor = isWork ? "bg-orange-50" : "bg-purple-50";
  const statusBorderColor = isWork ? "border-orange-200" : "border-purple-200";

  return (
    <div className={`rounded-xl p-4 ${statusBgColor} border ${statusBorderColor} transition-all duration-300`}>
      <div className="text-center mb-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {isWork ? "🔥 Đang học" : "☕ Đang nghỉ"}
          {isPaused && " (Tạm dừng)"}
        </div>
        <div className="text-5xl font-mono font-bold tracking-wider" style={{ color: statusColor }}>
          {formatTime(remainingSeconds)}
        </div>
      </div>
      <Progress
        percent={progressPercent}
        showInfo={false}
        strokeColor={{
          "0%": isWork ? "#ffa940" : "#9254de",
          "100%": statusColor,
        }}
        railColor={isWork ? "#fff7e6" : "#f9f0ff"}
        strokeWidth={8}
        className="mb-0"
      />
    </div>
  );
}

export default memo(PomodoroStatus);
