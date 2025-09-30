'use client';

import { useRouter } from 'next/navigation';
import { Task, TaskRowProps, ColumnConfig } from './types';
import { taskUtils } from './taskUtils';

export default function TaskRow({ task, isCollapsed, onToggle, visibleColumns }: TaskRowProps) {
  const router = useRouter();

  const handleRowClick = (e: React.MouseEvent) => {
    // Не переходим на редактирование, если кликнули на кнопку сворачивания
    if ((e.target as HTMLElement).closest('.toggle-button')) {
      return;
    }
    router.push(`/tasks/edit/${task.id}`);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  // Получаем индикатор для задачи
  const taskIndicator = taskUtils.getTaskIndicator(task);

  // Функция для получения стиля статуса
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Новая': 
        return 'bg-gray-500 dark:bg-gray-600';
      case 'В процессе': 
        return 'bg-blue-500 dark:bg-blue-600';
      case 'Запланировано': 
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'Выполнено': 
        return 'bg-green-500 dark:bg-green-600';
      case 'Готово': 
        return 'bg-green-500 dark:bg-green-600';
      case 'Отменено': 
        return 'bg-red-500 dark:bg-red-600';
      case 'Караул': 
        return 'bg-red-600 dark:bg-red-700';
      default: 
        return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  // Функция для получения стиля приоритета
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'Высокий': 
        return 'text-red-600 dark:text-red-400';
      case 'Средний': 
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Низкий': 
        return 'text-green-600 dark:text-green-400';
      case 'Караул': 
        return 'text-red-600 dark:text-red-400';
      default: 
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Функция для получения значения колонки
  const getCellValue = (columnKey: string) => {
    switch (columnKey) {
      case 'id':
        return (
          <div className="flex items-center gap-2 justify-end">
            {task.hasChildren && (task.level || 0) === 0 && (
              <button
                className="
                  toggle-button 
                  py-1 px-3 
                  rounded-md 
                  bg-gray-100 dark:bg-gray-700 
                  hover:bg-gray-200 dark:hover:bg-gray-600 
                  transition-colors 
                  cursor-pointer
                  border border-gray-300 dark:border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                "
                onClick={handleToggleClick}
                title={isCollapsed ? 'Развернуть задачи' : 'Свернуть задачи'}
              >
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {isCollapsed ? '▶' : '▼'}
                </span>
              </button>
            )}
            <span className="text-gray-900 dark:text-gray-100">{task.id}</span>
          </div>
        );
      case 'taskName':
        return (
          <div 
            className="flex items-center gap-2"
            style={{ paddingLeft: (task.level || 0) * 20 }}
          >
            {(task.level || 0) > 0 && (
              <span className="mr-2 text-gray-500 dark:text-gray-400 text-xs">
                ↳
              </span>
            )}
            {taskIndicator && (
              <span 
                style={{ color: taskIndicator.color, fontSize: '14px' }}
                title={taskIndicator.tooltip}
              >
                {taskIndicator.icon}
              </span>
            )}
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {task.taskName}
            </span>
          </div>
        );
      case 'description':
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {task.description || '-'}
          </span>
        );
      case 'statusName':
        return (
          <span 
            className={`
              ${getStatusClasses(task.statusName)}
              text-white px-2 py-1 rounded text-xs font-medium
            `}
            style={{ whiteSpace: 'nowrap' }}
          >
            {task.statusName}
          </span>
        );
      case 'priorityName':
        if (task.priorityName === 'Караул') {
          return (
            <span className="status-urgent inline-block">
              {task.priorityName}
            </span>
          );
        }
        return task.priorityName ? (
          <span className={`${getPriorityClasses(task.priorityName)} font-semibold text-sm`}>
            {task.priorityName}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 italic">
            Не указан
          </span>
        );
      case 'startDate':
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {task.startDate ? new Date(task.startDate).toLocaleDateString('ru-RU') : '-'}
          </span>
        );
      case 'dedline':
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {task.dedline ? new Date(task.dedline).toLocaleDateString('ru-RU') : '-'}
          </span>
        );
      case 'executorName':
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {task.executorName || 'Не назначен'}
          </span>
        );
      default:
        return '';
    }
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="
        cursor-pointer 
        bg-white dark:bg-gray-800 
        hover:bg-gray-50 dark:hover:bg-gray-700 
        transition-colors duration-200
        border-b border-gray-200 dark:border-gray-700
      "
    >
      {visibleColumns.map((column) => (
        <td
          key={column.key}
          className={`
            p-3 
            border border-gray-200 dark:border-gray-600
            ${column.key === 'description' ? 'max-w-[300px] truncate' : ''}
            ${column.key === 'taskName' ? 'font-medium' : ''}
            ${column.key === 'id' ? 'text-right' : 'text-left'}
            ${column.key === 'statusName' ? 'whitespace-nowrap' : ''}
          `}
        >
          {getCellValue(column.key)}
        </td>
      ))}
    </tr>
  );
}