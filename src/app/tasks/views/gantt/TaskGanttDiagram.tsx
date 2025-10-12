'use client';

import { useMemo, useState, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StatusTask } from '@/app/projects/actions/statusActions';
import { Task as GanttTask, ViewMode } from './types/public-types';
import { updateTaskDates, updateTaskProgress, deleteTask } from './actions';
import TimeScaleControls from './components/TimeScaleControls';

// Динамический импорт Gantt компонента
const GanttChart = dynamic(() => import('./GanttChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ),
});

interface Task {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
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
  orderInStatus?: number;
}

interface TaskGanttDiagramProps {
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

export default function TaskGanttDiagram({
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
}: TaskGanttDiagramProps) {
  const [isUpdating, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [showTaskList, setShowTaskList] = useState(true);

  // Восстанавливаем сохранённый масштаб и состояние списка задач при загрузке
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('gantt_view_mode') as ViewMode;
      if (savedViewMode && Object.values(ViewMode).includes(savedViewMode)) {
        setViewMode(savedViewMode);
      }

      const savedShowTaskList = localStorage.getItem('gantt_show_task_list');
      if (savedShowTaskList !== null) {
        setShowTaskList(savedShowTaskList === 'true');
      }
    } catch (error) {
      console.warn('Не удалось загрузить сохранённые настройки:', error);
    }
  }, []);

  // Рассчитываем доступную высоту для Gantt диаграммы
  useEffect(() => {
    const updateHeight = () => {
      const container = document.getElementById('gantt-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        // В полноэкранном режиме используем всю доступную высоту контейнера
        // В обычном режиме также используем доступную высоту (уже ограничена в TaskViewLayout)
        setAvailableHeight(rect.height);
      }
    };

    // Обновляем высоту сразу и при изменении размера окна
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // ResizeObserver для отслеживания изменений размера контейнера
    const container = document.getElementById('gantt-container');
    let resizeObserver: ResizeObserver | null = null;
    
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(container);
    }
    
    // Также обновляем при смене режима (небольшая задержка для завершения анимации)
    const timeoutId = setTimeout(updateHeight, 150);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timeoutId);
    };
  }, []); // Убираем зависимости, так как они могут вызывать лишние пересчеты

  // Функция для переключения отображения списка задач
  const toggleTaskList = () => {
    const newShowTaskList = !showTaskList;
    setShowTaskList(newShowTaskList);
    localStorage.setItem('gantt_show_task_list', newShowTaskList.toString());
  };

  // Функция для определения оптимальной ширины колонки в зависимости от масштаба
  const getColumnWidth = (mode: ViewMode): number => {
    switch (mode) {
      case ViewMode.Hour:
        return 30;
      case ViewMode.QuarterDay:
        return 60;
      case ViewMode.HalfDay:
        return 80;
      case ViewMode.Day:
        return 65;
      case ViewMode.Week:
        return 100;
      case ViewMode.Month:
        return 120;
      case ViewMode.QuarterYear:
        return 160;
      case ViewMode.Year:
        return 200;
      default:
        return 65;
    }
  };

  // Преобразуем Task[] в формат GanttTask[]
  const ganttTasks = useMemo<GanttTask[]>(() => {
    // Фильтруем задачи с датами
    const tasksWithDates = tasks.filter(task => task.startDate && task.dedline);
    
    // Сортируем задачи (можно выбрать один из вариантов):
    const sortedTasks = tasksWithDates.sort((a, b) => {
      // Вариант 1: По дате начала (раньше начинается = выше в списке)
      return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime();
      
      // Вариант 2: По ID (меньший ID = выше)
      // return a.id - b.id;
      
      // Вариант 3: По названию (алфавитный порядок)
      // return a.taskName.localeCompare(b.taskName, 'ru');
      
      // Вариант 4: По статусу (stepOrder)
      // return (statuses.find(s => s.id === a.statusId)?.stepOrder || 999) - 
      //        (statuses.find(s => s.id === b.statusId)?.stepOrder || 999);
      
      // Вариант 5: По приоритету (если есть)
      // return (a.priorityId || 999) - (b.priorityId || 999);
    });
    
    console.log('📊 Gantt Tasks Debug:', {
      totalTasks: tasks.length,
      tasksWithDates: sortedTasks.length,
      sampleTask: tasks[0] ? {
        id: tasks[0].id,
        name: tasks[0].taskName,
        startDate: tasks[0].startDate,
        dedline: tasks[0].dedline,
      } : null,
    });
    
    return sortedTasks.map(task => {
      const start = new Date(task.startDate!);
      const end = new Date(task.dedline!);
      
      // Рассчитываем прогресс на основе stepOrder статуса
      const status = statuses.find(s => s.id === task.statusId);
      const maxStep = Math.max(...statuses.map(s => s.stepOrder), 1);
      const progress = status ? Math.round((status.stepOrder / maxStep) * 100) : 0;

      return {
        id: String(task.id),
        name: task.taskName,
        start,
        end,
        type: 'task' as const,
        progress,
        isDisabled: false,
        displayOrder: task.orderInStatus || task.id, // Порядок отображения
        styles: {
          backgroundColor: getStatusColor(task.statusId, statuses),
          backgroundSelectedColor: getStatusColor(task.statusId, statuses, 0.8),
          progressColor: '#10b981',
          progressSelectedColor: '#059669',
        },
        // Если есть parentId — это зависимость
        ...(task.parentId && { dependencies: [String(task.parentId)] }),
      };
    });
  }, [tasks, statuses]);

  // Показываем loader во время загрузки
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  // Если нет задач с датами
  if (ganttTasks.length === 0) {
    // Подсчитываем задачи с частичными датами
    const tasksWithStartDate = tasks.filter(t => t.startDate).length;
    const tasksWithDeadline = tasks.filter(t => t.dedline).length;
    
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-8 max-w-2xl">
          {/* Иконка */}
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          
          {/* Заголовок */}
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Нет задач для отображения
          </h3>
          
          {/* Описание */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Для отображения на диаграмме Ганта задачи должны иметь <strong>дату начала</strong> и <strong>дату окончания (дедлайн)</strong>
          </p>

          {/* Детальная статистика */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="text-gray-500 dark:text-gray-400 mb-1">Всего задач:</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{tasks.length}</div>
              </div>
              <div className="text-left">
                <div className="text-gray-500 dark:text-gray-400 mb-1">С обеими датами:</div>
                <div className="text-xl font-semibold text-green-600 dark:text-green-400">{ganttTasks.length}</div>
              </div>
              <div className="text-left">
                <div className="text-gray-500 dark:text-gray-400 mb-1">С датой начала:</div>
                <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{tasksWithStartDate}</div>
              </div>
              <div className="text-left">
                <div className="text-gray-500 dark:text-gray-400 mb-1">С дедлайном:</div>
                <div className="text-lg font-medium text-amber-600 dark:text-amber-400">{tasksWithDeadline}</div>
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
            💡 <strong>Подсказка:</strong> Откройте задачу в режиме редактирования и заполните поля "Дата начала" и "Дедлайн"
          </div>
        </div>
      </div>
    );
  }

  // Рендерим диаграмму Ганта
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Панель управления */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          
          <button
            onClick={toggleTaskList}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer
                      bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border 
                      border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'`}
            title={showTaskList ? 'Скрыть список задач' : 'Показать список задач'}
          >
            {showTaskList ? 'Скрыть' : 'Показать'}
          </button>

          <div className="flex items-center gap-4">           
            {ganttTasks.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>👥 Компания ID: {companyId || 'Все'}</span>
                <span>📍 Проект ID: {projectId || 'Все'}</span>
              </div>
            )}
          </div>
          
          <TimeScaleControls
            currentViewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          

        </div>
      </div>

      {/* Диаграмма Ганта */}
      <div className="flex-1 overflow-hidden" id="gantt-container">
        <GanttChart
          tasks={ganttTasks}
          viewMode={viewMode}
          locale="ru-RU"
          ganttHeight={availableHeight > 70 ? availableHeight - 70 : 0} // Вычитаем примерную высоту панели управления
          columnWidth={getColumnWidth(viewMode)}
          listCellWidth={showTaskList ? "155px" : ""} // Управляем отображением списка задач
          rowHeight={50}
          barCornerRadius={4}
          fontFamily="var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)"
          fontSize="14px"
          todayColor="rgba(59, 130, 246, 0.1)" // Синий оттенок для "сегодня"
          // Callbacks
          onDoubleClick={(task) => {
            const originalTask = tasks.find(t => String(t.id) === task.id);
            if (originalTask && onTaskClick) {
              onTaskClick(originalTask);
            }
          }}
          onDateChange={async (task, children) => {
            const taskId = parseInt(task.id);
            const startDate = task.start.toISOString().split('T')[0];
            const dedline = task.end.toISOString().split('T')[0];
            
            console.log('📅 Date changed:', { taskId, startDate, dedline });
            
            startTransition(async () => {
              const result = await updateTaskDates(taskId, startDate, dedline);
              
              if (result.success) {
                console.log('✅ Dates saved successfully');
              } else {
                console.error('❌ Failed to save dates:', result.error);
                alert('Ошибка сохранения дат: ' + result.error);
              }
            });
          }}
          onProgressChange={async (task, children) => {
            const taskId = parseInt(task.id);
            const progress = task.progress;
            
            console.log('📊 Progress changed:', { taskId, progress });
            
            startTransition(async () => {
              const result = await updateTaskProgress(taskId, progress, statuses);
              
              if (result.success) {
                console.log('✅ Progress saved successfully, new status:', result.newStatusId);
              } else {
                console.error('❌ Failed to save progress:', result.error);
                alert('Ошибка сохранения прогресса: ' + result.error);
              }
            });
          }}
          onDelete={async (task) => {
            const taskId = parseInt(task.id);
            const confirmed = confirm(`Удалить задачу "${task.name}"?`);
            
            if (!confirmed) return false;
            
            console.log('🗑️ Deleting task:', taskId);
            
            startTransition(async () => {
              const result = await deleteTask(taskId);
              
              if (result.success) {
                console.log('✅ Task deleted successfully');
                if (onTaskDeleted) {
                  onTaskDeleted(taskId);
                }
              } else {
                console.error('❌ Failed to delete task:', result.error);
                alert('Ошибка удаления задачи: ' + result.error);
              }
            });
            
            // Возвращаем true для подтверждения удаления в UI
            return true;
          }}
          onClick={(task) => {
            const originalTask = tasks.find(t => String(t.id) === task.id);
            if (originalTask && onTaskClick) {
              onTaskClick(originalTask);
            }
          }}
        />
      </div>
    </div>
  );
}

// Вспомогательная функция для получения цвета статуса
function getStatusColor(statusId: number, statuses: StatusTask[], opacity: number = 1): string {
  const status = statuses.find(s => s.id === statusId);
  if (!status) return `rgba(156, 163, 175, ${opacity})`; // gray-400
  
  // Цветовая палитра на основе stepOrder
  const colors = [
    [59, 130, 246],   // blue-500
    [139, 92, 246],   // violet-500
    [16, 185, 129],   // green-500
    [245, 158, 11],   // amber-500
    [239, 68, 68],    // red-500
    [236, 72, 153],   // pink-500
    [14, 165, 233],   // sky-500
    [132, 204, 22],   // lime-500
  ];
  
  const colorIndex = status.stepOrder % colors.length;
  const [r, g, b] = colors[colorIndex];
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
