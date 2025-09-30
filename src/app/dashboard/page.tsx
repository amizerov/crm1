import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import InteractiveCard from '@/components/InteractiveCard';

export default async function DashboardPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Приветствие */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', color: '#333' }}>
          Добро пожаловать, {currentUser.nicName}!
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Выберите раздел для работы
        </p>
      </div>

      {/* Навигационные карточки */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 24,
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <InteractiveCard 
          href="/clients"
          style={{ 
            padding: '32px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '20px', 
            color: '#007bff',
            fontWeight: '600'
          }}>
            Клиенты
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Управление базой клиентов, добавление и редактирование контактов
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/tasks"
          style={{ 
            padding: '32px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '20px', 
            color: '#28a745',
            fontWeight: '600'
          }}>
            Задачи
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Создание, назначение и отслеживание выполнения задач
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/companies"
          style={{ 
            padding: '32px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '20px', 
            color: '#6f42c1',
            fontWeight: '600'
          }}>
            Мои компании
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Управление компаниями, переключение между организациями
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/employees"
          style={{ 
            padding: '32px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍💼</div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '20px', 
            color: '#fd7e14',
            fontWeight: '600'
          }}>
            Сотрудники
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Список всех сотрудников и назначенных им задач
          </p>
        </InteractiveCard>
      </div>
    </div>
  );
}
