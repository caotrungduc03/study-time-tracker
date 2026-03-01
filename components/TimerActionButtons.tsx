'use client';

import {
  CompressOutlined,
  ExpandOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React from 'react';

interface TimerActionButtonsProps {
  isFullPage: boolean;
  toggleFullPage: () => void;
  isPiPSupported: boolean;
  isPiPActive: boolean;
  handlePiP: () => void;
  darkTheme?: boolean;
}

export function TimerActionButtons({
  isFullPage,
  toggleFullPage,
  isPiPSupported,
  isPiPActive,
  handlePiP,
  darkTheme = false,
}: TimerActionButtonsProps) {
  const defaultIconClass = darkTheme
    ? '!text-slate-400 hover:!text-white'
    : '!text-gray-400 hover:!text-gray-600';

  const activeIconClass =
    '!border !border-blue-400/40 !bg-blue-400/10 !text-blue-400 hover:!border-blue-300/60 hover:!bg-blue-400/20 hover:!text-blue-200';

  return (
    <div className="absolute right-3 top-3 z-10 flex gap-1">
      {isPiPSupported && (
        <Tooltip title={isPiPActive ? 'Đóng thu nhỏ' : 'Xem thu nhỏ'}>
          <Button
            type="text"
            size="small"
            icon={<SwitcherOutlined />}
            onClick={handlePiP}
            className={isPiPActive ? activeIconClass : defaultIconClass}
          />
        </Tooltip>
      )}
      <Tooltip title={isFullPage ? 'Thu nhỏ' : 'Mở rộng toàn trang'}>
        <Button
          type="text"
          size="small"
          icon={isFullPage ? <CompressOutlined /> : <ExpandOutlined />}
          onClick={toggleFullPage}
          className={isFullPage ? activeIconClass : defaultIconClass}
        />
      </Tooltip>
    </div>
  );
}
