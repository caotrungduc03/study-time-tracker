"use client";

import React from "react";
import { Statistic, Row, Col, Card, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TimerCard } from "@/components/TimerCard";
import { Timeline } from "@/components/Timeline/Timeline";
import PomodoroPanel from "@/components/Pomodoro/PomodoroPanel";
import { useTimer } from "@/hooks/useTimer";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useTimerStore } from "@/store/useTimerStore";
import { formatDuration } from "@/lib/time-utils";
import { cleanupInvalidSessions } from "@/lib/db/operations";

export default function Home() {
  const pomodoroState = usePomodoroStore((state) => state.state);
  const { setRunning, setPaused, setCurrentTime, setCurrentSession } = useTimerStore();
  const timer = useTimer();
  const pomodoroHook = usePomodoro();
  const { sessions, todayStats, refreshData } = useAppInitialization();

  const handleStart = async () => {
    try {
      await timer.start("normal");
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handleStop = async () => {
    try {
      // Check if Pomodoro is active
      const isPomodoroActive =
        pomodoroState === "work" ||
        pomodoroState === "break" ||
        pomodoroState === "work-paused" ||
        pomodoroState === "break-paused";

      if (isPomodoroActive) {
        // If Pomodoro is active, cancel it (which also stops the timer)
        await pomodoroHook.cancel();
      } else {
        // Otherwise just stop the regular timer
        await timer.stop();
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const handleReset = async () => {
    try {
      // Force reset timer state
      setCurrentTime(0);
      setRunning(false);
      setPaused(false);
      setCurrentSession(null);

      // Cleanup any invalid sessions
      const deletedCount = await cleanupInvalidSessions();

      if (deletedCount > 0) {
        // Reload data after cleanup
        await refreshData();
      }
    } catch (error) {
      console.error("Failed to reset timer:", error);
    }
  };

  const handlePause = () => {
    try {
      // Check if Pomodoro is active
      const isPomodoroActive = pomodoroState === "work" || pomodoroState === "break";

      if (isPomodoroActive) {
        // If Pomodoro is active, pause via Pomodoro hook
        pomodoroHook.pause();
      } else {
        // Otherwise just pause the regular timer
        timer.pause();
      }
    } catch (error) {
      console.error("Failed to pause timer:", error);
    }
  };

  const handleResume = () => {
    try {
      // Check if Pomodoro is paused
      const isPomodoroActive = pomodoroState === "work-paused" || pomodoroState === "break-paused";

      if (isPomodoroActive) {
        // If Pomodoro is paused, resume via Pomodoro hook
        pomodoroHook.resume();
      } else {
        // Otherwise just resume the regular timer
        timer.resumeTimer();
      }
    } catch (error) {
      console.error("Failed to resume timer:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Timer and Pomodoro Row */}
      <Row gutter={[16, 16]}>
        {/* Pomodoro Panel */}
        <Col xs={24} lg={10}>
          <PomodoroPanel />
        </Col>

        {/* Timer Card */}
        <Col xs={24} lg={14}>
          <TimerCard
            currentTime={timer.currentTime}
            isRunning={timer.isRunning}
            isPaused={timer.isPaused}
            sessionType={timer.currentSession?.type}
            pomodoroActive={pomodoroState !== "idle" && pomodoroState !== "completed"}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReset={handleReset}
          />
        </Col>
      </Row>

      {/* Today's Summary */}
      {todayStats && (
        <Card>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Tổng thời gian hôm nay"
                value={formatDuration(todayStats.totalSeconds)}
                className="text-green-700"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={
                  <span className="flex items-center gap-1">
                    Số phiên học
                    <Tooltip title="Chỉ tính các phiên học >= 1 phút. Phiên < 1 phút sẽ bị bỏ qua.">
                      <InfoCircleOutlined className="text-gray-400 cursor-help text-sm" />
                    </Tooltip>
                  </span>
                }
                value={todayStats.sessionCount}
                suffix="phiên"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic title="Trung bình/phiên" value={formatDuration(todayStats.averageSessionDuration)} />
            </Col>
          </Row>
        </Card>
      )}

      {/* Timeline Full Width */}
      <Timeline sessions={sessions} currentSession={timer.currentSession} />
    </div>
  );
}
