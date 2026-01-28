"use client";

import { Card, Col, Row, Statistic } from "antd";
import React from "react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { formatDuration } from "@/lib/time-utils";

interface TodayStatsCardProps {
  totalSeconds: number;
  sessionCount: number;
  averageSessionDuration: number;
}

export const TodayStatsCard: React.FC<TodayStatsCardProps> = ({
  totalSeconds,
  sessionCount,
  averageSessionDuration,
}) => {
  return (
    <Card>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Statistic title="Tổng thời gian hôm nay" value={formatDuration(totalSeconds)} className="text-green-700" />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title={
              <span className="flex items-center gap-1">
                Số phiên học
                <InfoTooltip title="Chỉ tính các phiên học >= 1 phút. Phiên < 1 phút sẽ bị bỏ qua." />
              </span>
            }
            value={sessionCount}
            suffix="phiên"
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic title="Trung bình/phiên" value={formatDuration(averageSessionDuration)} />
        </Col>
      </Row>
    </Card>
  );
};
