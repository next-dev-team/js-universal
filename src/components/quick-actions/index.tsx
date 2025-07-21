import React from 'react';
import { Button, Tooltip, Dropdown, Space, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  FolderOpenOutlined,
  ConsoleSqlOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { useProjectStore } from '../../store/modules/use-project-store';
import type { QuickActionsProps, IDE } from '../../types/project';
import './styles.css';

const QuickActions: React.FC<QuickActionsProps> = ({
  project,
  size = 'middle',
  type = 'default',
  showLabels = false,
  actions = ['explorer', 'terminal', 'open', 'more'],
  className
}) => {
  const {
    openProject,
    toggleFavorite,
    deleteProject,
    ides,
    loadIDEs
  } = useProjectStore();

  React.useEffect(() => {
    loadIDEs();
  }, [loadIDEs]);

  const handleOpenInExplorer = async () => {
    try {
      // Use Electron's shell API to open folder in file explorer
      if (window.electronAPI?.shell?.openPath) {
        await window.electronAPI.shell.openPath(project.path);
        message.success('Opened in file explorer');
      } else {
        // Fallback for development/web environment
        console.log('Open in explorer:', project.path);
        message.info('File explorer integration available in desktop app');
      }
    } catch (error) {
      console.error('Failed to open in explorer:', error);
      message.error('Failed to open in file explorer');
    }
  };

  const handleOpenInTerminal = async () => {
    try {
      // Use Electron's IPC to open terminal
      if (window.electronAPI?.terminal?.open) {
        await window.electronAPI.terminal.open(project.path);
        message.success('Opened in terminal');
      } else {
        // Fallback for development/web environment
        console.log('Open in terminal:', project.path);
        message.info('Terminal integration available in desktop app');
      }
    } catch (error) {
      console.error('Failed to open in terminal:', error);
      message.error('Failed to open in terminal');
    }
  };

  const handleOpenProject = () => {
    openProject(project.id);
    message.success(`Opened ${project.name}`);
  };

  const handleOpenInIDE = async (ide: IDE) => {
    try {
      if (window.electronAPI?.ide?.open) {
        await window.electronAPI.ide.open(project.path, ide.executable);
        message.success(`Opened in ${ide.name}`);
      } else {
        // Fallback for development/web environment
        console.log(`Open in ${ide.name}:`, project.path);
        message.info(`${ide.name} integration available in desktop app`);
      }
    } catch (error) {
      console.error(`Failed to open in ${ide.name}:`, error);
      message.error(`Failed to open in ${ide.name}`);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(project.id);
    message.success(
      project.isFavorite 
        ? 'Removed from favorites' 
        : 'Added to favorites'
    );
  };

  const handleCopyPath = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(project.path);
        message.success('Project path copied to clipboard');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = project.path;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        message.success('Project path copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy path:', error);
      message.error('Failed to copy path');
    }
  };

  const handleDeleteProject = () => {
    // TODO: Add confirmation modal
    deleteProject(project.id);
    message.success('Project removed from list');
  };

  const getMoreMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'favorite',
        label: project?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
        icon: project?.isFavorite ? <StarFilled /> : <StarOutlined />,
        onClick: handleToggleFavorite
      },
      {
        type: 'divider'
      },
      {
        key: 'copy-path',
        label: 'Copy Path',
        icon: <CopyOutlined />,
        onClick: handleCopyPath
      }
    ];

    // Add IDE options if available
    if (ides.length > 0) {
      items.push(
        {
          type: 'divider'
        },
        {
          key: 'open-in',
          label: 'Open in IDE',
          icon: <CodeOutlined />,
          children: ides.map((ide) => ({
            key: `ide-${ide.id}`,
            label: ide.name,
            icon: <div className="ide-icon">{ide.icon}</div>,
            onClick: () => handleOpenInIDE(ide)
          }))
        }
      );
    }

    items.push(
      {
        type: 'divider'
      },
      {
        key: 'settings',
        label: 'Project Settings',
        icon: <SettingOutlined />,
        onClick: () => {
          // TODO: Implement project settings
          message.info('Project settings coming soon');
        }
      },
      {
        key: 'delete',
        label: 'Remove Project',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleDeleteProject
      }
    );

    return items;
  };

  const renderAction = (action: string) => {
    switch (action) {
      case 'explorer':
        return (
          <Tooltip title="Open in File Explorer">
            <Button
              type={type}
              size={size}
              icon={<FolderOpenOutlined />}
              onClick={handleOpenInExplorer}
              className="quick-action-btn"
            >
              {showLabels && 'Explorer'}
            </Button>
          </Tooltip>
        );

      case 'terminal':
        return (
          <Tooltip title="Open in Terminal">
            <Button
              type={type}
              size={size}
              icon={<ConsoleSqlOutlined />}
              onClick={handleOpenInTerminal}
              className="quick-action-btn"
            >
              {showLabels && 'Terminal'}
            </Button>
          </Tooltip>
        );

      case 'open':
        return (
          <Tooltip title="Open Project">
            <Button
              type="primary"
              size={size}
              icon={<PlayCircleOutlined />}
              onClick={handleOpenProject}
              className="quick-action-btn primary"
            >
              {showLabels && 'Open'}
            </Button>
          </Tooltip>
        );

      case 'edit':
        return (
          <Tooltip title="Edit Project">
            <Button
              type={type}
              size={size}
              icon={<EditOutlined />}
              onClick={() => {
                // TODO: Implement project editing
                message.info('Project editing coming soon');
              }}
              className="quick-action-btn"
            >
              {showLabels && 'Edit'}
            </Button>
          </Tooltip>
        );

      case 'favorite':
        return (
          <Tooltip title={project?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
            <Button
              type={type}
              size={size}
              icon={project?.isFavorite ? <StarFilled className="favorite-active" /> : <StarOutlined />}
              onClick={handleToggleFavorite}
              className="quick-action-btn"
            >
              {showLabels && (project?.isFavorite ? 'Unfavorite' : 'Favorite')}
            </Button>
          </Tooltip>
        );

      case 'more':
        return (
          <Dropdown
            menu={{ items: getMoreMenuItems() }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type={type}
              size={size}
              icon={<MoreOutlined />}
              className="quick-action-btn"
            >
              {showLabels && 'More'}
            </Button>
          </Dropdown>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`quick-actions ${className || ''}`}>
      <Space size="small">
        {actions.map((action, index) => (
          <React.Fragment key={`${action}-${index}`}>
            {renderAction(action)}
          </React.Fragment>
        ))}
      </Space>
    </div>
  );
};

export default QuickActions;