'use client';

import {
  ArrowLeftOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Layout, Space } from 'antd';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import SettingsModal from '@/components/SettingsModal';
import { ROUTES } from '@/constants';
import { getAssetPath } from '@/lib/url-utils';

const { Header } = Layout;

function isCurrentRoute(
  pathname: string,
  route: string,
  exact: boolean = true,
): boolean {
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
    window.location.reload();
  };

  return (
    <>
      <Header className="!h-16 !bg-white shadow-sm">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div
            className="flex cursor-pointer items-center"
            onClick={() => router.push(ROUTES.HOME)}
          >
            <Image
              src={getAssetPath('/images/logo.png')}
              alt="Study Time Tracker Logo"
              width={200}
              height={60}
              className="w-15 rounded-lg object-cover object-left sm:w-auto"
              priority
            />
          </div>

          {isCurrentRoute(pathname, ROUTES.HOME) && (
            <Space>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => router.push(ROUTES.STATS)}
              >
                Thống kê
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsModalOpen(true)}
              />
            </Space>
          )}
          {isCurrentRoute(pathname, ROUTES.STATS) && (
            <Space>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push(ROUTES.HOME)}
              >
                Quay lại
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsModalOpen(true)}
              />
            </Space>
          )}
        </div>
      </Header>

      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSuccess={handleSettingsSuccess}
      />
    </>
  );
}
