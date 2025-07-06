import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ipcRenderer } from 'electron';

const ProjectLauncher = () => {
  const [projectPath, setProjectPath] = useState<string | null>(null);

  const handleOpenProject = async (newWindow: boolean) => {
    try {
      const path = await ipcRenderer.invoke('open-project', {
        newWindow,
      });
      if (path) {
        setProjectPath(path);
        message.success(`Project opened: ${path}`);
      }
    } catch (error) {
      message.error('Failed to open project');
      console.error('Error selecting project:', error);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-6 text-2xl font-bold">Project Launcher</h1>

      <Button
        type="primary"
        onClick={() => handleOpenProject(false)}
        className="px-6 py-3"
      >
        Select Project Folder
      </Button>
      <Button
        type="primary"
        onClick={() => handleOpenProject(true)}
        className="ml-4 px-6 py-3"
      >
        Open Project in New Window
      </Button>

      {projectPath && (
        <div className="mt-4 max-w-md rounded-md bg-white p-4 shadow-md">
          <p className="font-medium">Selected Project:</p>
          <p className="mt-1 text-sm break-all text-gray-600">{projectPath}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectLauncher;
