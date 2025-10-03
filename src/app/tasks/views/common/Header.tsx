'use client';

import { usePathname } from 'next/navigation';

interface NavigationHeaderProps {
  isLeftPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  title?: string;
  tableUrl?: string;
}

export default function Header({
  isLeftPanelVisible,
  onToggleLeftPanel,
  isFullscreen,
  onToggleFullscreen,
  title = "📋 Канбан доска",
  tableUrl = "/tasks"
}: NavigationHeaderProps) {
  const pathname = usePathname();
  
  // Определяем текущую страницу и альтернативный URL
  const isListView = pathname.includes('/tasks/views/list');
  const isDeskView = pathname.includes('/tasks/views/desk');
  
  const getAlternativeUrl = () => {
    if (isListView) {
      return '/tasks/views/desk';
    } else if (isDeskView) {
      return '/tasks/views/list';
    }
    return tableUrl;
  };
  
  const getButtonText = () => {
    if (isListView) {
      return { icon: '📋', text: 'Канбан' };
    } else if (isDeskView) {
      return { icon: '📑', text: 'Список' };
    }
    return { icon: '📑', text: 'Таблица' };
  };
  
  const buttonConfig = getButtonText();

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {/* Кнопка скрытия боковой панели */}
        <button
          onClick={onToggleLeftPanel}
          className="text-gray-600 border-2 border-gray-300 dark:border-gray-600
           hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-1 cursor-pointer
           rounded mr-12
           hover:border-2 hover:border-gray-800"
          title={isLeftPanelVisible ? "Скрыть боковую панель" : "Показать боковую панель"}
          aria-label={isLeftPanelVisible ? "Скрыть боковую панель" : "Показать боковую панель"}
        >
          {isLeftPanelVisible ? (
            // Иконка для скрытия (стрелка влево)
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          ) : (
            // Иконка для показа (гамбургер)
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
        
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {title}
        </h1>
        <a
          href={getAlternativeUrl()}
          className="
            px-2 py-1.5
            bg-gray-200 hover:bg-gray-300 
            dark:bg-gray-700 dark:hover:bg-gray-600
            text-gray-900 dark:text-gray-100
            rounded
            text-xs font-medium
            no-underline inline-flex items-center gap-1
            transition-colors
            whitespace-nowrap
          "
        >
          <span>{buttonConfig.icon}</span>
          <span className="hidden sm:inline">{buttonConfig.text}</span>
        </a>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Кнопка полноэкранного режима */}
        <button
          onClick={onToggleFullscreen}
          className="
            px-3 py-2
            bg-gray-300 hover:bg-gray-400 
            dark:bg-gray-600 dark:hover:bg-gray-500
            text-gray-500 dark:text-gray-400
            rounded cursor-pointer
            text-[10px]
            transition-colors
            opacity-50 hover:opacity-100
          "
          title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Развернуть на весь экран'}
        >
          <span>⤢</span>
        </button>
      </div>
    </div>
  );
}