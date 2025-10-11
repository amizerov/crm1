'use client';

import ProjectRow from './ProjectRow';

export type Project = {
  id: number;
  projectName: string;
  description?: string;
  companyId: number;
  userId: number;
  companyName?: string;
  userNicName?: string;
  userFullName?: string;
  dtc: string;
  dtu?: string;
};

interface ProjectsTableProps {
  projects: Project[];
  isPending?: boolean;
}

export default function ProjectsTable({ projects, isPending = false }: ProjectsTableProps) {
  return (
    <div>
      {/* Таблица проектов */}
      <div style={{ 
        border: '1px solid #dee2e6', 
        borderRadius: 8, 
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>ID</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Название проекта</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Описание</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Компания</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Создатель</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Дата создания</th>
              <th style={{ padding: 16, textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ 
                  padding: 40, 
                  textAlign: 'center', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  {isPending ? 'Загрузка проектов...' : 'Нет проектов для отображения'}
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
