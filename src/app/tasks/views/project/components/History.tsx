'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskHistoryItem } from '../../inbox/actions/getTasksHistory';
import { getProjectHistory } from '../actions/getHistory';

type HistoryFilter = 'all' | 'tasks' | 'discussion' | 'files';

interface HistoryProps {
  projectId: number;
}

const discussionActions = new Set(['comment_added', 'comment_edited', 'comment_deleted']);
const fileActions = new Set(['document_added', 'document_deleted']);

function getIcon(actionType: string) {
  if (discussionActions.has(actionType)) return '💬';
  if (fileActions.has(actionType)) return '📎';
  if (actionType === 'created') return '➕';
  if (actionType === 'status_changed') return '🔄';
  if (actionType === 'executor_changed' || actionType === 'assigned') return '👤';
  if (actionType === 'priority_changed') return '⚡';
  if (actionType === 'deadline_changed' || actionType === 'startdate_changed') return '📅';
  if (actionType === 'description_changed' || actionType === 'name_changed') return '✏️';
  return '📌';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function History({ projectId }: HistoryProps) {
  const router = useRouter();
  const [items, setItems] = useState<TaskHistoryItem[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProjectHistory(projectId).then((data) => {
      if (active) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [projectId]);

  const filteredItems = useMemo(() => items.filter((item) => {
    if (filter === 'discussion') return discussionActions.has(item.actionType);
    if (filter === 'files') return fileActions.has(item.actionType);
    if (filter === 'tasks') return !discussionActions.has(item.actionType) && !fileActions.has(item.actionType);
    return true;
  }), [filter, items]);

  const groups = useMemo(() => {
    return filteredItems.reduce<Array<{ key: string; items: TaskHistoryItem[] }>>((result, item) => {
      const previous = result[result.length - 1];
      const first = previous?.items[0];
      const closeInTime = first && Math.abs(new Date(first.dtc).getTime() - new Date(item.dtc).getTime()) <= 5 * 60 * 1000;
      if (previous && first.taskId === item.taskId && first.actorUserId === item.actorUserId && closeInTime) {
        previous.items.push(item);
      } else {
        result.push({ key: String(item.id), items: [item] });
      }
      return result;
    }, []);
  }, [filteredItems]);

  const filters: Array<{ id: HistoryFilter; label: string }> = [
    { id: 'all', label: 'Все' },
    { id: 'tasks', label: 'Задачи' },
    { id: 'discussion', label: 'Обсуждения' },
    { id: 'files', label: 'Файлы' }
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">История проекта</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Все изменения задач проекта в хронологическом порядке.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {filters.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === option.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">Загрузка истории...</div>
        ) : groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-3">🕘</div>
            <p>В истории пока нет событий</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const item = group.items[0];
              const actor = item.userFullName || item.userName || 'Пользователь';
              return (
                <button
                  key={group.key}
                  onClick={() => router.push(`/tasks/edit/${item.taskId}`)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{getIcon(item.actionType)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{item.taskName}</h3>
                        <time className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{formatDate(item.dtc)}</time>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{actor}</span>{' '}
                        {group.items.length === 1
                          ? item.description
                          : `внёс(ла) ${group.items.length} изменения: ${group.items.map((entry) => entry.description).join('; ')}`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
