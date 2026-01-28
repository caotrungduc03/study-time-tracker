"use client";

import { Spin } from "antd";
import React from "react";

import { useAppInitialization } from "@/hooks/useAppInitialization";

interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * Global initializer for the app
 * Shows loading spinner while app is initializing
 */
export function AppInitializer({ children }: AppInitializerProps) {
  const { isLoading } = useAppInitialization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
