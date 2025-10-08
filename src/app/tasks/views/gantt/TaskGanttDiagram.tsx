'use client';

import { StatusTask } from '@/app/projects/actions/statusActions';

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
  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center p-8">
        {/* Иконка диаграммы Ганта */}
        <svg 
          className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M10 7.999v2H3c-1.654 0-3-1.346-3-3v-2c0-1.654 1.346-3 3-3h7v2H3c-.552 0-1 .449-1 1v2c0 .55.448 1 1 1h7Zm-3 12c-.552 0-1-.45-1-1v-2c0-.551.448-1 1-1h3v-2H7c-1.654 0-3 1.346-3 3v2c0 1.654 1.346 3 3 3h3v-2H7Zm17-3v2c0 1.654-1.346 3-3 3h-7v1a1 1 0 1 1-2 0v-22a1 1 0 1 1 2 0v1h3c1.654 0 3 1.346 3 3v2c0 1.654-1.346 3-3 3h-3v4h7c1.654 0 3 1.346 3 3Zm-10-9h3c.552 0 1-.45 1-1v-2c0-.551-.448-1-1-1h-3v4Zm8 9c0-.551-.448-1-1-1h-7v4h7c.552 0 1-.45 1-1v-2Z"/>
        </svg>

        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Диаграмма Ганта
        </h2>

        {/* Описание */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Визуализация временных рамок задач в виде горизонтальной диаграммы.
          Функционал находится в разработке.
        </p>

        {/* Статистика */}
        {!isPending && (
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span>{tasks.length} задач</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <span>{statuses.length} этапов</span>
            </div>
          </div>
        )}

        {/* Placeholder для будущей диаграммы */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Здесь будет отображаться интерактивная диаграмма Ганта
          </p>
        </div>
      </div>
    </div>
  );
}
