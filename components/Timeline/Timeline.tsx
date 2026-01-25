"use client";

import React, { useMemo } from "react";
import { Card, Tooltip } from "antd";
import { EVENT_COLORS, TIME_CONSTANTS } from "@/types";
import type { StudySession } from "@/types";
import { calculateTimelinePosition, formatDuration, getTimeString } from "@/lib/time-utils";

interface TimelineProps {
  sessions: StudySession[];
  currentSession?: StudySession | null;
  onEventClick?: (session: StudySession) => void;
}

export function Timeline({ sessions, currentSession, onEventClick }: TimelineProps) {
  // Calculate positions for all sessions
  const events = useMemo(() => {
    const allSessions = currentSession ? [...sessions, currentSession] : sessions;

    return allSessions.map((session) => {
      const { startPosition, length } = calculateTimelinePosition(session.startTime, session.duration || 0);

      return {
        session,
        startPosition,
        length,
        color: session.status === "in-progress" ? EVENT_COLORS.active : EVENT_COLORS[session.type],
      };
    });
  }, [sessions, currentSession]);

  // Generate timeline grid (24 hours, 4 slots per hour)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < TIME_CONSTANTS.HOURS_PER_DAY; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  }, []);

  return (
    <Card title="Timeline hôm nay" className="w-full">
      <div className="relative">
        {/* Time labels */}
        <div className="flex justify-between mb-2 text-xs text-gray-500">
          {timeSlots
            .filter((_, i) => i % 3 === 0)
            .map((slot) => (
              <span key={slot.hour}>{slot.label}</span>
            ))}
        </div>

        {/* Timeline grid */}
        <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
          {/* Changed from h-24 to h-40 for 1-min slots */}
          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: TIME_CONSTANTS.TOTAL_SLOTS }).map((_, index) => (
              <div
                key={index}
                className="flex-1 border-r border-gray-200 last:border-r-0"
                style={{
                  borderRightWidth: index % 60 === 59 ? "2px" : "1px", // Every hour (60 slots for 1-min)
                  borderColor: index % 60 === 59 ? "#d1d5db" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          {/* Events */}
          {events.map((event) => {
            const leftPercent = (event.startPosition / TIME_CONSTANTS.TOTAL_SLOTS) * 100;
            const widthPercent = (event.length / TIME_CONSTANTS.TOTAL_SLOTS) * 100;

            const tooltipContent = (
              <div className="text-sm">
                <div className="font-semibold">
                  {getTimeString(new Date(event.session.startTime))}
                  {event.session.endTime && ` - ${getTimeString(new Date(event.session.endTime))}`}
                </div>
                <div>Thời lượng: {formatDuration(event.session.duration)}</div>
                {event.session.notes && <div className="mt-1 text-xs opacity-80">{event.session.notes}</div>}
              </div>
            );

            return (
              <Tooltip key={event.session.id} title={tooltipContent}>
                <div
                  className="absolute top-1 bottom-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: event.color,
                    minWidth: "2px",
                  }}
                  onClick={() => onEventClick?.(event.session)}
                />
              </Tooltip>
            );
          })}

          {/* Current time indicator */}
          <CurrentTimeIndicator />
        </div>
      </div>
    </Card>
  );
}

// Current time indicator component
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
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${currentPosition}%` }}>
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
    </div>
  );
}
