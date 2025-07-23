import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import ProjectList from '@/components/project-list';
import MonacoEditor from '@/components/monaco-editor';
import { useProjectStore } from '@/store/modules/use-project-store';
import type { Project } from '@/types/project';

const IndexPage: React.FC = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [currentFilePath, setCurrentFilePath] = useState<string>('');
  const [selectedProject, setSelectedProjectLocal] = useState<Project | null>(null);

  const { 
    filters, 
    searchProjects, 
    openProjectInExplorer, 
    openProjectInTerminal, 
    openProjectInIDE,
    setSelectedProject 
  } = useProjectStore();

  // Get filtered projects based on current filters
  const filteredProjects = searchProjects(filters);

  const handleOpenInEditor = (project: Project, filePath?: string) => {
    setSelectedProjectLocal(project);
    const defaultContent = `// Welcome to ${project.name}!
// Project path: ${project.path}
// Type: ${project.type}

// This is a sample file opened in Monaco Editor
// You can edit and save files here

import React from 'react';

const ${project.name.replace(/[^a-zA-Z0-9]/g, '')}Component: React.FC = () => {
  return (
    <div>
      <h1>${project.name}</h1>
      <p>Edit your project files here!</p>
    </div>
  );
};

export default ${project.name.replace(/[^a-zA-Z0-9]/g, '')}Component;`;
    
    setEditorContent(defaultContent);
    setCurrentFilePath(filePath || `${project.name}/index.tsx`);
    setEditorVisible(true);
  };

  const handleSaveFile = async (content: string, filePath?: string) => {
    console.log('Saving file:', { content, filePath, project: selectedProject?.name });
    // TODO: Implement actual file saving via IPC
    // In a real implementation, this would save to the file system
  };

  const handleProjectAction = async (action: string, project: Project) => {
    try {
      switch (action) {
        case 'explorer':
          await openProjectInExplorer(project.path);
          break;
        case 'terminal':
          await openProjectInTerminal(project.path);
          break;
        case 'edit':
          setSelectedProject(project);
          // TODO: Open project edit modal or navigate to edit page
          break;
        case 'editor':
          handleOpenInEditor(project);
          break;
        case 'ide':
          await openProjectInIDE(project.path);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action}:`, error);
    }
  };

  return (
    <>
      <DashboardLayout title="Project Dashboard">
        <ProjectList
          projects={filteredProjects}
          viewMode="grid"
          onProjectAction={handleProjectAction}
        />
      </DashboardLayout>

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
              filePath={currentFilePath}
              content={editorContent}
              language="typescript"
              theme="vs-dark"
              onChange={setEditorContent}
              onSave={handleSaveFile}
              onClose={() => setEditorVisible(false)}
              height="100%"
              showToolbar={true}
              autoSave={true}
              autoSaveDelay={3000}
              showSidebar={true}
              showStatusBar={true}
              projectFiles={[]}
          onFileSelect={(filePath) => {
            // Handle file selection from the file tree
            // For now, we'll just set the file path
            setCurrentFilePath(filePath);
            setEditorContent('');
          }}
            />
          </div>
        </div>
      )}
    </>  );
};

export default IndexPage;
