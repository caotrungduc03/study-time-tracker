"use client";

import { memo } from "react";

interface PomodoroCycleCountProps {
  cycleCount: number;
  targetCycles: number;
}

function PomodoroCycleCount({ cycleCount, targetCycles }: PomodoroCycleCountProps) {
  // Display cycle count, capped at target
  const displayCycleCount = Math.min(cycleCount, targetCycles);
  // Break count = completed sessions - 1 (breaks are between sessions)
  const breakCount = Math.max(0, targetCycles - 1);
  const completedBreaks = Math.max(0, Math.min(cycleCount - 1, breakCount));

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded bg-study-pomodoro" />
          <span>
            Học ({displayCycleCount}/{targetCycles})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-study-break" />
          <span>
            Nghỉ ({completedBreaks}/{breakCount})
          </span>
        </div>
      </div>

      {cycleCount >= targetCycles && (
        <div className="mt-2 text-center text-sm text-green-600 font-medium">🎉 Hoàn thành mục tiêu!</div>
      )}
    </div>
  );
}

export default memo(PomodoroCycleCount);
