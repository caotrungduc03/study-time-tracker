'use client';

import { Layout } from 'antd';
const { Footer } = Layout;

export function AppFooter() {
  return (
    <Footer className="text-center !text-gray-600">
      Study Time Tracker © {new Date().getFullYear()} - Theo dõi thời gian học
      tập hiệu quả
    </Footer>
  );
}
