'use client';

import { useState, useTransition, useEffect } from 'react';
import { getProjectsByCompany } from './actions';
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

type Company = {
  id: number;
  companyName: string;
};

interface ProjectsTableProps {
  initialProjects: Project[];
  companies: Company[];
  defaultCompanyId?: number;
}

export default function ProjectsTable({ initialProjects, companies, defaultCompanyId }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(defaultCompanyId || 0);
  const [isPending, startTransition] = useTransition();

  // Восстанавливаем выбранную компанию из localStorage при монтировании компонента
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId_projects');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId, 10);
      // Проверяем, что компания существует в списке доступных компаний
      if (companyId === 0 || companies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId);
        
        // Загружаем данные для сохраненной компании
        startTransition(async () => {
          const newProjects = await getProjectsByCompany(companyId === 0 ? undefined : companyId);
          setProjects(newProjects);
        });
      }
    }
  }, [companies]);

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId_projects', companyId.toString());
    
    startTransition(async () => {
      const newProjects = await getProjectsByCompany(companyId === 0 ? undefined : companyId);
      setProjects(newProjects);
    });
  };

  return (
    <div>
      {/* Селектор компании */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Проекты</h1>
          
          {/* Селектор компании */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="company-select" style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
              Компания:
            </label>
            <select
              id="company-select"
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(Number(e.target.value))}
              disabled={isPending}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                backgroundColor: isPending ? '#f5f5f5' : 'white',
                cursor: isPending ? 'not-allowed' : 'pointer',
                minWidth: 180,
                opacity: isPending ? 0.7 : 1
              }}
            >
              <option value={0}>Все компании</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            {isPending && (
              <span style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                Загрузка...
              </span>
            )}
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '8px 16px', 
            borderRadius: 6, 
            border: '1px solid #dee2e6' 
          }}>
            <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
              Всего проектов: {projects.length}
            </span>
          </div>
          
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '6px 12px', 
            borderRadius: 4, 
            border: '1px solid #b3d9ff' 
          }}>
            <span style={{ fontSize: 12, color: '#0056b3', fontStyle: 'italic' }}>
              💡 Нажмите на строку для редактирования
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/projects/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              + Добавить проект
            </button>
          </a>
        </div>
      </div>

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
