'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleDeleteTask } from './actions';

interface DeleteTaskButtonProps {
  taskId: number;
  taskName: string;
}

export default function DeleteTaskButton({ taskId, taskName }: DeleteTaskButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteTask(taskId);
      // Server Action уже делает redirect, поэтому router.push не нужен
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      alert('Произошла ошибка при удалении задачи');
      setIsDeleting(false);
    }
    router.push('/tasks');
  };

  return (
    <>
      <button 
        type="button" 
        className="btn-danger"
        onClick={() => setShowModal(true)}
        style={{ 
          padding: '12px 24px', 
          color: 'white', 
          border: 'none', 
          borderRadius: 4, 
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        🗑️ Удалить
      </button>

      {/* Модальное окно */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 40,
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '3px solid #dc3545',
            position: 'relative',
            animation: 'modalAppear 0.3s ease-out'
          }}>
            {/* Заголовок с иконкой */}
            <div style={{
              textAlign: 'center',
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 16
              }}>
                ⚠️
              </div>
              <h2 style={{
                color: '#dc3545',
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                marginBottom: 8
              }}>
                ОПАСНОЕ ДЕЙСТВИЕ!
              </h2>
              <p style={{
                color: '#666',
                fontSize: 16,
                margin: 0
              }}>
                Вы собираетесь удалить задачу
              </p>
            </div>

            {/* Название задачи в рамке */}
            <div style={{
              backgroundColor: '#f8d7da',
              border: '2px solid #dc3545',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              <strong style={{
                fontSize: 18,
                color: '#721c24'
              }}>
                "{taskName}"
              </strong>
            </div>

            {/* Предупреждения */}
            <div style={{
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: 8,
              padding: 20,
              marginBottom: 24
            }}>
              <h3 style={{
                color: '#856404',
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🚨 Важная информация:
              </h3>
              <ul style={{
                color: '#856404',
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
                paddingLeft: 20
              }}>
                <li>Это действие <strong>НЕЛЬЗЯ ОТМЕНИТЬ</strong></li>
                <li>Все данные задачи будут <strong>УДАЛЕНЫ НАВСЕГДА</strong></li>
                <li>История выполнения и комментарии будут потеряны</li>
                <li>Восстановление данных будет невозможно</li>
              </ul>
            </div>

            {/* Кнопки */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                style={{
                  padding: '12px 24px',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  minWidth: 140
                }}
              >
                ↩️ Отменить
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isDeleting ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  minWidth: 180,
                  transition: 'all 0.2s ease'
                }}
              >
                {isDeleting ? '⏳ Удаление...' : '🗑️ Да, удалить навсегда'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
