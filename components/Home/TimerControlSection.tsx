"use client";

import React from "react";
import { TimerCard } from "@/components/TimerCard";

interface TimerControlSectionProps {
  currentTime: number;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const TimerControlSection: React.FC<TimerControlSectionProps> = ({
  currentTime,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
}) => {
  return (
    <TimerCard
      currentTime={currentTime}
      isRunning={isRunning}
      isPaused={isPaused}
      onStart={onStart}
      onPause={onPause}
      onResume={onResume}
      onReset={onReset}
    />
  );
};
