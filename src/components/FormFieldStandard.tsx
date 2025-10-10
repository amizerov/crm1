import React from 'react';
import { COMPONENT_STYLES } from '@/styles/constants';

interface FormFieldStandardProps {
  /** Текст лейбла */
  label: string;
  /** Обязательное поле */
  required?: boolean;
  /** Дочерние элементы (input, select, textarea) */
  children: React.ReactNode;
  /** Это последнее поле перед кнопками */
  isLast?: boolean;
  /** Дополнительные стили для контейнера */
  style?: React.CSSProperties;
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
  style
}: FormFieldStandardProps) {
  const containerStyle = isLast 
    ? COMPONENT_STYLES.lastFieldSection 
    : COMPONENT_STYLES.fieldSection;

  return (
    <div style={{ ...containerStyle, ...style }}>
      <label style={COMPONENT_STYLES.fieldLabel}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}