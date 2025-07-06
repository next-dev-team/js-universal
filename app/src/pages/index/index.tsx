import React, { useEffect, useState } from 'react';
import {
  CodeOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  Layout,
  List,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Search } = Input;
const { Text, Title } = Typography;

interface Project {
  id: string;
  name: string;
  path: string;
  type: string;
  lastOpened: number;
  favorite: boolean;
  tags: string[];
  description?: string;
}

interface IDE {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

const ProjectLauncher: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ides, setIdes] = useState<IDE[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Load projects and IDEs on component mount
  useEffect(() => {
    loadProjects();
    loadIDEs();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await (
        window as any
      ).electron.projectManager.getProjects();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        message.error('Failed to load projects');
      }
    } catch (_) {
      message.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const loadIDEs = async () => {
    try {
      const result = await (window as any).electron.projectManager.getIDEs();
      if (result.success) {
        setIdes(result.data || []);
      }
    } catch (_) {
      console.error('Error loading IDEs:', _);
    }
  };

  const handleLaunchProject = async (projectId: string, ideId?: string) => {
    try {
      let result;
      if (ideId) {
        result = await (window as any).electron.projectManager.launchWithIDE(
          projectId,
          ideId,
        );
      } else {
        result = await (window as any).electron.projectManager.launchProject(
          projectId,
        );
      }

      if (result.success) {
        message.success('Project launched successfully');
        loadProjects(); // Refresh to update last opened time
      } else {
        message.error(result.error || 'Failed to launch project');
      }
    } catch (_) {
      message.error('Error launching project');
    }
  };

  const handleToggleFavorite = async (projectId: string, favorite: boolean) => {
    try {
      const result = await (
        window as any
      ).electron.projectManager.updateProject(projectId, {
        favorite: !favorite,
      });
      if (result.success) {
        loadProjects();
      }
    } catch (_) {
      message.error('Error updating project');
    }
  };

  const handleScanDirectory = async () => {
    try {
      const result = await window.electron.projectManager.selectDirectory();
      if (result.success && !result.canceled) {
        setLoading(true);
        const scanResult = await (
          window as any
        ).electron.projectManager.scanDirectory(result.data);
        if (scanResult.success) {
          message.success(`Found ${scanResult.data.length} projects`);
          // Show import modal or auto-import
          if (scanResult.data.length > 0) {
            const importResult = await (
              window as any
            ).electron.projectManager.importProjects(scanResult.data);
            if (importResult.success) {
              message.success(`Imported ${importResult.data.length} projects`);
              loadProjects();
            }
          }
        }
      }
    } catch (_) {
      message.error('Error scanning directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.path.toLowerCase().includes(searchTerm.toLowerCase());

    switch (selectedFilter) {
      case 'favorites':
        return matchesSearch && project.favorite;
      case 'recent':
        return (
          matchesSearch &&
          project.lastOpened > Date.now() - 7 * 24 * 60 * 60 * 1000
        ); // Last 7 days
      default:
        return matchesSearch;
    }
  });

  const getProjectActions = (project: Project): MenuProps['items'] => [
    {
      key: 'launch',
      label: 'Launch',
      icon: <CodeOutlined />,
      onClick: () => handleLaunchProject(project.id),
    },
    {
      key: 'launch-with',
      label: 'Launch with...',
      icon: <FolderOpenOutlined />,
      children: ides.map((ide) => ({
        key: `launch-${ide.id}`,
        label: ide.name,
        onClick: () => handleLaunchProject(project.id, ide.id),
      })),
    },
    {
      key: 'explorer',
      label: 'Open in Explorer',
      icon: <FolderOutlined />,
      onClick: async () => {
        try {
          await (window as any).electron.projectManager.openInExplorer(
            project.id,
          );
        } catch (_) {
          message.error('Error opening in explorer');
        }
      },
    },
    {
      key: 'terminal',
      label: 'Open in Terminal',
      icon: <FolderOutlined />,
      onClick: async () => {
        try {
          await (window as any).electron.projectManager.openInTerminal(
            project.id,
          );
        } catch (_) {
          message.error('Error opening in terminal');
        }
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              Project Launcher
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadProjects}
                loading={loading}
              >
                Refresh
              </Button>
              <Button icon={<PlusOutlined />} onClick={handleScanDirectory}>
                Add Projects
              </Button>
              <Button icon={<SettingOutlined />}>Settings</Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Search
              placeholder="Search projects..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Space>
              <Button
                type={selectedFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('all')}
              >
                All Projects
              </Button>
              <Button
                type={selectedFilter === 'favorites' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('favorites')}
              >
                Favorites
              </Button>
              <Button
                type={selectedFilter === 'recent' ? 'primary' : 'default'}
                onClick={() => setSelectedFilter('recent')}
              >
                Recent
              </Button>
            </Space>
          </Col>
        </Row>

        {filteredProjects.length === 0 ? (
          <Empty
            description="No projects found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleScanDirectory}
            >
              Add Your First Project
            </Button>
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
            dataSource={filteredProjects}
            loading={loading}
            renderItem={(project) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Tooltip
                      key="favorite"
                      title={
                        project.favorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      <Button
                        type="text"
                        icon={
                          project.favorite ? (
                            <StarFilled style={{ color: '#faad14' }} />
                          ) : (
                            <StarOutlined />
                          )
                        }
                        onClick={() =>
                          handleToggleFavorite(project.id, project.favorite)
                        }
                      />
                    </Tooltip>,
                    <Button
                      key="launch"
                      type="primary"
                      icon={<CodeOutlined />}
                      onClick={() => handleLaunchProject(project.id)}
                    >
                      Launch
                    </Button>,
                    <Dropdown
                      key="more"
                      menu={{ items: getProjectActions(project) }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Text strong>{project.name}</Text>
                        <Tag color="blue">{project.type}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {project.path}
                        </Text>
                        {project.description && (
                          <div style={{ marginTop: 8 }}>
                            <Text>{project.description}</Text>
                          </div>
                        )}
                        {project.tags.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {project.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Last opened:{' '}
                            {new Date(project.lastOpened).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Content>
    </Layout>
  );
};

export default ProjectLauncher;
