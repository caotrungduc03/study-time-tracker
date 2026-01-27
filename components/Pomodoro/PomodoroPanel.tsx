"use client";

import { memo, useCallback } from "react";
import { Card } from "antd";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePomodoro } from "@/hooks/usePomodoro";
import { updateSettings } from "@/lib/db/operations";
import PomodoroStatus from "./PomodoroStatus";
import PomodoroSettings from "./PomodoroSettings";
import PomodoroControlButtons from "./PomodoroControlButtons";
import PomodoroCycleCount from "./PomodoroCycleCount";

function PomodoroPanel() {
  // Use selector to get full settings for update operations
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);

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

  const handleAutoStartBreakToggle = useCallback(
    async (checked: boolean) => {
      const newSettings = {
        ...settings,
        pomodoro: {
          ...settings.pomodoro,
          autoStartBreak: checked,
        },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const isActive = pomodoro.state === "work" || pomodoro.state === "break";
  const isPaused = pomodoro.state === "work-paused" || pomodoro.state === "break-paused";
  const isIdle = pomodoro.state === "idle" || pomodoro.state === "completed";

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <span>Pomodoro</span>
        </div>
      }
      className="h-full"
    >
      {/* Current Status */}
      {(isActive || isPaused) && (
        <PomodoroStatus
          state={pomodoro.state}
          remainingSeconds={pomodoro.remainingSeconds}
          workDuration={settings.pomodoro.workDuration}
          breakDuration={settings.pomodoro.breakDuration}
        />
      )}

      {/* Cycle count */}
      <PomodoroCycleCount cycleCount={pomodoro.cycleCount} />

      {/* Settings (only show when idle) */}
      {isIdle && (
        <PomodoroSettings
          workMinutes={workMinutes}
          breakMinutes={breakMinutes}
          soundEnabled={settings.pomodoro.soundEnabled}
          autoStartBreak={settings.pomodoro.autoStartBreak}
          onWorkDurationChange={handleWorkDurationChange}
          onBreakDurationChange={handleBreakDurationChange}
          onSoundToggle={handleSoundToggle}
          onAutoStartBreakToggle={handleAutoStartBreakToggle}
        />
      )}

      {/* Control Buttons */}
      <PomodoroControlButtons
        state={pomodoro.state}
        onStartWork={pomodoro.startWork}
        onPause={pomodoro.pause}
        onResume={pomodoro.resume}
        onCancel={pomodoro.cancel}
        onSkipBreak={pomodoro.skipBreak}
      />
    </Card>
  );
}

export default memo(PomodoroPanel);
