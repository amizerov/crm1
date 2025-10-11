'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getEmployeesByCompany, getUserCompanies } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import EmployeesTable from './EmployeesTable';
import CompanySelector from './CompanySelector';
import Link from 'next/link';

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
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

      // Определяем какую компанию использовать для загрузки сотрудников
      let targetCompanyId = user.companyId;
      
      // Проверяем localStorage
      const savedCompanyId = localStorage.getItem('selectedCompanyId_employees');
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId, 10);
        if (companyId === 0 || userCompanies.some((c: any) => c.id === companyId)) {
          targetCompanyId = companyId;
        }
      }

      // Загружаем сотрудников для выбранной компании
      const initialEmployees = await getEmployeesByCompany(targetCompanyId === 0 ? undefined : targetCompanyId);
      setEmployees(initialEmployees);
    };

    initPage();
  }, []);

  const handleCompanyChange = useCallback((companyId: number) => {
    startTransition(async () => {
      const newEmployees = await getEmployeesByCompany(companyId === 0 ? undefined : companyId);
      setEmployees(newEmployees);
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
          <h1 style={{ margin: 0 }}>Сотрудники</h1>
          
          <CompanySelector
            companies={companies}
            defaultCompanyId={currentUser.companyId}
            onCompanyChange={handleCompanyChange}
            isPending={isPending}
            storageKey="selectedCompanyId_employees"
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/employees/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              + Добавить сотрудника
            </button>
          </Link>
        </div>
      </div>

      <EmployeesTable 
        employees={employees}
        isPending={isPending}
      />
    </div>
  );
}
