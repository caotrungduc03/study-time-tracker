"use client";

import { useCallback, useEffect } from "react";

import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useSettingsStore } from "@/store/useSettingsStore";

import { useTimer } from "./useTimer";
import { getAssetPath } from "@/lib/url-utils";

export function usePomodoro() {
  // Use selectors to subscribe only to needed state
  const pomodoroState = usePomodoroStore((state) => state.state);
  const remainingSeconds = usePomodoroStore((state) => state.remainingSeconds);
  const cycleCount = usePomodoroStore((state) => state.cycleCount);
  const setPomodoroState = usePomodoroStore((state) => state.setPomodoroState);
  const setPomodoroRemaining = usePomodoroStore((state) => state.setPomodoroRemaining);
  const incrementPomodoroCycle = usePomodoroStore((state) => state.incrementPomodoroCycle);
  const resetPomodoro = usePomodoroStore((state) => state.resetPomodoro);

  // Settings selector
  const soundEnabled = useSettingsStore((state) => state.settings.pomodoro.soundEnabled);
  const workDuration = useSettingsStore((state) => state.settings.pomodoro.workDuration);
  const breakDuration = useSettingsStore((state) => state.settings.pomodoro.breakDuration);
  const autoStartBreak = useSettingsStore((state) => state.settings.pomodoro.autoStartBreak);

  const timer = useTimer();

  /**
   * Play notification sound when timer completes
   */
  const playSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio(getAssetPath("/sounds/alarm-kitchen.mp3"));
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error("Failed to play alarm sound:", error);
      });
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }, [soundEnabled]);

  /**
   * Play button click sound
   */
  const playButtonSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio(getAssetPath("/sounds/button.wav"));
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.error("Failed to play button sound:", error);
      });
    } catch (error) {
      console.error("Failed to play button sound:", error);
    }
  }, [soundEnabled]);

  /**
   * Start Pomodoro work session
   */
  const startWork = useCallback(async () => {
    try {
      // Play button sound
      playButtonSound();

      // Start timer with pomodoro-work type
      await timer.start("pomodoro-work");

      // Update Pomodoro state
      setPomodoroState("work");
      setPomodoroRemaining(workDuration);
    } catch (error) {
      console.error("Failed to start Pomodoro work:", error);
    }
  }, [playButtonSound, timer, setPomodoroState, setPomodoroRemaining, workDuration]);

  /**
   * Start Pomodoro break session
   */
  const startBreak = useCallback(async () => {
    try {
      // Start timer with pomodoro-break type
      await timer.start("pomodoro-break");

      // Update Pomodoro state
      setPomodoroState("break");
      setPomodoroRemaining(breakDuration);
    } catch (error) {
      console.error("Failed to start Pomodoro break:", error);
    }
  }, [timer, setPomodoroState, setPomodoroRemaining, breakDuration]);

  /**
   * Pause Pomodoro
   */
  const pause = useCallback(() => {
    if (pomodoroState === "work") {
      setPomodoroState("work-paused");
      timer.pause();
    } else if (pomodoroState === "break") {
      setPomodoroState("break-paused");
      timer.pause();
    }
  }, [pomodoroState, setPomodoroState, timer]);

  /**
   * Resume Pomodoro
   */
  const resumePomodoro = useCallback(() => {
    if (pomodoroState === "work-paused") {
      setPomodoroState("work");
      timer.resumeTimer();
    } else if (pomodoroState === "break-paused") {
      setPomodoroState("break");
      timer.resumeTimer();
    }
  }, [pomodoroState, setPomodoroState, timer]);

  /**
   * Skip break and start new work session
   */
  const skipBreak = useCallback(async () => {
    if (pomodoroState === "break" || pomodoroState === "break-paused") {
      await timer.stop();
      incrementPomodoroCycle();
      await startWork();
    }
  }, [pomodoroState, timer, incrementPomodoroCycle, startWork]);

  /**
   * Cancel Pomodoro cycle
   * If cancelled during work phase (< 1 min), subtract that time from the timer
   * but don't reset timer to 0
   */
  const cancelPomodoro = useCallback(async () => {
    // Get the current pomodoro duration before cancelling
    const currentPomodoroTime = timer.currentTime;
    const wasInWorkPhase = pomodoroState === "work" || pomodoroState === "work-paused";

    // Cancel the timer session (will delete from DB)
    await timer.cancel();

    // If we were in work phase and time < 1 min, we need to adjust the timer
    // The timer.cancel() already handles the session deletion
    // We just need to reset pomodoro state
    resetPomodoro(workDuration);

    // If the session was in work phase, keep track of the time for display
    // but the session is already deleted by timer.cancel()
  }, [timer, resetPomodoro, workDuration, pomodoroState]);

  /**
   * Complete current Pomodoro work phase immediately
   * Saves the session and moves to break or completes
   */
  const completePomodoro = useCallback(async () => {
    if (pomodoroState !== "work" && pomodoroState !== "work-paused") {
      return; // Can only complete during work phase
    }

    // Stop the timer and save the session
    await timer.stop();

    // Play completion sound
    playSound();

    // Increment cycle count
    incrementPomodoroCycle();

    // Auto-start break if enabled
    if (autoStartBreak) {
      await startBreak();
    } else {
      setPomodoroState("completed");
    }
  }, [pomodoroState, timer, playSound, autoStartBreak, startBreak, incrementPomodoroCycle, setPomodoroState]);

  /**
   * Complete current phase and move to next
   */
  const completePhase = useCallback(async () => {
    await timer.stop();

    if (pomodoroState === "work") {
      // Work completed
      playSound();

      incrementPomodoroCycle();

      // Auto-start break if enabled
      if (autoStartBreak) {
        await startBreak();
      } else {
        setPomodoroState("completed");
      }
    } else if (pomodoroState === "break") {
      // Break completed
      playSound();

      setPomodoroState("idle");
    }
  }, [pomodoroState, timer, playSound, autoStartBreak, startBreak, incrementPomodoroCycle, setPomodoroState]);

  /**
   * Sync Pomodoro with Timer (Countdown effect)
   * Instead of a separate interval, we derive remaining time from the main timer
   */
  useEffect(() => {
    // Only run if we are in an active work or break phase
    if (pomodoroState === "work" || pomodoroState === "break") {
      const duration = pomodoroState === "work" ? workDuration : breakDuration;

      // Calculate remaining time based on main timer
      // This ensures Pomodoro and Main Timer are always in sync
      const remaining = Math.max(0, duration - timer.currentTime);

      // Only dispatch if value changed to avoid infinite loops
      if (remaining !== remainingSeconds) {
        setPomodoroRemaining(remaining);
      }

      // Check if time is up
      if (remaining <= 0) {
        completePhase();
      }
    }
  }, [
    timer.currentTime,
    pomodoroState,
    remainingSeconds,
    workDuration,
    breakDuration,
    setPomodoroRemaining,
    completePhase,
  ]);

  /**
   * Sync pause state: when timer is paused/resumed, sync pomodoro state
   */
  useEffect(() => {
    if (timer.isPaused && (pomodoroState === "work" || pomodoroState === "break")) {
      // Timer was paused from outside, pause pomodoro too
      if (pomodoroState === "work") {
        setPomodoroState("work-paused");
      } else if (pomodoroState === "break") {
        setPomodoroState("break-paused");
      }
    } else if (!timer.isPaused && (pomodoroState === "work-paused" || pomodoroState === "break-paused")) {
      // Timer was resumed from outside, resume pomodoro too
      if (pomodoroState === "work-paused") {
        setPomodoroState("work");
      } else if (pomodoroState === "break-paused") {
        setPomodoroState("break");
      }
    }
  }, [timer.isPaused, pomodoroState, setPomodoroState]);

  return {
    state: pomodoroState,
    remainingSeconds,
    cycleCount,
    startWork,
    startBreak,
    pause,
    resume: resumePomodoro,
    skipBreak,
    cancel: cancelPomodoro,
    complete: completePomodoro,
  };
}
