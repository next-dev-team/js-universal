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
import type { IDE, Project } from '../../../electron/main/services/database';

const { Header, Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

type FilterType = 'all' | 'favorites' | 'recent';

const IndexPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ides, setIDEs] = useState<IDE[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadProjects();
    loadIDEs();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await (
        window as any
      ).electronAPI.projectManager.getProjects();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        message.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      message.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const loadIDEs = async () => {
    try {
      const result = await (window as any).electronAPI.projectManager.getIDEs();
      if (result.success) {
        setIDEs(result.data || []);
      }
    } catch (error) {
      console.error('Error loading IDEs:', error);
    }
  };

  const handleLaunchProject = async (projectId: string, ideId?: string) => {
    try {
      let result;
      if (ideId) {
        result = await (window as any).electronAPI.projectManager.launchWithIDE(
          projectId,
          ideId,
        );
      } else {
        result = await (window as any).electronAPI.projectManager.launchProject(
          projectId,
        );
      }

      if (result.success) {
        message.success('Project launched successfully');
        loadProjects(); // Refresh to update last opened time
      } else {
        message.error(result.error || 'Failed to launch project');
      }
    } catch (error) {
      console.error('Error launching project:', error);
      message.error('Error launching project');
    }
  };

  const handleToggleFavorite = async (projectId: string, favorite: boolean) => {
    try {
      const result = await (
        window as any
      ).electronAPI.projectManager.updateProject(projectId, {
        favorite: !favorite,
      });
      if (result.success) {
        loadProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      message.error('Error updating project');
    }
  };

  const handleScanDirectory = async () => {
    try {
      setLoading(true);
      const result = await (window as any).electronAPI.projectManager.selectDirectory();
      
      if (result.success && !result.canceled && result.data) {
        const scanResult = await (
          window as any
        ).electronAPI.projectManager.scanDirectory(result.data);
        
        if (scanResult.success) {
          message.success(`Found ${scanResult.data?.length || 0} projects`);
          
          // Auto-import found projects
          if (scanResult.data && scanResult.data.length > 0) {
            const importResult = await (
              window as any
            ).electronAPI.projectManager.importProjects(scanResult.data);
            
            if (importResult.success) {
              message.success(`Imported ${importResult.data?.length || 0} projects`);
              loadProjects();
            } else {
              message.error(importResult.error || 'Failed to import projects');
            }
          }
        } else {
          message.error(scanResult.error || 'Failed to scan directory');
        }
      } else if (result.canceled) {
        // User canceled the dialog, no error message needed
      } else {
        message.error(result.error || 'Failed to select directory');
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
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
        } catch (error) {
          console.error('Error opening in explorer:', error);
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
        } catch (error) {
          console.error('Error opening in terminal:', error);
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
                      <Button icon={<MoreOutlined />} />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{project.name}</span>
                        {project.type && (
                          <Tag color="blue">{project.type}</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '4px',
                          }}
                        >
                          {project.path}
                        </div>
                        {project.lastOpened && (
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            Last opened:{' '}
                            {new Date(project.lastOpened).toLocaleDateString()}
                          </div>
                        )}
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

export default IndexPage;
