'use client';

import { Button, Card } from 'antd';
import React from 'react';

interface TimerPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  actionButtons: React.ReactNode;
}

export function TimerPlaceholder({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  actionButtons,
}: TimerPlaceholderProps) {
  return (
    <Card className="relative w-full overflow-hidden bg-white">
      {actionButtons}
      <div className="flex min-h-60 flex-col items-center justify-center py-4 text-center md:min-h-72">
        <div className="mb-4 text-4xl text-gray-300">{icon}</div>
        <h3 className="text-lg font-medium text-gray-500">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
        <Button className="mt-4" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </div>
    </Card>
  );
}
