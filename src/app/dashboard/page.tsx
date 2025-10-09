import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import InteractiveCard from '@/components/InteractiveCard';

export default async function DashboardPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div style={{ 
      padding: '20px 0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Приветствие */}
      <div style={{ 
        marginBottom: 24, 
        textAlign: 'center',
        flexShrink: 0
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 4vw, 32px)', 
          color: '#333' 
        }}>
          Добро пожаловать, {currentUser.nicName}!
        </h1>
        <p style={{ 
          margin: 0, 
          color: '#666', 
          fontSize: 'clamp(14px, 2vw, 16px)' 
        }}>
          Выберите раздел для работы
        </p>
      </div>

      {/* Навигационные карточки */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        flex: '1',
        minHeight: 0,
        alignContent: 'start'
      }}
      className="dashboard-grid"
      >
        <InteractiveCard 
          href="/clients"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#007bff',
            fontWeight: '600'
          }}>
            Клиенты
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Управление базой клиентов
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/tasks/views"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#28a745',
            fontWeight: '600'
          }}>
            Задачи
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Отслеживание задач
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/companies"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#6f42c1',
            fontWeight: '600'
          }}>
            Мои компании
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Управление компаниями
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/employees"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍💼</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#fd7e14',
            fontWeight: '600'
          }}>
            Сотрудники
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Список сотрудников
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/projects"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#17a2b8',
            fontWeight: '600'
          }}>
            Проекты
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Управление проектами
          </p>
        </InteractiveCard>

        <InteractiveCard 
          href="/templates"
          style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            color: '#20c997',
            fontWeight: '600'
          }}>
            Шаблоны процессов
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6c757d', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Управление шаблонами
          </p>
        </InteractiveCard>
      </div>
    </div>
  );
}
