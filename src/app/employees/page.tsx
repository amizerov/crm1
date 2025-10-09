import { getEmployeesByCompany, getUserCompanies } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import EmployeesTable from './EmployeesTable';

interface EmployeesPageProps {
  searchParams: Promise<{ companyId?: string }>;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  // Если companyId не указан в URL, используем активную компанию пользователя
  const companyId = params.companyId ? Number(params.companyId) : currentUser.companyId;

  // Получаем начальные данные для клиентского компонента
  const [initialEmployees, userCompanies] = await Promise.all([
    getEmployeesByCompany(companyId),
    getUserCompanies()
  ]);

  return (
    <div style={{ padding: '20px 0' }}>
      <EmployeesTable 
        initialEmployees={initialEmployees}
        companies={userCompanies}
        defaultCompanyId={currentUser.companyId}
      />
    </div>
  );
}
