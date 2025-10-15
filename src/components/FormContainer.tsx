import React, { ReactNode } from 'react';

interface FormContainerProps {
  /** Server action для формы */
  action?: string | ((formData: FormData) => void);
  /** Содержимое формы (поля) */
  children: ReactNode;
  /** Кнопки формы */
  buttons?: ReactNode;
  /** Использовать grid-layout для полей */
  useGrid?: boolean;
  /** Дополнительный класс */
  className?: string;
}

/**
 * Универсальный контейнер для форм
 * Применяет единые стили ко всем формам в приложении
 */
export default function FormContainer({
  action,
  children,
  buttons,
  useGrid = false,
  className = ''
}: FormContainerProps) {
  return (
    <form 
      action={action}
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-md 
        p-6
        ${useGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}
        ${className}
      `}
    >
      {children}
      
      {/* Кнопки формы */}
      {buttons && (
        <div className="flex justify-end gap-3 mt-6 col-span-full">
          {buttons}
        </div>
      )}
    </form>
  );
}