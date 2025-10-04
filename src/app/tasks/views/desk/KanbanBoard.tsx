'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { quickAddTask } from '../../actions/quickAddTask';
import { updateTaskStatus } from '../../actions/updateTaskStatus';

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
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
}

interface Status {
  id: number;
  status: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  statuses: Status[];
  onTaskClick: (task: Task) => void;
  isPending: boolean;
  companyId?: number;
  projectId?: number;
  onTaskCreated?: () => void;
  selectedTaskId?: number;
}

export default function KanbanBoard({ 
  tasks, 
  statuses, 
  onTaskClick,
  isPending,
  companyId,
  projectId,
  onTaskCreated,
  selectedTaskId
}: KanbanBoardProps) {
  const [addingToStatus, setAddingToStatus] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isActionPending, startTransition] = useTransition();
  const isSubmitting = isCreating || isActionPending;
  
  // Кастомный drag and drop
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const draggedElementRef = useRef<HTMLDivElement | null>(null);

  // Фильтруем статусы: исключаем только "На паузе" и "Отменено"
  const activeStatuses = statuses.filter(status => 
    status.status !== 'На паузе' && 
    status.status !== 'Отменено'
  );
  
  // Группируем задачи по активным статусам
  const tasksByStatus = activeStatuses.map(status => ({
    status,
    tasks: tasks.filter(task => task.statusId === status.id && task.level === 0) // Только корневые задачи
  }));

  const getPriorityColor = (priorityName?: string) => {
    switch(priorityName) {
      case 'Низкий': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Средний': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Срочный': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const handleAddTask = (statusId: number) => {
    if (!newTaskName.trim() || !companyId) return;

    setIsCreating(true);

    startTransition(async () => {
      try {
        const result = await quickAddTask({
          taskName: newTaskName.trim(),
          statusId,
          companyId,
          projectId: projectId && projectId > 0 ? projectId : undefined
        });

        if (result?.success) {
          setNewTaskName('');
          setAddingToStatus(null);
          if (onTaskCreated) {
            await onTaskCreated();
          }
        } else if (result?.error) {
          console.error('Error creating task:', result.error);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      } finally {
        setIsCreating(false);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask(statusId);
    } else if (e.key === 'Escape') {
      setAddingToStatus(null);
      setNewTaskName('');
    }
  };

  // Кастомный drag and drop
  const handleMouseDown = (e: React.MouseEvent, task: Task) => {
    // Только левая кнопка мыши
    if (e.button !== 0) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setDraggedTask(task);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    // Сохраняем размеры элемента
    draggedElementRef.current = target.cloneNode(true) as HTMLDivElement;
    draggedElementRef.current.style.width = rect.width + 'px';
    
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({
        x: e.clientX,
        y: e.clientY
      });

      // Определяем, над какой колонкой находимся
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const column = elements.find(el => el.hasAttribute('data-status-id'));
      
      if (column) {
        const statusId = parseInt(column.getAttribute('data-status-id') || '0');
        setDragOverStatus(statusId);
      } else {
        setDragOverStatus(null);
      }
    };

    const handleMouseUp = async () => {
      if (draggedTask && dragOverStatus && draggedTask.statusId !== dragOverStatus) {
        startTransition(async () => {
          const result = await updateTaskStatus(draggedTask.id, dragOverStatus);
          
          if (result?.success) {
            if (onTaskCreated) {
              await onTaskCreated();
            }
          } else if (result?.error) {
            console.error('Error updating task status:', result.error);
          }
        });
      }
      
      setIsDragging(false);
      setDraggedTask(null);
      setDragOverStatus(null);
      draggedElementRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedTask, dragOverStatus, onTaskCreated]);

  return (
    <div className="h-full w-full overflow-x-auto">
      <div 
        className="h-full p-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeStatuses.length}, minmax(240px, 1fr))`,
          gap: '1rem',
          gridAutoFlow: 'column',
          gridTemplateRows: '1fr',
        }}
      >
        {tasksByStatus.map(({ status, tasks: statusTasks }) => (
          <div 
            key={status.id}
            data-status-id={status.id}
            className={`flex flex-col rounded-lg transition-colors min-w-[240px] overflow-hidden ${
              dragOverStatus === status.id
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {/* Заголовок колонки */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {status.status}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {statusTasks.length}
                </span>
              </div>
            </div>

            {/* Список задач */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {isPending && statusTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
                </div>
              ) : statusTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  Нет задач
                </div>
              ) : (
                statusTasks.map(task => (
                  <div
                    key={task.id}
                    onMouseDown={(e) => handleMouseDown(e, task)}
                    onClick={() => !isDragging && onTaskClick(task)}
                    className={`
                      bg-white dark:bg-gray-700 
                      p-4 rounded-lg shadow-sm
                      border-2
                      hover:shadow-md
                      cursor-pointer
                      transition-all duration-200
                      select-none
                      ${
                        draggedTask?.id === task.id && isDragging
                          ? 'opacity-30'
                          : selectedTaskId === task.id
                            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }
                    `}
                  >
                    {/* Название задачи */}
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {task.taskName}
                    </h4>

                    {/* Приоритет */}
                    {task.priorityName && (
                      <div className="mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priorityName)}`}>
                          {task.priorityName}
                        </span>
                      </div>
                    )}

                    {/* Дедлайн и исполнитель */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      {task.dedline && (
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDate(task.dedline)}</span>
                        </div>
                      )}
                      {task.executorName && (
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span className="truncate max-w-[100px]">{task.executorName}</span>
                        </div>
                      )}
                    </div>

                    {/* Подзадачи */}
                    {task.hasChildren && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        📋 Есть подзадачи
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Форма добавления задачи */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              {addingToStatus === status.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, status.id)}
                    placeholder="Напишите название задачи"
                    autoFocus
                    disabled={isSubmitting}
                    className="
                      w-full px-3 py-2
                      text-sm
                      bg-white dark:bg-gray-700
                      border border-gray-300 dark:border-gray-600
                      rounded
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:opacity-50
                    "
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(status.id)}
                      disabled={!newTaskName.trim() || isSubmitting}
                      className="
                        px-3 py-1.5
                        text-sm text-white
                        bg-blue-600 hover:bg-blue-700
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        rounded
                        transition-colors
                      "
                    >
                      {isSubmitting ? 'Создание...' : 'Добавить задачу'}
                    </button>
                    <button
                      onClick={() => {
                        setAddingToStatus(null);
                        setNewTaskName('');
                      }}
                      disabled={isSubmitting}
                      className="
                        px-3 py-1.5
                        text-sm text-gray-700 dark:text-gray-300
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        rounded
                        transition-colors
                      "
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingToStatus(status.id)}
                  disabled={!companyId || isSubmitting}
                  className="
                    w-full px-3 py-2 
                    text-sm text-gray-700 dark:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    rounded
                    transition-colors
                    flex items-center gap-2
                  "
                  title={!companyId ? 'Выберите компанию для добавления задачи' : ''}
                >
                  <span className="text-lg">+</span>
                  <span>Добавить задачу</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Плавающая карточка при перетаскивании */}
      {isDragging && draggedTask && draggedElementRef.current && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x - dragOffset.x,
            top: dragPosition.y - dragOffset.y,
            pointerEvents: 'none',
            zIndex: 10000,
            width: draggedElementRef.current.style.width,
            transform: 'rotate(3deg)',
            transition: 'none'
          }}
          className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-2xl border-2 border-blue-500"
        >
          {/* Название задачи */}
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {draggedTask.taskName}
          </h4>

          {/* Приоритет */}
          {draggedTask.priorityName && (
            <div className="mb-2">
              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(draggedTask.priorityName)}`}>
                {draggedTask.priorityName}
              </span>
            </div>
          )}

          {/* Дедлайн и исполнитель */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            {draggedTask.dedline && (
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{formatDate(draggedTask.dedline)}</span>
              </div>
            )}
            {draggedTask.executorName && (
              <div className="flex items-center gap-1">
                <span>👤</span>
                <span className="truncate max-w-[100px]">{draggedTask.executorName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
