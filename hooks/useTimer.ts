"use client";

import { useCallback, useEffect, useRef } from "react";

import { completeSession, createSession, deleteSession } from "@/lib/db/operations";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTimerStore } from "@/store/useTimerStore";
import type { StudySession } from "@/types";
import { getAssetPath } from "@/lib/url-utils";

export function useTimer() {
  const { isRunning, isPaused, currentTime, currentSession, setRunning, setPaused, setCurrentTime, setCurrentSession } =
    useTimerStore();
  const settings = useSettingsStore((state) => state.settings);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimestampRef = useRef<number>(0); // Store timestamp when paused
  const startTimeRef = useRef<number>(0);
  const driftCheckRef = useRef<number>(0);

  /**
   * Play button click sound
   */
  const playButtonSound = useCallback(() => {
    if (!settings.pomodoro.soundEnabled) return;

    try {
      const audio = new Audio(getAssetPath("/sounds/button.wav"));
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
        setPaused(false);
        setRunning(true);

        return session;
      } catch (error) {
        console.error("Failed to start timer:", error);
        throw error;
      }
    },
    [playButtonSound, setRunning, setPaused, setCurrentTime, setCurrentSession],
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
      setPaused(false);
      setCurrentSession(null);
      setCurrentTime(0);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  }, [currentSession, setRunning, setPaused, setCurrentSession, setCurrentTime]);

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
      setPaused(false);
      setRunning(true);
    },
    [setRunning, setPaused, setCurrentTime, setCurrentSession],
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
      setPaused(false);
      setCurrentSession(null);
      // Note: NOT resetting currentTime here - only handleReset does that
    } catch (error) {
      console.error("Failed to cancel session:", error);
      throw error;
    }
  }, [currentSession, setRunning, setPaused, setCurrentSession]);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      // Save timestamp when pausing
      pauseTimestampRef.current = Date.now();
      setPaused(true);
    }
  }, [isRunning, isPaused, setPaused]);

  /**
   * Resume the timer
   */
  const resumeTimer = useCallback(() => {
    if (isRunning && isPaused && currentSession) {
      // Calculate how long we were paused
      const pauseDuration = Date.now() - pauseTimestampRef.current;

      // Adjust session start time by adding the pause duration
      // This way the timer continues from where it was paused
      const session = currentSession;
      const originalStartTime = new Date(session.startTime).getTime();
      const newStartTime = originalStartTime + pauseDuration;

      // Update session with new start time
      const updatedSession = {
        ...session,
        startTime: new Date(newStartTime).toISOString(),
      };

      // Update pause state first (this will allow interval to start)
      setPaused(false);
      // Then update session
      setCurrentSession(updatedSession);
    }
  }, [isRunning, isPaused, currentSession, setCurrentSession, setPaused]);

  /**
   * Timer tick effect
   */
  useEffect(() => {
    if (isRunning && !isPaused) {
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

        // Calculate elapsed time
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
  }, [isRunning, isPaused, currentSession, setCurrentTime]);

  return {
    isRunning,
    isPaused,
    currentTime,
    currentSession,
    start,
    stop,
    pause,
    resume,
    resumeTimer,
    cancel,
  };
}
