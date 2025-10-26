import React, { useState, useEffect } from "react";
import { Tabs, Button, Typography, Modal, message, Space } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  CloseOutlined,
  ReloadOutlined,
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

interface WorkspaceProject {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  hasDevServer: boolean;
  devServerPort?: number;
  isDevelopment: boolean;
}

export default function PluginContainer() {
  const { runningPlugins, webviewPlugins, plugins, closePlugin, loadPlugins } =
    useAppStore();

  const [embeddedPlugins, setEmbeddedPlugins] = useState<EmbeddedPlugin[]>([]);
  const [workspaceProjects, setWorkspaceProjects] = useState<WorkspaceProject[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [fullscreenPlugin, setFullscreenPlugin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load workspace projects
  const loadWorkspaceProjects = async () => {
    try {
      setLoading(true);
      console.log("[PluginContainer] Starting to load workspace projects");
      console.log("[PluginContainer] window.electronAPI available:", !!window.electronAPI);
      console.log("[PluginContainer] getWorkspaceProjects method available:", !!window.electronAPI?.getWorkspaceProjects);
      
      if (window.electronAPI?.getWorkspaceProjects) {
        console.log("[PluginContainer] Calling getWorkspaceProjects...");
        const projects = await window.electronAPI.getWorkspaceProjects();
        console.log("[PluginContainer] Raw projects response:", projects);
        console.log("[PluginContainer] Projects type:", typeof projects);
        console.log("[PluginContainer] Projects length:", Array.isArray(projects) ? projects.length : 'not an array');
        
        if (Array.isArray(projects)) {
          console.log("[PluginContainer] Loaded workspace projects:", projects);
          setWorkspaceProjects(projects);
          
          // Convert workspace projects to embedded plugins
          const embedded = projects
            .filter(project => {
              console.log(`[PluginContainer] Checking project ${project.id}: hasDevServer=${project.hasDevServer}, devServerPort=${project.devServerPort}`);
              return project.hasDevServer && project.devServerPort;
            })
            .map(project => ({
              id: project.id,
              name: project.name,
              url: `http://localhost:${project.devServerPort}`,
              isDevelopment: project.isDevelopment,
            }));
          
          console.log("[PluginContainer] Converted to embedded plugins:", embedded);
          setEmbeddedPlugins(embedded);
          
          // Set active tab to the first plugin if none is active
          if (embedded.length > 0 && !activeTab) {
            console.log("[PluginContainer] Setting active tab to:", embedded[0].id);
            setActiveTab(embedded[0].id);
          }
        } else {
          console.error("[PluginContainer] Projects response is not an array:", projects);
        }
      } else {
        console.warn("[PluginContainer] getWorkspaceProjects API not available");
        console.log("[PluginContainer] Available electronAPI methods:", Object.keys(window.electronAPI || {}));
      }
    } catch (error) {
      console.error("[PluginContainer] Failed to load workspace projects:", error);
      console.error("[PluginContainer] Error details:", error);
      console.error("[PluginContainer] Error message:", error instanceof Error ? error.message : String(error));
      console.error("[PluginContainer] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      message.error("Failed to load workspace projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[PluginContainer] useEffect triggered - starting to load plugins and workspace projects");
    console.log("[PluginContainer] Component mounted, embeddedPlugins length:", embeddedPlugins.length);
    console.log("[PluginContainer] Current workspaceProjects:", workspaceProjects);
    
    // Load both database plugins and workspace projects
    loadPlugins();
    loadWorkspaceProjects();

    // Listen for webview reload messages from main process
    const handleWebviewReload = (event: any, data: { pluginId: string }) => {
      console.log(`[PluginContainer] Received reload request for plugin: ${data.pluginId}`);
      
      // Find the webview element for this plugin and reload it
      const webviewElement = document.querySelector(`webview[data-plugin-id="${data.pluginId}"]`) as any;
      if (webviewElement && typeof webviewElement.reload === 'function') {
        console.log(`[PluginContainer] Reloading webview for plugin: ${data.pluginId}`);
        webviewElement.reload();
        message.info(`Plugin ${data.pluginId} reloaded due to file changes`);
      } else {
        console.warn(`[PluginContainer] Webview element not found for plugin: ${data.pluginId}`);
      }
    };

    // Add IPC listener for webview reload
    if (window.electronAPI && window.electronAPI.onWebviewReload) {
      window.electronAPI.onWebviewReload(handleWebviewReload);
    }

    // Cleanup function
    return () => {
      if (window.electronAPI && window.electronAPI.removeWebviewReloadListener) {
        window.electronAPI.removeWebviewReloadListener(handleWebviewReload);
      }
    };
  }, [loadPlugins]);

  // No need for the old useEffect that converted running plugins to embedded plugins
  // since we now load workspace projects directly

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
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPlugin}
          >
            Add Plugin
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={async () => {
              console.log("[PluginContainer] Refresh button clicked");
              try {
                // Use the new workspace rescan functionality
                if (window.electronAPI?.rescanWorkspace) {
                  const result = await window.electronAPI.rescanWorkspace();
                  console.log(`[PluginContainer] Workspace rescanned successfully. ${result.projectCount} projects found.`);
                  message.success(`Workspace rescanned! Found ${result.projectCount} projects.`);
                }
                
                // Reload workspace projects
                await loadWorkspaceProjects();
              } catch (error) {
                console.error("[PluginContainer] Failed to refresh workspace:", error);
                message.error("Failed to refresh workspace");
                // Fallback to just reloading workspace projects
                await loadWorkspaceProjects();
              }
            }}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
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
            <div 
              className="flex items-center space-x-2"
              data-testid={`plugin-tab-${plugin.id}`}
            >
              <span>{plugin.name}</span>
              {plugin.isDevelopment && (
                <span 
                  className="text-xs bg-orange-100 text-orange-600 px-1 rounded"
                  data-testid={`dev-indicator-${plugin.id}`}
                >
                  DEV
                </span>
              )}
            </div>
          ),
          closable: true,
          closeIcon: (
            <CloseOutlined 
              data-testid={`plugin-close-${plugin.id}`}
            />
          ),
          children: (
            <div className="h-full">
              <PluginWebview
                pluginId={plugin.id}
                pluginName={plugin.name}
                pluginUrl={plugin.url}
                preloadPath={plugin.isDevelopment ? "./out/preload/dev-plugin-preload.cjs" : "./out/preload/plugin-preload.cjs"}
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
                  preloadPath={plugin.isDevelopment ? "./out/preload/dev-plugin-preload.cjs" : "./out/preload/plugin-preload.cjs"}
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
