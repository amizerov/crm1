'use client';

import { useState, useTransition, useEffect } from 'react';
import { getTotalSum, getUserCompanies, getClientsByCompany, getStatuses } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import ClientsTable from './ClientsTable';
import LoadingCEP from '@/components/LoadingCEP';
import ListPageLayout from '@/components/ListPageLayout';
import StatCard from '@/components/StatCard';

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
    <ListPageLayout
      title="Клиенты"
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      onCompanyChange={handleCompanyChange}
      addButtonText="+ Добавить клиента"
      addButtonHref="/clients/add"
      footer={
        <>
          <StatCard label="Всего клиентов" value={clients.length} />
          <StatCard label="Общая сумма" value={totalSum} variant="success" />
        </>
      }
    >
      <ClientsTable 
        clients={clients}
        statuses={statuses}
      />
    </ListPageLayout>
  );
}
