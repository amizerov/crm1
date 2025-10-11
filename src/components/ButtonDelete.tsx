'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ButtonDeleteProps {
  /** Текст на кнопке удаления */
  buttonText?: string;
  /** Заголовок модального окна подтверждения */
  confirmTitle: string;
  /** Текст подтверждения в модальном окне */
  confirmMessage: string;
  /** Server action для удаления */
  deleteAction: () => Promise<{ success: boolean; error?: string } | void>;
  /** URL для перенаправления после удаления (переопределяет редирект из server action) */
  redirectTo?: string;
  /** Дополнительные стили для кнопки */
  style?: React.CSSProperties;
  /** Отключить кнопку */
  disabled?: boolean;
}

export default function ButtonDelete({
  buttonText = 'Удалить',
  confirmTitle,
  confirmMessage,
  deleteAction,
  redirectTo,
  style,
  disabled = false
}: ButtonDeleteProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          setError(null);
        }}
        disabled={disabled || isDeleting}
        style={{
          padding: '12px 24px',
          backgroundColor: isDeleting ? '#6c757d' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: (disabled || isDeleting) ? 'not-allowed' : 'pointer',
          opacity: (disabled || isDeleting) ? 0.6 : 1,
          transition: 'all 0.3s ease',
          ...style
        }}
      >
        {isDeleting ? 'Удаляется...' : buttonText}
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 32,
            borderRadius: 8,
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease',
            transform: isDeleting ? 'scale(0.98)' : 'scale(1)',
            transition: 'transform 0.2s ease'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#dc3545',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              {confirmTitle}
            </h3>
            
            <p style={{ 
              margin: '0 0 24px 0', 
              color: '#666',
              lineHeight: 1.5
            }}>
              {confirmMessage}
            </p>

            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: 4,
                marginBottom: 16,
                color: '#c33',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }}>
                {error}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'flex-end' 
            }}>
                <button
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                    disabled={isDeleting}
                    style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                    }}
                >
                    Отмена
                </button>
              
                <button
                  type="button"
                  onClick={async () => {
                    setIsDeleting(true);
                    setError(null);
                    try {
                      const result = await deleteAction();
                      
                      // Если result существует (не void), проверяем успех
                      if (result) {
                        if (!result.success) {
                          // Показываем ошибку без выброса исключения
                          setError(result.error || 'Произошла ошибка при удалении');
                          setIsDeleting(false);
                          return;
                        }
                      }
                      
                      // Если успешно и указан redirectTo, перенаправляем туда
                      if (redirectTo) {
                        router.push(redirectTo);
                      }
                      // Иначе server action сам должен сделать redirect
                    } catch (error) {
                      console.error('Ошибка при удалении:', error);
                      setError(error instanceof Error ? error.message : 'Произошла ошибка при удалении');
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isDeleting ? '#6c757d' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {isDeleting && (
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS анимации */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}