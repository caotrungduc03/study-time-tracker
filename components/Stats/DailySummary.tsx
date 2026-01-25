"use client";

import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import type { DailyStat } from "@/types";
import { formatDuration } from "@/lib/time-utils";

interface DailySummaryProps {
  stats: DailyStat | null;
  dailyGoal?: number; // in seconds
}

export function DailySummary({ stats, dailyGoal = 14400 }: DailySummaryProps) {
  if (!stats) {
    return (
      <Card title="Thống kê hôm nay">
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu hôm nay</p>
      </Card>
    );
  }

  const goalProgress = dailyGoal > 0 ? Number(((stats.totalSeconds / dailyGoal) * 100).toFixed(2)) : 0;
  const goalAchieved = stats.totalSeconds >= dailyGoal;

  return (
    <Card title="📊 Thống kê hôm nay" extra={<span className="text-sm text-gray-500">{stats.date}</span>}>
      {/* Main Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Statistic
            title="Tổng thời gian"
            value={formatDuration(stats.totalSeconds)}
            prefix={<ClockCircleOutlined />}
            styles={{ content: { color: "#3f8600", fontSize: "28px" } }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Số phiên học"
            value={stats.sessionCount}
            suffix="phiên"
            prefix={<CheckCircleOutlined />}
            styles={{ content: { fontSize: "28px" } }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Trung bình/phiên"
            value={formatDuration(stats.averageSessionDuration)}
            prefix={<TrophyOutlined />}
            styles={{ content: { fontSize: "28px" } }}
          />
        </Col>
      </Row>

      {/* Goal Progress */}
      {dailyGoal > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Tiến độ mục tiêu hôm nay</span>
            <span className="text-sm text-gray-600">
              {formatDuration(stats.totalSeconds)} / {formatDuration(dailyGoal)}
            </span>
          </div>
          <Progress
            percent={Number(Math.min(goalProgress, 100).toFixed(2))}
            status={goalAchieved ? "success" : "active"}
            strokeColor={goalAchieved ? "#52c41a" : "#1890ff"}
          />
          {goalAchieved && (
            <div className="mt-2 text-center">
              <span className="text-green-600 font-semibold">🎉 Chúc mừng! Bạn đã đạt mục tiêu hôm nay!</span>
            </div>
          )}
        </div>
      )}

      {/* Breakdown by Type */}
      <div>
        <h4 className="text-sm font-medium mb-3">Phân bổ theo loại</h4>
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Học bình thường</div>
              <div className="text-lg font-semibold text-green-600">{formatDuration(stats.normalSeconds)}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Pomodoro làm việc</div>
              <div className="text-lg font-semibold text-orange-600">{formatDuration(stats.pomodoroWorkSeconds)}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Pomodoro nghỉ</div>
              <div className="text-lg font-semibold text-purple-600">{formatDuration(stats.pomodoroBreakSeconds)}</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Additional Info */}
      {stats.longestSessionDuration > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phiên học dài nhất:</span>
            <span className="font-semibold">{formatDuration(stats.longestSessionDuration)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
