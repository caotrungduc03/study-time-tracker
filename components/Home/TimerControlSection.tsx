"use client";

import { Col, Row } from "antd";
import React from "react";
import PomodoroPanel from "@/components/Pomodoro/PomodoroPanel";
import { TimerCard } from "@/components/TimerCard";
import { StudySession } from "@/types";

interface TimerControlSectionProps {
  currentTime: number;
  isRunning: boolean;
  isPaused: boolean;
  sessionType?: StudySession["type"];
  pomodoroActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const TimerControlSection: React.FC<TimerControlSectionProps> = ({
  currentTime,
  isRunning,
  isPaused,
  sessionType,
  pomodoroActive,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Pomodoro Panel */}
      <Col xs={24} lg={10}>
        <PomodoroPanel />
      </Col>

      {/* Timer Card */}
      <Col xs={24} lg={14}>
        <TimerCard
          currentTime={currentTime}
          isRunning={isRunning}
          isPaused={isPaused}
          sessionType={sessionType}
          pomodoroActive={pomodoroActive}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onReset={onReset}
        />
      </Col>
    </Row>
  );
};
