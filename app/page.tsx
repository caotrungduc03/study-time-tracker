"use client";

import React from "react";
import { Statistic, Row, Col, Card, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TimerCard } from "@/components/TimerCard";
import { Timeline } from "@/components/Timeline/Timeline";
import { PomodoroPanel } from "@/components/PomodoroPanel";
import { RecoveryModal } from "@/components/Modals/RecoveryModal";
import { useTimer } from "@/hooks/useTimer";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAppDispatch, useAppState } from "@/contexts/AppContext";
import { formatDuration } from "@/lib/time-utils";
import { cleanupInvalidSessions } from "@/lib/db/operations";

export default function Home() {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const timer = useTimer();
  const pomodoro = usePomodoro();
  const recovery = useSessionRecovery();
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
        state.pomodoro.state === "work" ||
        state.pomodoro.state === "break" ||
        state.pomodoro.state === "work-paused" ||
        state.pomodoro.state === "break-paused";

      if (isPomodoroActive) {
        // If Pomodoro is active, cancel it (which also stops the timer)
        await pomodoro.cancel();
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
      dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
      dispatch({ type: "SET_RUNNING", payload: false });
      dispatch({ type: "SET_CURRENT_SESSION", payload: null });

      // Cleanup any invalid sessions
      const deletedCount = await cleanupInvalidSessions();

      if (deletedCount > 0) {
        console.log(`Reset: Cleaned up ${deletedCount} corrupted sessions`);
        // Reload data after cleanup
        await refreshData();
      }
    } catch (error) {
      console.error("Failed to reset timer:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Recovery Modal */}
      <RecoveryModal
        open={recovery.showRecoveryModal}
        session={recovery.unfinishedSession}
        onClose={recovery.clearSession}
      />

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
            sessionType={timer.currentSession?.type}
            pomodoroActive={state.pomodoro.state !== "idle" && state.pomodoro.state !== "completed"}
            onStart={handleStart}
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
                styles={{ content: { color: "#3f8600" } }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={
                  <span className="flex items-center gap-1">
                    Số phiên học
                    <Tooltip title="Chỉ tính các phiên học >= 1 phút. Phiên < 1 phút sẽ bị bỏ qua.">
                      <InfoCircleOutlined className="text-gray-400 cursor-help" style={{ fontSize: "14px" }} />
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
