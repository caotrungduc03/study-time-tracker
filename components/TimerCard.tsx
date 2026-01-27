"use client";

import React from "react";
import { Card, Tag } from "antd";
import { TimerDisplay } from "./TimerDisplay";
import { ControlButtons } from "./ControlButtons";
import type { StudySession } from "@/types";

interface TimerCardProps {
  currentTime: number;
  isRunning: boolean;
  isPaused?: boolean;
  sessionType?: StudySession["type"];
  pomodoroActive?: boolean;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop: () => void;
  onReset?: () => void;
}

export function TimerCard({
  currentTime,
  isRunning,
  isPaused = false,
  sessionType,
  pomodoroActive = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: TimerCardProps) {
  // Determine if this is a Pomodoro session
  const isPomodoroWork = sessionType === "pomodoro-work";
  const isPomodoroBreak = sessionType === "pomodoro-break";
  const isPomodoro = isPomodoroWork || isPomodoroBreak;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <span>Timer</span>
          {isPomodoro && (
            <Tag color={isPomodoroWork ? "orange" : "purple"} className="ml-2">
              🍅 {isPomodoroWork ? "Pomodoro - Đang học" : "Pomodoro - Đang nghỉ"}
            </Tag>
          )}
        </div>
      }
      className="h-full"
    >
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <TimerDisplay seconds={currentTime} />
        <ControlButtons
          isRunning={isRunning}
          isPaused={isPaused}
          currentTime={currentTime}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onReset={onReset}
          disableStart={pomodoroActive}
        />
      </div>
    </Card>
  );
}
