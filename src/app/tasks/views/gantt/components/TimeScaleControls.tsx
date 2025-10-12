'use client';

import { ViewMode } from '../types/public-types';

interface TimeScaleControlsProps {
  currentViewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  className?: string;
}

interface ViewModeOption {
  mode: ViewMode;
  label: string;
  icon: string;
  shortLabel: string;
  description: string;
}

const viewModeOptions: ViewModeOption[] = [
  {
    mode: ViewMode.Day,
    label: 'День',
    icon: '📅',
    shortLabel: 'День',
    description: 'Детализация по дням'
  },
  {
    mode: ViewMode.Week,
    label: 'Неделя',
    icon: '📊',
    shortLabel: 'Неделя',
    description: 'Группировка по неделям'
  },
  {
    mode: ViewMode.Month,
    label: 'Месяц',
    icon: '🗓️',
    shortLabel: 'Месяц',
    description: 'Обзор по месяцам'
  },
  {
    mode: ViewMode.QuarterYear,
    label: 'Квартал',
    icon: '📈',
    shortLabel: 'Квартал',
    description: 'Квартальный обзор'
  }
];

export default function TimeScaleControls({
  currentViewMode,
  onViewModeChange,
  className = ''
}: TimeScaleControlsProps) {
  const handleViewModeChange = (newMode: ViewMode) => {
    onViewModeChange(newMode);
    
    // Сохраняем в localStorage для восстановления при следующем посещении
    try {
      localStorage.setItem('gantt_view_mode', newMode);
    } catch (error) {
      console.warn('Не удалось сохранить настройки масштаба:', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
        Масштаб:
      </span>
      
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-sm">
        {viewModeOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => handleViewModeChange(option.mode)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              min-w-[60px] justify-center
              ${currentViewMode === option.mode
                ? 'bg-blue-500 text-white shadow-sm transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            title={option.description}
            aria-label={`Переключить на масштаб: ${option.label}`}
          >
            <span className="text-sm">{option.icon}</span>
            <span className="hidden md:inline whitespace-nowrap">{option.shortLabel}</span>
          </button>
        ))}
      </div>
      
      {/* Индикатор текущего масштаба для мобильных устройств */}
      <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
        {viewModeOptions.find(opt => opt.mode === currentViewMode)?.shortLabel}
      </span>
    </div>
  );
}