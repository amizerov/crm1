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
  /** Дополнительный класс */
  className?: string;
  /** Отключить кнопку */
  disabled?: boolean;
}

export default function ButtonDelete({
  buttonText = 'Удалить',
  confirmTitle,
  confirmMessage,
  deleteAction,
  redirectTo,
  className = '',
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
        className={`
          px-6 py-3 
          bg-red-600 dark:bg-red-700
          hover:bg-red-700 dark:hover:bg-red-600
          disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60
          text-white font-medium
          rounded transition-all
          cursor-pointer
          ${className}
        `}
      >
        {isDeleting ? 'Удаляется...' : buttonText}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[10000] animate-fadeIn">
          <div className={`
            bg-white dark:bg-gray-800 
            p-8 rounded-lg 
            max-w-[500px] w-[90%] 
            shadow-xl
            animate-slideIn
            transition-transform
            ${isDeleting ? 'scale-[0.98]' : 'scale-100'}
          `}>
            <h3 className="m-0 mb-4 text-red-600 dark:text-red-400 text-xl font-bold">
              {confirmTitle}
            </h3>
            
            <p className="m-0 mb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              {confirmMessage}
            </p>

            {error && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded mb-4 text-red-700 dark:text-red-300 text-sm leading-normal">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
                <button
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-white rounded transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded transition-all disabled:cursor-not-allowed disabled:opacity-80 flex items-center gap-2"
                >
                  {isDeleting && (
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                  )}
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}