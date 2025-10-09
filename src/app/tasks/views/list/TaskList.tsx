'use client';

import { StatusTask } from '@/app/projects/actions/statusActions';
import { useState, useEffect } from 'react';
import TaskControlPanel from './TaskControlPanel';

type GroupBy = 'status' | 'executor' | 'creator' | 'priority' | 'importance' | 'none';

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

interface TaskListProps {
  tasks: Task[];
  statuses: StatusTask[];
  onTaskClick?: (task: Task) => void;
  isPending?: boolean;
  companyId?: number;
  projectId?: number;
  onTaskCreated?: () => void;
  selectedTaskId?: number;
  onTaskDeleted?: (taskId: number) => void;
  currentUserId?: number;
}

interface Filters {
  incompleted: boolean;
  completed: boolean;
  myTasks: boolean;
  dueDateThisWeek: boolean;
  dueDateNextWeek: boolean;
}

export default function TaskList({ 
  tasks,
  statuses,
  onTaskClick,
  isPending = false,
  companyId,
  projectId,
  onTaskCreated,
  selectedTaskId,
  onTaskDeleted,
  currentUserId
}: TaskListProps) {
  // Состояния панели управления
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskListGroupBy');
      return (saved as GroupBy) || 'status';
    }
    return 'status';
  });
  
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskListSortBy');
      return saved || 'none';
    }
    return 'none';
  });
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskListSortOrder');
      return (saved as 'asc' | 'desc') || 'asc';
    }
    return 'asc';
  });
  
  const [filters, setFilters] = useState<Filters>({
    incompleted: false,
    completed: false,
    myTasks: false,
    dueDateThisWeek: false,
    dueDateNextWeek: false,
  });

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskListVisibleColumns');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      taskName: true,
      statusName: true,
      executorName: true,
      dedline: true,
      priorityName: true,
    };
  });

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Сохранение настроек в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskListGroupBy', groupBy);
    }
  }, [groupBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskListSortBy', sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskListSortOrder', sortOrder);
    }
  }, [sortOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskListVisibleColumns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Функция поиска
  const searchTasks = (tasksToSearch: Task[]) => {
    if (!searchTerm.trim()) return tasksToSearch;
    
    const lowerSearch = searchTerm.toLowerCase();
    return tasksToSearch.filter(task => 
      task.taskName.toLowerCase().includes(lowerSearch) ||
      (task.description && task.description.toLowerCase().includes(lowerSearch)) ||
      (task.executorName && task.executorName.toLowerCase().includes(lowerSearch))
    );
  };

  // Функция фильтрации задач
  const filterTasks = (tasksToFilter: Task[]) => {
    let filtered = [...tasksToFilter];

    if (filters.incompleted) {
      filtered = filtered.filter(task => task.statusName !== 'Готово' && task.statusName !== 'Завершено');
    }

    if (filters.completed) {
      filtered = filtered.filter(task => task.statusName === 'Готово' || task.statusName === 'Завершено');
    }

    if (filters.myTasks && currentUserId) {
      // Фильтруем задачи, где текущий пользователь является исполнителем
      filtered = filtered.filter(task => task.executorId === currentUserId);
    }

    if (filters.dueDateThisWeek) {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + (7 - now.getDay()));
      
      filtered = filtered.filter(task => {
        if (!task.dedline) return false;
        const dedline = new Date(task.dedline);
        return dedline <= weekEnd;
      });
    }

    if (filters.dueDateNextWeek) {
      const now = new Date();
      const nextWeekStart = new Date(now);
      nextWeekStart.setDate(now.getDate() + (7 - now.getDay()) + 1);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      
      filtered = filtered.filter(task => {
        if (!task.dedline) return false;
        const dedline = new Date(task.dedline);
        return dedline >= nextWeekStart && dedline <= nextWeekEnd;
      });
    }

    return filtered;
  };

  // Функция сортировки задач
  const sortTasks = (tasksToSort: Task[]) => {
    if (sortBy === 'none') return tasksToSort;

    const sorted = [...tasksToSort].sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'taskName':
          compareResult = a.taskName.localeCompare(b.taskName);
          break;
        case 'description':
          compareResult = (a.description || '').localeCompare(b.description || '');
          break;
        case 'statusName':
          compareResult = a.statusName.localeCompare(b.statusName);
          break;
        case 'statusId':
          compareResult = a.statusId - b.statusId;
          break;
        case 'priorityName': {
          const priorityOrder: Record<string, number> = {
            'Срочный': 4,
            'Высокий': 3,
            'Средний': 2,
            'Низкий': 1,
          };
          const priorityA = priorityOrder[a.priorityName || ''] || 0;
          const priorityB = priorityOrder[b.priorityName || ''] || 0;
          compareResult = priorityA - priorityB;
          break;
        }
        case 'priorityId':
          compareResult = (a.priorityId || 0) - (b.priorityId || 0);
          break;
        case 'orderInStatus':
          compareResult = (a.orderInStatus || 0) - (b.orderInStatus || 0);
          break;
        case 'startDate': {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          compareResult = dateA - dateB;
          break;
        }
        case 'dedline': {
          const dateA = a.dedline ? new Date(a.dedline).getTime() : 0;
          const dateB = b.dedline ? new Date(b.dedline).getTime() : 0;
          compareResult = dateA - dateB;
          break;
        }
        case 'executorName':
          compareResult = (a.executorName || '').localeCompare(b.executorName || '');
          break;
        case 'executorId':
          compareResult = (a.executorId || 0) - (b.executorId || 0);
          break;
        case 'userId':
          compareResult = (a.userId || 0) - (b.userId || 0);
          break;
        case 'dtc': {
          const dateA = new Date(a.dtc).getTime();
          const dateB = new Date(b.dtc).getTime();
          compareResult = dateA - dateB;
          break;
        }
        case 'dtu': {
          const dateA = a.dtu ? new Date(a.dtu).getTime() : 0;
          const dateB = b.dtu ? new Date(b.dtu).getTime() : 0;
          compareResult = dateA - dateB;
          break;
        }
        case 'companyId':
          compareResult = (a.companyId || 0) - (b.companyId || 0);
          break;
        case 'projectId':
          compareResult = (a.projectId || 0) - (b.projectId || 0);
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return sorted;
  };

  // Функция группировки задач
  // Pipeline: поиск → фильтрация → сортировка → группировка
  const groupTasks = () => {
    const searchedTasks = searchTasks(tasks);
    const filteredTasksList = filterTasks(searchedTasks);
    const sortedTasksList = sortTasks(filteredTasksList);
    
    if (groupBy === 'none') {
      return { 'Все задачи': sortedTasksList };
    }

    return sortedTasksList.reduce((acc, task) => {
      let key: string;
      
      switch (groupBy) {
        case 'status': {
          // Используем statusId для получения актуального названия из справочника
          const status = statuses.find(s => s.id === task.statusId);
          key = status?.status || 'Без статуса';
          break;
        }
        case 'executor':
          key = task.executorName || 'Без исполнителя';
          break;
        case 'creator':
          key = task.userId ? `Пользователь ${task.userId}` : 'Без автора';
          break;
        case 'priority':
          key = task.priorityName || 'Без приоритета';
          break;
        case 'importance':
          key = task.orderInStatus !== undefined ? `Важность ${task.orderInStatus}` : 'Без важности';
          break;
        default:
          key = 'Прочее';
      }
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const groupedTasks = groupTasks();
  
  // Сортируем группы: для статусов — по stepOrder, для остальных — по алфавиту
  const groupKeys = Object.keys(groupedTasks).sort((a, b) => {
    if (groupBy === 'status') {
      // Сортируем статусы по stepOrder из справочника
      const statusA = statuses.find(s => s.status === a);
      const statusB = statuses.find(s => s.status === b);
      return (statusA?.stepOrder || 999) - (statusB?.stepOrder || 999);
    }
    // Для остальных группировок — по алфавиту
    return a.localeCompare(b);
  });

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getPriorityColor = (priorityName?: string) => {
    switch(priorityName) {
      case 'Низкий': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Средний': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Высокий': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Срочный': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Обработчик клика по заголовку столбца для сортировки
  const handleColumnSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      // Если уже сортируем по этому столбцу — меняем направление
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Новый столбец — сортируем по возрастанию
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  // Рендер иконки сортировки
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      // Неактивная сортировка — серая двойная стрелка
      return (
        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
      );
    }
    
    // Активная сортировка — показываем направление
    return sortOrder === 'asc' ? (
      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
      </svg>
    ) : (
      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
      </svg>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Панель управления */}
      <TaskControlPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        filters={filters}
        onFiltersChange={setFilters}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      {/* Основной контент со скроллом */}
      <div className="flex-1 overflow-auto">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Загрузка задач...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Нет задач
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Задачи появятся здесь после создания
            </p>
          </div>
        ) : groupKeys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ничего не найдено
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Попробуйте изменить фильтры или поисковый запрос
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Заголовки таблицы */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4 px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="w-8 flex-shrink-0"></div> {/* Чекбокс */}
                
                {visibleColumns.taskName && (
                  <button 
                    onClick={() => handleColumnSort('taskName')}
                    className="flex-1 min-w-[200px] flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Название</span>
                    {renderSortIcon('taskName')}
                  </button>
                )}
                
                {visibleColumns.description && (
                  <button 
                    onClick={() => handleColumnSort('description')}
                    className="flex-1 min-w-[200px] flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Описание</span>
                    {renderSortIcon('description')}
                  </button>
                )}
                
                {visibleColumns.statusName && (
                  <button 
                    onClick={() => handleColumnSort('statusName')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Этап</span>
                    {renderSortIcon('statusName')}
                  </button>
                )}
                
                {visibleColumns.executorName && (
                  <button 
                    onClick={() => handleColumnSort('executorName')}
                    className="w-40 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Исполнитель</span>
                    {renderSortIcon('executorName')}
                  </button>
                )}
                
                {visibleColumns.priorityName && (
                  <button 
                    onClick={() => handleColumnSort('priorityName')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Приоритет</span>
                    {renderSortIcon('priorityName')}
                  </button>
                )}
                
                {visibleColumns.orderInStatus && (
                  <button 
                    onClick={() => handleColumnSort('orderInStatus')}
                    className="w-24 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Важность</span>
                    {renderSortIcon('orderInStatus')}
                  </button>
                )}
                
                {visibleColumns.startDate && (
                  <button 
                    onClick={() => handleColumnSort('startDate')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Дата начала</span>
                    {renderSortIcon('startDate')}
                  </button>
                )}
                
                {visibleColumns.dedline && (
                  <button 
                    onClick={() => handleColumnSort('dedline')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Срок</span>
                    {renderSortIcon('dedline')}
                  </button>
                )}
                
                {visibleColumns.dtc && (
                  <button 
                    onClick={() => handleColumnSort('dtc')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Создано</span>
                    {renderSortIcon('dtc')}
                  </button>
                )}
                
                {visibleColumns.dtu && (
                  <button 
                    onClick={() => handleColumnSort('dtu')}
                    className="w-32 flex-shrink-0 flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
                  >
                    <span>Обновлено</span>
                    {renderSortIcon('dtu')}
                  </button>
                )}
              </div>
            </div>

            {/* Тело таблицы */}
            <div>
              {groupKeys.map((groupKey) => {
                const groupTasks = groupedTasks[groupKey] || [];
                const isCollapsed = collapsedSections[groupKey];
                
                return (
                  <div key={groupKey}>
                    {/* Заголовок секции группы - показываем только если есть группировка */}
                    {groupBy !== 'none' && (
                      <button
                        onClick={() => toggleSection(groupKey)}
                        className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3 px-6 py-3">
                          <svg 
                            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${
                              isCollapsed ? '-rotate-90' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {groupKey}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {groupTasks.length}
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Строки задач */}
                    {!isCollapsed && groupTasks.map((task: Task) => (
                      <div
                        key={task.id}
                        className={`flex gap-4 px-6 py-3 border-b cursor-pointer transition-colors group ${
                          selectedTaskId === task.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                            : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                        onClick={() => onTaskClick?.(task)}
                      >
                        {/* Чекбокс */}
                        <div className="w-8 flex-shrink-0 flex items-center">
                          <button 
                            className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        </div>

                        {/* Название задачи */}
                        {visibleColumns.taskName && (
                          <div className="flex-1 min-w-[200px] flex items-center">
                            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                              {task.taskName}
                            </span>
                          </div>
                        )}

                        {/* Описание */}
                        {visibleColumns.description && (
                          <div className="flex-1 min-w-[200px] flex items-center">
                            {task.description ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {task.description}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Этап */}
                        {visibleColumns.statusName && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {task.statusName}
                            </span>
                          </div>
                        )}

                        {/* Исполнитель */}
                        {visibleColumns.executorName && (
                          <div className="w-40 flex-shrink-0 flex items-center">
                            {task.executorName ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {task.executorName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Приоритет */}
                        {visibleColumns.priorityName && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            {task.priorityName ? (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priorityName)}`}>
                                {task.priorityName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Важность */}
                        {visibleColumns.orderInStatus && (
                          <div className="w-24 flex-shrink-0 flex items-center">
                            {task.orderInStatus !== undefined ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {task.orderInStatus}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Дата начала */}
                        {visibleColumns.startDate && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            {task.startDate ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(task.startDate).toLocaleDateString('ru-RU', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Срок выполнения */}
                        {visibleColumns.dedline && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            {task.dedline ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(task.dedline).toLocaleDateString('ru-RU', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}

                        {/* Дата создания */}
                        {visibleColumns.dtc && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(task.dtc).toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Дата обновления */}
                        {visibleColumns.dtu && (
                          <div className="w-32 flex-shrink-0 flex items-center">
                            {task.dtu ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(task.dtu).toLocaleDateString('ru-RU', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Кнопка добавления задачи - показываем только если есть группировка */}
                    {!isCollapsed && groupBy !== 'none' && (
                      <button
                        className="w-full px-6 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-gray-800"
                        onClick={() => onTaskCreated?.()}
                      >
                        <svg className="w-4 h-4 ml-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Добавить задачу
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
