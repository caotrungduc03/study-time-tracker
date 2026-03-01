'use client';

import { Spin } from 'antd';
import React from 'react';

import { useAppInitialization } from '@/hooks/useAppInitialization';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { isLoading } = useAppInitialization();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
