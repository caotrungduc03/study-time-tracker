'use client';

import {
  DownloadOutlined,
  ExportOutlined,
  FileTextOutlined,
  ImportOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  Alert,
  Button,
  Input,
  Menu,
  message,
  Modal,
  Segmented,
  Space,
  Typography,
  Upload,
} from 'antd';
import React, { useState } from 'react';

import { importMultipleSessions } from '@/lib/db/operations';
import { db } from '@/lib/db/schema';
import { type ParsedEntry, parseImportData } from '@/lib/import-utils';
import type { AppSettings, StudySession } from '@/types';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type MenuKey = 'import' | 'export';
type ImportType = 'text' | 'json';

interface ExportedData {
  version: string;
  exportedAt: string;
  timezone: string;
  data: {
    sessions: StudySession[];
    settings: AppSettings[];
  };
}

export default function SettingsModal({
  open,
  onClose,
  onSuccess,
}: SettingsModalProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>('import');
  const [importType, setImportType] = useState<ImportType>('text');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedEntry[]>([]);
  const [textDuplicates, setTextDuplicates] = useState(0);
  const [jsonPreview, setJsonPreview] = useState<{
    sessions: number;
    settings: number;
  } | null>(null);
  const [jsonData, setJsonData] = useState<ExportedData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (!text.trim()) {
      setPreview([]);
      return;
    }

    const { entries, duplicatesCount } = parseImportData(text);
    setPreview(entries);
    setTextDuplicates(duplicatesCount);
  };

  const handleTextImport = async () => {
    if (preview.length === 0) {
      message.warning('Không có dữ liệu hợp lệ để nhập');
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
        message.success(`Đã lưu thành công ${result.success} ngày học`);
        setInputText('');
        setPreview([]);
        onSuccess?.();
        onClose();
      }

      if (result.failed > 0) {
        message.error(`Có ${result.failed} mục bị lỗi không thể nhập`);
        console.error('Import errors:', result.errors);
      }
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Lỗi khi nhập dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData) {
      message.warning('Chưa có file JSON để nhập');
      return;
    }

    setLoading(true);
    try {
      const { sessions, settings } = jsonData.data;

      let sessionSuccess = 0;
      let sessionFailed = 0;

      for (const session of sessions) {
        try {
          await db.sessions.add(session);
          sessionSuccess++;
        } catch (error) {
          console.error('Session import error:', error);
          sessionFailed++;
        }
      }

      for (const setting of settings) {
        try {
          const settingWithId = setting as { id: string };
          const existing = await db.settings.get(settingWithId.id);
          if (existing) {
            await db.settings.update(settingWithId.id, setting);
          } else {
            await db.settings.add(setting);
          }
        } catch (error) {
          console.error('Failed to import setting:', error);
        }
      }

      message.success(
        `Đã nhập thành công ${sessionSuccess} ngày học${sessionFailed > 0 ? `, lỗi ${sessionFailed} mục` : ''}`,
      );
      setJsonData(null);
      setJsonPreview(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('JSON Import failed:', error);
      message.error('Lỗi khi nhập dữ liệu từ file JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportedData;

        if (!data.data || !data.data.sessions) {
          message.error('File JSON không đúng định dạng');
          return;
        }

        setJsonData(data);
        setJsonPreview({
          sessions: data.data.sessions.length,
          settings: data.data.settings?.length || 0,
        });
        message.success('Đã đọc file thành công!');
      } catch {
        message.error(
          'Không thể đọc file JSON. Vui lòng kiểm tra định dạng file.',
        );
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const sessions = await db.sessions.toArray();
      const settings = await db.settings.toArray();

      const exportData: ExportedData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        data: {
          sessions,
          settings,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('Đã xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Lỗi khi xuất dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputText('');
    setPreview([]);
    setJsonData(null);
    setJsonPreview(null);
    onClose();
  };

  const menuItems = [
    {
      key: 'import',
      icon: <ImportOutlined />,
      label: 'Nhập dữ liệu',
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: 'Xuất dữ liệu',
    },
  ];

  const renderImportContent = () => {
    if (importType === 'json') {
      return (
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            title="Khôi phục từ file backup"
            description="Chọn file JSON đã được export trước đó để khôi phục dữ liệu."
            type="info"
            showIcon
          />

          <Upload.Dragger
            accept=".json"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            style={{ padding: '20px' }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              Click hoặc kéo thả file JSON vào đây
            </p>
            <p className="ant-upload-hint">
              Chỉ hỗ trợ file .json được export từ ứng dụng
            </p>
          </Upload.Dragger>

          {jsonPreview && (
            <Alert
              title="Đã đọc file thành công"
              description={
                <div>
                  <p>📊 {jsonPreview.sessions} ngày học</p>
                  <p>⚙️ {jsonPreview.settings} cài đặt</p>
                </div>
              }
              type="success"
              showIcon
            />
          )}

          <Button
            type="primary"
            icon={<ImportOutlined />}
            onClick={handleJsonImport}
            loading={loading}
            disabled={!jsonData}
            block
          >
            Nhập từ file JSON
          </Button>
        </Space>
      );
    }

    return (
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          title="Hướng dẫn"
          description={
            <div className="text-sm">
              Cấu trúc: <Text strong>ngày,thời gian</Text>
              <div className="mt-1 text-xs text-gray-500">
                Hỗ trợ: <Text code>DD/MM/YYYY</Text>,{' '}
                <Text code>YYYY-MM-DD</Text> |{' '}
                <Text code>XhY&apos;Z&apos;&apos;</Text>,{' '}
                <Text code>HH:mm:ss</Text>
              </div>
              <div className="mt-1 text-xs text-blue-600">
                Ví dụ: 15/01/2025,1h30&apos;00&apos;&apos; hoặc
                2025-01-15,01:30:00
              </div>
            </div>
          }
          type="info"
          showIcon
        />

        <div className="space-y-2">
          <Text strong>Nhập dữ liệu:</Text>
          <TextArea
            rows={10}
            value={inputText}
            onChange={handleInputChange}
            className="font-mono text-sm"
          />
        </div>

        <Space orientation="vertical" style={{ width: '100%' }} size="small">
          <Alert
            title={`Đã nhận diện ${preview.length} ngày học hợp lệ`}
            type="success"
            showIcon
          />
          {textDuplicates > 0 && (
            <Alert
              title={`Lưu ý: Có ${textDuplicates} dòng bị trùng ngày trong nội dung nhập đã được tự động xử lý.`}
              type="warning"
              showIcon
            />
          )}
        </Space>

        <Button
          type="primary"
          icon={<ImportOutlined />}
          onClick={handleTextImport}
          loading={loading}
          disabled={preview.length === 0}
          block
        >
          Lưu dữ liệu {preview.length > 0 ? `(${preview.length} ngày)` : ''}
        </Button>
      </Space>
    );
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'import':
        return (
          <Space orientation="vertical" style={{ width: '100%' }} size="middle">
            <Title level={5}>Nhập dữ liệu học tập</Title>

            <Segmented
              value={importType}
              onChange={(value) => setImportType(value as ImportType)}
              options={[
                {
                  label: (
                    <span>
                      <FileTextOutlined /> Nhập thủ công
                    </span>
                  ),
                  value: 'text',
                },
                {
                  label: (
                    <span>
                      <UploadOutlined /> File JSON
                    </span>
                  ),
                  value: 'json',
                },
              ]}
              block
            />

            {renderImportContent()}
          </Space>
        );

      case 'export':
        return (
          <Space orientation="vertical" style={{ width: '100%' }} size="middle">
            <Title level={5}>Xuất dữ liệu học tập</Title>
            <Alert
              title="Thông tin"
              description={
                <div className="space-y-2">
                  <p>
                    Xuất toàn bộ dữ liệu của bạn ra file JSON để backup hoặc
                    chuyển sang thiết bị khác.
                  </p>
                  <p className="text-sm text-gray-500">
                    File xuất dữ liệu sẽ bao gồm tất cả các ngày học và cài đặt
                    của bạn.
                  </p>
                </div>
              }
              type="info"
              showIcon
            />

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={loading}
              block
            >
              Tải xuống file backup
            </Button>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Cài đặt"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex min-h-[400px]">
        <div className="w-48 border-r border-gray-200 bg-gray-50">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key as MenuKey)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>

        <div className="flex-1 p-6">{renderContent()}</div>
      </div>
    </Modal>
  );
}
