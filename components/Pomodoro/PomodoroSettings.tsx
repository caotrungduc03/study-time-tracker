"use client";

import { memo } from "react";
import { InputNumber, Space, Divider, Switch } from "antd";

interface PomodoroSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  soundEnabled: boolean;
  autoStartBreak: boolean;
  onWorkDurationChange: (value: number | null) => Promise<void>;
  onBreakDurationChange: (value: number | null) => Promise<void>;
  onSoundToggle: (checked: boolean) => Promise<void>;
  onAutoStartBreakToggle: (checked: boolean) => Promise<void>;
}

function PomodoroSettings({
  workMinutes,
  breakMinutes,
  soundEnabled,
  autoStartBreak,
  onWorkDurationChange,
  onBreakDurationChange,
  onSoundToggle,
  onAutoStartBreakToggle,
}: PomodoroSettingsProps) {
  return (
    <>
      <Space orientation="vertical" className="w-full" size="middle">
        <div>
          <label className="block text-sm mb-1">Thời gian học (phút)</label>
          <InputNumber min={1} max={60} value={workMinutes} onChange={onWorkDurationChange} className="w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Thời gian nghỉ (phút)</label>
          <InputNumber min={1} max={30} value={breakMinutes} onChange={onBreakDurationChange} className="w-full" />
        </div>
      </Space>

      <Divider size="middle" />

      <Space orientation="vertical" className="w-full" size="small">
        <div className="flex items-center justify-between">
          <span className="text-sm">Âm thanh thông báo</span>
          <Switch checked={soundEnabled} onChange={onSoundToggle} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Tự động bắt đầu nghỉ</span>
          <Switch checked={autoStartBreak} onChange={onAutoStartBreakToggle} />
        </div>
      </Space>

      <Divider size="middle" />
    </>
  );
}

export default memo(PomodoroSettings);
