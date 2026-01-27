"use client";

import React, { useState } from "react";
import { Modal, Input, message, Alert, Space, Typography } from "antd";
import { importMultipleSessions } from "@/lib/db/operations";
import { parseImportData, type ParsedEntry } from "@/lib/import-utils";

const { TextArea } = Input;
const { Text } = Typography;

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedEntry[]>([]);

  // Parse input text to show preview
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (!text.trim()) {
      setPreview([]);
      return;
    }

    const { entries } = parseImportData(text);
    setPreview(entries);
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      message.warning("Không có dữ liệu hợp lệ để import");
      return;
    }

    setLoading(true);
    try {
      const result = await importMultipleSessions(
        preview.map((p) => ({
          date: p.date,
          durationSeconds: p.durationSeconds,
        })),
      );

      if (result.success > 0) {
        message.success(`Đã import thành công ${result.success} phiên học`);
        setInputText("");
        setPreview([]);
        onSuccess?.();
        onClose();
      }

      if (result.failed > 0) {
        message.error(`Có ${result.failed} phiên không thể import`);
        console.error("Import errors:", result.errors);
      }
    } catch (error) {
      console.error("Import failed:", error);
      message.error("Lỗi khi import dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputText("");
    setPreview([]);
    onClose();
  };

  return (
    <Modal
      title="Import dữ liệu cũ"
      open={open}
      onOk={handleImport}
      onCancel={handleCancel}
      okText="Import"
      cancelText="Hủy"
      width={700}
      confirmLoading={loading}
      okButtonProps={{
        disabled: preview.length === 0,
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Alert
          message="Hướng dẫn"
          description={
            <div className="space-y-2">
              <p className="mb-2">
                Mỗi dòng nhập một phiên học theo format: <strong>ngày,thời gian</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>1/1/2025,1h20&apos;00&apos;&apos;</li>
                <li>2/2/2025,1h30&apos;</li>
                <li>15/3/2025,45&apos; (45 phút)</li>
                <li>20/4/2025,2h (2 giờ)</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Có thể bỏ qua giây hoặc phút. Dòng bắt đầu bằng # sẽ bị bỏ qua.
              </p>
            </div>
          }
          type="info"
          showIcon
        />

        <div className="space-y-2">
          <Text strong>Nhập dữ liệu:</Text>
          <TextArea rows={10} value={inputText} onChange={handleInputChange} className="font-mono" />
        </div>
      </Space>
    </Modal>
  );
}
