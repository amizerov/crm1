'use client';

import { useState, useTransition, useEffect } from 'react';
import { getProjectsByCompany, getUserCompanies } from './actions/actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import ProjectsTable from './ProjectsTable';
import LoadingCEP from '@/components/LoadingCEP';
import ListPageLayout from '@/components/ListPageLayout';
import StatCard from '@/components/StatCard';

export default function ProjectsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

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
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId, 10);
        if (companyId === 0 || userCompanies.some((c: any) => c.id === companyId)) {
          targetCompanyId = companyId;
        }
      }

      // Устанавливаем выбранную компанию в состояние
      setSelectedCompanyId(targetCompanyId);

      // Загружаем проекты для выбранной компании
      const initialProjects = await getProjectsByCompany(targetCompanyId === 0 ? undefined : targetCompanyId);
      setProjects(initialProjects);
      
      // Завершаем начальную загрузку
      setIsInitialLoading(false);
    };

    initPage();
  }, []);

  const handleCompanyChange = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId', companyId.toString());
    
    startTransition(async () => {
      const newProjects = await getProjectsByCompany(companyId === 0 ? undefined : companyId);
      setProjects(newProjects);
    });
  };

  if (!currentUser || isInitialLoading) {
    return <LoadingCEP message="Загрузка проектов..." />;
  }

  return (
    <ListPageLayout
      title="Проекты"
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      onCompanyChange={handleCompanyChange}
      isPending={isPending}
      addButtonText="+ Добавить проект"
      addButtonHref="/projects/add"
      footer={
        <>
          <StatCard label="Всего проектов" value={projects.length} />
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <span className="text-xs italic text-blue-700 dark:text-blue-300">
              💡 Нажмите на строку для редактирования
            </span>
          </div>
        </>
      }
    >
      <ProjectsTable 
        projects={projects}
        isPending={isPending}
      />
    </ListPageLayout>
  );
}
