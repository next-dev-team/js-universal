import { useState } from "react";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  SettingOutlined,
  CodeOutlined,
  AppstoreOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  EyeOutlined,
  MessageOutlined,
  MenuOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MinusOutlined,
  BorderOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, currentUser, theme } =
    useAppStore();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/marketplace",
      icon: <AppstoreOutlined />,
      label: "Marketplace",
    },
    {
      key: "/plugins",
      icon: <AppstoreOutlined />,
      label: "Plugin Manager",
    },
    {
      key: "/workspace",
      icon: <AppstoreOutlined />,
      label: "Plugin Workspace",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "/developer",
      icon: <CodeOutlined />,
      label: "Developer Console",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      // Handle logout
      console.log("Logout clicked");
    } else if (key === "profile") {
      // Handle profile
      console.log("Profile clicked");
    }
  };

  const handleWindowControl = async (
    action: "minimize" | "maximize" | "close"
  ) => {
    try {
      switch (action) {
        case "minimize":
          await window.electronAPI.minimizeWindow();
          break;
        case "maximize":
          await window.electronAPI.maximizeWindow();
          break;
        case "close":
          await window.electronAPI.closeWindow();
          break;
      }
    } catch (error) {
      console.error("Window control error:", error);
    }
  };

  return (
    <AntLayout className="h-screen">
      {/* Custom Title Bar */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 h-8 px-4 select-none drag-region">
        <div className="flex items-center space-x-2">
          <AppstoreOutlined className="text-blue-500" />
          <Text strong className="text-sm">
            Electron Super App
          </Text>
        </div>
        <div className="flex items-center space-x-1 no-drag">
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleWindowControl("minimize")}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
          />
          <Button
            type="text"
            size="small"
            icon={<BorderOutlined />}
            onClick={() => handleWindowControl("maximize")}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleWindowControl("close")}
            className="hover:bg-red-500 hover:text-white"
          />
        </div>
      </div>

      <AntLayout>
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={sidebarCollapsed}
          theme={theme === "dark" ? "dark" : "light"}
          className="border-r border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-center space-x-2">
                <AppstoreOutlined className="text-2xl text-blue-500" />
                <Text strong className="text-lg">
                  Super App
                </Text>
              </div>
            )}
            {sidebarCollapsed && (
              <AppstoreOutlined className="text-2xl text-blue-500" />
            )}
          </div>

          <Menu
            theme={theme === "dark" ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="border-none"
          />
        </Sider>

        <AntLayout>
          {/* Header */}
          <Header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                type="text"
                icon={
                  sidebarCollapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mr-4"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Space className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text>{currentUser?.username || "User"}</Text>
                </Space>
              </Dropdown>
            </div>
          </Header>

          {/* Content */}
          <Content className="bg-gray-50 dark:bg-gray-900 overflow-auto">
            <div className="p-6">{children}</div>
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
}
