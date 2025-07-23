import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import ProjectList from '@/components/project-list';
import { useProjectStore } from '@/store/modules/use-project-store';
import type { Project } from '@/types/project';

const IndexPage: React.FC = () => {
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
    <DashboardLayout title="Project Dashboard">
      <ProjectList
        projects={filteredProjects}
        viewMode="grid"
        onProjectAction={handleProjectAction}
      />
    </DashboardLayout>
  );
};

export default IndexPage;
