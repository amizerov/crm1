'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getProjectsByCompany, getUserCompanies } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import ProjectsTable from './ProjectsTable';
import CompanySelector from './CompanySelector';
import Link from 'next/link';

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const initPage = async () => {
      const user = await getCurrentUser();
      if (!user) {
        redirect('/login');
        return;
      }
      setCurrentUser(user);

      // Получаем компании
      const userCompanies = await getUserCompanies();
      setCompanies(userCompanies);

      // Определяем какую компанию использовать для загрузки проектов
      let targetCompanyId = user.companyId;
      
      // Проверяем localStorage
      const savedCompanyId = localStorage.getItem('selectedCompanyId_projects');
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId, 10);
        if (companyId === 0 || userCompanies.some((c: any) => c.id === companyId)) {
          targetCompanyId = companyId;
        }
      }

      // Загружаем проекты для выбранной компании
      const initialProjects = await getProjectsByCompany(targetCompanyId === 0 ? undefined : targetCompanyId);
      setProjects(initialProjects);
    };

    initPage();
  }, []);

  const handleCompanyChange = useCallback((companyId: number) => {
    startTransition(async () => {
      const newProjects = await getProjectsByCompany(companyId === 0 ? undefined : companyId);
      setProjects(newProjects);
    });
  }, []);

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Шапка с заголовком, селектором компании и кнопкой */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Проекты</h1>
          
          <CompanySelector
            companies={companies}
            defaultCompanyId={currentUser.companyId}
            onCompanyChange={handleCompanyChange}
            isPending={isPending}
            storageKey="selectedCompanyId_projects"
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/projects/add">
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
          </Link>
        </div>
      </div>

      <ProjectsTable 
        projects={projects}
        isPending={isPending}
      />
      
      {/* Футер с информацией */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '20px',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
      }}>
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
    </div>
  );
}
