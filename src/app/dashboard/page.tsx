'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveCard from '@/components/InteractiveCard';
import { checkTasksAvailability } from './actions';

export default function DashboardPage() {
  const router = useRouter();
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Получаем имя пользователя из куки
    const cookies = document.cookie.split('; ');
    const userNicNameCookie = cookies.find(c => c.startsWith('userNicName='));
    if (userNicNameCookie) {
      setUserName(decodeURIComponent(userNicNameCookie.split('=')[1]));
    }
  }, []);

  const handleTasksClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const result = await checkTasksAvailability();
    
    if (result.available) {
      router.push('/tasks/views');
    } else {
      setTooltip(result.message || 'Недоступно');
      setHighlightedCard(result.highlightCard || null);
      
      // Убираем подсказку через 3 секунды
      setTimeout(() => {
        setTooltip(null);
        setHighlightedCard(null);
      }, 3000);
    }
  };

  const getCardStyle = (cardId: string) => {
    const baseStyle = { 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: '160px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    };

    // Подсветка нужной карточки
    if (highlightedCard === cardId) {
      return {
        ...baseStyle,
        border: '3px solid #ffc107',
        backgroundColor: '#fff8e1',
        boxShadow: '0 0 20px rgba(255, 193, 7, 0.4)',
        transform: 'scale(1.05)'
      };
    }

    return baseStyle;
  };

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
          Добро пожаловать{userName && `, ${userName}`}!
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        flex: '1',
        minHeight: 0,
        alignContent: 'start'
      }}>
        <InteractiveCard 
          href="/clients"
          style={getCardStyle('clients')}
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

        {/* Карточка задач с проверками */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={handleTasksClick}
            style={getCardStyle('tasks')}
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
          </div>

          {/* Тултип-облачко */}
          {tooltip && (
            <div style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fff',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              whiteSpace: 'nowrap',
              fontSize: '14px',
              fontWeight: '500',
              color: '#856404',
              animation: 'fadeIn 0.3s ease'
            }}>
              {tooltip}
              {/* Стрелка вниз */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #ffc107'
              }} />
            </div>
          )}
        </div>

        <InteractiveCard 
          href="/companies"
          style={getCardStyle('companies')}
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
          style={getCardStyle('employees')}
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
          style={getCardStyle('projects')}
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
          style={getCardStyle('templates')}
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

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
