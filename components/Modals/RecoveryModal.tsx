"use client";

import React from "react";
import { Modal, Button, Space } from "antd";
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { StudySession } from "@/types";
import { formatDuration, getTimeString } from "@/lib/time-utils";
import { useTimer } from "@/hooks/useTimer";
import { completeSession, deleteSession } from "@/lib/db/operations";

interface RecoveryModalProps {
  open: boolean;
  session: StudySession | null;
  onClose: () => void;
}

export function RecoveryModal({ open, session, onClose }: RecoveryModalProps) {
  const timer = useTimer();
  const [loading, setLoading] = React.useState(false);

  if (!session) return null;

  const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);

  const handleResume = async () => {
    setLoading(true);
    try {
      await timer.resume(session);
      onClose();
    } catch (error) {
      console.error("Failed to resume session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeSession(session.id);
      onClose();
    } catch (error) {
      console.error("Failed to complete session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    setLoading(true);
    try {
      await deleteSession(session.id);
      onClose();
    } catch (error) {
      console.error("Failed to discard session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Phiên học chưa hoàn thành"
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div className="py-4">
        <p className="text-base mb-4">
          Bạn có một phiên học đang diễn ra từ{" "}
          <span className="font-semibold">{getTimeString(new Date(session.startTime))}</span>.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-600 mb-1">Thời gian đã trôi qua</div>
          <div className="text-2xl font-semibold text-study-active">{formatDuration(elapsed)}</div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Bạn muốn làm gì với phiên học này?</p>

        <Space orientation="vertical" className="w-full" size="middle">
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleResume} loading={loading} block>
            Tiếp tục phiên học
          </Button>

          <Button icon={<CheckCircleOutlined />} onClick={handleComplete} loading={loading} block>
            Kết thúc phiên học
          </Button>

          <Button danger icon={<CloseCircleOutlined />} onClick={handleDiscard} loading={loading} block>
            Hủy bỏ phiên học
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
