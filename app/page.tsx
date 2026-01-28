"use client";

import React from "react";

import { TodayStatsCard, TimerControlSection } from "@/components/Home";
import { Timeline } from "@/components/Timeline/Timeline";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useTimer } from "@/hooks/useTimer";
import { cleanupInvalidSessions } from "@/lib/db/operations";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useTimerStore } from "@/store/useTimerStore";

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
      <TimerControlSection
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

      {/* Today's Summary */}
      {todayStats && (
        <TodayStatsCard
          totalSeconds={todayStats.totalSeconds}
          sessionCount={todayStats.sessionCount}
          averageSessionDuration={todayStats.averageSessionDuration}
        />
      )}

      {/* Timeline Full Width */}
      <Timeline sessions={sessions} currentSession={timer.currentSession} />
    </div>
  );
}
