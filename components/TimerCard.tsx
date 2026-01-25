"use client";

import React from "react";
import { Card, Tag } from "antd";
import { TimerDisplay } from "./TimerDisplay";
import { ControlButtons } from "./ControlButtons";
import type { StudySession } from "@/types";

interface TimerCardProps {
  currentTime: number;
  isRunning: boolean;
  sessionType?: StudySession["type"];
  pomodoroActive?: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset?: () => void;
}

export function TimerCard({
  currentTime,
  isRunning,
  sessionType,
  pomodoroActive = false,
  onStart,
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
          currentTime={currentTime}
          onStart={onStart}
          onStop={onStop}
          onReset={onReset}
          disableStart={pomodoroActive}
        />
      </div>
    </Card>
  );
}
