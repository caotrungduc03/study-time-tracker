"use client";

import { useCallback, useEffect, useRef } from "react";

import { completeSession, createSession, deleteSession } from "@/lib/db/operations";
import { useTimerStore } from "@/store/useTimerStore";
import type { StudySession } from "@/types";

export function useTimer() {
  const { isRunning, isPaused, currentTime, currentSession, setRunning, setPaused, setCurrentTime, setCurrentSession } =
    useTimerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const driftCheckRef = useRef<number>(0);

  /**
   * accumulatedTimeRef: seconds already counted before the current running session segment.
   * Updated when: stop, cancel, pause.
   */
  const accumulatedTimeRef = useRef<number>(0);

  /**
   * currentTimeRef: real-time source of truth (integer seconds).
   * Updated every 100 ms by the interval — always accurate.
   */
  const currentTimeRef = useRef<number>(0);

  /**
   * Start the timer — always creates a "normal" session
   */
  const start = useCallback(async () => {
    try {
      const session = await createSession("normal");

      driftCheckRef.current = Date.now();

      setCurrentSession(session);
      setCurrentTime(accumulatedTimeRef.current);
      currentTimeRef.current = accumulatedTimeRef.current;
      setPaused(false);
      setRunning(true);

      return session;
    } catch (error) {
      console.error("Failed to start timer:", error);
      throw error;
    }
  }, [setRunning, setPaused, setCurrentTime, setCurrentSession]);

  /**
   * Stop the timer and complete the session
   */
  const stop = useCallback(async () => {
    if (!currentSession) {
      console.warn("No active session to stop");
      return;
    }

    try {
      await completeSession(currentSession.id);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      accumulatedTimeRef.current = currentTimeRef.current;

      setRunning(false);
      setPaused(false);
      setCurrentSession(null);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  }, [currentSession, setRunning, setPaused, setCurrentSession]);

  /**
   * Resume a session (for recovery after page reload)
   */
  const resume = useCallback(
    async (session: StudySession) => {
      const startTime = new Date(session.startTime).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      driftCheckRef.current = Date.now();
      accumulatedTimeRef.current = 0;
      currentTimeRef.current = elapsed;

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
      await deleteSession(currentSession.id);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      accumulatedTimeRef.current = currentTimeRef.current;

      setRunning(false);
      setPaused(false);
      setCurrentSession(null);
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
      accumulatedTimeRef.current = currentTimeRef.current;
      setPaused(true);
    }
  }, [isRunning, isPaused, setPaused]);

  /**
   * Resume the timer
   */
  const resumeTimer = useCallback(() => {
    if (isRunning && isPaused && currentSession) {
      const updatedSession = {
        ...currentSession,
        startTime: new Date().toISOString(),
      };

      setCurrentSession(updatedSession);
      setPaused(false);
    }
  }, [isRunning, isPaused, currentSession, setCurrentSession, setPaused]);

  /**
   * Timer tick effect — 100ms interval, state update only on integer-second change
   */
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const session = useTimerStore.getState().currentSession;

        if (!session?.startTime) return;

        const startTime = new Date(session.startTime).getTime();
        if (isNaN(startTime) || startTime <= 0) return;

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed < 0 || elapsed > 7 * 24 * 60 * 60) return;

        const totalTime = accumulatedTimeRef.current + elapsed;

        currentTimeRef.current = totalTime;

        if (totalTime !== useTimerStore.getState().currentTime) {
          setCurrentTime(totalTime);
        }

        if (Date.now() - driftCheckRef.current > 10 * 60 * 1000) {
          driftCheckRef.current = Date.now();
        }
      }, 100);
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
  }, [isRunning, isPaused, setCurrentTime]);

  /**
   * Reset the timer — clear accumulated time and ref
   */
  const resetTimer = useCallback(() => {
    accumulatedTimeRef.current = 0;
    currentTimeRef.current = 0;
  }, []);

  return {
    isRunning,
    isPaused,
    currentTime,
    currentTimeRef,
    currentSession,
    start,
    stop,
    pause,
    resume,
    resumeTimer,
    cancel,
    resetTimer,
  };
}
