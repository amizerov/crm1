import React from 'react';

interface FormFieldStandardProps {
  /** Текст лейбла */
  label: string;
  /** Обязательное поле */
  required?: boolean;
  /** Дочерние элементы (input, select, textarea) */
  children: React.ReactNode;
  /** Это последнее поле перед кнопками */
  isLast?: boolean;
  /** Дополнительный класс */
  className?: string;
}

/**
 * Универсальный компонент для полей формы со стандартными стилями
 * Обеспечивает единообразное отображение лейблов и отступов
 */
export default function FormFieldStandard({
  label,
  required = false,
  children,
  isLast = false,
  className = ''
}: FormFieldStandardProps) {
  return (
    <div className={`${isLast ? 'mb-8' : 'mb-4'} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
        {label}{required && <span className="text-red-500 dark:text-red-400"> *</span>}
      </label>
      {children}
    </div>
  );
}