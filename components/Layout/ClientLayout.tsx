"use client";

import { App,ConfigProvider, Layout } from "antd";
import viVN from "antd/locale/vi_VN";
import React from "react";

import { AppFooter, AppHeader, AppInitializer } from "@/components/Layout";
import { themeConfig } from "@/config/theme";

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
