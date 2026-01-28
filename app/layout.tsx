import "./globals.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ClientLayout } from "@/components/Layout";
import { getAssetPath } from "@/lib/url-utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study Time Tracker - Theo dõi thời gian học tập",
  description: "Ứng dụng web đơn giản theo dõi thời gian học tập với Pomodoro và thống kê chi tiết",
  icons: {
    icon: getAssetPath("/images/logo-icon.png"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
