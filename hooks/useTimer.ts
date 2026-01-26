"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/store/useTimerStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { createSession, completeSession, deleteSession } from "@/lib/db/operations";
import type { StudySession } from "@/types";

export function useTimer() {
  const { isRunning, currentTime, currentSession, setRunning, setCurrentTime, setCurrentSession } = useTimerStore();
  const settings = useSettingsStore((state) => state.settings);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const driftCheckRef = useRef<number>(0);

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
   * Start the timer
   */
  const start = useCallback(
    async (type: StudySession["type"] = "normal") => {
      try {
        // Play button sound
        playButtonSound();

        // Create new session in database
        const session = await createSession(type);

        // Record start time for drift correction BEFORE dispatching SET_RUNNING
        // This prevents race condition where timer effect runs before startTimeRef is set
        startTimeRef.current = Date.now();
        driftCheckRef.current = Date.now();

        // Update state
        setCurrentSession(session);
        setCurrentTime(0);
        setRunning(true);

        return session;
      } catch (error) {
        console.error("Failed to start timer:", error);
        throw error;
      }
    },
    [playButtonSound, setRunning, setCurrentTime, setCurrentSession],
  );

  /**
   * Stop the timer and complete the session
   */
  const stop = useCallback(async () => {
    if (!currentSession) {
      console.warn("No active session to stop");
      return;
    }

    try {
      // Calculate session duration
      const startTime = new Date(currentSession.startTime).getTime();
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Minimum session duration: 60 seconds (1 minute)
      const MIN_SESSION_DURATION = 60;

      if (duration < MIN_SESSION_DURATION) {
        // Session too short, delete it instead of saving
        console.log(`Session too short (${duration}s), deleting instead of saving`);
        await deleteSession(currentSession.id);
      } else {
        // Complete session in database
        await completeSession(currentSession.id);
      }

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Update state
      setRunning(false);
      setCurrentSession(null);
      setCurrentTime(0);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  }, [currentSession, setRunning, setCurrentSession, setCurrentTime]);

  /**
   * Resume a session (for recovery after page reload)
   */
  const resume = useCallback(
    async (session: StudySession) => {
      const startTime = new Date(session.startTime).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      // Set refs before dispatching SET_RUNNING to prevent race condition
      startTimeRef.current = startTime;
      driftCheckRef.current = Date.now();

      setCurrentSession(session);
      setCurrentTime(elapsed);
      setRunning(true);
    },
    [setRunning, setCurrentTime, setCurrentSession],
  );

  /**
   * Cancel current session without saving
   */
  const cancel = useCallback(async () => {
    if (!currentSession) return;

    try {
      // Delete the session from database
      const { deleteSession } = await import("@/lib/db/operations");
      await deleteSession(currentSession.id);

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset state (but keep currentTime so user can see it before manual reset)
      setRunning(false);
      setCurrentSession(null);
      // Note: NOT resetting currentTime here - only handleReset does that
    } catch (error) {
      console.error("Failed to cancel session:", error);
      throw error;
    }
  }, [currentSession, setRunning, setCurrentSession]);

  /**
   * Timer tick effect
   */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Use global session start time (from State) as the single source of truth
        // This fixes issues where different hook instances have unsynced startTimeRef
        // resulting in corrupted time calculations
        const session = currentSession;

        if (!session?.startTime) {
          return;
        }

        const startTime = new Date(session.startTime).getTime();

        // Safety check for invalid start time
        if (isNaN(startTime) || startTime <= 0) {
          return;
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        // Safety check: elapsed should be reasonable
        if (elapsed < 0 || elapsed > 7 * 24 * 60 * 60) {
          return;
        }

        setCurrentTime(elapsed);

        // Drift check every 10 minutes
        if (Date.now() - driftCheckRef.current > 10 * 60 * 1000) {
          driftCheckRef.current = Date.now();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentSession, setCurrentTime]);

  return {
    isRunning,
    currentTime,
    currentSession,
    start,
    stop,
    resume,
    cancel,
  };
}
