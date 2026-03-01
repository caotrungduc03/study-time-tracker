'use client';

import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';

import { formatDuration } from '@/lib/time-utils';

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
        <Col xs={24} sm={24}>
          <Statistic
            title="Tổng thời gian hôm nay"
            value={formatDuration(totalSeconds)}
            className="text-green-700"
          />
        </Col>
      </Row>
    </Card>
  );
};
