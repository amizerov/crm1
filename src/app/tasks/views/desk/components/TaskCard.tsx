'use client';

import { MouseEvent } from 'react';
import { getPriorityColor, formatDate } from './taskUtils';

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
  orderInStatus?: number;
}

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  draggedTask?: Task | null;
  selectedTaskId?: number;
  isUpdating: boolean;
  onMouseDown: (e: MouseEvent, task: Task) => void;
  onClick: () => void;
}

export default function TaskCard({
  task,
  isDragging,
  draggedTask,
  selectedTaskId,
  isUpdating,
  onMouseDown,
  onClick
}: TaskCardProps) {
  return (
    <div
      data-task-card="true"
      onMouseDown={(e) => onMouseDown(e, task)}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-700 
        p-4 rounded-lg shadow-sm
        border-2
        hover:shadow-md
        cursor-pointer
        transition-all duration-200
        select-none
        relative
        ${
          draggedTask?.id === task.id && isDragging
            ? 'opacity-30'
            : selectedTaskId === task.id
              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
              : isUpdating
                ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
        }
      `}
    >
      {/* Индикатор обновления */}
      {isUpdating && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Название задачи */}
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 pr-6">
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
  );
}