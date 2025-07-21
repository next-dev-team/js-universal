import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import ProjectList from '@/components/project-list';
import { useProjectStore } from '@/store/modules/use-project-store';
import type { Project } from '@/types/project';

const IndexPage: React.FC = () => {
  const { filters, searchProjects } = useProjectStore();

  // Get filtered projects based on current filters
  const filteredProjects = searchProjects(filters);

  return (
    <DashboardLayout title="Project Dashboard">
      <ProjectList
        projects={filteredProjects}
        viewMode="grid"
        onProjectAction={(action: string, project: Project) => {
          console.log(`Action: ${action}`, project);
        }}
      />
    </DashboardLayout>
  );
};

export default IndexPage;
