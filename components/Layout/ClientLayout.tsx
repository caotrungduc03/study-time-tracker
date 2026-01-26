"use client";

import React from "react";
import { ConfigProvider, Layout, App } from "antd";
import viVN from "antd/locale/vi_VN";
import { themeConfig } from "@/config/theme";
import { AppHeader, AppFooter, AppInitializer } from "@/components/Layout";

const { Content } = Layout;

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={themeConfig} locale={viVN}>
      <App>
        <AppInitializer>
          <Layout className="!min-h-screen">
            <AppHeader />
            <Content>{children}</Content>
            <AppFooter />
          </Layout>
        </AppInitializer>
      </App>
    </ConfigProvider>
  );
}
