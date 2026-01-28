"use client";

import { PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
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
                className="min-w-[120px] h-[56px] text-lg font-semibold"
              >
                Tạm dừng
              </Button>
            ) : isPaused && onResume ? (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={onResume}
                className="min-w-[120px] h-[56px] text-lg font-semibold"
              >
                Tiếp tục
              </Button>
            ) : null}
            <Button
              danger
              icon={<StopOutlined />}
              onClick={onStop}
              disabled={disableStop}
              className="min-w-[120px] h-[56px] text-lg font-semibold"
            >
              Dừng
            </Button>
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
