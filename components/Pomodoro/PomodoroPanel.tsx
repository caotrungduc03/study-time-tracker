"use client";

import { Card } from "antd";
import { memo, useCallback } from "react";

import { usePomodoro } from "@/hooks/usePomodoro";
import { updateSettings } from "@/lib/db/operations";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useTimerStore } from "@/store/useTimerStore";

import PomodoroControlButtons from "./PomodoroControlButtons";
import PomodoroCycleCount from "./PomodoroCycleCount";
import PomodoroSettings from "./PomodoroSettings";
import PomodoroStatus from "./PomodoroStatus";

function PomodoroPanel() {
  // Use selector to get full settings for update operations
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);

  // Get targetCycles from pomodoro store
  const targetCycles = usePomodoroStore((state) => state.targetCycles);
  const setTargetCycles = usePomodoroStore((state) => state.setTargetCycles);

  // Get current timer time for elapsed time calculation
  const currentTime = useTimerStore((state) => state.currentTime);

  const pomodoro = usePomodoro();

  const workMinutes = Math.floor(settings.pomodoro.workDuration / 60);
  const breakMinutes = Math.floor(settings.pomodoro.breakDuration / 60);

  // Memoized handlers to prevent unnecessary re-renders
  const handleWorkDurationChange = useCallback(
    async (value: number | null) => {
      if (value === null) return;
      const seconds = value * 60;
      const newSettings = {
        ...settings,
        pomodoro: {
          ...settings.pomodoro,
          workDuration: seconds,
        },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const handleBreakDurationChange = useCallback(
    async (value: number | null) => {
      if (value === null) return;
      const seconds = value * 60;
      const newSettings = {
        ...settings,
        pomodoro: {
          ...settings.pomodoro,
          breakDuration: seconds,
        },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const handleSoundToggle = useCallback(
    async (checked: boolean) => {
      const newSettings = {
        ...settings,
        pomodoro: {
          ...settings.pomodoro,
          soundEnabled: checked,
        },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const handleTargetCyclesChange = useCallback(
    (value: number | null) => {
      if (value === null) return;
      setTargetCycles(value);
    },
    [setTargetCycles],
  );

  const isActive = pomodoro.state === "work" || pomodoro.state === "break";
  const isPaused = pomodoro.state === "work-paused" || pomodoro.state === "break-paused";
  const isIdle = pomodoro.state === "idle" || pomodoro.state === "completed";

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <span className="text-lg font-semibold">Pomodoro</span>
        </div>
      }
      className="h-full shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col gap-4">
        {/* Current Status */}
        {(isActive || isPaused) && (
          <PomodoroStatus
            state={pomodoro.state}
            remainingSeconds={pomodoro.remainingSeconds}
            workDuration={settings.pomodoro.workDuration}
            breakDuration={settings.pomodoro.breakDuration}
          />
        )}

        {/* Settings (only show when idle) */}
        {isIdle && (
          <PomodoroSettings
            workMinutes={workMinutes}
            breakMinutes={breakMinutes}
            targetCycles={targetCycles}
            soundEnabled={settings.pomodoro.soundEnabled}
            onWorkDurationChange={handleWorkDurationChange}
            onBreakDurationChange={handleBreakDurationChange}
            onTargetCyclesChange={handleTargetCyclesChange}
            onSoundToggle={handleSoundToggle}
          />
        )}

        {/* Control Buttons */}
        <PomodoroControlButtons
          state={pomodoro.state}
          elapsedTime={currentTime}
          onStartWork={pomodoro.startWork}
          onPause={pomodoro.pause}
          onResume={pomodoro.resume}
          onCancel={pomodoro.cancel}
          onSkipBreak={pomodoro.skipBreak}
          onComplete={pomodoro.complete}
        />
      </div>
    </Card>
  );
}

export default memo(PomodoroPanel);
