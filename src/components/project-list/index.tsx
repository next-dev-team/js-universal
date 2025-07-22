import React, { useState } from 'react';
import {
  AppstoreOutlined,
  ConsoleSqlOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  StarFilled,
  StarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Empty,
  List,
  Modal,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { useProjectStore } from '../../store/modules/use-project-store';
import type { Project, ProjectListProps } from '../../types/project';
import './styles.css';

const { Meta } = Card;

const ProjectList: React.FC<ProjectListProps> = ({
  viewMode: propViewMode,
  onViewModeChange,
  showViewToggle = true,
  className,
}) => {
  const { projects, isLoading, toggleFavorite, openProject, deleteProject } =
    useProjectStore();

  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(
    'grid',
  );
  const viewMode = propViewMode || internalViewMode;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const confirmDelete = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setDeleteModalVisible(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setProjectToDelete(null);
  };

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      web: 'blue',
      mobile: 'green',
      desktop: 'purple',
      api: 'orange',
      library: 'cyan',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getProjectIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      web: '🌐',
      mobile: '📱',
      desktop: '💻',
      api: '🔌',
      library: '📚',
      other: '📁',
    };
    return icons[type] || '📁';
  };

  const formatLastOpened = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return dateObj.toLocaleDateString();
  };

  const handleQuickAction = (
    action: string,
    project: Project,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    switch (action) {
      case 'open':
        openProject(project.id);
        break;
      case 'favorite':
        toggleFavorite(project.id);
        break;
      case 'explorer':
        // In a real implementation, this would use the Electron API
        console.log('Open in explorer:', project.path);
        break;
      case 'terminal':
        // In a real implementation, this would use the Electron API
        console.log('Open in terminal:', project.path);
        break;
      case 'edit':
        // In a real implementation, this would open an edit form
        console.log('Edit project:', project.name);
        break;
      case 'delete':
        confirmDelete(project);
        break;
    }
  };

  const getMoreMenuItems = (project: Project) => [
    {
      key: 'edit',
      label: 'Edit Project',
      icon: <EditOutlined />,
      onClick: () => {
        const e = new MouseEvent('click') as unknown as React.MouseEvent;
        handleQuickAction('edit', project, e);
      },
    },
    {
      key: 'delete',
      label: 'Delete Project',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        const e = new MouseEvent('click') as unknown as React.MouseEvent;
        handleQuickAction('delete', project, e);
      },
    },
  ];

  const renderGridView = () => (
    <div className="project-grid">
      {projects.map((project: Project) => (
        <Card
          key={project.id}
          className="project-card"
          hoverable
          onClick={() => openProject(project.id)}
          actions={[
            <Tooltip key="explorer" title="Open in File Explorer">
              <FolderOpenOutlined
                onClick={(e: React.MouseEvent) =>
                  handleQuickAction('explorer', project, e)
                }
              />
            </Tooltip>,
            <Tooltip key="terminal" title="Open in Terminal">
              <ConsoleSqlOutlined
                onClick={(e: React.MouseEvent) =>
                  handleQuickAction('terminal', project, e)
                }
              />
            </Tooltip>,
            <Tooltip
              key="favorite"
              title={
                project.isFavorite
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'
              }
            >
              {project.isFavorite ? (
                <StarFilled
                  key="star-filled"
                  className="favorite-icon active"
                  onClick={(e: React.MouseEvent) =>
                    handleQuickAction('favorite', project, e)
                  }
                />
              ) : (
                <StarOutlined
                  key="star-outlined"
                  onClick={(e: React.MouseEvent) =>
                    handleQuickAction('favorite', project, e)
                  }
                />
              )}
            </Tooltip>,
            <Dropdown
              key="more"
              menu={{ items: getMoreMenuItems(project) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip title="More Actions">
                <MoreOutlined
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </Tooltip>
            </Dropdown>,
          ]}
        >
          <Meta
            avatar={
              <Avatar
                size={48}
                style={{ backgroundColor: '#f0f0f0', color: '#666' }}
              >
                {getProjectIcon(project.type)}
              </Avatar>
            }
            title={
              <div className="project-title">
                <span>{project.name}</span>
                {project.isFavorite && (
                  <StarFilled className="favorite-badge" />
                )}
              </div>
            }
            description={
              <div className="project-description">
                <p>{project.description}</p>
                <Space wrap>
                  <Tag color={getProjectTypeColor(project.type)}>
                    {project.type.toUpperCase()}
                  </Tag>
                  <span className="last-opened">
                    {project.lastOpenedAt
                      ? formatLastOpened(project.lastOpenedAt)
                      : 'Never opened'}
                  </span>
                </Space>
              </div>
            }
          />
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <List
      className="project-list"
      itemLayout="horizontal"
      dataSource={projects}
      renderItem={(project: Project) => (
        <List.Item
          key={project.id}
          className="project-list-item"
          onClick={() => openProject(project.id)}
          actions={[
            <Tooltip key="explorer" title="Open in File Explorer">
              <Button
                type="text"
                icon={<FolderOpenOutlined />}
                onClick={(e: React.MouseEvent) =>
                  handleQuickAction('explorer', project, e)
                }
              />
            </Tooltip>,
            <Tooltip key="terminal" title="Open in Terminal">
              <Button
                type="text"
                icon={<ConsoleSqlOutlined />}
                onClick={(e: React.MouseEvent) =>
                  handleQuickAction('terminal', project, e)
                }
              />
            </Tooltip>,
            <Tooltip
              key="favorite"
              title={
                project.isFavorite
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'
              }
            >
              <Button
                type="text"
                icon={
                  project.isFavorite ? (
                    <StarFilled className="favorite-icon active" />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={(e: React.MouseEvent) =>
                  handleQuickAction('favorite', project, e)
                }
              />
            </Tooltip>,
            <Dropdown
              key="more"
              menu={{ items: getMoreMenuItems(project) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            </Dropdown>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                size={40}
                style={{ backgroundColor: '#f0f0f0', color: '#666' }}
              >
                {getProjectIcon(project.type)}
              </Avatar>
            }
            title={
              <div className="project-title">
                <span>{project.name}</span>
                {project.isFavorite && (
                  <StarFilled className="favorite-badge" />
                )}
              </div>
            }
            description={
              <div className="project-meta">
                <p>{project.description}</p>
                <Space>
                  <Tag color={getProjectTypeColor(project.type)}>
                    {project.type.toUpperCase()}
                  </Tag>
                  <span className="project-path">{project.path}</span>
                  <span className="last-opened">
                    Last opened:{' '}
                    {project.lastOpenedAt
                      ? formatLastOpened(new Date(project.lastOpenedAt))
                      : 'Never'}
                  </span>
                </Space>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  if (isLoading) {
    return (
      <div className="project-list-loading">
        <Card loading />
        <Card loading />
        <Card loading />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-list-empty">
        <Empty
          image={<FolderOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="No projects found"
        >
          <Button type="primary" icon={<PlayCircleOutlined />}>
            Create Your First Project
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className={`project-list-container ${className || ''}`}>
      {showViewToggle && (
        <div className="view-toggle">
          <Button.Group>
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => handleViewModeChange('grid')}
            >
              Grid
            </Button>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => handleViewModeChange('list')}
            >
              List
            </Button>
          </Button.Group>
        </div>
      )}

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      <Modal
        title="Delete Project"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the project &quot;{projectToDelete?.name}&quot;?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ProjectList;
