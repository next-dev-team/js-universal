import React, { useState, useEffect } from "react";
import { Tabs, Button, Typography, Modal, message } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import PluginWebview from "./PluginWebview";
import { useAppStore } from "@/store/useAppStore";

const { Title, Text } = Typography;

interface EmbeddedPlugin {
  id: string;
  name: string;
  url: string;
  isDevelopment?: boolean;
}

export default function PluginContainer() {
  const { runningPlugins, webviewPlugins, plugins, closePlugin, loadPlugins } =
    useAppStore();

  const [embeddedPlugins, setEmbeddedPlugins] = useState<EmbeddedPlugin[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [fullscreenPlugin, setFullscreenPlugin] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();

    // Add counter-app-dev to webview plugins for development
    const { setWebviewPlugins, setPlugins } = useAppStore.getState();
    setWebviewPlugins(["counter-app-dev"]);

    // Add counter-app-dev to plugins list for development
    const counterAppDevPlugin = {
      id: "counter-app-dev",
      name: "Counter App Dev",
      version: "1.0.0",
      description:
        "Counter App Development Mode - Testing plugin with hot reload and real-time changes",
      author: "Super App Team",
      icon: "counter-icon.svg",
      main: "index.html",
      path: "http://localhost:3003",
      permissions: ["storage", "notifications", "communication"],
      downloadCount: 0,
      rating: 5,
      category: "development",
      tags: ["counter", "development", "demo"],
      enabled: true,
      installed: true,
      manifest: {
        id: "counter-app-dev",
        name: "Counter App Dev",
        version: "1.0.0",
        description:
          "Counter App Development Mode - Testing plugin with hot reload and real-time changes",
        author: "Super App Team",
        main: "index.html",
        permissions: ["storage", "notifications", "communication"],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPlugins([counterAppDevPlugin]);
  }, [loadPlugins]);

  // Convert running plugins to embedded plugins
  useEffect(() => {
    // Combine both running plugins and webview plugins
    const allRunningPlugins = [...runningPlugins, ...webviewPlugins];

    const embedded = allRunningPlugins
      .map((pluginId) => {
        const plugin = plugins.find((p) => p.id === pluginId);
        if (!plugin) return null;

        // Determine if it's a development plugin
        const isDevelopment = pluginId === "counter-app-dev";

        // Get the appropriate URL
        let url = "";
        if (isDevelopment) {
          url = "http://localhost:3003";
        } else {
          // For production plugins, use file:// protocol
          url = `file://${plugin.path || ""}/index.html`;
        }

        return {
          id: pluginId,
          name: plugin.name,
          url,
          isDevelopment,
        };
      })
      .filter(Boolean) as EmbeddedPlugin[];

    setEmbeddedPlugins(embedded);

    // Set active tab to the first plugin if none is active
    if (embedded.length > 0 && !activeTab) {
      setActiveTab(embedded[0].id);
    }
  }, [runningPlugins, webviewPlugins, plugins, activeTab]);

  const handleClosePlugin = async (pluginId: string) => {
    try {
      await closePlugin(pluginId);
      message.success(`Plugin ${pluginId} closed successfully`);

      // Remove from embedded plugins
      setEmbeddedPlugins((prev) => prev.filter((p) => p.id !== pluginId));

      // Update active tab if needed
      if (activeTab === pluginId) {
        const remaining = embeddedPlugins.filter((p) => p.id !== pluginId);
        setActiveTab(remaining.length > 0 ? remaining[0].id : "");
      }
    } catch (error) {
      console.error("Failed to close plugin:", error);
      message.error(`Failed to close plugin ${pluginId}`);
    }
  };

  const handleFullscreen = (pluginId: string) => {
    setFullscreenPlugin(pluginId);
  };

  const handleCloseFullscreen = () => {
    setFullscreenPlugin(null);
  };

  const handleSettings = (pluginId: string) => {
    // TODO: Implement plugin settings modal
    message.info(`Settings for ${pluginId} - Coming soon!`);
  };

  const handleAddPlugin = () => {
    Modal.info({
      title: "Add Plugin",
      content: "Use the Plugin Manager to install and launch plugins.",
      onOk: () => {
        // Navigate to plugin manager
        window.location.href = "/plugins";
      },
    });
  };

  if (embeddedPlugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AppstoreOutlined className="text-6xl text-gray-300 mb-4" />
        <Title level={3} className="text-gray-500">
          No Plugins Running
        </Title>
        <Text type="secondary" className="mb-4">
          Launch a plugin from the Plugin Manager to see it here.
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddPlugin}
        >
          Add Plugin
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="editable-card"
        hideAdd
        className="h-full"
        tabBarStyle={{ marginBottom: 0 }}
        items={embeddedPlugins.map((plugin) => ({
          key: plugin.id,
          label: (
            <div className="flex items-center space-x-2">
              <span>{plugin.name}</span>
              {plugin.isDevelopment && (
                <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                  DEV
                </span>
              )}
            </div>
          ),
          closable: true,
          children: (
            <div className="h-full">
              <PluginWebview
                pluginId={plugin.id}
                pluginName={plugin.name}
                pluginUrl={plugin.url}
                isDevelopment={plugin.isDevelopment}
                onClose={() => handleClosePlugin(plugin.id)}
                onFullscreen={() => handleFullscreen(plugin.id)}
                onSettings={() => handleSettings(plugin.id)}
              />
            </div>
          ),
        }))}
        onEdit={(targetKey, action) => {
          if (action === "remove" && typeof targetKey === "string") {
            handleClosePlugin(targetKey);
          }
        }}
      />

      {/* Fullscreen Modal */}
      {fullscreenPlugin && (
        <Modal
          title={null}
          open={true}
          onCancel={handleCloseFullscreen}
          footer={null}
          width="100vw"
          style={{ top: 0, paddingBottom: 0 }}
          bodyStyle={{ height: "100vh", padding: 0 }}
          closable={false}
        >
          <div className="relative h-full">
            <Button
              className="absolute top-2 right-2 z-50"
              icon={<CloseOutlined />}
              onClick={handleCloseFullscreen}
            />
            {(() => {
              const plugin = embeddedPlugins.find(
                (p) => p.id === fullscreenPlugin
              );
              return plugin ? (
                <PluginWebview
                  pluginId={plugin.id}
                  pluginName={plugin.name}
                  pluginUrl={plugin.url}
                  isDevelopment={plugin.isDevelopment}
                  onClose={handleCloseFullscreen}
                />
              ) : null;
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
}
