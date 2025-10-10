import React, { ReactNode } from 'react';
import { COMPONENT_STYLES } from '@/styles/constants';

interface FormPageLayoutProps {
  /** Заголовок страницы */
  title: string;
  /** Подзаголовок (опционально) */
  subtitle?: string;
  /** Содержимое формы */
  children: ReactNode;
  /** Кнопка в правом верхнем углу (обычно ButtonBack) */
  actionButton?: ReactNode;
  /** Дополнительные стили для контейнера страницы */
  pageStyle?: React.CSSProperties;
  /** Дополнительные стили для контейнера формы */
  formStyle?: React.CSSProperties;
}

/**
 * Универсальный компонент для страниц с формами
 * Обеспечивает единообразный дизайн всех форм в приложении
 */
export default function FormPageLayout({
  title,
  subtitle,
  children,
  actionButton,
  pageStyle,
  formStyle
}: FormPageLayoutProps) {
  return (
    <div style={{ ...COMPONENT_STYLES.pageContainer, ...pageStyle }}>
      {/* Заголовок страницы */}
      <div style={{ marginBottom: COMPONENT_STYLES.pageContainer.padding.split(' ')[0] }}>
        <div style={COMPONENT_STYLES.headerWithButton}>
          <div>
            <h1 style={COMPONENT_STYLES.pageTitle}>
              {title}
            </h1>
            {subtitle && (
              <p style={COMPONENT_STYLES.subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          {actionButton}
        </div>
      </div>

      {/* Содержимое формы */}
      {children}
    </div>
  );
}