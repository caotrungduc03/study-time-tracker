"use client";

import React from "react";

import { formatTime } from "@/lib/time-utils";

interface TimerDisplayProps {
  seconds: number;
  size?: "default" | "large";
}

export function TimerDisplay({ seconds, size = "large" }: TimerDisplayProps) {
  // Validate seconds to prevent display of corrupted data
  // If seconds is unreasonably large (> 7 days), it's likely corrupted
  // 7 days = 604800 seconds (allowing for extreme edge cases like leaving tab open)
  const MAX_REASONABLE_SECONDS = 7 * 24 * 60 * 60;
  const isValid = seconds >= 0 && seconds < MAX_REASONABLE_SECONDS;

  const timeString = isValid ? formatTime(seconds) : "ERROR";

  const fontSize = size === "large" ? "text-6xl md:text-8xl" : "text-4xl md:text-6xl";

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {!isValid && (
        <div className="text-red-500 text-sm mb-2 text-center max-w-md">
          ⚠️ Phát hiện dữ liệu bị hỏng (thời gian không hợp lệ)
          <br />
          Vui lòng click &quot;Dừng&quot; để dọn dẹp, sau đó reload trang
        </div>
      )}
      <div
        className={`font-mono font-bold ${fontSize} tracking-wider ${isValid ? "text-study-active drop-shadow-md" : "text-red-500 drop-shadow-md"} transition-all duration-300`}
      >
        {timeString}
      </div>
    </div>
  );
}
