"use client";

import React from "react";
import { Button, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from "@ant-design/icons";

interface ControlButtonsProps {
  isRunning: boolean;
  currentTime?: number;
  onStart: () => void;
  onStop: () => void;
  onReset?: () => void;
  disableStart?: boolean;
  disableStop?: boolean;
}

export function ControlButtons({
  isRunning,
  currentTime = 0,
  onStart,
  onStop,
  onReset,
  disableStart = false,
  disableStop = false,
}: ControlButtonsProps) {
  return (
    <div className="flex items-center justify-center py-6">
      <Space size="large">
        <Space size="large">
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
            <Button
              danger
              icon={<PauseCircleOutlined />}
              onClick={onStop}
              disabled={disableStop}
              className="min-w-[200px] h-[56px] text-lg font-semibold"
            >
              Dừng
            </Button>
          )}
        </Space>

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
