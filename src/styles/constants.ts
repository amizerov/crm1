// Центральные константы стилей для всего приложения
export const COLORS = {
  // Основные цвета
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  secondary: '#6c757d',
  
  // Цвета текста
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  
  // Цвета фона
  backgroundLight: '#f8f9fa',
  backgroundWhite: '#ffffff',
  
  // Цвета границ
  borderLight: '#dee2e6',
  borderDefault: '#ddd',
  
  // Состояния
  hover: '#0056b3',
  focus: '#0069d9',
  disabled: '#e9ecef'
} as const;

export const TYPOGRAPHY = {
  // Размеры шрифтов
  fontSize: {
    small: '12px',
    normal: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '24px',
    xxlarge: '28px',
    xxxlarge: '32px'
  },
  
  // Веса шрифтов
  fontWeight: {
    normal: 'normal',
    medium: '500',
    semibold: '600',
    bold: 'bold'
  },
  
  // Высота строк
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  }
} as const;

export const SPACING = {
  // Отступы и поля
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  
  // Специальные отступы для форм
  formPadding: '32px',
  fieldMargin: '8px',         // Уменьшили с 12px до 8px
  sectionMargin: '16px'       // Уменьшили с 20px до 16px
} as const;

export const BORDERS = {
  radius: {
    small: '4px',
    medium: '8px',
    large: '12px'
  },
  
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  }
} as const;

export const SHADOWS = {
  light: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 12px rgba(0,0,0,0.15)',
  heavy: '0 8px 24px rgba(0,0,0,0.2)'
} as const;

// Готовые стили для компонентов
export const COMPONENT_STYLES = {
  // Стили для заголовков страниц
  pageTitle: {
    margin: '0 0 12px 0',
    fontSize: TYPOGRAPHY.fontSize.xxlarge,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },
  
  // Стили для подзаголовков
  subtitle: {
    margin: 0,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.medium
  },
  
  // Стили для лейблов полей формы
  fieldLabel: {
    display: 'block',
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.normal
  },
  
  // Стили для полей ввода
  input: {
    width: '100%',
    padding: SPACING.md,
    border: `${BORDERS.width.thin} solid ${COLORS.borderDefault}`,
    borderRadius: BORDERS.radius.small,
    fontSize: TYPOGRAPHY.fontSize.medium,
    boxSizing: 'border-box' as const,
    backgroundColor: COLORS.backgroundWhite,
    color: COLORS.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  
  // Стили для полей ввода при фокусе
  inputFocus: {
    borderColor: COLORS.primary,
    boxShadow: `0 0 0 2px rgba(0, 123, 255, 0.25)`
  },
  
  // Стили для контейнера формы
  formContainer: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.formPadding,
    borderRadius: BORDERS.radius.medium,
    border: `${BORDERS.width.thin} solid ${COLORS.borderLight}`,
    marginBottom: SPACING.xl
  },
  
  // Стили для контейнера формы с grid-layout (новые стандартные формы)
  formContainerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.formPadding,
    borderRadius: BORDERS.radius.medium,
    border: `${BORDERS.width.thin} solid ${COLORS.borderLight}`,
    marginBottom: SPACING.xl
  },
  
  // Стили для контейнера страницы
  pageContainer: {
    padding: `${SPACING.xl} 0`,
    maxWidth: '600px',
    margin: '0 auto'
  },
  
  // Стили для секций с полями
  fieldSection: {
    marginBottom: SPACING.fieldMargin
  },
  
  // Стили для последней секции (перед кнопками)
  lastFieldSection: {
    marginBottom: SPACING.sectionMargin
  },
  
  // Стили для контейнера кнопок
  buttonContainer: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: SPACING.lg,
    justifyContent: 'flex-end'
  },
  
  // Стили для контейнера кнопок с разделением (удаление слева, остальные справа)
  buttonContainerSplit: {
    display: 'flex',
    gap: SPACING.lg,
    justifyContent: 'space-between'
  },
  
  // Стили для группы кнопок справа
  buttonGroup: {
    display: 'flex',
    gap: SPACING.lg
  },
  
  // Стили для заголовка с кнопкой
  headerWithButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  }
} as const;