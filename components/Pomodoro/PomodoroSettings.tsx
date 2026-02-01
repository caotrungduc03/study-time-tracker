"use client";

import { ClockCircleOutlined, CoffeeOutlined, FlagOutlined, NotificationOutlined } from "@ant-design/icons";
import { Divider, InputNumber, Switch, Tooltip } from "antd";
import { memo } from "react";

interface PomodoroSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  targetCycles: number;
  soundEnabled: boolean;
  onWorkDurationChange: (value: number | null) => Promise<void>;
  onBreakDurationChange: (value: number | null) => Promise<void>;
  onTargetCyclesChange: (value: number | null) => void;
  onSoundToggle: (checked: boolean) => Promise<void>;
}

function PomodoroSettings({
  workMinutes,
  breakMinutes,
  targetCycles,
  soundEnabled,
  onWorkDurationChange,
  onBreakDurationChange,
  onTargetCyclesChange,
  onSoundToggle,
}: PomodoroSettingsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">⚙️ Cài đặt</div>

      {/* Time Settings */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Tooltip title="Thời gian tập trung học">
          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-orange-300 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <ClockCircleOutlined className="text-study-pomodoro" />
              <span>Học (phút)</span>
            </div>
            <InputNumber min={1} max={60} value={workMinutes} onChange={onWorkDurationChange} className="w-full" />
          </div>
        </Tooltip>

        <Tooltip title="Thời gian nghỉ ngơi">
          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <CoffeeOutlined className="text-study-break" />
              <span>Nghỉ (phút)</span>
            </div>
            <InputNumber min={1} max={30} value={breakMinutes} onChange={onBreakDurationChange} className="w-full" />
          </div>
        </Tooltip>

        <Tooltip title="Số phiên mục tiêu trong ngày">
          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <FlagOutlined className="text-study-active" />
              <span>Mục tiêu</span>
            </div>
            <InputNumber min={1} max={20} value={targetCycles} onChange={onTargetCyclesChange} className="w-full" />
          </div>
        </Tooltip>
      </div>

      {/* Toggle Settings */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <NotificationOutlined className="text-gray-400" />
            <span className="text-sm text-gray-700">Âm thanh thông báo</span>
          </div>
          <Switch checked={soundEnabled} onChange={onSoundToggle} />
        </div>
      </div>
    </div>
  );
}

export default memo(PomodoroSettings);
