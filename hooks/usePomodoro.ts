"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { getAssetPath } from "@/lib/url-utils";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PomodoroPhase } from "@/types";

interface Milestone {
  seconds: number;
  type: "study-end" | "break-end" | "completed";
}

/**
 * Build milestone array from settings.
 *
 * For N cycles, workDuration=W, breakDuration=B:
 *   cycle 1: study ends at W              → "study-end"
 *   cycle 1: break ends at W + B          → "break-end"
 *   cycle 2: study ends at 2W + B         → "study-end"
 *   ...
 *   cycle N: study ends at N*W + (N-1)*B  → "completed"
 */
function buildMilestones(workDuration: number, breakDuration: number, targetCycles: number): Milestone[] {
  const milestones: Milestone[] = [];
  let accumulated = 0;

  for (let i = 1; i <= targetCycles; i++) {
    accumulated += workDuration;
    const isLast = i === targetCycles;
    milestones.push({
      seconds: accumulated,
      type: isLast ? "completed" : "study-end",
    });

    if (!isLast) {
      accumulated += breakDuration;
      milestones.push({
        seconds: accumulated,
        type: "break-end",
      });
    }
  }

  return milestones;
}

/**
 * Determine the current phase based on elapsed time and milestones.
 */
function getPhaseFromTime(
  currentTime: number,
  milestones: Milestone[],
  workDuration: number,
  breakDuration: number,
  targetCycles: number,
): PomodoroPhase {
  if (milestones.length === 0 || currentTime <= 0) return "study";

  const lastMilestone = milestones[milestones.length - 1];
  if (currentTime >= lastMilestone.seconds) return "completed";

  let accumulated = 0;
  for (let i = 1; i <= targetCycles; i++) {
    const studyEnd = accumulated + workDuration;
    if (currentTime < studyEnd) return "study";

    accumulated = studyEnd;
    const isLast = i === targetCycles;

    if (!isLast) {
      const breakEnd = accumulated + breakDuration;
      if (currentTime < breakEnd) return "break";
      accumulated = breakEnd;
    }
  }

  return "completed";
}

export function usePomodoro() {
  const currentPhase = usePomodoroStore((s) => s.currentPhase);
  const alertedMilestones = usePomodoroStore((s) => s.alertedMilestones);
  const setCurrentPhase = usePomodoroStore((s) => s.setCurrentPhase);
  const addAlertedMilestone = usePomodoroStore((s) => s.addAlertedMilestone);
  const targetCycles = usePomodoroStore((s) => s.targetCycles);

  const soundEnabled = useSettingsStore((s) => s.settings.pomodoro.soundEnabled);
  const pomodoroEnabled = useSettingsStore((s) => s.settings.pomodoro.pomodoroEnabled);
  const workDuration = useSettingsStore((s) => s.settings.pomodoro.workDuration);
  const breakDuration = useSettingsStore((s) => s.settings.pomodoro.breakDuration);

  const alertedRef = useRef<Set<number>>(new Set(alertedMilestones));

  useEffect(() => {
    alertedRef.current = new Set(alertedMilestones);
  }, [alertedMilestones]);

  const milestones = useMemo(
    () => buildMilestones(workDuration, breakDuration, targetCycles),
    [workDuration, breakDuration, targetCycles],
  );

  /** Total Pomodoro duration = N*W + (N-1)*B */
  const totalDuration = useMemo(() => {
    if (milestones.length === 0) return 0;
    return milestones[milestones.length - 1].seconds;
  }, [milestones]);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(getAssetPath("/sounds/alarm-kitchen.mp3"));
      audio.volume = 0.5;
      audio.play().catch((e) => console.error("Failed to play alarm:", e));
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }, [soundEnabled]);

  /**
   * Called every time timer.currentTime changes.
   * Checks milestones and updates phase.
   */
  const tick = useCallback(
    (currentTime: number) => {
      if (!pomodoroEnabled) return;

      const phase = getPhaseFromTime(currentTime, milestones, workDuration, breakDuration, targetCycles);

      if (phase !== currentPhase) {
        setCurrentPhase(phase);
      }

      for (const m of milestones) {
        if (currentTime >= m.seconds && !alertedRef.current.has(m.seconds)) {
          alertedRef.current.add(m.seconds);
          addAlertedMilestone(m.seconds);
          playSound();
        }
      }
    },
    [
      pomodoroEnabled,
      milestones,
      workDuration,
      breakDuration,
      targetCycles,
      currentPhase,
      setCurrentPhase,
      addAlertedMilestone,
      playSound,
    ],
  );

  /** Number of work-phase cycles that have already fired their alert */
  const completedCycles = useMemo(() => {
    return milestones.filter(
      (m) => (m.type === "study-end" || m.type === "completed") && alertedMilestones.includes(m.seconds),
    ).length;
  }, [milestones, alertedMilestones]);

  return {
    currentPhase,
    milestones,
    totalDuration,
    targetCycles,
    completedCycles,
    pomodoroEnabled,
    tick,
  };
}
