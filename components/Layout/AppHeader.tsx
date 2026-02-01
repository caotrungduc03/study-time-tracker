"use client";

import { ArrowLeftOutlined, BarChartOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Layout, Space } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import SettingsModal from "@/components/SettingsModal";
import { ROUTES } from "@/constants";
import { getAssetPath } from "@/lib/url-utils";

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
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleSettingsSuccess = () => {
    // Reload the page to refresh data
    window.location.reload();
  };

  return (
    <>
      <AntHeader className="!bg-white shadow-sm !h-16">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex items-center cursor-pointer" onClick={() => router.push(ROUTES.HOME)}>
            <Image
              src={getAssetPath("/images/logo.png")}
              alt="Study Time Tracker Logo"
              width={200}
              height={60}
              className="w-15 object-cover object-left rounded-lg sm:w-auto"
              priority
            />
          </div>

          {/* Navigation Buttons - changes based on route */}
          {isCurrentRoute(pathname, ROUTES.HOME) && (
            <Space>
              <Button type="primary" icon={<BarChartOutlined />} onClick={() => router.push(ROUTES.STATS)}>
                Thống kê
              </Button>
              <Button icon={<SettingOutlined />} onClick={() => setSettingsModalOpen(true)} />
            </Space>
          )}
          {isCurrentRoute(pathname, ROUTES.STATS) && (
            <Space>
              <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => router.push(ROUTES.HOME)}>
                Quay lại
              </Button>
              <Button icon={<SettingOutlined />} onClick={() => setSettingsModalOpen(true)} />
            </Space>
          )}
        </div>
      </AntHeader>

      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSuccess={handleSettingsSuccess}
      />
    </>
  );
}
