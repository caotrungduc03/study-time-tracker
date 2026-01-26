"use client";

import React from "react";
import { Layout, Button } from "antd";
import { ArrowLeftOutlined, BarChartOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "@/constants";

const { Header: AntHeader } = Layout;

/**
 * Check if current pathname matches a route
 * Supports both exact match and prefix match with startsWith
 */
function isCurrentRoute(pathname: string, route: string, exact: boolean = true): boolean {
  if (exact) {
    return pathname === route;
  }
  return pathname.startsWith(route);
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  console.log("Current pathname:", pathname);

  return (
    <AntHeader className="!bg-white shadow-sm !h-16">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center cursor-pointer" onClick={() => router.push(ROUTES.HOME)}>
          <Image
            src="/images/logo.png"
            alt="Study Time Tracker Logo"
            width={200}
            height={60}
            className="rounded-lg w-auto"
            priority
          />
        </div>

        {/* Navigation Button - changes based on route */}
        {isCurrentRoute(pathname, ROUTES.HOME) && (
          <Button type="primary" icon={<BarChartOutlined />} onClick={() => router.push(ROUTES.STATS)}>
            Thống kê
          </Button>
        )}
        {isCurrentRoute(pathname, ROUTES.STATS) && (
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => router.push(ROUTES.HOME)}>
            Quay lại
          </Button>
        )}
      </div>
    </AntHeader>
  );
}
