'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { useStatistics } from '@/hooks/useStatistics';
import { getSessionsByDateRange } from '@/lib/db/operations';
import { getSessionDuration, getDateString } from '@/lib/time-utils';
import type { DailyStat } from '@/types';

import type { TabKey } from '../../types/stats';
import { AllTimeStats } from './AllTimeStats';
import { DailySummary } from './DailySummary';
import { MonthlyOverview } from './MonthlyOverview';
import { YearlyOverview } from './YearlyOverview';

export function StatsDashboard() {
  const { weekStats, monthStats, yearStats, loading, refresh } =
    useStatistics();
  const [activeTab, setActiveTab] = useState<TabKey>('week');
  const [allTimeStats, setAllTimeStats] = useState<DailyStat[]>([]);

  useEffect(() => {
    const loadAllTimeStats = async () => {
      try {
        const now = dayjs();
        const startDate = '2020-01-01';
        const endDate = now.format('YYYY-MM-DD');

        const stats = await getSessionsByDateRange(startDate, endDate);

        const dailyStats = new Map<string, DailyStat>();

        stats.forEach((session) => {
          const date = getDateString(new Date(session.startTime));
          if (!dailyStats.has(date)) {
            dailyStats.set(date, {
              id: date,
              date,
              totalSeconds: 0,
              sessionCount: 0,
              normalSeconds: 0,
              pomodoroWorkSeconds: 0,
              pomodoroBreakSeconds: 0,
              sessions: [],
              averageSessionDuration: 0,
              longestSessionDuration: 0,
              lastUpdated: new Date().toISOString(),
            });
          }

          const stat = dailyStats.get(date)!;
          const sessionDuration = getSessionDuration(session);
          stat.totalSeconds += sessionDuration;
          stat.sessionCount += 1;
          stat.sessions.push(session.id);

          if (sessionDuration > stat.longestSessionDuration) {
            stat.longestSessionDuration = sessionDuration;
          }
        });

        const result = Array.from(dailyStats.values()).sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        setAllTimeStats(result);
      } catch (error) {
        console.error('Failed to load all time stats:', error);
      }
    };

    loadAllTimeStats();
  }, []);

  const items = [
    {
      key: 'week',
      label: 'Tuần',
      children: <DailySummary stats={weekStats} />,
    },
    {
      key: 'month',
      label: 'Tháng',
      children: <MonthlyOverview stats={monthStats} />,
    },
    {
      key: 'year',
      label: 'Năm',
      children: <YearlyOverview stats={yearStats} />,
    },
    {
      key: 'all-time',
      label: 'Toàn bộ thời gian',
      children: <AllTimeStats stats={allTimeStats} />,
    },
  ];

  return (
    <div className="stats-dashboard">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Thống kê học tập</h2>
        <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
          Cập nhật dữ liệu
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key) => setActiveTab(key as TabKey)}
        size="large"
      />
    </div>
  );
}
