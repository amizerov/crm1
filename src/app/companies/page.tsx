import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getUserCompanies } from '@/db/getUsers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CompanySwitcher from '@/components/CompanySwitcher';

type Company = {
  id: number;
  companyName: string;
  ownerId: number;
  ownerName?: string;
  isOwner: boolean;
};

export default async function CompaniesPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  console.log('Current User:', currentUser);

  if (!currentUser) {
    redirect('/login');
  }

  // Получаем компании пользователя
  const companies = await getUserCompanies(currentUser.id);

  return (
    <div style={{ padding: '20px 0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#333' }}>
            Мои компании
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Управление компаниями и переключение между ними
          </p>
        </div>
        
        <Link 
          href="/companies/create"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          + Создать компанию
        </Link>
      </div>

      {companies.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏢</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#333' }}>
            У вас пока нет компаний
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '16px' }}>
            Создайте первую компанию или попросите коллег добавить вас в существующую
          </p>
          <Link 
            href="/companies/create"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Создать первую компанию
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {companies.map((company) => (
            <div
              key={company.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    {company.companyName}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: company.isOwner ? '#d4edda' : '#fff3cd',
                    color: company.isOwner ? '#155724' : '#856404',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {company.isOwner ? 'Владелец' : 'Сотрудник'}
                  </div>
                </div>
                
                {currentUser.companyId === company.id && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Активная
                  </div>
                )}
              </div>

              {company.ownerName && !company.isOwner && (
                <p style={{ 
                  margin: '0 0 16px 0', 
                  color: '#6c757d', 
                  fontSize: '14px' 
                }}>
                  Владелец: {company.ownerName}
                </p>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {company.isOwner && (
                  <Link
                    href={`/companies/edit/${company.id}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Редактировать
                  </Link>
                )}
                
                {currentUser.companyId !== company.id && (
                  <CompanySwitcher 
                    companies={companies}
                    currentCompanyId={currentUser.companyId}
                  >
                    <input type="hidden" name="companyId" value={company.id} />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Сделать активной
                    </button>
                  </CompanySwitcher>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
