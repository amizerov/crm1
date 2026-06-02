'use client';

import { useState } from 'react';
import type { Project } from '../../actions/actions';
import type { StatusTask } from '../../actions/statusActions';
import type { ProjectAccessEmployee } from './actions';
import ProjectForm from './ProjectForm';
import ProjectStatusEditor from './ProjectStatusEditor';
import ProjectAccessEditor from './ProjectAccessEditor';

type ProjectEditTab = 'main' | 'statuses' | 'access';

interface ProjectEditTabsProps {
  project: Project;
  companies: { id: number; companyName: string }[];
  statuses: StatusTask[];
  templates: { id: number; templName: string }[];
  accessEmployees: ProjectAccessEmployee[];
}

const tabs: { id: ProjectEditTab; label: string }[] = [
  { id: 'main', label: 'Основное' },
  { id: 'statuses', label: 'Статусы' },
  { id: 'access', label: 'Доступы' },
];

export default function ProjectEditTabs({
  project,
  companies,
  statuses,
  templates,
  accessEmployees,
}: ProjectEditTabsProps) {
  const [activeTab, setActiveTab] = useState<ProjectEditTab>('main');

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'main' && (
        <ProjectForm project={project} companies={companies} />
      )}

      {activeTab === 'statuses' && (
        <ProjectStatusEditor
          projectId={project.id}
          initialStatuses={statuses}
          templates={templates}
        />
      )}

      {activeTab === 'access' && (
        <ProjectAccessEditor
          projectId={project.id}
          employees={accessEmployees}
        />
      )}
    </div>
  );
}
