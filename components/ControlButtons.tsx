"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Space } from "antd";
import React from "react";

interface ControlButtonsProps {
  isRunning: boolean;
  isPaused?: boolean;
  currentTime?: number;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  disableStart?: boolean;
  disableStop?: boolean;
}

export function ControlButtons({
  isRunning,
  isPaused = false,
  currentTime = 0,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onCancel,
  disableStart = false,
  disableStop = false,
}: ControlButtonsProps) {
  return (
    <div className="flex items-center justify-center py-6">
      <Space size="middle">
        {!isRunning ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStart}
            disabled={disableStart}
            className="min-w-[200px] h-[56px] text-lg font-semibold"
          >
            Bắt đầu học
          </Button>
        ) : (
          <Space size="middle">
            {!isPaused && onPause ? (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={onPause}
                disabled={disableStop}
                className="min-w-[100px] h-[56px] text-lg font-semibold"
              >
                Tạm dừng
              </Button>
            ) : isPaused && onResume ? (
              <Button
                type="default"
                icon={<PlayCircleOutlined />}
                onClick={onResume}
                className="min-w-[100px] h-[56px] text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              >
                Tiếp tục
              </Button>
            ) : null}
            {currentTime >= 60 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onStop}
                disabled={disableStop}
                className="min-w-[100px] h-[56px] text-lg font-semibold bg-green-600 hover:bg-green-700 border-green-600"
              >
                Hoàn thành
              </Button>
            )}
            {onCancel && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={onCancel}
                disabled={disableStop}
                className="min-w-[100px] h-[56px] text-lg font-semibold"
              >
                Hủy bỏ
              </Button>
            )}
          </Space>
        )}

        {/* Reset button - only show when stopped and there's time to reset */}
        {!isRunning && currentTime > 0 && onReset && (
          <Button type="default" icon={<ReloadOutlined />} onClick={onReset} className="w-full">
            Reset Timer
          </Button>
        )}
      </Space>
    </div>
  );
}
