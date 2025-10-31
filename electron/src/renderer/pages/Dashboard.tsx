import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Button,
  Avatar,
  Tag,
  Typography,
  Space,
  Empty,
  Spin,
} from "antd";
import {
  AppstoreOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAppStore } from "@/store/useAppStore";
import { Plugin, UserPlugin } from "../types";

const { Title, Text } = Typography;

export default function Dashboard() {
  const {
    plugins,
    userPlugins,
    installedPlugins,
    runningPlugins,
    currentUser,
    loading,
    loadUserPlugins,
    launchPlugin,
  } = useAppStore();

  const [recentPlugins, setRecentPlugins] = useState<UserPlugin[]>([]);
  const [popularPlugins, setPopularPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadUserPlugins();
    }
  }, [currentUser, loadUserPlugins]);

  useEffect(() => {
    // Get recent plugins (last used)
    const recent = [...userPlugins]
      .filter((up) => up.lastUsedAt)
      .sort(
        (a, b) =>
          new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime()
      )
      .slice(0, 5);
    setRecentPlugins(recent);

    // Get popular plugins (by download count)
    const popular = [...plugins]
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5);
    setPopularPlugins(popular);
  }, [plugins, userPlugins]);

  const handleLaunchPlugin = async (pluginId: string) => {
    try {
      await launchPlugin(pluginId);
    } catch (error) {
      console.error("Failed to launch plugin:", error);
    }
  };

  const getPluginById = (pluginId: string) => {
    return plugins.find((p) => p.id === pluginId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <Title level={2}>Welcome back, {currentUser?.username}!</Title>
        <Text type="secondary">
          Manage your plugins and explore new mini-apps in your super app
          ecosystem.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Installed Plugins"
              value={installedPlugins.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Running Plugins"
              value={runningPlugins.length}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Available Plugins"
              value={plugins.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Downloads"
              value={plugins.reduce((sum, p) => sum + p.downloadCount, 0)}
              prefix={<DownloadOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Plugins */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                Recently Used Plugins
              </Space>
            }
            extra={
              <Button type="link" href="/plugins">
                View All
              </Button>
            }
          >
            {recentPlugins.length > 0 ? (
              <List
                dataSource={recentPlugins}
                renderItem={(userPlugin) => {
                  const plugin = getPluginById(userPlugin.pluginId);
                  if (!plugin) return null;

                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="launch"
                          type="primary"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleLaunchPlugin(plugin.id)}
                          disabled={runningPlugins.includes(plugin.id)}
                        >
                          {runningPlugins.includes(plugin.id)
                            ? "Running"
                            : "Launch"}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={plugin.iconUrl}
                            icon={<AppstoreOutlined />}
                          />
                        }
                        title={plugin.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary" ellipsis>
                              {plugin.description}
                            </Text>
                            <Space>
                              <Tag color="blue">{plugin.category}</Tag>
                              {userPlugin.lastUsedAt && (
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  Last used:{" "}
                                  {new Date(
                                    userPlugin.lastUsedAt
                                  ).toLocaleDateString()}
                                </Text>
                              )}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                description="No recently used plugins"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Popular Plugins */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <StarOutlined />
                Popular Plugins
              </Space>
            }
            extra={
              <Button type="link" href="/marketplace">
                Browse Marketplace
              </Button>
            }
          >
            {popularPlugins.length > 0 ? (
              <List
                dataSource={popularPlugins}
                renderItem={(plugin) => {
                  const isInstalled = installedPlugins.some(
                    (ip) => ip.id === plugin.id
                  );
                  const isRunning = runningPlugins.includes(plugin.id);

                  return (
                    <List.Item
                      actions={[
                        isInstalled ? (
                          <Button
                            key="launch"
                            type="primary"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleLaunchPlugin(plugin.id)}
                            disabled={isRunning}
                          >
                            {isRunning ? "Running" : "Launch"}
                          </Button>
                        ) : (
                          <Button
                            key="install"
                            size="small"
                            icon={<DownloadOutlined />}
                            href="/marketplace"
                          >
                            Install
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={plugin.iconUrl}
                            icon={<AppstoreOutlined />}
                          />
                        }
                        title={
                          <Space>
                            {plugin.name}
                            {plugin.isVerified && (
                              <Tag color="green" style={{ fontSize: "10px" }}>
                                Verified
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary" ellipsis>
                              {plugin.description}
                            </Text>
                            <Space>
                              <Tag color="blue">{plugin.category}</Tag>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <DownloadOutlined /> {plugin.downloadCount}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                <StarOutlined />{" "}
                                {plugin.averageRating.toFixed(1)}
                              </Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                description="No plugins available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Button
              type="primary"
              size="large"
              block
              icon={<AppstoreOutlined />}
              href="/marketplace"
            >
              Browse Marketplace
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              size="large"
              block
              icon={<AppstoreOutlined />}
              href="/plugins"
            >
              Manage Plugins
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              size="large"
              block
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  const pluginPath =
                    await window.electronAPI.openDirectoryDialog();
                  if (pluginPath) {
                    // Navigate to plugin manager with install action
                    window.location.href = `/plugins?install=${encodeURIComponent(
                      pluginPath
                    )}`;
                  }
                } catch (error) {
                  console.error("Failed to open directory dialog:", error);
                }
              }}
            >
              Install Local Plugin
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
