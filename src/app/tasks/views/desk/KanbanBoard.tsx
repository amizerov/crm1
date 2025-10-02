'use client';

import { useState } from 'react';

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
  onTaskCreated?: () => void;
}

export default function KanbanBoard({ 
  tasks, 
  statuses, 
  onTaskClick,
  isPending,
  companyId,
  onTaskCreated
}: KanbanBoardProps) {
  const [addingToStatus, setAddingToStatus] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  // Фильтруем статусы: исключаем "Готово" и все статусы после него
  const activeStatuses = statuses.filter(status => 
    status.status !== 'Готово' && 
    status.status !== 'Отменено' && 
    status.status !== 'Караул'
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

  const handleAddTask = async (statusId: number) => {
    if (!newTaskName.trim() || !companyId) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/tasks/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName: newTaskName.trim(),
          statusId,
          companyId
        })
      });

      if (response.ok) {
        setNewTaskName('');
        setAddingToStatus(null);
        // Вызываем обновление задач
        if (onTaskCreated) {
          await onTaskCreated();
        }
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreating(false);
    }
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

  return (
    <div className="h-full w-full p-4 overflow-hidden">
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {tasksByStatus.map(({ status, tasks: statusTasks }) => (
          <div 
            key={status.id}
            className="flex-shrink-0 h-full flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg"
            style={{ width: 'calc((100% - 64px) / 5)' }}
          >
            {/* Заголовок колонки */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    onClick={() => onTaskClick(task)}
                    className="
                      bg-white dark:bg-gray-700 
                      p-4 rounded-lg shadow-sm
                      border border-gray-200 dark:border-gray-600
                      hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500
                      cursor-pointer
                      transition-all duration-200
                    "
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {addingToStatus === status.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, status.id)}
                    placeholder="Напишите название задачи"
                    autoFocus
                    disabled={isCreating}
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
                      disabled={!newTaskName.trim() || isCreating}
                      className="
                        px-3 py-1.5
                        text-sm text-white
                        bg-blue-600 hover:bg-blue-700
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        rounded
                        transition-colors
                      "
                    >
                      {isCreating ? 'Создание...' : 'Добавить задачу'}
                    </button>
                    <button
                      onClick={() => {
                        setAddingToStatus(null);
                        setNewTaskName('');
                      }}
                      disabled={isCreating}
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
                  disabled={!companyId}
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
    </div>
  );
}
