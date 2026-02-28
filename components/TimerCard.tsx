"use client";

import { Card } from "antd";
import React from "react";

import { ControlButtons } from "./ControlButtons";
import { TimerDisplay } from "./TimerDisplay";

interface TimerCardProps {
  currentTime: number;
  isRunning: boolean;
  isPaused?: boolean;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

export function TimerCard({
  currentTime,
  isRunning,
  isPaused = false,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerCardProps) {
  return (
    <Card className="w-full">
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <TimerDisplay seconds={currentTime} />
        <ControlButtons
          isRunning={isRunning}
          isPaused={isPaused}
          currentTime={currentTime}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onReset={onReset}
        />
      </div>
    </Card>
  );
}
