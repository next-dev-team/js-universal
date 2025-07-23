import React, { useState } from 'react';
import {
  CodeOutlined,
  ConsoleSqlOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  StarFilled,
  StarOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Space, Tooltip, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import { useProjectStore } from '../../store/modules/use-project-store';
import type { IDE, QuickActionsProps } from '../../types/project';
import MonacoEditor from '../monaco-editor';
import './styles.css';

const QuickActions: React.FC<QuickActionsProps> = ({
  project,
  size = 'middle',
  type = 'default',
  showLabels = false,
  actions = ['explorer', 'terminal', 'open', 'more'],
  className,
}) => {
  const {
    openProject,
    toggleFavorite,
    deleteProject,
    ides,
    loadIDEs,
    openProjectInExplorer,
    openProjectInTerminal,
    openProjectInIDE,
  } = useProjectStore();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorFile, setEditorFile] = useState<{ path: string; content: string; language: string } | null>(null);

  React.useEffect(() => {
    loadIDEs();
  }, [loadIDEs]);

  const handleOpenInExplorer = async () => {
    try {
      await openProjectInExplorer(project.path);
    } catch (_error) {
      // Error is already handled in the store
    }
  };

  const handleOpenInTerminal = async () => {
    try {
      await openProjectInTerminal(project.path);
    } catch (_error) {
      // Error is already handled in the store
    }
  };

  const handleOpenProject = () => {
    openProject(project.id);
    message.success(`Opened ${project.name}`);
  };

  const handleOpenInIDE = async (ide: IDE) => {
    try {
      await openProjectInIDE(project.path, ide.id);
    } catch (_error) {
      // Error is already handled in the store
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(project.id);
    message.success(
      project.isFavorite ? 'Removed from favorites' : 'Added to favorites',
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
    Modal.confirm({
      title: 'Remove Project',
      content: `Are you sure you want to remove "${project.name}" from the list?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteProject(project.id);
        message.success('Project removed successfully');
      },
    });
  };

  const handleOpenInBrowser = async (filePath?: string) => {
    try {
      const targetPath = filePath || project.path;
      // Check if it's a UI component file
      const isUIComponent = /\.(tsx|jsx|vue)$/i.test(targetPath);
      
      if (isUIComponent) {
        // For UI components, try to open in development server
        const devUrl = `http://localhost:3000`; // Default dev server
        window.open(devUrl, '_blank');
        message.success('Opening in browser...');
      } else {
        // For other files, open file explorer
        await (window as any).ipcApi?.openInExplorer(targetPath);
      }
    } catch (error) {
      console.error('Failed to open in browser:', error);
      message.error('Failed to open in browser');
    }
  };

  const handleEditInMonaco = async (filePath: string) => {
    try {
      // In a real app, you'd read the file content from the file system
      // For now, we'll use placeholder content
      const content = '// File content would be loaded here\nconsole.log("Hello World");';
      const language = getLanguageFromExtension(filePath);
      
      setEditorFile({ path: filePath, content, language });
      setEditorVisible(true);
    } catch (error) {
      console.error('Failed to open file in editor:', error);
      message.error('Failed to open file in editor');
    }
  };

  const getLanguageFromExtension = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (!extension) return 'plaintext';
    
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'vue': 'vue',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
    };
    return languageMap[extension] || 'plaintext';
  };

  const handleSaveFile = async (content: string, filePath?: string) => {
    try {
      // In a real app, you'd save the file to the file system
      console.log('Saving file:', filePath, content);
      message.success('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      message.error('Failed to save file');
    }
  };

  const getMoreMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'favorite',
        label: project?.isFavorite
          ? 'Remove from Favorites'
          : 'Add to Favorites',
        icon: project?.isFavorite ? <StarFilled /> : <StarOutlined />,
        onClick: handleToggleFavorite,
      },
      {
        type: 'divider',
      },
      {
        key: 'copy-path',
        label: 'Copy Path',
        icon: <CopyOutlined />,
        onClick: handleCopyPath,
      },
      {
        type: 'divider',
      },
      {
        key: 'browser-actions',
        label: 'Browser Actions',
        icon: <GlobalOutlined />,
        children: [
          {
            key: 'open-browser',
            label: 'Open in Browser',
            icon: <GlobalOutlined />,
            onClick: () => handleOpenInBrowser(),
          },
          {
            key: 'open-ui-browser',
            label: 'Open UI Component',
            icon: <ThunderboltOutlined />,
            onClick: () => handleOpenInBrowser(`${project.path}/src/App.tsx`),
          },
        ],
      },
      {
        key: 'editor-actions',
        label: 'Editor Actions',
        icon: <FileTextOutlined />,
        children: [
          {
            key: 'edit-monaco',
            label: 'Edit in Monaco',
            icon: <EditOutlined />,
            onClick: () => handleEditInMonaco(`${project.path}/src/App.tsx`),
          },
          {
            key: 'edit-readme',
            label: 'Edit README',
            icon: <FileTextOutlined />,
            onClick: () => handleEditInMonaco(`${project.path}/README.md`),
          },
        ],
      },
    ];

    // Add IDE options if available
    if (ides.length > 0) {
      items.push(
        {
          type: 'divider',
        },
        {
          key: 'open-in',
          label: 'Open in IDE',
          icon: <CodeOutlined />,
          children: ides.map((ide) => ({
            key: `ide-${ide.id}`,
            label: ide.name,
            icon: <div className="ide-icon">{ide.icon}</div>,
            onClick: () => handleOpenInIDE(ide),
          })),
        },
      );
    }

    items.push(
      {
        type: 'divider',
      },
      {
        key: 'settings',
        label: 'Project Settings',
        icon: <SettingOutlined />,
        onClick: () => {
          // TODO: Implement project settings
          message.info('Project settings coming soon');
        },
      },
      {
        key: 'delete',
        label: 'Remove Project',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleDeleteProject,
      },
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
          <Tooltip
            title={
              project?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'
            }
          >
            <Button
              type={type}
              size={size}
              icon={
                project?.isFavorite ? (
                  <StarFilled className="favorite-active" />
                ) : (
                  <StarOutlined />
                )
              }
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

      <Modal
        title={`Edit ${editorFile?.path}`}
        open={editorVisible}
        onCancel={() => setEditorVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setEditorVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              if (editorFile) {
                handleSaveFile(editorFile.content, editorFile.path);
                setEditorVisible(false);
              }
            }}
          >
            Save
          </Button>,
        ]}
      >
        {editorFile && (
           <MonacoEditor
             filePath={editorFile.path}
             content={editorFile.content}
             language={editorFile.language}
             onChange={(content) => {
               if (editorFile) {
                 setEditorFile({ ...editorFile, content });
               }
             }}
             onSave={handleSaveFile}
             height={400}
             showToolbar={false}
           />
         )}
      </Modal>
    </div>
  );
};

export default QuickActions;
