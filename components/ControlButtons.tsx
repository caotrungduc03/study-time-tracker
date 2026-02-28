"use client";

import { PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import React, { useCallback } from "react";

import { getAssetPath } from "@/lib/url-utils";

interface ControlButtonsProps {
  isRunning: boolean;
  isPaused?: boolean;
  currentTime?: number;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

export function ControlButtons({
  isRunning,
  isPaused = false,
  currentTime = 0,
  onStart,
  onPause,
  onResume,
  onReset,
}: ControlButtonsProps) {
  const playClick = useCallback(() => {
    try {
      const audio = new Audio(getAssetPath("/sounds/button.wav"));
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const handleStart = useCallback(() => {
    playClick();
    onStart();
  }, [playClick, onStart]);
  const handlePause = useCallback(() => {
    playClick();
    onPause?.();
  }, [playClick, onPause]);
  const handleResume = useCallback(() => {
    playClick();
    onResume?.();
  }, [playClick, onResume]);
  const handleReset = useCallback(() => {
    playClick();
    onReset?.();
  }, [playClick, onReset]);

  return (
    <div className="flex items-center justify-center py-6">
      <Space size="middle">
        {!isRunning ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            className="h-[56px] text-lg font-semibold"
          >
            Bắt đầu
          </Button>
        ) : !isPaused && onPause ? (
          <Button icon={<PauseCircleOutlined />} onClick={handlePause} className="h-[56px] text-lg font-semibold">
            Tạm dừng
          </Button>
        ) : isPaused && onResume ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleResume}
            className="h-[56px] text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          >
            Tiếp tục
          </Button>
        ) : null}

        {onReset && (
          <Button
            type="default"
            danger
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={currentTime === 0 && !isRunning}
            className="h-[56px] text-lg font-semibold"
          >
            Reset
          </Button>
        )}
      </Space>
    </div>
  );
}
