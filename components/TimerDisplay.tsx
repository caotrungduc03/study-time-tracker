'use client';

import React from 'react';

import { formatTime } from '@/lib/time-utils';

interface TimerDisplayProps {
  seconds: number;
  size?: 'default' | 'large';
  isFullPage?: boolean;
}

export function TimerDisplay({ seconds, size = 'large', isFullPage = false }: TimerDisplayProps) {
  const MAX_REASONABLE_SECONDS = 7 * 24 * 60 * 60;
  const isValid = seconds >= 0 && seconds < MAX_REASONABLE_SECONDS;

  const timeString = isValid ? formatTime(seconds) : 'ERROR';

  const fontSize = isFullPage
    ? 'text-[6rem] md:text-[10rem] leading-none'
    : size === 'large'
      ? 'text-6xl md:text-8xl leading-none'
      : 'text-4xl md:text-6xl leading-none';

  const validColor = isFullPage
    ? 'text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]'
    : 'text-study-active drop-shadow-md';

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {!isValid && (
        <div className="mb-2 max-w-md text-center text-sm text-red-500">
          ⚠️ Phát hiện dữ liệu bị hỏng (thời gian không hợp lệ)
          <br />
          Vui lòng click &quot;Dừng&quot; để dọn dẹp, sau đó reload trang
        </div>
      )}
      <div
        className={`font-mono font-bold ${fontSize} tracking-wider ${isValid ? validColor : 'text-red-500 drop-shadow-md'} transition-all duration-300`}
      >
        {timeString}
      </div>
    </div>
  );
}
