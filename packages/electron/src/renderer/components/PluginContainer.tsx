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
import { discoverDirectPlugins, directPluginRegistry, DirectPlugin } from "@/plugins";

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
  const [directPlugins, setDirectPlugins] = useState<DirectPlugin[]>([]);
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
              console.log(`[PluginContainer] Checking project ${project.id}:`);
              console.log(`  - hasDevServer: ${project.hasDevServer} (type: ${typeof project.hasDevServer})`);
              console.log(`  - devServerPort: ${project.devServerPort} (type: ${typeof project.devServerPort})`);
              console.log(`  - isDevelopment: ${project.isDevelopment} (type: ${typeof project.isDevelopment})`);
              const hasServer = project.hasDevServer === true;
              const hasPort = project.devServerPort && project.devServerPort > 0;
              console.log(`  - hasServer check: ${hasServer}`);
              console.log(`  - hasPort check: ${hasPort}`);
              const result = hasServer && hasPort;
              console.log(`  - final result: ${result}`);
              return result;
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

  // Load direct plugins
  const loadDirectPlugins = async () => {
    try {
      console.log("[PluginContainer] Loading direct plugins...");
      const plugins = await discoverDirectPlugins();
      setDirectPlugins(plugins);
      console.log("[PluginContainer] Loaded direct plugins:", plugins);
    } catch (error) {
      console.error("[PluginContainer] Failed to load direct plugins:", error);
    }
  };

  useEffect(() => {
    console.log("[PluginContainer] useEffect triggered - starting to load plugins and workspace projects");
    console.log("[PluginContainer] Component mounted, embeddedPlugins length:", embeddedPlugins.length);
    console.log("[PluginContainer] Current workspaceProjects:", workspaceProjects);
    
    // Load database plugins, workspace projects, and direct plugins
    loadPlugins();
    loadWorkspaceProjects();
    loadDirectPlugins();

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

  // Check if we have any plugins at all (embedded or direct)
  const hasAnyPlugins = embeddedPlugins.length > 0 || directPlugins.length > 0;

  if (!hasAnyPlugins) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AppstoreOutlined className="text-6xl text-gray-300 mb-4" />
        <Title level={3} className="text-gray-500">
          No Plugins Running
        </Title>
        <Text type="secondary" className="mb-4">
          Launch a plugin from the Plugin Manager or develop plugins directly in src/plugins/.
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
        items={[
          // Embedded plugins (webview-based)
          ...embeddedPlugins.map((plugin) => ({
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
        })),
        // Direct plugins (component-based)
        ...directPlugins.map((plugin) => ({
          key: `direct-${plugin.id}`,
          label: (
            <div 
              className="flex items-center space-x-2"
              data-testid={`plugin-tab-direct-${plugin.id}`}
            >
              <span>{plugin.name}</span>
              <span 
                className="text-xs bg-blue-100 text-blue-600 px-1 rounded"
                data-testid={`direct-indicator-${plugin.id}`}
              >
                DIRECT
              </span>
            </div>
          ),
          closable: true,
          closeIcon: (
            <CloseOutlined 
              data-testid={`plugin-close-direct-${plugin.id}`}
            />
          ),
          children: (
            <div className="h-full p-4">
              <plugin.component />
            </div>
          ),
        }))
        ]}
        onEdit={(targetKey, action) => {
          if (action === "remove" && typeof targetKey === "string") {
            if (targetKey.startsWith('direct-')) {
              // Handle direct plugin close
              const pluginId = targetKey.replace('direct-', '');
              console.log(`[PluginContainer] Closing direct plugin: ${pluginId}`);
              // For direct plugins, we just remove them from the active tab
              if (activeTab === targetKey) {
                const remainingTabs = [...embeddedPlugins, ...directPlugins];
                if (remainingTabs.length > 1) {
                  const currentIndex = remainingTabs.findIndex(p => 
                    (p as any).id === pluginId || `direct-${(p as any).id}` === targetKey
                  );
                  const nextTab = remainingTabs[currentIndex + 1] || remainingTabs[currentIndex - 1];
                  setActiveTab(nextTab ? (nextTab as any).id : '');
                } else {
                  setActiveTab('');
                }
              }
            } else {
              handleClosePlugin(targetKey);
            }
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
