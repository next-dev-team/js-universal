import React from "react";
import { Typography } from "antd";
import PluginContainer from "@/components/PluginContainer";

const { Title, Text } = Typography;

export default function PluginWorkspace() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <Title level={2}>Plugin Workspace</Title>
        <Text type="secondary">
          Run and manage your plugins in an integrated workspace.
        </Text>
      </div>

      <div className="h-full">
        <PluginContainer />
      </div>
    </div>
  );
}

