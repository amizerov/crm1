'use client';

import { Task } from '@/app/tasks/types';
import { TaskHistoryItem, markHistoryAsViewed, markAllHistoryAsViewed } from './actions/getTasksHistory';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface InboxViewProps {
  tasks: Task[];
  currentUserId: number;
  tasksHistory: TaskHistoryItem[];
  tasksStatsMap: Map<number, { daysFromCreation: number; currentStatus: string }>;
}

export default function InboxView({ tasks, currentUserId, tasksHistory, tasksStatsMap }: InboxViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Сортируем историю по дате (новые сверху)
  const sortedHistory = [...tasksHistory].sort((a, b) => 
    new Date(b.dtc).getTime() - new Date(a.dtc).getTime()
  );

  // Обработчик "Прочитать все"
  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      await markAllHistoryAsViewed();
      router.refresh();
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg 
              className="w-8 h-8 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Входящие
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                События, которые требуют вашего внимания.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sortedHistory.length} {sortedHistory.length === 1 ? 'запись' : 'записей'}
              </span>
              {sortedHistory.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                  {sortedHistory.length} новых
                </span>
              )}
            </div>
            {sortedHistory.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Прочитать все
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Для вас нет новых сообщений
            </h3>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map(item => (
              <HistoryCard 
                key={item.id} 
                item={item} 
                currentUserId={currentUserId}
                taskStats={tasksStatsMap.get(item.taskId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ 
  item, 
  currentUserId, 
  taskStats 
}: { 
  item: TaskHistoryItem; 
  currentUserId: number;
  taskStats?: { daysFromCreation: number; currentStatus: string };
}) {
  const router = useRouter();
  
  // Определяем, является ли это назначением текущему пользователю
  const isAssignedToMe = 
    (item.actionType === 'assigned' || item.actionType === 'executor_changed') && 
    item.executorUserId === currentUserId;
  
  // Определяем, является ли задача завершённой
  const isCompleted = 
    item.actionType === 'status_changed' && 
    (item.statusName?.toLowerCase().includes('done') ||
     item.statusName?.toLowerCase().includes('completed') ||
     item.statusName?.toLowerCase().includes('выполнено') ||
     item.statusName?.toLowerCase().includes('завершено'));

  // Обработчик клика на карточку
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Отмечаем как прочитанное
    await markHistoryAsViewed(item.id);
    
    // Переходим к задаче
    router.push(`/tasks/edit/${item.taskId}`);
    router.refresh();
  };

  // Иконка для типа действия
  const getActionIcon = () => {
    if (isAssignedToMe) return '👤';
    if (isCompleted) return '✅';
    
    switch (item.actionType) {
      case 'created': return '➕';
      case 'status_changed': return '🔄';
      case 'assigned':
      case 'executor_changed': return '👤';
      case 'priority_changed': return '⚡';
      case 'deadline_changed': return '📅';
      case 'startdate_changed': return '�';
      case 'name_changed': return '✏️';
      case 'description_changed': return '📝';
      case 'document_added': return '📎';
      case 'document_deleted': return '🗑️';
      case 'comment_added': return '💬';
      case 'comment_edited': return '✏️';
      case 'comment_deleted': return '🗑️';
      case 'moved': return '↔️';
      case 'order_changed': return '🔀';
      case 'checklist_item_added': return '☑️';
      case 'checklist_item_completed': return '✔️';
      case 'checklist_item_uncompleted': return '⬜';
      case 'checklist_item_edited': return '✏️';
      case 'checklist_item_deleted': return '❌';
      case 'checklist_item_reordered': return '🔀';
      default: return '📌';
    }
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={handleClick}
      className={`block p-4 rounded-lg border transition-all cursor-pointer ${
        isAssignedToMe
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600'
          : isCompleted
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1 text-2xl">
          {getActionIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Task Name & Status */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item.taskName}
            </h3>
            {item.statusName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {item.statusName}
              </span>
            )}
            {isAssignedToMe && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">
                Назначено вам
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
                Завершено
              </span>
            )}
          </div>

          {/* Action Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">{item.userFullName || item.userName || 'Пользователь'}</span>
            {' '}{item.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            {item.projectName && (
              <span className="flex items-center gap-1">
                📁 {item.projectName}
              </span>
            )}
            {item.priorityName && (
              <span className="flex items-center gap-1">
                ⚡ {item.priorityName}
              </span>
            )}
            {item.executorName && (
              <span className="flex items-center gap-1">
                👤 {item.executorName}
              </span>
            )}
            <span className="flex items-center gap-1">
              🕒 {formatTime(item.dtc)}
            </span>
          </div>

          {/* Task Statistics */}
          {taskStats && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1" title="Текущий статус">
                  🏷️ {taskStats.currentStatus}
                </span>
                <span className="flex items-center gap-1" title="Дней с создания">
                  📅 {taskStats.daysFromCreation} {taskStats.daysFromCreation === 1 ? 'день' : taskStats.daysFromCreation < 5 ? 'дня' : 'дней'}
                </span>
                {item.createdAt && (
                  <span className="flex items-center gap-1" title="Дата создания">
                    ✨ {new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

