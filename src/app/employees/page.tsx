'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getEmployeesByCompany, getUserCompanies } from './actions/actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import EmployeesTable from './EmployeesTable';
import LoadingCEP from '@/components/LoadingCEP';
import ListPageLayout from '@/components/ListPageLayout';
import StatCard from '@/components/StatCard';

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
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

      // Определяем какую компанию использовать для загрузки сотрудников
      let targetCompanyId = user.companyId; // fallback значение
      
      // Проверяем localStorage (приоритет)
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId, 10);
        if (companyId === 0 || userCompanies.some((c: any) => c.id === companyId)) {
          targetCompanyId = companyId;
        }
      }

      // Устанавливаем выбранную компанию в состояние
      setSelectedCompanyId(targetCompanyId);

      // Загружаем сотрудников для выбранной компании
      const initialEmployees = await getEmployeesByCompany(targetCompanyId === 0 ? undefined : targetCompanyId);
      setEmployees(initialEmployees);
      
      // Завершаем начальную загрузку
      setIsInitialLoading(false);
    };

    initPage();
  }, []);

  const handleCompanyChange = useCallback((companyId: number) => {
    setSelectedCompanyId(companyId);
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId', companyId.toString());
    
    startTransition(async () => {
      const newEmployees = await getEmployeesByCompany(companyId === 0 ? undefined : companyId);
      setEmployees(newEmployees);
    });
  }, []);

  if (!currentUser || isInitialLoading) {
    return <LoadingCEP message="Загрузка сотрудников..." />;
  }

  return (
    <ListPageLayout
      title="Сотрудники"
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      onCompanyChange={handleCompanyChange}
      isPending={isPending}
      addButtonText="+ Добавить сотрудника"
      addButtonHref="/employees/add"
      footer={
        <>
          <StatCard label="Всего сотрудников" value={employees.length} />
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <span className="text-xs italic text-blue-700 dark:text-blue-300">
              💡 Нажмите на строку для редактирования
            </span>
          </div>
        </>
      }
    >
      <EmployeesTable 
        employees={employees}
        isPending={isPending}
      />
    </ListPageLayout>
  );
}
