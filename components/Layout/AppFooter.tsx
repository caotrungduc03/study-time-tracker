"use client";

import { Layout } from "antd";
const { Footer } = Layout;

export function AppFooter() {
  return (
    <Footer>
      <div className="container text-center text-gray-600 text-sm">
        Study Time Tracker © {new Date().getFullYear()} - Theo dõi thời gian học tập hiệu quả
      </div>
    </Footer>
  );
}
