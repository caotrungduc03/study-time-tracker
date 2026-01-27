"use client";

import { memo } from "react";
import { Button } from "antd";
import { PlayCircleOutlined, PauseOutlined, CloseCircleOutlined, FastForwardOutlined } from "@ant-design/icons";

interface PomodoroControlButtonsProps {
  state: string;
  onStartWork: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSkipBreak: () => void;
}

function PomodoroControlButtons({
  state,
  onStartWork,
  onPause,
  onResume,
  onCancel,
  onSkipBreak,
}: PomodoroControlButtonsProps) {
  const isIdle = state === "idle" || state === "completed";
  const isActive = state === "work" || state === "break";
  const isPaused = state === "work-paused" || state === "break-paused";

  return (
    <div className="flex items-center justify-center gap-2">
      {isIdle && (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={onStartWork}
          className="bg-study-pomodoro hover:bg-orange-600 border-study-pomodoro"
        >
          Bắt đầu Pomodoro
        </Button>
      )}

      {isActive && (
        <>
          <Button icon={<PauseOutlined />} onClick={onPause}>
            Tạm dừng
          </Button>
          {state === "break" && (
            <Button icon={<FastForwardOutlined />} onClick={onSkipBreak}>
              Bỏ qua nghỉ ngơi
            </Button>
          )}
          <Button danger icon={<CloseCircleOutlined />} onClick={onCancel}>
            Hủy bỏ
          </Button>
        </>
      )}

      {isPaused && (
        <>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={onResume}>
            Tiếp tục
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={onCancel}>
            Hủy bỏ
          </Button>
        </>
      )}
    </div>
  );
}

export default memo(PomodoroControlButtons);
