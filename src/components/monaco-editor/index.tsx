import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import { Editor } from '@monaco-editor/react';
import { Button, Space, message, Modal, Spin, Input, Tree, Tooltip } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
  SettingOutlined,
  BugOutlined,
  GitlabOutlined,
  MenuOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { editor } from 'monaco-editor';
import './styles.css';

// Electron IPC types
declare global {
  interface Window {
    electronAPI: {
      file: {
        saveFile: (filePath: string, content: string) => Promise<boolean>;
        readFile: (filePath: string) => Promise<string>;
        watchFile: (filePath: string, callback: (content: string) => void) => void;
        unwatchFile: (filePath: string) => void;
        fileExists: (filePath: string) => Promise<boolean>;
        createFile: (filePath: string, content?: string) => Promise<boolean>;
        deleteFile: (filePath: string) => Promise<boolean>;
        getFileStats: (filePath: string) => Promise<any>;
      };
      project: any;
      checkUpdate: any;
      user32: any;
      send: (type: string, msg: unknown) => void;
      versions: any;
      getTestHandle1: (params: any) => any;
    };
  }
}

export interface MonacoEditorProps {
  filePath?: string;
  content?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  onSave?: (content: string, filePath?: string) => Promise<void> | void;
  onClose?: () => void;
  onChange?: (content: string) => void;
  className?: string;
  showToolbar?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showSidebar?: boolean;
  showStatusBar?: boolean;
  projectFiles?: Array<{ name: string; path: string; type: 'file' | 'folder'; children?: any[] }>;
  onFileSelect?: (filePath: string) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  content = '',
  language = 'typescript',
  theme = 'vs-dark',
  readOnly = false,
  height = '400px',
  onSave,
  onClose,
  onChange,
  className,
  showToolbar = true,
  autoSave = false,
  autoSaveDelay = 2000,
  showSidebar = true,
  showStatusBar = true,
  projectFiles = [],
  onFileSelect,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [editorContent, setEditorContent] = useState(content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(showSidebar);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileWatcherRef = useRef<boolean>(false);

  const handleSave = useCallback(async () => {
    if (!onSave && !window.electronAPI?.file) return;

    try {
      setSaveStatus('saving');
      
      // Try Electron IPC first, fallback to prop function
      if (window.electronAPI?.file && filePath) {
        const success = await window.electronAPI.file.saveFile(filePath, editorContent);
        if (!success) throw new Error('Failed to save via Electron IPC');
      } else if (onSave) {
        await onSave(editorContent, filePath);
      }
      
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      message.success('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      setSaveStatus('error');
      message.error('Failed to save file');
    }
  }, [onSave, editorContent, filePath]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && (onSave || window.electronAPI?.file)) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      setSaveStatus('unsaved');
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editorContent, hasUnsavedChanges, autoSave, autoSaveDelay, handleSave, onSave]);

  // File watching for real-time collaboration
  useEffect(() => {
    if (window.electronAPI?.file && filePath && !fileWatcherRef.current) {
      fileWatcherRef.current = true;
      window.electronAPI.file.watchFile(filePath, (newContent) => {
        if (newContent !== editorContent && !hasUnsavedChanges) {
          setEditorContent(newContent);
          message.info('File updated externally');
        }
      });
    }

    return () => {
      if (window.electronAPI?.file && filePath && fileWatcherRef.current) {
        window.electronAPI.file.unwatchFile(filePath);
        fileWatcherRef.current = false;
      }
    };
  }, [filePath, editorContent, hasUnsavedChanges]);

  // Update content when prop changes
  useEffect(() => {
    setEditorContent(content);
    setHasUnsavedChanges(false);
  }, [content]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // Configure VS Code-like editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      fontLigatures: true,
      minimap: { enabled: true, side: 'right' },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      mouseWheelZoom: true,
      multiCursorModifier: 'ctrlCmd',
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: true,
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      lightbulb: { enabled: 'on' as any },
      codeLens: true,
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      unfoldOnClickAfterEndOfLine: true,
      renderLineHighlight: 'all',
      occurrencesHighlight: 'singleFile',
      selectionHighlight: true,
      hover: { enabled: true, delay: 300 },
      links: true,
      colorDecorators: true,
      contextmenu: true,
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
    });

    // Track cursor position and selection
    editor.onDidChangeCursorPosition((e) => {
      setCurrentLine(e.position.lineNumber);
      setCurrentColumn(e.position.column);
    });

    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      setSelectedText(selection || '');
    });

    // Add VS Code-like keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      handleClose();
    });

    editor.addCommand(monaco.KeyCode.F11, () => {
      toggleFullscreen();
    });

    // Command Palette
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      setCommandPaletteVisible(true);
    });

    // Quick Open
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      setCommandPaletteVisible(true);
    });

    // Search
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setSearchVisible(true);
    });

    // Toggle Sidebar
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      setSidebarVisible(!sidebarVisible);
    });

    // Format Document
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });

    // Go to Line
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => {
      editor.getAction('editor.action.gotoLine')?.run();
    });

    // Toggle Comment
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction('editor.action.commentLine')?.run();
    });

    // Duplicate Line
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.copyLinesDownAction')?.run();
    });

    // Move Line Up/Down
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
      editor.getAction('editor.action.moveLinesUpAction')?.run();
    });

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
      editor.getAction('editor.action.moveLinesDownAction')?.run();
    });

    // Enable TypeScript/JavaScript IntelliSense
    if (editorLanguage === 'typescript' || editorLanguage === 'javascript') {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    }
  };

  const handleEditorChange: OnChange = (value) => {
    const newContent = value || '';
    setEditorContent(newContent);
    setHasUnsavedChanges(newContent !== content);
    onChange?.(newContent);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to close?',
        onOk: () => {
          setHasUnsavedChanges(false);
          onClose?.();
        },
        okText: 'Close without saving',
        cancelText: 'Cancel',
        type: 'warning'
      });
    } else {
      onClose?.();
    }
  };

  const handleReload = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Reload File',
        content: 'You have unsaved changes. Reloading will discard them. Continue?',
        onOk: () => {
          setEditorContent(content);
          setHasUnsavedChanges(false);
          message.info('File reloaded');
        },
      });
    } else {
      setEditorContent(content);
      message.info('File reloaded');
    }
  };

  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
    // Trigger editor layout update after fullscreen toggle
    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);
  };

  const toggleSidebar = (): void => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleCommandPalette = (command: string): void => {
    setCommandPaletteVisible(false);
    const editor = editorRef.current;
    if (!editor) return;

    switch (command) {
      case 'save':
        handleSave();
        break;
      case 'format':
        editor.getAction('editor.action.formatDocument')?.run();
        break;
      case 'goto-line':
        editor.getAction('editor.action.gotoLine')?.run();
        break;
      case 'find':
        editor.getAction('actions.find')?.run();
        break;
      case 'replace':
        editor.getAction('editor.action.startFindReplaceAction')?.run();
        break;
      case 'toggle-comment':
        editor.getAction('editor.action.commentLine')?.run();
        break;
      case 'duplicate-line':
        editor.getAction('editor.action.copyLinesDownAction')?.run();
        break;
      case 'toggle-sidebar':
        toggleSidebar();
        break;
      case 'toggle-fullscreen':
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const commandPaletteItems: Array<{ key: string; label: string; icon: React.ReactNode }> = [
    { key: 'save', label: 'File: Save', icon: <SaveOutlined /> },
    { key: 'format', label: 'Format Document', icon: <ThunderboltOutlined /> },
    { key: 'goto-line', label: 'Go to Line...', icon: <SearchOutlined /> },
    { key: 'find', label: 'Find', icon: <SearchOutlined /> },
    { key: 'replace', label: 'Replace', icon: <SearchOutlined /> },
    { key: 'toggle-comment', label: 'Toggle Line Comment', icon: <MenuOutlined /> },
    { key: 'duplicate-line', label: 'Duplicate Line', icon: <MenuOutlined /> },
    { key: 'toggle-sidebar', label: 'Toggle Sidebar', icon: <FolderOutlined /> },
    { key: 'toggle-fullscreen', label: 'Toggle Fullscreen', icon: <FullscreenOutlined /> },
  ];

  const renderFileTree = (files: Array<{ name: string; path: string; type: 'file' | 'folder'; children?: any[] }>): Array<{ title: React.ReactNode; key: string; children?: any; isLeaf: boolean }> => {
    return files.map((file) => ({
      title: (
        <span
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => file.type === 'file' && onFileSelect?.(file.path)}
        >
          {file.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
          {file.name}
        </span>
      ),
      key: file.path,
      children: file.children ? renderFileTree(file.children) : undefined,
      isLeaf: file.type === 'file',
    }));
  };

  const getLanguageFromFilePath = (path?: string): string => {
    if (!path) return language;
    
    const extension = path.split('.').pop()?.toLowerCase();
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
      'less': 'less',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    
    return languageMap[extension] || 'plaintext';
  };

  const editorLanguage = getLanguageFromFilePath(filePath);

  return (
    <div className={`monaco-editor-container vscode-like ${className || ''} ${isFullscreen ? 'fullscreen' : ''}`} data-theme={theme}>
      {/* Activity Bar */}
      <div className="activity-bar">
        <div className="activity-bar-items">
          <Tooltip title="Explorer" placement="right">
            <Button
              type="text"
              icon={<FolderOutlined />}
              className={`activity-item ${sidebarVisible ? 'active' : ''}`}
              onClick={toggleSidebar}
            />
          </Tooltip>
          <Tooltip title="Search" placement="right">
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="activity-item"
              onClick={() => setSearchVisible(!searchVisible)}
            />
          </Tooltip>
          <Tooltip title="Source Control" placement="right">
            <Button
              type="text"
              icon={<GitlabOutlined />}
              className="activity-item"
            />
          </Tooltip>
          <Tooltip title="Run and Debug" placement="right">
            <Button
              type="text"
              icon={<BugOutlined />}
              className="activity-item"
            />
          </Tooltip>
        </div>
        <div className="activity-bar-bottom">
          <Tooltip title="Settings" placement="right">
            <Button
              type="text"
              icon={<SettingOutlined />}
              className="activity-item"
            />
          </Tooltip>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarVisible && (
        <div className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">EXPLORER</span>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={toggleSidebar}
            />
          </div>
          <div className="sidebar-content">
            {projectFiles.length > 0 ? (
              <Tree
                treeData={renderFileTree(projectFiles)}
                defaultExpandAll
                showIcon={false}
                className="file-tree"
              />
            ) : (
              <div className="empty-workspace">
                <p>No folder opened</p>
                <Button type="link" size="small">
                  Open Folder
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="editor-area">
        {/* Title Bar */}
        {showToolbar && (
          <div className="title-bar">
            <div className="title-bar-left">
              <div className="tab">
                <span className="tab-label">{filePath ? filePath.split('/').pop() || filePath.split('\\').pop() : 'Untitled'}</span>
                {hasUnsavedChanges && <span className="unsaved-indicator">●</span>}
                {onClose && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    className="tab-close"
                    onClick={handleClose}
                  />
                )}
              </div>
            </div>
            <div className="title-bar-right">
              <Space size="small">
                <Tooltip title="Command Palette (Ctrl+Shift+P)">
                  <Button
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setCommandPaletteVisible(true)}
                  />
                </Tooltip>
                <Tooltip title="Reload (Ctrl+R)">
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleReload}
                  />
                </Tooltip>
                {onSave && (
                  <Tooltip title="Save (Ctrl+S)">
                    <Button
                      size="small"
                      type={hasUnsavedChanges ? 'primary' : 'default'}
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges && saveStatus !== 'error'}
                      loading={saveStatus === 'saving'}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Toggle Fullscreen (F11)">
                  <Button
                    size="small"
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFullscreen}
                  />
                </Tooltip>
                {onClose && (
                  <Tooltip title="Close (Ctrl+W)">
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={handleClose}
                      className="close-button"
                    />
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
        )}
        
        {/* Editor */}
        <div className="editor-wrapper">
          {isLoading && (
            <div className="editor-loading">
              <Spin size="large" tip="Loading editor..." />
            </div>
          )}
          
          <Editor
            height={height}
            width="100%"
            language={editorLanguage}
            theme={theme}
            value={editorContent}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              readOnly,
              selectOnLineNumbers: true,
              roundedSelection: false,
              cursorStyle: 'line',
              automaticLayout: true,
            }}
          />
        </div>

        {/* Status Bar */}
        {showStatusBar && (
          <div className="status-bar">
            <div className="status-bar-left">
              <span className="status-item">
                <GitlabOutlined /> main
              </span>
              <span className="status-item">
                {editorLanguage.charAt(0).toUpperCase() + editorLanguage.slice(1)}
              </span>
              <span className="status-item">
                Ln {currentLine}, Col {currentColumn}
              </span>
              {selectedText && (
                <span className="status-item">
                  ({selectedText.length} selected)
                </span>
              )}
              <div className="save-status">
                {saveStatus === 'saving' && (
                  <span className="status-item status-saving">
                    <SyncOutlined spin /> Saving...
                  </span>
                )}
                {saveStatus === 'saved' && lastSavedTime && (
                  <span className="status-item status-saved">
                    <CheckCircleOutlined /> Saved {lastSavedTime.toLocaleTimeString()}
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="status-item status-unsaved">
                    ● Unsaved changes
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="status-item status-error">
                    ✕ Save failed
                  </span>
                )}
              </div>
            </div>
            <div className="status-bar-right">
              <span className="status-item">
                UTF-8
              </span>
              <span className="status-item">
                LF
              </span>
              <span className="status-item">
                {theme === 'vs-dark' ? 'Dark' : 'Light'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Command Palette Modal */}
      <Modal
        title="Command Palette"
        open={commandPaletteVisible}
        onCancel={() => setCommandPaletteVisible(false)}
        footer={null}
        width={600}
        className="command-palette-modal"
      >
        <Input.Search
          placeholder="Type a command..."
          allowClear
          onSearch={handleCommandPalette}
          style={{ marginBottom: 16 }}
          autoFocus
        />
        <div className="command-list">
          {commandPaletteItems.map((item) => (
            <div
              key={item.key}
              className="command-item"
              onClick={() => handleCommandPalette(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default MonacoEditor;