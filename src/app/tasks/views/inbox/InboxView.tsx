'use client';

import { Task } from '@/app/tasks/types';
import Link from 'next/link';
import { useState } from 'react';

interface InboxViewProps {
  tasks: Task[];
  currentUserId: number;
}

export default function InboxView({ tasks, currentUserId }: InboxViewProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'overdue'>('all');

  // Группируем задачи
  const newTasks = tasks.filter(task => {
    const createdDate = new Date(task.dtc);
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 7;
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.dedline) return false;
    const deadline = new Date(task.dedline);
    return deadline < new Date();
  });

  const displayTasks = 
    filter === 'new' ? newTasks :
    filter === 'overdue' ? overdueTasks :
    tasks;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📥 Входящие
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Новые задачи, изменения и уведомления
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {displayTasks.length} {displayTasks.length === 1 ? 'задача' : 'задач'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Новые ({newTasks.length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Просрочено ({overdueTasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Входящие пусты
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filter === 'all' && 'У вас нет новых уведомлений'}
              {filter === 'new' && 'Нет новых задач за последние 7 дней'}
              {filter === 'overdue' && 'Нет просроченных задач'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map(task => (
              <TaskInboxCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskInboxCard({ task }: { task: Task }) {
  const isOverdue = task.dedline && new Date(task.dedline) < new Date();
  const isNew = () => {
    const createdDate = new Date(task.dtc);
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 2;
  };

  return (
    <Link
      href={`/tasks/edit/${task.id}`}
      className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Status Badge */}
        <div className="flex-shrink-0 mt-1">
          {isNew() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Новая
            </span>
          )}
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Просрочено
            </span>
          )}
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {task.taskName}
            </h3>
            {task.statusName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {task.statusName}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {task.description || 'Без описания'}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {task.projectName && (
              <span className="flex items-center gap-1">
                📁 {task.projectName}
              </span>
            )}
            {task.priorityName && (
              <span className="flex items-center gap-1">
                ⚡ {task.priorityName}
              </span>
            )}
            {task.dedline && (
              <span className="flex items-center gap-1">
                📅 {new Date(task.dedline).toLocaleDateString('ru-RU')}
              </span>
            )}
            <span className="flex items-center gap-1">
              🕒 {new Date(task.dtc).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
