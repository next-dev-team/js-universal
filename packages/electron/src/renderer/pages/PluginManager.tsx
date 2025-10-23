import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Avatar,
  Tag,
  Typography,
  Space,
  Switch,
  Popconfirm,
  Modal,
  message,
  Tabs,
  Progress,
  Tooltip,
  Input,
} from "antd";
import {
  AppstoreOutlined,
  DeleteOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  StopOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useAppStore } from "@/store/useAppStore";
import { Plugin, UserPlugin } from "../types";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PluginTableData extends Plugin {
  userPlugin?: UserPlugin;
  isRunning: boolean;
}

export default function PluginManager() {
  const {
    plugins,
    userPlugins,
    installedPlugins,
    runningPlugins,
    loading,
    currentUser,
    loadPlugins,
    loadUserPlugins,
    uninstallPlugin,
    enableUserPlugin,
    disableUserPlugin,
    launchPlugin,
    closePlugin,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("installed");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    loadPlugins();
    loadUserPlugins();
  }, [loadPlugins, loadUserPlugins]);

  const getTableData = (): PluginTableData[] => {
    let basePlugins: Plugin[] = [];

    if (activeTab === "installed") {
      basePlugins = installedPlugins;
    } else {
      basePlugins = plugins;
    }

    return basePlugins
      .filter(
        (plugin) =>
          plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((plugin) => {
        const userPlugin = userPlugins.find((up) => up.pluginId === plugin.id);
        return {
          ...plugin,
          userPlugin,
          isRunning: runningPlugins.includes(plugin.id),
        };
      });
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      await uninstallPlugin(pluginId);
      message.success("Plugin uninstalled successfully");
    } catch (error) {
      console.error("Failed to uninstall plugin:", error);
      message.error("Failed to uninstall plugin");
    }
  };

  const handleToggleEnabled = async (pluginId: string, enabled: boolean) => {
    if (!currentUser) {
      message.error("User not logged in");
      return;
    }

    try {
      if (enabled) {
        const result = await enableUserPlugin(currentUser.id, pluginId);
        if (result.success) {
          message.success("Plugin enabled");
        } else {
          message.error(result.error || "Failed to enable plugin");
        }
      } else {
        const result = await disableUserPlugin(currentUser.id, pluginId);
        if (result.success) {
          message.success("Plugin disabled");
        } else {
          message.error(result.error || "Failed to disable plugin");
        }
      }
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
      message.error("Failed to update plugin status");
    }
  };

  const handleLaunchPlugin = async (pluginId: string) => {
    try {
      await launchPlugin(pluginId);
      message.success("Plugin launched");
    } catch (error) {
      console.error("Failed to launch plugin:", error);
      message.error("Failed to launch plugin");
    }
  };

  const handleClosePlugin = async (pluginId: string) => {
    try {
      await closePlugin(pluginId);
      message.success("Plugin closed");
    } catch (error) {
      console.error("Failed to close plugin:", error);
      message.error("Failed to close plugin");
    }
  };

  const handleSelectFolder = async () => {
    try {
      const pluginPath = await window.electronAPI.openDirectoryDialog();
      if (pluginPath) {
        setSelectedFolderPath(pluginPath);
      }
    } catch (error) {
      console.error("Failed to select folder:", error);
      message.error("Failed to select folder");
    }
  };

  const handleInstallPlugin = async () => {
    if (!selectedFolderPath) {
      message.error("Please select a plugin folder first");
      return;
    }

    setIsInstalling(true);
    try {
      message.info("Installing plugin...");

      // Use the actual Electron API to install the plugin
      const result = await window.electronAPI.installPlugin(selectedFolderPath);

      if (result.success) {
        setUploadModalVisible(false);
        setSelectedFolderPath("");

        // Reload plugins after installation
        await loadPlugins();
        await loadUserPlugins();

        message.success(
          `Plugin installed successfully! ${
            result.pluginId ? `Plugin ID: ${result.pluginId}` : ""
          }`
        );
      } else {
        message.error(`Failed to install plugin: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to install plugin:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      message.error(`Failed to install plugin: ${errorMessage}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleQuickInstall = async () => {
    setIsInstalling(true);
    try {
      const pluginPath = await window.electronAPI.openDirectoryDialog();
      if (pluginPath) {
        message.info("Installing plugin...");

        // Use the actual Electron API to install the plugin
        const result = await window.electronAPI.installPlugin(pluginPath);

        if (result.success) {
          setUploadModalVisible(false);
          setSelectedFolderPath("");

          // Reload plugins after installation
          await loadPlugins();
          await loadUserPlugins();

          message.success(
            `Plugin installed successfully! ${
              result.pluginId ? `Plugin ID: ${result.pluginId}` : ""
            }`
          );
        } else {
          message.error(`Failed to install plugin: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Failed to install plugin:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      message.error(`Failed to install plugin: ${errorMessage}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) {
        // Try to get directory from dataTransfer items
        const items = Array.from(e.dataTransfer.items);
        if (items.length === 0) {
          message.error("No files or folders were dropped");
          return;
        }

        // Handle directory entry for web browsers
        const item = items[0];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry?.isDirectory) {
            // For web browsers, we can't get the actual path, so we need to use the directory name
            // and let the user know they need to use the file dialog instead
            message.warning(
              'Drag and drop detected a folder, but path cannot be determined in web browser. Please use "Select Plugin Folder" button instead.'
            );
            return;
          }
        }

        message.error("No files were dropped");
        return;
      }

      if (files.length > 1) {
        message.error("Please drop only one folder at a time");
        return;
      }

      const file = files[0];

      // Check if it's a directory by checking the webkitGetAsEntry API
      const entry = e.dataTransfer.items[0]?.webkitGetAsEntry();

      if (!entry?.isDirectory) {
        message.error("Please drop a folder, not a file");
        return;
      }

      // Get the folder path - this works in Electron but not in web browsers
      const folderPath = (file as File & { path?: string }).path;

      if (!folderPath) {
        // Fallback for web browsers - show a helpful message
        message.warning(
          'Folder detected, but path cannot be determined in web browser. Please use "Select Plugin Folder" button instead.'
        );
        return;
      }

      setSelectedFolderPath(folderPath);
      message.success("Folder selected! Click Install to proceed.");
    } catch (error) {
      console.error("Failed to handle dropped folder:", error);
      message.error("Failed to process dropped folder");
    }
  };

  const showPluginSettings = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setSettingsModalVisible(true);
  };

  const columns: ColumnsType<PluginTableData> = [
    {
      title: "Plugin",
      key: "plugin",
      render: (_, record) => (
        <Space>
          <Avatar src={record.iconUrl} icon={<AppstoreOutlined />} size={40} />
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" className="text-sm">
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Version",
      dataIndex: "currentVersion",
      key: "version",
      width: 100,
    },
    {
      title: "Category",
      key: "category",
      width: 120,
      render: (_, record) => <Tag color="blue">{record.category}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        if (record.isRunning) {
          return <Tag color="green">Running</Tag>;
        }
        if (record.userPlugin?.isEnabled) {
          return <Tag color="blue">Enabled</Tag>;
        }
        return <Tag color="default">Disabled</Tag>;
      },
    },
    {
      title: "Enabled",
      key: "enabled",
      width: 80,
      render: (_, record) => (
        <Switch
          checked={record.userPlugin?.isEnabled || false}
          onChange={(checked) => handleToggleEnabled(record.id, checked)}
          disabled={record.isRunning}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          {record.isRunning ? (
            <Tooltip title="Stop Plugin">
              <Button
                type="text"
                icon={<StopOutlined />}
                onClick={() => handleClosePlugin(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Launch Plugin">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleLaunchPlugin(record.id)}
                disabled={!record.userPlugin?.isEnabled}
              />
            </Tooltip>
          )}
          <Tooltip title="Plugin Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => showPluginSettings(record)}
            />
          </Tooltip>
          {activeTab === "installed" && (
            <Popconfirm
              title="Are you sure you want to uninstall this plugin?"
              onConfirm={() => handleUninstall(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Uninstall Plugin">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={record.isRunning}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Title level={2}>Plugin Manager</Title>
          <Text type="secondary">
            Manage your installed plugins and their settings.
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadPlugins();
              loadUserPlugins();
            }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            Install Plugin
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search plugins..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
      </Card>

      {/* Plugin Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={`Installed (${installedPlugins.length})`}
            key="installed"
          >
            <Table
              columns={columns}
              dataSource={getTableData()}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </TabPane>
          <TabPane tab={`All Plugins (${plugins.length})`} key="all">
            <Table
              columns={columns}
              dataSource={getTableData()}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Install Plugin Modal */}
      <Modal
        title="Install Plugin"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-6">
          <div>
            <Title level={4}>Install from Local Folder</Title>
            <Text type="secondary">
              Select a plugin distribution folder to install, or drag and drop a
              folder below.
            </Text>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
              ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 border-solid shadow-lg"
                  : selectedFolderPath
                  ? "border-green-500 bg-green-50 border-solid shadow-md"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSelectFolder}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                {selectedFolderPath ? (
                  <FolderOpenOutlined className="text-4xl text-green-500 animate-pulse" />
                ) : (
                  <CloudUploadOutlined
                    className={`text-4xl ${
                      isDragOver
                        ? "text-blue-500 animate-bounce"
                        : "text-gray-400"
                    }`}
                  />
                )}
              </div>
              <div>
                <Text
                  className={`text-lg font-medium ${
                    isDragOver
                      ? "text-blue-600"
                      : selectedFolderPath
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {isDragOver
                    ? "Drop folder here"
                    : selectedFolderPath
                    ? "✓ Folder ready for installation!"
                    : "Drag & drop a plugin folder here"}
                </Text>
                <br />
                <Text type="secondary">
                  {selectedFolderPath
                    ? "Click to select a different folder"
                    : "or click to browse for a folder"}
                </Text>
              </div>
            </div>
          </div>

          {/* Selected Folder Path Display */}
          {selectedFolderPath && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text strong>Selected folder:</Text>
              <br />
              <Text code className="text-sm break-all">
                {selectedFolderPath}
              </Text>
            </div>
          )}

          <div className="text-center">
            <Text type="secondary">or</Text>
          </div>

          <Button
            type="default"
            icon={<FolderOpenOutlined />}
            onClick={handleSelectFolder}
            block
            size="large"
          >
            Select Plugin Folder
          </Button>

          {/* Install Button - Always visible but disabled when no path */}
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleInstallPlugin}
            loading={isInstalling}
            disabled={!selectedFolderPath || isInstalling}
            block
            size="large"
            className="mt-4"
          >
            {isInstalling ? "Installing..." : "Install Plugin"}
          </Button>

          <div className="mt-4">
            <Text type="secondary">
              <InfoCircleOutlined className="mr-1" />
              Plugin folders should contain a package.json file and the plugin
              code.
            </Text>
          </div>

          <div className="text-center mt-4">
            <Text type="secondary">or use one-click install</Text>
          </div>

          {/* Quick Install Button */}
          <Button
            type="default"
            icon={<UploadOutlined />}
            onClick={handleQuickInstall}
            loading={isInstalling}
            disabled={isInstalling}
            block
            size="large"
            className="mt-2"
          >
            {isInstalling ? "Installing..." : "Quick Install Plugin"}
          </Button>
        </div>
      </Modal>

      {/* Plugin Settings Modal */}
      <Modal
        title={`${selectedPlugin?.name} Settings`}
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedPlugin && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar
                size={64}
                src={selectedPlugin.iconUrl}
                icon={<AppstoreOutlined />}
              />
              <div>
                <Title level={4} className="mb-1">
                  {selectedPlugin.name}
                </Title>
                <Text type="secondary">Version {selectedPlugin.version}</Text>
                <div className="mt-2">
                  <Tag color="blue">{selectedPlugin.category}</Tag>
                </div>
              </div>
            </div>

            <div>
              <Title level={5}>Description</Title>
              <Text>{selectedPlugin.description}</Text>
            </div>

            <div>
              <Title level={5}>Author</Title>
              <Text>{selectedPlugin.author}</Text>
            </div>

            <div>
              <Title level={5}>Permissions</Title>
              <Space wrap>
                {selectedPlugin.requiredPermissions.map((permission) => (
                  <Tag key={permission} color="orange">
                    {permission}
                  </Tag>
                ))}
              </Space>
            </div>

            <div>
              <Title level={5}>Storage Usage</Title>
              <Progress
                percent={Math.min(
                  (selectedPlugin.size / (100 * 1024 * 1024)) * 100,
                  100
                )}
                format={() =>
                  `${(selectedPlugin.size / 1024 / 1024).toFixed(1)} MB`
                }
              />
            </div>

            <div>
              <Title level={5}>Installation Date</Title>
              <Text>
                {selectedPlugin.createdAt
                  ? new Date(selectedPlugin.createdAt).toLocaleDateString()
                  : "Unknown"}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
