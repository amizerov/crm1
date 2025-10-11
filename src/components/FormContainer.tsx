import React, { ReactNode } from 'react';
import { COMPONENT_STYLES } from '@/styles/constants';

interface FormContainerProps {
  /** Server action для формы */
  action?: string | ((formData: FormData) => void);
  /** Содержимое формы (поля) */
  children: ReactNode;
  /** Кнопки формы */
  buttons?: ReactNode;
  /** Использовать grid-layout для полей */
  useGrid?: boolean;
  /** Дополнительные стили для формы */
  style?: React.CSSProperties;
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
  style
}: FormContainerProps) {
  const containerStyle = useGrid 
    ? COMPONENT_STYLES.formContainerGrid 
    : COMPONENT_STYLES.formContainer;

  return (
    <form 
      action={action}
      style={{ 
        ...containerStyle,
        ...style
      }}
    >
      {children}
      
      {/* Кнопки формы */}
      {buttons && (
        <div style={COMPONENT_STYLES.buttonContainer}>
          {buttons}
        </div>
      )}
    </form>
  );
}