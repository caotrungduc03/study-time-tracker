'use client';

import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  completeSessionWithDuration,
  deleteSession,
  saveOrUpdateSession,
} from '@/lib/db/operations';
import { getDateString, toISOString } from '@/lib/db/schema';
import { useTimerStore } from '@/store/useTimerStore';
import type { StudySession } from '@/types';

export function useTimer() {
  const {
    isRunning,
    isPaused,
    currentTime,
    currentSession,
    setRunning,
    setPaused,
    setCurrentTime,
    setCurrentSession,
  } = useTimerStore();
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
   * savedToDBRef: whether the current session has been written to DB (first pause).
   * False on start; set to true after the first saveOrUpdateSession call.
   */
  const savedToDBRef = useRef<boolean>(false);

  /**
   * lastAutoSaveRef: totalTime (seconds) at the last auto-save checkpoint.
   * Reset on start / cancel / reset so the first auto-save fires at exactly +60s.
   */
  const lastAutoSaveRef = useRef<number>(0);

  /**
   * Start the timer — create session in memory only, no DB write yet.
   * The session is persisted only when the user pauses.
   */
  const start = useCallback(async () => {
    try {
      const now = new Date();
      const session: StudySession = {
        id: uuidv4(),
        startTime: toISOString(now),
        endTime: '',
        type: 'normal',
        status: 'in-progress',
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      };

      savedToDBRef.current = false;
      lastAutoSaveRef.current = 0;
      driftCheckRef.current = Date.now();

      setCurrentSession(session);
      setCurrentTime(accumulatedTimeRef.current);
      currentTimeRef.current = accumulatedTimeRef.current;
      setPaused(false);
      setRunning(true);

      return session;
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    }
  }, [setRunning, setPaused, setCurrentTime, setCurrentSession]);

  /**
   * Stop the timer and complete the session.
   * Only writes to DB if the session was previously saved (i.e. paused at least once).
   */
  const stop = useCallback(async () => {
    if (!currentSession) {
      console.warn('No active session to stop');
      return;
    }

    try {
      if (savedToDBRef.current) {
        await completeSessionWithDuration(
          currentSession.id,
          currentTimeRef.current,
        );
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      accumulatedTimeRef.current = currentTimeRef.current;
      savedToDBRef.current = false;

      setRunning(false);
      setPaused(false);
      setCurrentSession(null);
    } catch (error) {
      console.error('Failed to stop timer:', error);
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
   * Cancel current session without saving.
   * Only deletes from DB if it was previously saved.
   */
  const cancel = useCallback(async () => {
    if (!currentSession) return;

    try {
      if (savedToDBRef.current) {
        await deleteSession(currentSession.id);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      accumulatedTimeRef.current = currentTimeRef.current;
      savedToDBRef.current = false;
      lastAutoSaveRef.current = 0;

      setRunning(false);
      setPaused(false);
      setCurrentSession(null);
    } catch (error) {
      console.error('Failed to cancel session:', error);
      throw error;
    }
  }, [currentSession, setRunning, setPaused, setCurrentSession]);

  /**
   * Pause the timer and persist accumulated time to DB.
   * Creates the session record on first pause; updates duration on subsequent pauses.
   */
  const pause = useCallback(async () => {
    if (isRunning && !isPaused && currentSession) {
      const accTime = currentTimeRef.current;
      accumulatedTimeRef.current = accTime;

      try {
        await saveOrUpdateSession(currentSession, accTime);
        savedToDBRef.current = true;
      } catch (error) {
        console.error('Failed to save session on pause:', error);
      }

      setPaused(true);
    }
  }, [isRunning, isPaused, currentSession, setPaused]);

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

        // Auto-save every 60 seconds of accumulated time
        if (totalTime - lastAutoSaveRef.current >= 60) {
          lastAutoSaveRef.current = totalTime;
          const activeSession = useTimerStore.getState().currentSession;
          if (activeSession) {
            saveOrUpdateSession(activeSession, totalTime)
              .then(() => {
                savedToDBRef.current = true;
              })
              .catch((err) => {
                console.error('Auto-save failed:', err);
              });
          }
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
   * Reset the timer — clear accumulated time and refs
   */
  const resetTimer = useCallback(() => {
    accumulatedTimeRef.current = 0;
    currentTimeRef.current = 0;
    savedToDBRef.current = false;
    lastAutoSaveRef.current = 0;
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
