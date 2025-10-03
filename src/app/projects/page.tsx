import { getProjectsByCompany, getUserCompanies } from './actions';
import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import ProjectsTable from './ProjectsTable';

interface ProjectsPageProps {
  searchParams: Promise<{ companyId?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  // Если companyId не указан в URL, используем активную компанию пользователя
  const companyId = params.companyId ? Number(params.companyId) : currentUser.companyId;

  // Получаем начальные данные для клиентского компонента
  const [initialProjects, userCompanies] = await Promise.all([
    getProjectsByCompany(companyId),
    getUserCompanies()
  ]);

  return (
    <div style={{ padding: '20px 0' }}>
      <ProjectsTable 
        initialProjects={initialProjects}
        companies={userCompanies}
        defaultCompanyId={currentUser.companyId}
      />
    </div>
  );
}
