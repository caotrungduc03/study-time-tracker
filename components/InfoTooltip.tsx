import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React from "react";

interface InfoTooltipProps {
  title: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, className = "text-gray-400 cursor-help text-sm" }) => {
  return (
    <Tooltip title={title}>
      <InfoCircleOutlined className={className} />
    </Tooltip>
  );
};
