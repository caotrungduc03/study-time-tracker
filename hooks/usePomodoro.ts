"use client";

import { useEffect, useCallback } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTimer } from "./useTimer";

export function usePomodoro() {
  const {
    state: pomodoroState,
    remainingSeconds,
    cycleCount,
    setPomodoroState,
    setPomodoroRemaining,
    incrementPomodoroCycle,
    resetPomodoro,
  } = usePomodoroStore();
  const settings = useSettingsStore((state) => state.settings);
  const timer = useTimer();

  /**
   * Play notification sound when timer completes
   */
  const playSound = useCallback(() => {
    if (!settings.pomodoro.soundEnabled) return;

    try {
      const audio = new Audio("/sounds/alarm-kitchen.mp3");
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error("Failed to play alarm sound:", error);
      });
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }, [settings.pomodoro.soundEnabled]);

  /**
   * Play button click sound
   */
  const playButtonSound = useCallback(() => {
    if (!settings.pomodoro.soundEnabled) return;

    try {
      const audio = new Audio("/sounds/button.wav");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.error("Failed to play button sound:", error);
      });
    } catch (error) {
      console.error("Failed to play button sound:", error);
    }
  }, [settings.pomodoro.soundEnabled]);

  /**
   * Show browser notification
   */
  const showNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.notifications.pomodoroEnd) return;

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/icon.png" });
      }
    },
    [settings.notifications.pomodoroEnd],
  );

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
      setPomodoroRemaining(settings.pomodoro.workDuration);
    } catch (error) {
      console.error("Failed to start Pomodoro work:", error);
    }
  }, [playButtonSound, timer, setPomodoroState, setPomodoroRemaining, settings.pomodoro.workDuration]);

  /**
   * Start Pomodoro break session
   */
  const startBreak = useCallback(async () => {
    try {
      // Start timer with pomodoro-break type
      await timer.start("pomodoro-break");

      // Update Pomodoro state
      setPomodoroState("break");
      setPomodoroRemaining(settings.pomodoro.breakDuration);
    } catch (error) {
      console.error("Failed to start Pomodoro break:", error);
    }
  }, [timer, setPomodoroState, setPomodoroRemaining, settings.pomodoro.breakDuration]);

  /**
   * Pause Pomodoro
   */
  const pause = useCallback(() => {
    if (pomodoroState === "work") {
      setPomodoroState("work-paused");
    } else if (pomodoroState === "break") {
      setPomodoroState("break-paused");
    }
  }, [pomodoroState, setPomodoroState]);

  /**
   * Resume Pomodoro
   */
  const resumePomodoro = useCallback(() => {
    if (pomodoroState === "work-paused") {
      setPomodoroState("work");
    } else if (pomodoroState === "break-paused") {
      setPomodoroState("break");
    }
  }, [pomodoroState, setPomodoroState]);

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
   */
  const cancelPomodoro = useCallback(async () => {
    await timer.cancel();
    resetPomodoro(settings.pomodoro.workDuration);
  }, [timer, resetPomodoro, settings.pomodoro.workDuration]);

  /**
   * Complete current phase and move to next
   */
  const completePhase = useCallback(async () => {
    await timer.stop();

    if (pomodoroState === "work") {
      // Work completed, show notification
      playSound();
      showNotification("Pomodoro hoàn thành!", "Bạn đã hoàn thành 25 phút học tập. Giờ nghỉ ngơi!");

      incrementPomodoroCycle();

      // Auto-start break if enabled
      if (settings.pomodoro.autoStartBreak) {
        await startBreak();
      } else {
        setPomodoroState("completed");
      }
    } else if (pomodoroState === "break") {
      // Break completed
      playSound();
      showNotification("Giờ nghỉ kết thúc!", "Sẵn sàng cho chu kỳ Pomodoro tiếp theo?");

      setPomodoroState("idle");
    }
  }, [
    pomodoroState,
    timer,
    playSound,
    showNotification,
    settings.pomodoro.autoStartBreak,
    startBreak,
    incrementPomodoroCycle,
    setPomodoroState,
  ]);

  /**
   * Sync Pomodoro with Timer (Countdown effect)
   * Instead of a separate interval, we derive remaining time from the main timer
   */
  useEffect(() => {
    // Only run if we are in an active work or break phase
    if (pomodoroState === "work" || pomodoroState === "break") {
      const duration = pomodoroState === "work" ? settings.pomodoro.workDuration : settings.pomodoro.breakDuration;

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
    settings.pomodoro.workDuration,
    settings.pomodoro.breakDuration,
    setPomodoroRemaining,
    completePhase,
  ]);

  /**
   * Request notification permission on mount
   */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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
  };
}
