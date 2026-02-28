'use client';

import React, { useEffect } from 'react';

import PomodoroSettingsCard from '@/components/PomodoroSettingsCard';
import { Timeline } from '@/components/Timeline/Timeline';
import { TimerCard } from '@/components/TimerCard';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTimer } from '@/hooks/useTimer';
import { cleanupInvalidSessions } from '@/lib/db/operations';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useTimerStore } from '@/store/useTimerStore';

export default function Home() {
  const { setRunning, setPaused, setCurrentTime, setCurrentSession } =
    useTimerStore();
  const resetPomodoro = usePomodoroStore((s) => s.resetPomodoro);
  const timer = useTimer();
  const pomodoro = usePomodoro();
  const { sessions, refreshData } = useAppInitialization();

  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      pomodoro.tick(timer.currentTime);
    }
  }, [timer.currentTime, timer.isRunning, timer.isPaused, pomodoro]);

  const handleStart = async () => {
    try {
      await timer.start();
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handlePause = () => {
    try {
      timer.pause();
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  };

  const handleResume = () => {
    try {
      timer.resumeTimer();
    } catch (error) {
      console.error('Failed to resume timer:', error);
    }
  };

  const handleReset = async () => {
    try {
      if (timer.currentSession) {
        await timer.stop();
      }

      setCurrentTime(0);
      setRunning(false);
      setPaused(false);
      setCurrentSession(null);

      timer.resetTimer();

      resetPomodoro();

      const deletedCount = await cleanupInvalidSessions();

      if (deletedCount > 0) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-6">
      <PomodoroSettingsCard disabled={timer.isRunning} />

      <TimerCard
        currentTime={timer.currentTime}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
      />

      <Timeline sessions={sessions} currentSession={timer.currentSession} />
    </div>
  );
}
