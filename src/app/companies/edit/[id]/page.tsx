import { getCurrentUser } from '@/db/loginUser';
import { getCompanyById } from './actions';
import { redirect } from 'next/navigation';
import CompanyForm from './CompanyForm';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function CompanyEditPage({ params }: PageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // В Next.js 15 нужно ожидать params
  const resolvedParams = await params;
  const companyId = parseInt(resolvedParams.id);
  
  if (isNaN(companyId)) {
    return (
      <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px'
        }}>
          Неверный ID компании
        </div>
        <a href="/companies" style={{
          display: 'inline-block',
          padding: '12px 24px',
          border: '1px solid #6c757d',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#6c757d',
          fontSize: '16px',
          textDecoration: 'none'
        }}>
          Назад к списку компаний
        </a>
      </div>
    );
  }

  // Загружаем данные компании
  const company = await getCompanyById(companyId);
  
  if (!company) {
    return (
      <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px'
        }}>
          Компания не найдена
        </div>
        <a href="/companies" style={{
          display: 'inline-block',
          padding: '12px 24px',
          border: '1px solid #6c757d',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#6c757d',
          fontSize: '16px',
          textDecoration: 'none'
        }}>
          Назад к списку компаний
        </a>
      </div>
    );
  }

  // Проверяем права доступа - только владелец может редактировать
  if (company.ownerId !== currentUser.id) {
    return (
      <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px'
        }}>
          У вас нет прав для редактирования этой компании
        </div>
        <a href="/companies" style={{
          display: 'inline-block',
          padding: '12px 24px',
          border: '1px solid #6c757d',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#6c757d',
          fontSize: '16px',
          textDecoration: 'none'
        }}>
          Назад к списку компаний
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#333' }}>
          Редактирование компании
        </h1>
      </div>

      <CompanyForm company={company} />
    </div>
  );
}
