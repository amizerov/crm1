import { getTotalSum, getUserCompanies, getClientsByCompany, getStatuses } from './actions';
import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import ClientsTable from './ClientsTable';

interface ClientsPageProps {
  searchParams: Promise<{ companyId?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  // Если companyId не указан в URL, используем активную компанию пользователя
  const companyId = params.companyId ? Number(params.companyId) : currentUser.companyId;

  // Получаем начальные данные для клиентского компонента
  const [initialClients, userCompanies, statuses, initialTotalSum] = await Promise.all([
    getClientsByCompany(companyId),
    getUserCompanies(),
    getStatuses(),
    getTotalSum(companyId)
  ]);

  return (
    <div style={{ padding: '20px 0' }}>
      <ClientsTable 
        initialClients={initialClients}
        companies={userCompanies}
        statuses={statuses}
        initialTotalSum={initialTotalSum}
        defaultCompanyId={currentUser.companyId}
      />
    </div>
  );
}
