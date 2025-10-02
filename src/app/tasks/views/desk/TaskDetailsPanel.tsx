'use client';

import Link from 'next/link';

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

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailsPanel({ task, onClose }: TaskDetailsPanelProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Не указано';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priorityName?: string) => {
    switch(priorityName) {
      case 'Низкий': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Средний': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Срочный': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="w-96 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Детали задачи
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID задачи */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ID: #{task.id}
        </div>

        {/* Название */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {task.taskName}
          </h3>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Статус
          </label>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
            {task.statusName}
          </span>
        </div>

        {/* Приоритет */}
        {task.priorityName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Приоритет
            </label>
            <span className={`inline-block px-3 py-1 rounded text-sm ${getPriorityColor(task.priorityName)}`}>
              {task.priorityName}
            </span>
          </div>
        )}

        {/* Исполнитель */}
        {task.executorName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Исполнитель
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <span className="text-gray-900 dark:text-gray-100">{task.executorName}</span>
            </div>
          </div>
        )}

        {/* Даты */}
        <div className="grid grid-cols-2 gap-4">
          {task.startDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Начало
              </label>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                📅 {formatDate(task.startDate)}
              </div>
            </div>
          )}
          {task.dedline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Дедлайн
              </label>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                ⏰ {formatDate(task.dedline)}
              </div>
            </div>
          )}
        </div>

        {/* Описание */}
        {task.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
              {task.description}
            </div>
          </div>
        )}

        {/* Даты создания и обновления */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <strong>Создано:</strong> {formatDate(task.dtc)}
          </div>
          {task.dtu && (
            <div>
              <strong>Обновлено:</strong> {formatDate(task.dtu)}
            </div>
          )}
        </div>
      </div>

      {/* Футер с кнопками действий */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          href={`/tasks/edit/${task.id}`}
          className="
            block w-full px-4 py-2 
            bg-blue-600 hover:bg-blue-700 
            text-white text-center
            rounded
            transition-colors
            no-underline
          "
        >
          Редактировать
        </Link>
        <button
          onClick={onClose}
          className="
            w-full px-4 py-2 
            bg-gray-200 hover:bg-gray-300 
            dark:bg-gray-700 dark:hover:bg-gray-600
            text-gray-900 dark:text-gray-100
            rounded
            transition-colors
          "
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
