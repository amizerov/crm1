'use client';

import { useState, useEffect } from 'react';
import { getTaskHistory } from '../../actions/taskHistory';

interface TaskHistoryTabProps {
  taskId: number;
}

interface HistoryEntry {
  id: number;
  actionType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string;
  dtc: string;
  userName: string;
  userFullName: string | null;
}

export default function TaskHistoryTab({ taskId }: TaskHistoryTabProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Перезагружаем историю при каждом монтировании компонента
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getTaskHistory(taskId);
      setHistory(data);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, string> = {
      created: '✨',
      status_changed: '🔄',
      assigned: '👤',
      executor_changed: '👤',
      priority_changed: '🎯',
      updated: '✏️',
      deleted: '🗑️',
      document_added: '📎',
      document_deleted: '🗑️',
      comment_added: '💬',
      comment_edited: '✏️',
      comment_deleted: '🗑️',
      moved: '↗️',
      deadline_changed: '📅',
      startdate_changed: '📅',
      name_changed: '✏️',
      description_changed: '📝',
    };
    return icons[actionType] || '📝';
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      created: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      status_changed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      assigned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      executor_changed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      priority_changed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      deleted: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      document_added: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      document_deleted: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      deadline_changed: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      startdate_changed: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    };
    return colors[actionType] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-3 opacity-50">📜</div>
            <p className="text-sm">История изменений пуста</p>
            <p className="text-xs mt-2 text-gray-500">Здесь будет отображаться история всех изменений задачи</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                    ${getActionColor(entry.actionType)}
                  `}>
                    {getActionIcon(entry.actionType)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[20px] mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.userFullName || entry.userName}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.description}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDate(entry.dtc)}
                    </span>
                  </div>

                  {/* Детали изменения */}
                  {(entry.oldValue || entry.newValue) && entry.actionType !== 'document_added' && entry.actionType !== 'document_deleted' && (
                    <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 space-y-1">
                      {entry.oldValue && (
                        <div className="text-gray-500 dark:text-gray-400 line-through opacity-60">
                          <span className="font-medium">Было:</span> {entry.oldValue}
                        </div>
                      )}
                      {entry.newValue && (
                        <div className="text-green-600 dark:text-green-400">
                          <span className="font-medium">Стало:</span> {entry.newValue}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
