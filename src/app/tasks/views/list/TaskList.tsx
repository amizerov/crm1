'use client';

import { StatusTask } from '@/app/projects/actions/statusActions';
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
}

export default function TaskList({ 
  tasks,
  statuses,
  onTaskClick,
  isPending = false,
  companyId,
  projectId,
  onTaskCreated,
  selectedTaskId
}: TaskListProps) {
  // Группируем задачи по статусам
  const tasksByStatus = tasks.reduce((acc, task) => {
    const statusId = task.statusId;
    if (!acc[statusId]) {
      acc[statusId] = [];
    }
    acc[statusId].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  // Используем переданные статусы, отсортированные по stepOrder
  const sortedStatuses = statuses.sort((a, b) => a.stepOrder - b.stepOrder);

  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (statusId: number) => {
    setCollapsedSections(prev => ({
      ...prev,
      [statusId]: !prev[statusId]
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
  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-900">
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
      ) : (
        <div className="w-full">
          {/* Заголовки таблицы */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-5">Имя</div>
              <div className="col-span-3">Исполнитель</div>
              <div className="col-span-2">Срок выполнения</div>
              <div className="col-span-2">Приоритет</div>
            </div>
          </div>

          {/* Тело таблицы */}
          <div>
            {sortedStatuses.map((status) => {
              const statusTasks = tasksByStatus[status.id] || [];
              const isCollapsed = collapsedSections[status.id];
              
              return (
                <div key={status.id}>
                  {/* Заголовок секции статуса */}
                  <button
                    onClick={() => toggleSection(status.id)}
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
                        {status.status}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {statusTasks.length}
                      </span>
                    </div>
                  </button>

                  {/* Строки задач */}
                  {!isCollapsed && statusTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-3 border-b cursor-pointer transition-colors group ${
                        selectedTaskId === task.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={() => onTaskClick?.(task)}
                    >
                      {/* Имя задачи */}
                      <div className="col-span-5 flex items-center gap-3">
                        <button 
                          className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 hover:border-blue-500 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {task.taskName}
                        </span>
                      </div>

                      {/* Исполнитель */}
                      <div className="col-span-3 flex items-center">
                        {task.executorName ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {task.executorName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </div>

                      {/* Срок выполнения */}
                      <div className="col-span-2 flex items-center">
                        {task.dedline ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(task.dedline).toLocaleDateString('ru-RU', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </div>

                      {/* Приоритет */}
                      <div className="col-span-2 flex items-center">
                        {task.priorityName ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priorityName)}`}>
                            {task.priorityName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Кнопка добавления задачи */}
                  {!isCollapsed && (
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
  );
}