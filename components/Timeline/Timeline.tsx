'use client';

import { Card, Tooltip } from 'antd';
import React, { useMemo } from 'react';

import {
  calculateTimelinePosition,
  formatDuration,
  getTimeString,
  getSessionDuration,
} from '@/lib/time-utils';
import type { StudySession } from '@/types';
import { EVENT_COLORS, TIME_CONSTANTS } from '@/types';

interface TimelineProps {
  sessions: StudySession[];
  currentSession?: StudySession | null;
  currentTime?: number;
  onEventClick?: (session: StudySession) => void;
}

export function Timeline({
  sessions,
  currentSession,
  currentTime = 0,
  onEventClick,
}: TimelineProps) {
  const events = useMemo(() => {
    const allSessions = currentSession
      ? [...sessions.filter((s) => s.id !== currentSession.id), currentSession]
      : sessions;

    return allSessions.map((session) => {
      const isCurrent =
        session.status === 'in-progress' && session.id === currentSession?.id;
      const sessionDuration = isCurrent
        ? currentTime
        : getSessionDuration(session);

      const { startPosition, length } = calculateTimelinePosition(
        session.startTime,
        sessionDuration,
      );

      return {
        session,
        startPosition,
        length,
        color:
          session.status === 'in-progress'
            ? EVENT_COLORS.active
            : EVENT_COLORS[session.type],
      };
    });
  }, [sessions, currentSession, currentTime]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour <= TIME_CONSTANTS.HOURS_PER_DAY; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
      });
    }
    return slots;
  }, []);

  return (
    <Card title="Timeline hôm nay" className="w-full">
      <div className="relative">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          {timeSlots
            .filter((_, i) => i % 3 === 0)
            .map((slot) => (
              <span key={slot.hour}>{slot.label}</span>
            ))}
        </div>

        <div className="relative h-40 overflow-hidden rounded-lg bg-gray-100">
          <div className="absolute inset-0 flex">
            {Array.from({ length: TIME_CONSTANTS.TOTAL_SLOTS }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`flex-1 last:border-r-0 ${index % 60 === 59 ? 'border-r-2 border-gray-300' : 'border-r border-gray-200'}`}
                />
              ),
            )}
          </div>

          {events.map((event) => {
            const leftPercent =
              (event.startPosition / TIME_CONSTANTS.TOTAL_SLOTS) * 100;
            const widthPercent =
              (event.length / TIME_CONSTANTS.TOTAL_SLOTS) * 100;

            const tooltipContent = (
              <div className="text-sm">
                <div className="font-semibold">
                  {getTimeString(new Date(event.session.startTime))}
                  {event.session.endTime &&
                    ` - ${getTimeString(new Date(event.session.endTime))}`}
                </div>
                <div>
                  Thời lượng:{' '}
                  {formatDuration(
                    event.session.status === 'in-progress' &&
                      event.session.id === currentSession?.id
                      ? currentTime
                      : getSessionDuration(event.session),
                  )}
                </div>
              </div>
            );

            return (
              <Tooltip key={event.session.id} title={tooltipContent}>
                <div
                  className="absolute bottom-1 top-1 cursor-pointer rounded transition-opacity hover:opacity-80"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: event.color,
                    minWidth: '2px',
                  }}
                  onClick={() => onEventClick?.(event.session)}
                />
              </Tooltip>
            );
          })}

          <CurrentTimeIndicator />
        </div>
      </div>
    </Card>
  );
}

function CurrentTimeIndicator() {
  const [currentPosition, setCurrentPosition] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const position = (hours * 60 + minutes) / (24 * 60);
      setCurrentPosition(position * 100);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-500"
      style={{ left: `${currentPosition}%` }}
    >
      <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
    </div>
  );
}
