"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FastForwardOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Space } from "antd";
import { memo } from "react";

interface PomodoroControlButtonsProps {
  state: string;
  elapsedTime: number;
  onStartWork: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSkipBreak: () => void;
  onComplete: () => void;
}

function PomodoroControlButtons({
  state,
  elapsedTime,
  onStartWork,
  onPause,
  onResume,
  onCancel,
  onSkipBreak,
  onComplete,
}: PomodoroControlButtonsProps) {
  const isIdle = state === "idle" || state === "completed";
  const isActive = state === "work" || state === "break";
  const isPaused = state === "work-paused" || state === "break-paused";

  return (
    <div className="flex items-center justify-center pt-2">
      <Space wrap size="middle">
        {isIdle && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStartWork}
            className="bg-study-pomodoro hover:bg-orange-600 border-study-pomodoro shadow-md hover:shadow-lg transition-all duration-300"
          >
            Bắt đầu Pomodoro
          </Button>
        )}

        {isActive && (
          <>
            <Button icon={<PauseOutlined />} onClick={onPause} className="shadow-sm hover:shadow transition-all">
              Tạm dừng
            </Button>
            {state === "break" && (
              <Button
                icon={<FastForwardOutlined />}
                onClick={onSkipBreak}
                className="shadow-sm hover:shadow transition-all"
              >
                Bỏ qua nghỉ
              </Button>
            )}
            {state === "work" && elapsedTime >= 60 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700 border-green-600 shadow-sm hover:shadow transition-all"
              >
                Hoàn thành
              </Button>
            )}
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={onCancel}
              className="shadow-sm hover:shadow transition-all"
            >
              Hủy
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={onResume}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 shadow-sm hover:shadow transition-all"
            >
              Tiếp tục
            </Button>
            {state === "work-paused" && elapsedTime >= 60 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700 border-green-600 shadow-sm hover:shadow transition-all"
              >
                Hoàn thành
              </Button>
            )}
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={onCancel}
              className="shadow-sm hover:shadow transition-all"
            >
              Hủy
            </Button>
          </>
        )}
      </Space>
    </div>
  );
}

export default memo(PomodoroControlButtons);
