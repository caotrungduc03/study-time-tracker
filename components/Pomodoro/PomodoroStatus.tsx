"use client";

import { memo } from "react";
import { Progress } from "antd";
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

  return (
    <div className="mb-4">
      <div className="text-center mb-2">
        <div className="text-sm text-gray-500 mb-1">
          {isWork ? "Đang học" : "Đang nghỉ"}
          {isPaused && " (Tạm dừng)"}
        </div>
        <div className="text-4xl font-mono font-bold text-study-pomodoro">{formatTime(remainingSeconds)}</div>
      </div>
      <Progress percent={progressPercent} showInfo={false} strokeColor={isWork ? "#fa8c16" : "#722ed1"} />
    </div>
  );
}

export default memo(PomodoroStatus);
