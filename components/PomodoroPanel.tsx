"use client";

import React from "react";
import { Card, Button, InputNumber, Switch, Space, Divider, Progress } from "antd";
import { PlayCircleOutlined, PauseOutlined, CloseCircleOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePomodoro } from "@/hooks/usePomodoro";
import { formatTime } from "@/lib/time-utils";
import { updateSettings } from "@/lib/db/operations";

export function PomodoroPanel() {
  const { settings, setSettings } = useSettingsStore();
  const pomodoro = usePomodoro();

  const workMinutes = Math.floor(settings.pomodoro.workDuration / 60);
  const breakMinutes = Math.floor(settings.pomodoro.breakDuration / 60);

  const handleWorkDurationChange = async (value: number | null) => {
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
  };

  const handleBreakDurationChange = async (value: number | null) => {
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
  };

  const handleSoundToggle = async (checked: boolean) => {
    const newSettings = {
      ...settings,
      pomodoro: {
        ...settings.pomodoro,
        soundEnabled: checked,
      },
    };
    await updateSettings({ pomodoro: newSettings.pomodoro });
    setSettings(newSettings);
  };

  const handleAutoStartBreakToggle = async (checked: boolean) => {
    const newSettings = {
      ...settings,
      pomodoro: {
        ...settings.pomodoro,
        autoStartBreak: checked,
      },
    };
    await updateSettings({ pomodoro: newSettings.pomodoro });
    setSettings(newSettings);
  };

  const isActive = pomodoro.state === "work" || pomodoro.state === "break";
  const isPaused = pomodoro.state === "work-paused" || pomodoro.state === "break-paused";
  const isIdle = pomodoro.state === "idle" || pomodoro.state === "completed";

  // Calculate progress percentage
  const totalDuration =
    pomodoro.state === "work" || pomodoro.state === "work-paused"
      ? settings.pomodoro.workDuration
      : settings.pomodoro.breakDuration;
  const progressPercent = ((totalDuration - pomodoro.remainingSeconds) / totalDuration) * 100;

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
        <div className="mb-4">
          <div className="text-center mb-2">
            <div className="text-sm text-gray-500 mb-1">
              {pomodoro.state === "work" || pomodoro.state === "work-paused" ? "Đang học" : "Đang nghỉ"}
              {isPaused && " (Tạm dừng)"}
            </div>
            <div className="text-4xl font-mono font-bold text-study-pomodoro">
              {formatTime(pomodoro.remainingSeconds)}
            </div>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={pomodoro.state === "work" || pomodoro.state === "work-paused" ? "#fa8c16" : "#722ed1"}
          />
        </div>
      )}

      {/* Cycle count */}
      {pomodoro.cycleCount > 0 && (
        <div className="text-center mb-4 text-sm text-gray-600">
          Số chu kỳ hoàn thành: <span className="font-semibold">{pomodoro.cycleCount}</span>
        </div>
      )}

      {/* Settings (only show when idle) */}
      {isIdle && (
        <>
          <Space orientation="vertical" className="w-full" size="middle">
            <div>
              <label className="block text-sm mb-1">Thời gian học (phút)</label>
              <InputNumber
                min={1}
                max={60}
                value={workMinutes}
                onChange={handleWorkDurationChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Thời gian nghỉ (phút)</label>
              <InputNumber
                min={1}
                max={30}
                value={breakMinutes}
                onChange={handleBreakDurationChange}
                className="w-full"
              />
            </div>
          </Space>

          <Divider size="middle" />

          <Space orientation="vertical" className="w-full" size="small">
            <div className="flex items-center justify-between">
              <span className="text-sm">Âm thanh thông báo</span>
              <Switch checked={settings.pomodoro.soundEnabled} onChange={handleSoundToggle} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tự động bắt đầu nghỉ</span>
              <Switch checked={settings.pomodoro.autoStartBreak} onChange={handleAutoStartBreakToggle} />
            </div>
          </Space>

          <Divider size="middle" />
        </>
      )}

      {/* Control Buttons */}
      <Space orientation="vertical" className="w-full" size="small">
        {isIdle && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={pomodoro.startWork}
            block
            className="bg-study-pomodoro hover:bg-orange-600 border-study-pomodoro"
          >
            Bắt đầu Pomodoro
          </Button>
        )}

        {isActive && (
          <>
            <Button icon={<PauseOutlined />} onClick={pomodoro.pause} block>
              Tạm dừng
            </Button>
            {pomodoro.state === "break" && (
              <Button icon={<FastForwardOutlined />} onClick={pomodoro.skipBreak} block>
                Bỏ qua nghỉ ngơi
              </Button>
            )}
            <Button danger icon={<CloseCircleOutlined />} onClick={pomodoro.cancel} block>
              Hủy bỏ
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={pomodoro.resume} block>
              Tiếp tục
            </Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={pomodoro.cancel} block>
              Hủy bỏ
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
}
