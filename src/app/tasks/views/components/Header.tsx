'use client';

interface NavigationHeaderProps {
  isLeftPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentView?: 'list' | 'desk' | 'gantt' | 'inbox';
  onViewChange?: (view: 'list' | 'desk' | 'gantt' | 'inbox') => void;
}

export default function Header({
  isLeftPanelVisible,
  onToggleLeftPanel,
  isFullscreen,
  onToggleFullscreen,
  currentView = 'desk',
  onViewChange
}: NavigationHeaderProps) {
  const isListView = currentView === 'list';
  const isDeskView = currentView === 'desk';
  const isGanttView = currentView === 'gantt';
  const isInboxView = currentView === 'inbox';

  // Определяем заголовок на основе текущего вида
  const getTitle = () => {
    switch (currentView) {
      case 'list':
        return 'Список задач';
      case 'desk':
        return 'Канбан доска';
      case 'gantt':
        return 'Диаграмма Ганта';
      case 'inbox':
        return 'Входящие';
      default:
        return 'Задачи';
    }
  };

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
        
        {/* Заголовок с фиксированной шириной */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap w-[200px]">
          {getTitle()}
        </h1>
        
        {/* Кнопки переключения вида с одинаковой шириной */}
        {onViewChange && (
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => onViewChange('desk')}
              className={`
                w-[110px]
                px-3 py-1.5
                rounded
                text-xs font-medium
                inline-flex items-center justify-center gap-1
                transition-colors
                whitespace-nowrap
                cursor-pointer
                ${isDeskView 
                  ? 'bg-gray-500 text-white dark:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M21,2h-4h-2H9H7H3C1.3,2,0,3.3,0,5v10c0,1.7,1.3,3,3,3h4v1c0,1.7,1.3,3,3,3h4c1.7,0,3-1.3,3-3v-3h4c1.7,0,3-1.3,3-3V5  C24,3.3,22.7,2,21,2z M3,16c-0.6,0-1-0.4-1-1V5c0-0.6,0.4-1,1-1h4v12H3z M15,19c0,0.6-0.4,1-1,1h-4c-0.6,0-1-0.4-1-1v-0.9V4h6v12.2  V19z M22,13c0,0.6-0.4,1-1,1h-4V4h4c0.6,0,1,0.4,1,1V13z" fill="currentColor"></path>
              </svg>
              <span className="hidden sm:inline">Канбан</span>
            </button>
            
            <button
              onClick={() => onViewChange('list')}
              className={`
                w-[110px]
                px-3 py-1.5
                rounded
                text-xs font-medium
                inline-flex items-center justify-center gap-1
                transition-colors
                whitespace-nowrap
                cursor-pointer
                ${isListView 
                  ? 'bg-gray-500 text-white dark:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 2H3C1.346 2 0 3.346 0 5v2c0 1.654 1.346 3 3 3h2c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3Zm1 5c0 .551-.448 1-1 1H3c-.552 0-1-.449-1-1V5c0-.551.448-1 1-1h2c.552 0 1 .449 1 1v2Zm-1 7H3c-1.654 0-3 1.346-3 3v2c0 1.654 1.346 3 3 3h2c1.654 0 3-1.346 3-3v-2c0-1.654-1.346-3-3-3Zm1 5c0 .551-.448 1-1 1H3c-.552 0-1-.449-1-1v-2c0-.551.448-1 1-1h2c.552 0 1 .449 1 1v2Zm4-13a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1Zm14 12a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h12a1 1 0 0 1 1 1Z" fill="currentColor"></path>
              </svg>
              <span className="hidden sm:inline">Список</span>
            </button>
            
            <button
              onClick={() => onViewChange('gantt')}
              className={`
                w-[110px]
                px-3 py-1.5
                rounded
                text-xs font-medium
                inline-flex items-center justify-center gap-1
                transition-colors
                whitespace-nowrap
                cursor-pointer
                ${isGanttView 
                  ? 'bg-gray-500 text-white dark:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M10 7.999v2H3c-1.654 0-3-1.346-3-3v-2c0-1.654 1.346-3 3-3h7v2H3c-.552 0-1 .449-1 1v2c0 .55.448 1 1 1h7Zm-3 12c-.552 0-1-.45-1-1v-2c0-.551.448-1 1-1h3v-2H7c-1.654 0-3 1.346-3 3v2c0 1.654 1.346 3 3 3h3v-2H7Zm17-3v2c0 1.654-1.346 3-3 3h-7v1a1 1 0 1 1-2 0v-22a1 1 0 1 1 2 0v1h3c1.654 0 3 1.346 3 3v2c0 1.654-1.346 3-3 3h-3v4h7c1.654 0 3 1.346 3 3Zm-10-9h3c.552 0 1-.45 1-1v-2c0-.551-.448-1-1-1h-3v4Zm8 9c0-.551-.448-1-1-1h-7v4h7c.552 0 1-.45 1-1v-2Z" fill="currentColor"></path>
              </svg>
              <span className="hidden sm:inline">Gantt</span>
            </button>
          </div>
        )}
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