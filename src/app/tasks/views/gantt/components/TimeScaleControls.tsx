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
  shortLabel: string;
}

const viewModeOptions: ViewModeOption[] = [
  {
    mode: ViewMode.Day,
    label: 'День',
    shortLabel: 'День'
  },
  {
    mode: ViewMode.Week,
    label: 'Неделя',
    shortLabel: 'Неделя'
  },
  {
    mode: ViewMode.Month,
    label: 'Месяц',
    shortLabel: 'Месяц'
  },
  {
    mode: ViewMode.QuarterYear,
    label: 'Квартал',
    shortLabel: 'Квартал'
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
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        {viewModeOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => handleViewModeChange(option.mode)}
            className={`
              px-3 py-1.5 text-sm font-medium transition-colors duration-150 border-r border-gray-300 dark:border-gray-600 last:border-r-0
              ${currentViewMode === option.mode
                ? 'bg-gray-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            title={`Переключить на масштаб: ${option.label}`}
          >
            {option.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}