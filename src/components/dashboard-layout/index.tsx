import React, { useEffect, useState } from 'react';
import {
  BellOutlined,
  BugOutlined,
  FolderOutlined,
  GithubOutlined,
  HistoryOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { useProjectStore } from '../../store/modules/use-project-store';
import ProjectCreateModal from '../project-create-modal';
import './styles.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  showCreateButton?: boolean;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Project Manager',
  // showSearch = true,
  showCreateButton = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);

  const {
    setFilters,
    clearFilters,
    loadProjects,
    loadTemplates,
    createProject,
    getProjectStats,
  } = useProjectStore();

  const stats = getProjectStats();

  useEffect(() => {
    loadProjects();
    loadTemplates();
  }, [loadProjects, loadTemplates]);

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'All Projects',
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: 'Favorites',
    },
    {
      key: 'recent',
      icon: <HistoryOutlined />,
      label: 'Recent',
    },
    {
      key: 'categories',
      icon: <FolderOutlined />,
      label: 'Categories',
      children: [
        { key: 'web', icon: <ProjectOutlined />, label: 'Web' },
        { key: 'mobile', icon: <ProjectOutlined />, label: 'Mobile' },
        { key: 'desktop', icon: <ProjectOutlined />, label: 'Desktop' },
        { key: 'backend', icon: <ProjectOutlined />, label: 'Backend' },
      ],
    },
    {
      key: 'tags',
      icon: <TagsOutlined />,
      label: 'Tags',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
    },
    {
      key: 'github',
      icon: <GithubOutlined />,
      label: 'GitHub',
    },
    {
      key: 'report',
      icon: <BugOutlined />,
      label: 'Report Issue',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = (key: string) => {
    setSelectedKeys([key]);

    // Handle menu navigation
    switch (key) {
      case 'dashboard':
        clearFilters();
        break;
      case 'projects':
        clearFilters();
        break;
      case 'favorites':
        setFilters({ isFavorite: true });
        break;
      case 'recent':
        setFilters({ sortBy: 'lastOpenedAt', sortOrder: 'desc' });
        break;
      case 'web':
      case 'mobile':
      case 'desktop':
      case 'backend':
        setFilters({ type: key as any });
        break;
      default:
        break;
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        console.log('Open profile');
        break;
      case 'settings':
        console.log('Open settings');
        break;
      case 'help':
        console.log('Open help');
        break;
      case 'github':
        window.open('https://github.com', '_blank');
        break;
      case 'report':
        console.log('Report issue');
        break;
      case 'logout':
        console.log('Logout');
        break;
      default:
        break;
    }
  };

  const handleCreateProject = async (request: any) => {
    try {
      await createProject(request);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Layout className="dashboard-layout">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="dashboard-sidebar"
        width={250}
        collapsedWidth={80}
      >
        <div className="sidebar-header">
          <div className="logo">
            <ProjectOutlined className="logo-icon" />
            {!collapsed && <span className="logo-text">Project Manager</span>}
          </div>
        </div>

        <div className="sidebar-stats">
          {!collapsed && (
            <div className="stats-grid">
              <div className="stat-item">
                <Text type="secondary">Total Projects</Text>
                <Title level={4}>{stats.totalProjects}</Title>
              </div>
              <div className="stat-item">
                <Text type="secondary">Favorites</Text>
                <Title level={4}>{stats.favoriteProjects.length}</Title>
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className="sidebar-menu"
        />
      </Sider>

      {/* Main Layout */}
      <Layout className="dashboard-main">
        {/* Header */}
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-trigger"
            />
            <Title level={3} className="page-title">
              {title}
            </Title>
          </div>

          {/* <div className="header-center">
            {showSearch && (
              <div className="header-search">
                <ProjectSearch
                  onFiltersChange={setFilters}
                  onClear={clearFilters}
                />
              </div>
            )}
          </div> */}

          <div className="header-right">
            <Space size="middle">
              {showCreateButton && (
                <Tooltip title="Create New Project">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                    className="create-button"
                  >
                    New Project
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Search Projects">
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  className="header-action"
                />
              </Tooltip>

              <Tooltip title="Notifications">
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="header-action"
                  />
                </Badge>
              </Tooltip>

              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="text" className="user-menu">
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span className="username">John Doe</span>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content className="dashboard-content">
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>

      {/* Create Project Modal */}
      <ProjectCreateModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateProject}
      />
    </Layout>
  );
};

export default DashboardLayout;
export { DashboardLayout };
export type { DashboardLayoutProps };
