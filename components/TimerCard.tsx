'use client';

import { FullscreenOutlined, SwitcherOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import React from 'react';
import { createPortal } from 'react-dom';

import { useDocumentPiP } from '@/hooks/useDocumentPiP';
import { useFullPage } from '@/hooks/useFullscreen';

import { ControlButtons } from './ControlButtons';
import { TimerActionButtons } from './TimerActionButtons';
import { TimerDisplay } from './TimerDisplay';
import { TimerPlaceholder } from './TimerPlaceholder';

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
  const {
    isSupported: isPiPSupported,
    isPiPActive,
    pipWindow,
    requestPiP,
    closePiP,
  } = useDocumentPiP();

  const handlePiP = async () => {
    if (isPiPActive) {
      closePiP();
    } else {
      await requestPiP({ width: 350, height: 250 });
    }
  };

  const actionButtonsLight = (
    <TimerActionButtons
      isFullPage={isFullPage}
      toggleFullPage={toggleFullPage}
      isPiPSupported={isPiPSupported}
      isPiPActive={isPiPActive}
      handlePiP={handlePiP}
      darkTheme={false}
    />
  );

  const actionButtonsDark = (
    <TimerActionButtons
      isFullPage={isFullPage}
      toggleFullPage={toggleFullPage}
      isPiPSupported={isPiPSupported}
      isPiPActive={isPiPActive}
      handlePiP={handlePiP}
      darkTheme={true}
    />
  );

  const timerContentBase = (isDark: boolean, isPiP: boolean) => (
    <>
      <TimerDisplay
        seconds={currentTime}
        isFullPage={isDark && !isPiP}
        isPiP={isPiP}
      />
      <ControlButtons
        isRunning={isRunning}
        isPaused={isPaused}
        currentTime={currentTime}
        isFullPage={isDark}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
      />
    </>
  );

  const pipPortal =
    isPiPActive && pipWindow
      ? createPortal(
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            {timerContentBase(true, true)}
          </div>,
          pipWindow.document.body,
        )
      : null;

  const fullscreenOverlay = isFullPage ? (
    <div
      className="fixed inset-0 z-[1000] flex animate-fade-in items-center justify-center p-8"
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      <div className="relative w-full max-w-[800px]">
        {actionButtonsDark}
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          {timerContentBase(true, false)}
        </div>
      </div>
    </div>
  ) : null;

  if (isPiPActive || isFullPage) {
    return (
      <>
        {isPiPActive ? (
          <TimerPlaceholder
            icon={<SwitcherOutlined />}
            title="Đang xem ở chế độ PiP"
            description="Đóng cửa sổ thu nhỏ để quay lại giao diện chính"
            buttonText="Quay lại"
            onButtonClick={handlePiP}
            actionButtons={actionButtonsLight}
          />
        ) : (
          <TimerPlaceholder
            icon={<FullscreenOutlined />}
            title="Đang xem ở chế độ toàn trang"
            description="Thoát chế độ này để tương tác ở giao diện gốc"
            buttonText="Thu nhỏ"
            onButtonClick={toggleFullPage}
            actionButtons={actionButtonsLight}
          />
        )}
        {pipPortal}
        {fullscreenOverlay}
      </>
    );
  }

  return (
    <Card className="relative w-full overflow-hidden bg-white">
      {actionButtonsLight}
      <div className="flex min-h-60 flex-col items-center justify-center py-4 md:min-h-72">
        {timerContentBase(false, false)}
      </div>
    </Card>
  );
}
