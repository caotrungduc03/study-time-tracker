"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppState, useAppDispatch } from "@/contexts/AppContext";
import { createSession, completeSession, deleteSession } from "@/lib/db/operations";
import type { StudySession } from "@/types";

export function useTimer() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const driftCheckRef = useRef<number>(0);

  /**
   * Start the timer
   */
  const start = useCallback(
    async (type: StudySession["type"] = "normal") => {
      try {
        // Create new session in database
        const session = await createSession(type);

        // Record start time for drift correction BEFORE dispatching SET_RUNNING
        // This prevents race condition where timer effect runs before startTimeRef is set
        startTimeRef.current = Date.now();
        driftCheckRef.current = Date.now();

        // Update state
        dispatch({ type: "SET_CURRENT_SESSION", payload: session });
        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
        dispatch({ type: "SET_RUNNING", payload: true });

        return session;
      } catch (error) {
        console.error("Failed to start timer:", error);
        throw error;
      }
    },
    [dispatch],
  );

  /**
   * Stop the timer and complete the session
   */
  const stop = useCallback(async () => {
    if (!state.currentSession) {
      console.warn("No active session to stop");
      return;
    }

    try {
      // Calculate session duration
      const startTime = new Date(state.currentSession.startTime).getTime();
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Minimum session duration: 60 seconds (1 minute)
      const MIN_SESSION_DURATION = 60;

      if (duration < MIN_SESSION_DURATION) {
        // Session too short, delete it instead of saving
        console.log(`Session too short (${duration}s), deleting instead of saving`);
        await deleteSession(state.currentSession.id);
      } else {
        // Complete session in database
        await completeSession(state.currentSession.id);
      }

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Update state
      dispatch({ type: "SET_RUNNING", payload: false });
      dispatch({ type: "SET_CURRENT_SESSION", payload: null });
      dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  }, [state.currentSession, dispatch]);

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

      dispatch({ type: "SET_CURRENT_SESSION", payload: session });
      dispatch({ type: "SET_CURRENT_TIME", payload: elapsed });
      dispatch({ type: "SET_RUNNING", payload: true });
    },
    [dispatch],
  );

  /**
   * Cancel current session without saving
   */
  const cancel = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      // Delete the session from database
      const { deleteSession } = await import("@/lib/db/operations");
      await deleteSession(state.currentSession.id);

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset state (but keep currentTime so user can see it before manual reset)
      dispatch({ type: "SET_RUNNING", payload: false });
      dispatch({ type: "SET_CURRENT_SESSION", payload: null });
      // Note: NOT resetting currentTime here - only handleReset does that
    } catch (error) {
      console.error("Failed to cancel session:", error);
      throw error;
    }
  }, [state.currentSession, dispatch]);

  /**
   * Timer tick effect
   */
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        // Use global session start time (from State) as the single source of truth
        // This fixes issues where different hook instances have unsynced startTimeRef
        // resulting in corrupted time calculations
        const currentSession = state.currentSession;

        if (!currentSession?.startTime) {
          return;
        }

        const startTime = new Date(currentSession.startTime).getTime();

        // Safety check for invalid start time
        if (isNaN(startTime) || startTime <= 0) {
          return;
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        // Safety check: elapsed should be reasonable
        if (elapsed < 0 || elapsed > 7 * 24 * 60 * 60) {
          return;
        }

        dispatch({ type: "SET_CURRENT_TIME", payload: elapsed });

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
  }, [state.isRunning, state.currentSession, dispatch]);

  return {
    isRunning: state.isRunning,
    currentTime: state.currentTime,
    currentSession: state.currentSession,
    start,
    stop,
    resume,
    cancel,
  };
}
