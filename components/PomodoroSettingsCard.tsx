'use client';

import {
  ClockCircleOutlined,
  CoffeeOutlined,
  FlagOutlined,
  NotificationOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Card, InputNumber, Progress, Switch, Tooltip } from 'antd';
import { memo, useCallback } from 'react';

import { usePomodoro } from '@/hooks/usePomodoro';
import { updateSettings } from '@/lib/db/operations';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PomodoroSettingsCardProps {
  disabled?: boolean;
}

function PomodoroSettingsCard({ disabled = false }: PomodoroSettingsCardProps) {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const targetCycles = usePomodoroStore((s) => s.targetCycles);
  const setTargetCycles = usePomodoroStore((s) => s.setTargetCycles);
  const { completedCycles } = usePomodoro();

  const workMinutes = Math.floor(settings.pomodoro.workDuration / 60);
  const breakMinutes = Math.floor(settings.pomodoro.breakDuration / 60);

  const progressPercent =
    targetCycles > 0 ? Math.round((completedCycles / targetCycles) * 100) : 0;

  const handleWorkDurationChange = useCallback(
    async (value: number | null) => {
      if (value === null) return;
      const newSettings = {
        ...settings,
        pomodoro: { ...settings.pomodoro, workDuration: value * 60 },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const handleBreakDurationChange = useCallback(
    async (value: number | null) => {
      if (value === null) return;
      const newSettings = {
        ...settings,
        pomodoro: { ...settings.pomodoro, breakDuration: value * 60 },
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

  const handleSoundToggle = useCallback(
    async (checked: boolean) => {
      const newSettings = {
        ...settings,
        pomodoro: { ...settings.pomodoro, soundEnabled: checked },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const handlePomodoroToggle = useCallback(
    async (checked: boolean) => {
      const newSettings = {
        ...settings,
        pomodoro: { ...settings.pomodoro, pomodoroEnabled: checked },
      };
      await updateSettings({ pomodoro: newSettings.pomodoro });
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  return (
    <Card className="w-full">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row">
        <div className="flex flex-wrap gap-3">
          <Tooltip title="Thời gian tập trung">
            <div className="min-w-32 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-orange-300">
              <div className="mb-1.5 flex items-center gap-1.5 text-gray-500">
                <ClockCircleOutlined className="text-study-pomodoro" />
                <span>Tập trung (phút)</span>
              </div>
              <InputNumber
                min={1}
                max={60}
                value={workMinutes}
                onChange={handleWorkDurationChange}
                disabled={disabled}
              />
            </div>
          </Tooltip>

          <Tooltip title="Thời gian nghỉ ngơi">
            <div className="min-w-32 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-purple-300">
              <div className="mb-1.5 flex items-center gap-1.5 text-gray-500">
                <CoffeeOutlined className="text-study-break" />
                <span>Nghỉ ngơi (phút)</span>
              </div>
              <InputNumber
                min={1}
                max={30}
                value={breakMinutes}
                onChange={handleBreakDurationChange}
                disabled={disabled}
              />
            </div>
          </Tooltip>

          <Tooltip title="Số chu kỳ mục tiêu">
            <div className="min-w-32 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-blue-300">
              <div className="mb-1.5 flex items-center gap-1.5 text-gray-500">
                <FlagOutlined className="text-study-active" />
                <span>Mục tiêu (chu kỳ)</span>
              </div>
              <InputNumber
                min={1}
                max={20}
                value={targetCycles}
                onChange={handleTargetCyclesChange}
                disabled={disabled}
              />
            </div>
          </Tooltip>
        </div>

        <div className="flex flex-1 flex-col items-center justify-start gap-1">
          <Progress
            type="circle"
            percent={progressPercent}
            size={84}
            strokeColor={progressPercent === 100 ? '#52c41a' : '#fa8c16'}
            format={() => (
              <span className="text-sm font-semibold">
                {completedCycles}
                <span className="text-gray-400">/{targetCycles}</span>
              </span>
            )}
          />
        </div>

        <div className="h-fit space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex min-w-56 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <NotificationOutlined className="text-gray-400" />
              <span className="text-sm text-gray-700">Âm thanh cảnh báo</span>
            </div>
            <Switch
              checked={settings.pomodoro.soundEnabled}
              onChange={handleSoundToggle}
              disabled={disabled}
            />
          </div>

          <div className="flex min-w-56 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-gray-400" />
              <span className="text-sm text-gray-700">Bật Pomodoro</span>
            </div>
            <Switch
              checked={settings.pomodoro.pomodoroEnabled}
              onChange={handlePomodoroToggle}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(PomodoroSettingsCard);
