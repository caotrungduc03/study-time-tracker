'use client';

import { CompressOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import React from 'react';

import { useFullPage } from '@/hooks/useFullscreen';

import { ControlButtons } from './ControlButtons';
import { TimerDisplay } from './TimerDisplay';

interface TimerCardProps {
  currentTime: number;
  isRunning: boolean;
  isPaused?: boolean;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

export function TimerCard({
  currentTime,
  isRunning,
  isPaused = false,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerCardProps) {
  const { isFullPage, toggleFullPage } = useFullPage();

  const actionButtons = (
    <div className="absolute right-3 top-3 z-10">
      <Tooltip title={isFullPage ? 'Thu nhỏ' : 'Mở rộng toàn trang'}>
        <Button
          type="text"
          size="small"
          icon={isFullPage ? <CompressOutlined /> : <ExpandOutlined />}
          onClick={toggleFullPage}
          className={
            isFullPage
              ? '!border !border-blue-400/40 !bg-blue-400/10 !text-blue-400 hover:!border-blue-300/60 hover:!bg-blue-400/20 hover:!text-blue-200'
              : 'text-gray-400 hover:text-gray-600'
          }
        />
      </Tooltip>
    </div>
  );

  const timerContent = (
    <>
      <TimerDisplay seconds={currentTime} isFullPage={isFullPage} />
      <ControlButtons
        isRunning={isRunning}
        isPaused={isPaused}
        currentTime={currentTime}
        isFullPage={isFullPage}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
      />
    </>
  );

  if (isFullPage) {
    return (
      <div
        className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center p-8"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        <div className="relative w-full max-w-[800px]">
          {actionButtons}
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            {timerContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="relative w-full overflow-hidden bg-white">
      {actionButtons}
      <div className="flex flex-col items-center justify-center py-4">
        {timerContent}
      </div>
    </Card>
  );
}
