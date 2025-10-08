'use client';

import { useState, useRef, useEffect } from 'react';

type GroupBy = 'status' | 'executor' | 'creator' | 'priority' | 'importance' | 'none';

interface TaskColumn {
  key: keyof Task | 'statusName' | 'priorityName' | 'executorName';
  label: string;
  sortable: boolean;
  filterable: boolean;
  groupable: boolean;
  visible: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
}

interface Task {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  orderInStatus?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number;
  companyId?: number;
  projectId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
}

// Конфигурация колонок на основе реальных полей Task
const TASK_COLUMNS: Record<string, TaskColumn> = {
  taskName: { key: 'taskName', label: 'Название задачи', sortable: true, filterable: true, groupable: false, visible: true, type: 'string' },
  description: { key: 'description', label: 'Описание', sortable: true, filterable: true, groupable: false, visible: false, type: 'string' },
  statusName: { key: 'statusName', label: 'Этап', sortable: true, filterable: true, groupable: true, visible: true, type: 'string' },
  priorityName: { key: 'priorityName', label: 'Приоритет', sortable: true, filterable: true, groupable: true, visible: true, type: 'string' },
  orderInStatus: { key: 'orderInStatus', label: 'Важность', sortable: true, filterable: false, groupable: true, visible: false, type: 'number' },
  startDate: { key: 'startDate', label: 'Дата начала', sortable: true, filterable: true, groupable: false, visible: false, type: 'date' },
  dedline: { key: 'dedline', label: 'Срок выполнения', sortable: true, filterable: true, groupable: false, visible: true, type: 'date' },
  executorName: { key: 'executorName', label: 'Исполнитель', sortable: true, filterable: true, groupable: true, visible: true, type: 'string' },
  dtc: { key: 'dtc', label: 'Дата создания', sortable: true, filterable: true, groupable: false, visible: false, type: 'date' },
  dtu: { key: 'dtu', label: 'Дата обновления', sortable: true, filterable: true, groupable: false, visible: false, type: 'date' },
};

interface Filters {
  incompleted: boolean;
  completed: boolean;
  myTasks: boolean;
  dueDateThisWeek: boolean;
  dueDateNextWeek: boolean;
}

interface TaskControlPanelProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  visibleColumns: Record<string, boolean>;
  onVisibleColumnsChange: (columns: Record<string, boolean>) => void;
}

export default function TaskControlPanel({
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  filters,
  onFiltersChange,
  visibleColumns,
  onVisibleColumnsChange,
}: TaskControlPanelProps) {
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
        setIsGroupMenuOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGroupLabel = () => {
    switch (groupBy) {
      case 'status': return 'Этап';
      case 'executor': return 'Исполнитель';
      case 'creator': return 'Кем создано';
      case 'priority': return 'Приоритет';
      case 'importance': return 'Важность';
      case 'none': return 'Без группировки';
      default: return 'Группировка';
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const getGroupableColumns = () => {
    return Object.entries(TASK_COLUMNS).filter(([_, config]) => config.groupable);
  };

  return (
    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Поиск */}
        <div className="relative flex-1 max-w-md">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Фильтр */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              title="Фильтр"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              <span>Фильтр</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {getActiveFiltersCount()}
                </span>
              )}
              <svg className={`w-3 h-3 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* Выпадающее меню фильтров */}
            {isFilterMenuOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Фильтры</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Быстрые фильтры</p>
                </div>

                <div className="px-4 py-2 space-y-2">
                  {/* Незавершенные задачи */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                    <input
                      type="checkbox"
                      checked={filters.incompleted}
                      onChange={(e) => onFiltersChange({ ...filters, incompleted: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Незавершенные задачи</span>
                  </label>

                  {/* Завершенные задачи */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                    <input
                      type="checkbox"
                      checked={filters.completed}
                      onChange={(e) => onFiltersChange({ ...filters, completed: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Завершенные задачи</span>
                  </label>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  {/* Только мои задачи */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                    <input
                      type="checkbox"
                      checked={filters.myTasks}
                      onChange={(e) => onFiltersChange({ ...filters, myTasks: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Только мои задачи</span>
                  </label>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Срок выполнения</p>

                  {/* Срок выполнения — на этой неделе */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                    <input
                      type="checkbox"
                      checked={filters.dueDateThisWeek}
                      onChange={(e) => onFiltersChange({ ...filters, dueDateThisWeek: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Срок выполнения — на этой неделе</span>
                  </label>

                  {/* Срок выполнения — на следующей неделе */}
                  <label className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                    <input
                      type="checkbox"
                      checked={filters.dueDateNextWeek}
                      onChange={(e) => onFiltersChange({ ...filters, dueDateNextWeek: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Срок выполнения — на следующей неделе</span>
                  </label>
                </div>

                {/* Кнопка очистки фильтров */}
                {hasActiveFilters && (
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => onFiltersChange({
                        incompleted: false,
                        completed: false,
                        myTasks: false,
                        dueDateThisWeek: false,
                        dueDateNextWeek: false,
                      })}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      Очистить все фильтры
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Группировка */}
          <div className="relative" ref={groupMenuRef}>
            <button
              onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              title="Группировка"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
              <span>{getGroupLabel()}</span>
              <svg className={`w-3 h-3 transition-transform ${isGroupMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* Выпадающее меню группировки */}
            {isGroupMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => {
                    onGroupByChange('none');
                    setIsGroupMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    groupBy === 'none' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  <span>Без группировки</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                {/* Динамический список группируемых колонок */}
                {getGroupableColumns().map(([key, config]) => {
                  const groupByKey = key === 'statusName' ? 'status' : 
                                   key === 'executorName' ? 'executor' :
                                   key === 'userId' ? 'creator' :
                                   key === 'priorityName' ? 'priority' :
                                   key === 'orderInStatus' ? 'importance' : key as GroupBy;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onGroupByChange(groupByKey);
                        setIsGroupMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                        groupBy === groupByKey ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7"/>
                      </svg>
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Управление колонками */}
          <div className="relative" ref={columnMenuRef}>
            <button
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              title="Настройка колонок"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
              <span>Колонки</span>
            </button>

            {/* Выпадающее меню управления колонками */}
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Показать колонки</h3>
                </div>
                
                <div className="px-4 py-2 space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(TASK_COLUMNS).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns[key] || false}
                        onChange={(e) => onVisibleColumnsChange({
                          ...visibleColumns,
                          [key]: e.target.checked
                        })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}