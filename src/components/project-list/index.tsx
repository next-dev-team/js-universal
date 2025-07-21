import React, { useState } from 'react';
import {
  AppstoreOutlined,
  ConsoleSqlOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  StarFilled,
  StarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Empty, List, Space, Tag, Tooltip } from 'antd';
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

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
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

  const formatLastOpened = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
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
        // TODO: Implement file explorer opening
        console.log('Open in explorer:', project.path);
        break;
      case 'terminal':
        // TODO: Implement terminal opening
        console.log('Open in terminal:', project.path);
        break;
      case 'delete':
        // TODO: Add confirmation modal
        deleteProject(project.id);
        break;
    }
  };

  const renderGridView = () => (
    <div className="project-grid">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="project-card"
          hoverable
          onClick={() => openProject(project.id)}
          actions={[
            <Tooltip key="explorer" title="Open in File Explorer">
              <FolderOpenOutlined
                onClick={(e) => handleQuickAction('explorer', project, e)}
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
                  onClick={(e) => handleQuickAction('favorite', project, e)}
                />
              ) : (
                <StarOutlined
                  key="star-outlined"
                  onClick={(e) => handleQuickAction('favorite', project, e)}
                />
              )}
            </Tooltip>,
            <Tooltip key="more" title="More Actions">
              <MoreOutlined />
            </Tooltip>,
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
                      : 'Never'}
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
      renderItem={(project) => (
        <List.Item
          className="project-list-item"
          onClick={() => openProject(project.id)}
          actions={[
            <Tooltip key="explorer" title="Open in File Explorer">
              <Button
                type="text"
                icon={<FolderOpenOutlined />}
                onClick={(e) => handleQuickAction('explorer', project, e)}
              />
            </Tooltip>,
            <Tooltip key="terminal" title="Open in Terminal">
              <Button
                type="text"
                icon={<ConsoleSqlOutlined />}
                onClick={(e) => handleQuickAction('terminal', project, e)}
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
                onClick={(e) => handleQuickAction('favorite', project, e)}
              />
            </Tooltip>,
            <Button key="more" type="text" icon={<MoreOutlined />} />,
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
                      ? formatLastOpened(project.lastOpenedAt)
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
    </div>
  );
};

export default ProjectList;
