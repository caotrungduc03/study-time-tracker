"use client";

import { memo } from "react";

interface PomodoroCycleCountProps {
  cycleCount: number;
}

function PomodoroCycleCount({ cycleCount }: PomodoroCycleCountProps) {
  if (cycleCount === 0) return null;

  return (
    <div className="text-center mb-4 text-sm text-gray-600">
      Số chu kỳ hoàn thành: <span className="font-semibold">{cycleCount}</span>
    </div>
  );
}

export default memo(PomodoroCycleCount);
