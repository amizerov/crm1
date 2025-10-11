'use client';

import { useState, useTransition, useEffect } from 'react';
import { getTotalSum, getUserCompanies, getClientsByCompany, getStatuses } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import ClientsTable from './ClientsTable';
import CompanySelector from '@/components/CompanySelector';
import LoadingCEP from '@/components/LoadingCEP';
import Link from 'next/link';

export type Client = {
  id: number;
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
  companyId?: number;
  companyName?: string;
  summa?: number;
  payDate?: string;
  payType?: string;
  dtc: string;
  dtu?: string;
};

type Company = {
  id: number;
  companyName: string;
};

type Status = {
  id: number;
  status: string;
};

export default function ClientsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [totalSum, setTotalSum] = useState<number>(0);
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

      // Получаем компании и статусы
      const [userCompanies, clientStatuses] = await Promise.all([
        getUserCompanies(),
        getStatuses()
      ]);
      setCompanies(userCompanies);
      setStatuses(clientStatuses);

      // Определяем какую компанию использовать для загрузки клиентов
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

      // Загружаем клиентов для выбранной компании
      const [initialClients, initialTotalSum] = await Promise.all([
        getClientsByCompany(targetCompanyId === 0 ? undefined : targetCompanyId),
        getTotalSum(targetCompanyId === 0 ? undefined : targetCompanyId)
      ]);
      setClients(initialClients);
      setTotalSum(initialTotalSum);
      
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
      const [newClients, newTotalSum] = await Promise.all([
        getClientsByCompany(companyId === 0 ? undefined : companyId),
        getTotalSum(companyId === 0 ? undefined : companyId)
      ]);
      setClients(newClients);
      setTotalSum(newTotalSum);
    });
  };

  if (!currentUser || isInitialLoading) {
    return <LoadingCEP message="Загрузка клиентов..." />;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Заголовок и селектор компании */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Клиенты</h1>
          
          <CompanySelector 
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
            storageKey="selectedCompanyId"
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/clients/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              + Добавить клиента
            </button>
          </Link>
        </div>
      </div>

      <ClientsTable 
        clients={clients}
        statuses={statuses}
      />
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '20px',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
      }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '8px 16px', borderRadius: 6, border: '1px solid #dee2e6' }}>
          <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
            Всего клиентов: {clients.length}
          </span>
        </div>
        
        <div style={{ backgroundColor: '#e8f5e8', padding: '8px 16px', borderRadius: 6, border: '1px solid #28a745' }}>
          <span style={{ fontSize: 14, color: '#155724', fontWeight: 'bold' }}>
            Общая сумма: {totalSum.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
    </div>
  );
}
