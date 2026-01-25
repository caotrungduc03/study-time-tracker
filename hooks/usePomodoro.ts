"use client";

import { useEffect, useCallback } from "react";
import { useAppState, useAppDispatch } from "@/contexts/AppContext";
import { useTimer } from "./useTimer";

export function usePomodoro() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const timer = useTimer();

  const { pomodoro, settings } = state;

  /**
   * Play notification sound
   */
  const playSound = useCallback(() => {
    if (!settings.pomodoro.soundEnabled) return;

    try {
      // Create a simple beep sound using Web Audio API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Failed to play sound:", error);
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
      // Start timer with pomodoro-work type
      await timer.start("pomodoro-work");

      // Update Pomodoro state
      dispatch({ type: "SET_POMODORO_STATE", payload: "work" });
      dispatch({
        type: "SET_POMODORO_REMAINING",
        payload: settings.pomodoro.workDuration,
      });
    } catch (error) {
      console.error("Failed to start Pomodoro work:", error);
    }
  }, [timer, dispatch, settings.pomodoro.workDuration]);

  /**
   * Start Pomodoro break session
   */
  const startBreak = useCallback(async () => {
    try {
      // Start timer with pomodoro-break type
      await timer.start("pomodoro-break");

      // Update Pomodoro state
      dispatch({ type: "SET_POMODORO_STATE", payload: "break" });
      dispatch({
        type: "SET_POMODORO_REMAINING",
        payload: settings.pomodoro.breakDuration,
      });
    } catch (error) {
      console.error("Failed to start Pomodoro break:", error);
    }
  }, [timer, dispatch, settings.pomodoro.breakDuration]);

  /**
   * Pause Pomodoro
   */
  const pause = useCallback(() => {
    if (pomodoro.state === "work") {
      dispatch({ type: "SET_POMODORO_STATE", payload: "work-paused" });
    } else if (pomodoro.state === "break") {
      dispatch({ type: "SET_POMODORO_STATE", payload: "break-paused" });
    }
  }, [pomodoro.state, dispatch]);

  /**
   * Resume Pomodoro
   */
  const resumePomodoro = useCallback(() => {
    if (pomodoro.state === "work-paused") {
      dispatch({ type: "SET_POMODORO_STATE", payload: "work" });
    } else if (pomodoro.state === "break-paused") {
      dispatch({ type: "SET_POMODORO_STATE", payload: "break" });
    }
  }, [pomodoro.state, dispatch]);

  /**
   * Skip break and start new work session
   */
  const skipBreak = useCallback(async () => {
    if (pomodoro.state === "break" || pomodoro.state === "break-paused") {
      await timer.stop();
      dispatch({ type: "INCREMENT_POMODORO_CYCLE" });
      await startWork();
    }
  }, [pomodoro.state, timer, dispatch, startWork]);

  /**
   * Cancel Pomodoro cycle
   */
  const cancelPomodoro = useCallback(async () => {
    await timer.cancel();
    dispatch({ type: "RESET_POMODORO" });
  }, [timer, dispatch]);

  /**
   * Complete current phase and move to next
   */
  const completePhase = useCallback(async () => {
    await timer.stop();

    if (pomodoro.state === "work") {
      // Work completed, show notification
      playSound();
      showNotification("Pomodoro hoàn thành!", "Bạn đã hoàn thành 25 phút học tập. Giờ nghỉ ngơi!");

      dispatch({ type: "INCREMENT_POMODORO_CYCLE" });

      // Auto-start break if enabled
      if (settings.pomodoro.autoStartBreak) {
        await startBreak();
      } else {
        dispatch({ type: "SET_POMODORO_STATE", payload: "completed" });
      }
    } else if (pomodoro.state === "break") {
      // Break completed
      playSound();
      showNotification("Giờ nghỉ kết thúc!", "Sẵn sàng cho chu kỳ Pomodoro tiếp theo?");

      dispatch({ type: "SET_POMODORO_STATE", payload: "idle" });
    }
  }, [pomodoro.state, timer, dispatch, playSound, showNotification, settings.pomodoro.autoStartBreak, startBreak]);

  /**
   * Countdown effect
   */
  /**
   * Sync Pomodoro with Timer (Countdown effect)
   * Instead of a separate interval, we derive remaining time from the main timer
   */
  useEffect(() => {
    // Only run if we are in an active work or break phase
    if (pomodoro.state === "work" || pomodoro.state === "break") {
      const duration = pomodoro.state === "work" ? settings.pomodoro.workDuration : settings.pomodoro.breakDuration;

      // Calculate remaining time based on main timer
      // This ensures Pomodoro and Main Timer are always in sync
      const remaining = Math.max(0, duration - timer.currentTime);

      // Only dispatch if value changed to avoid infinite loops
      if (remaining !== pomodoro.remainingSeconds) {
        dispatch({
          type: "SET_POMODORO_REMAINING",
          payload: remaining,
        });
      }

      // Check if time is up
      if (remaining <= 0) {
        completePhase();
      }
    }
  }, [
    timer.currentTime,
    pomodoro.state,
    pomodoro.remainingSeconds,
    settings.pomodoro.workDuration,
    settings.pomodoro.breakDuration,
    dispatch,
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
    state: pomodoro.state,
    remainingSeconds: pomodoro.remainingSeconds,
    cycleCount: pomodoro.cycleCount,
    startWork,
    startBreak,
    pause,
    resume: resumePomodoro,
    skipBreak,
    cancel: cancelPomodoro,
  };
}
