import React, { useState } from 'react';
import { Card, Space, Typography, Button, Divider, Row, Col } from 'antd';
import { CodeOutlined, RocketOutlined, EditOutlined } from '@ant-design/icons';
import QuickActions from '../../components/quick-actions';
import MonacoEditor from '../../components/monaco-editor';
import type { Project } from '../../types/project';

const { Title, Paragraph, Text } = Typography;

const DemoPage: React.FC = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState(`// Welcome to the Enhanced Quick Actions Demo!
// This demonstrates the new features:

import React from 'react';
import { Button } from 'antd';

const MyComponent: React.FC = () => {
  const handleClick = () => {
    console.log('Hello from the Monaco Editor!');
  };

  return (
    <div className="my-component">
      <h1>Enhanced Quick Actions Demo</h1>
      <Button type="primary" onClick={handleClick}>
        Click me!
      </Button>
    </div>
  );
};

export default MyComponent;

// Try the following features:
// 1. Right-click for context menu
// 2. Press Ctrl+S to save
// 3. Press F11 for fullscreen
// 4. Use the toolbar buttons
`);

  // Mock project data for demonstration
  const mockProject: Project = {
    id: 'demo-project',
    name: 'Enhanced Quick Actions Demo',
    description: 'Demonstration of enhanced quick actions and Monaco editor integration',
    path: 'C:\\Users\\User\\Documents\\GitHub\\awesome-agent-rules',
    type: 'react',
    status: 'active',
    tags: ['demo', 'react', 'typescript', 'monaco'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isFavorite: false,
    metadata: {
      version: '1.0.0',
      framework: 'React',
      packageManager: 'yarn',
    },
  };

  const handleSaveDemo = async (content: string, filePath?: string) => {
    console.log('Demo save:', { content, filePath });
    // In a real app, this would save to the file system
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={1}>
        <RocketOutlined /> Enhanced Quick Actions Demo
      </Title>
      
      <Paragraph>
        This demo showcases the new enhanced quick actions and Monaco editor integration.
        Try the various actions available in the quick actions menu below.
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions Demo" extra={<CodeOutlined />}>
            <Paragraph>
              <Text strong>New Features:</Text>
            </Paragraph>
            <ul>
              <li>🔵 VS Code integration</li>
              <li>⚡ Cursor editor support</li>
              <li>🌊 Windsurf editor support</li>
              <li>🤖 Trae AI integration</li>
              <li>🌐 Browser actions</li>
              <li>📝 Monaco editor integration</li>
            </ul>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Try the Quick Actions:</Text>
              <QuickActions
                project={mockProject}
                size="large"
                showLabels={true}
                actions={['explorer', 'terminal', 'open', 'edit', 'favorite']}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Monaco Editor Demo" extra={<EditOutlined />}>
            <Paragraph>
              <Text strong>Features:</Text>
            </Paragraph>
            <ul>
              <li>Syntax highlighting</li>
              <li>Auto-completion</li>
              <li>Keyboard shortcuts</li>
              <li>Fullscreen mode</li>
              <li>Auto-save</li>
              <li>Theme support</li>
            </ul>
            
            <Divider />
            
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => setEditorVisible(true)}
              block
            >
              Open Monaco Editor
            </Button>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }} title="Context Menu Actions">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" title="Browser Actions">
              <ul>
                <li>🌐 Open in Browser</li>
                <li>⚡ Open UI Component</li>
                <li>🔗 Copy URL</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="Editor Actions">
              <ul>
                <li>📝 Edit in Monaco</li>
                <li>📄 Edit README</li>
                <li>⚙️ Edit Config</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" title="IDE Actions">
              <ul>
                <li>🔵 Open in VS Code</li>
                <li>⚡ Open in Cursor</li>
                <li>🌊 Open in Windsurf</li>
                <li>🤖 Open in Trae AI</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Monaco Editor Modal */}
      {editorVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            height: '80%',
            maxWidth: '1000px',
            overflow: 'hidden'
          }}>
            <MonacoEditor
              filePath="demo/MyComponent.tsx"
              content={editorContent}
              language="typescript"
              theme="vs-dark"
              onChange={setEditorContent}
              onSave={handleSaveDemo}
              onClose={() => setEditorVisible(false)}
              height="100%"
              showToolbar={true}
              autoSave={true}
              autoSaveDelay={3000}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoPage;