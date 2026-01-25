"use client";

import React from "react";

export function AppFooter() {
  return (
    <footer className="bg-gray-50">
      <div className="container mx-auto p-4 text-center text-gray-600 text-sm">
        Study Time Tracker © {new Date().getFullYear()} - Theo dõi thời gian học tập hiệu quả
      </div>
    </footer>
  );
}
