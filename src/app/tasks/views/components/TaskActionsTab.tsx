'use client';

import { useState, useTransition, useEffect } from 'react';
import { addTaskAction, updateTaskAction, deleteTaskAction, TaskAction } from '../../actions/taskActions';
import { ChecklistItem } from '../../actions/taskChecklist';
import TaskChecklist from './TaskChecklist';

interface TaskActionsTabProps {
  taskId: number;
  currentUserId: number;
  initialActions: TaskAction[];
  initialChecklist: ChecklistItem[];
  onActionsUpdate?: () => void;
}

export default function TaskActionsTab({ 
  taskId, 
  currentUserId, 
  initialActions,
  initialChecklist,
  onActionsUpdate 
}: TaskActionsTabProps) {
  const [actions, setActions] = useState<TaskAction[]>(initialActions);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Синхронизация с initialActions и initialChecklist при их изменении
  useEffect(() => {
    setActions(initialActions);
  }, [initialActions]);

  useEffect(() => {
    setChecklist(initialChecklist);
  }, [initialChecklist]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    // Оптимистичное обновление: добавляем комментарий сразу в UI
    const optimisticAction: TaskAction = {
      id: Date.now(), // Временный ID
      taskId,
      userId: currentUserId,
      description: newComment.trim(),
      dtc: new Date().toISOString()
    };
    
    setActions(prev => [optimisticAction, ...prev]);
    setNewComment('');

    startTransition(async () => {
      try {
        await addTaskAction(taskId, newComment.trim(), currentUserId);
        // Перезагружаем с сервера для получения реального ID и данных
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Ошибка при добавлении комментария');
        // Откатываем оптимистичное обновление при ошибке
        setActions(prev => prev.filter(a => a.id !== optimisticAction.id));
      }
    });
  };

  const handleStartEdit = (action: TaskAction) => {
    setEditingId(action.id);
    setEditingText(action.description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = (actionId: number) => {
    if (!editingText.trim()) return;

    // Сохраняем старое значение для отката
    const oldAction = actions.find(a => a.id === actionId);
    
    // Оптимистичное обновление
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, description: editingText.trim(), dtu: new Date().toISOString() }
        : a
    ));
    
    setEditingId(null);
    setEditingText('');
    setProcessingId(actionId);
    
    startTransition(async () => {
      try {
        await updateTaskAction(actionId, editingText.trim());
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('Ошибка при обновлении комментария');
        // Откатываем при ошибке
        if (oldAction) {
          setActions(prev => prev.map(a => a.id === actionId ? oldAction : a));
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  const handleDelete = (actionId: number) => {
    if (!confirm('Удалить этот комментарий?')) return;

    // Сохраняем для отката
    const deletedAction = actions.find(a => a.id === actionId);
    
    // Оптимистичное удаление
    setActions(prev => prev.filter(a => a.id !== actionId));
    setProcessingId(actionId);
    
    startTransition(async () => {
      try {
        await deleteTaskAction(actionId);
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Ошибка при удалении комментария');
        // Откатываем при ошибке
        if (deletedAction) {
          setActions(prev => [...prev, deletedAction].sort((a, b) => 
            new Date(b.dtc).getTime() - new Date(a.dtc).getTime()
          ));
        }
      } finally {
        setProcessingId(null);
      }
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} дн назад`;

    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* ЧЕКЛИСТ */}
      <TaskChecklist
        taskId={taskId}
        currentUserId={currentUserId}
        checklist={checklist}
        onUpdate={onActionsUpdate}
      />

      {/* КОММЕНТАРИИ */}
      <div className="flex-shrink-0 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Комментарии
        </h3>
      </div>

      {/* Форма добавления комментария */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {actions.find(a => a.userId === currentUserId)?.userName?.charAt(0)?.toUpperCase() || 'Я'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий или заметку..."
              className="
                w-full px-3 py-2 
                text-sm
                border border-gray-300 dark:border-gray-600 
                rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                resize-none
                transition-all
              "
              rows={3}
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAddComment();
                }
              }}
            />
            {newComment.trim() && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={isPending}
                  className="
                    px-4 py-1.5
                    text-sm font-medium
                    bg-blue-600 hover:bg-blue-700
                    disabled:bg-blue-400 disabled:cursor-not-allowed
                    text-white
                    rounded
                    transition-colors
                    cursor-pointer
                  "
                >
                  {isPending ? 'Отправка...' : 'Отправить'}
                </button>
                <button
                  onClick={() => setNewComment('')}
                  disabled={isPending}
                  className="
                    px-4 py-1.5
                    text-sm font-medium
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-600
                    rounded
                    transition-colors
                    cursor-pointer
                  "
                >
                  Отмена
                </button>
              </div>
            )}
            {newComment.trim() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Нажмите Ctrl+Enter для отправки
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Список комментариев */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {actions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">📝</p>
            <p className="text-sm">Пока нет комментариев</p>
            <p className="text-xs mt-1">Добавьте первый комментарий или заметку</p>
          </div>
        ) : (
          actions.map((action) => {
            const isEditing = editingId === action.id;
            const isProcessing = processingId === action.id;
            const isOwnComment = action.userId === currentUserId;

            return (
              <div
                key={action.id}
                className="flex gap-2 items-start group"
              >
                {/* Аватар */}
                <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {action.userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Контент комментария */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {action.userName || 'Пользователь'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(action.dtc)}
                    </span>
                    {action.dtu && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        (изм.)
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="
                          w-full px-3 py-2 
                          text-sm
                          border border-gray-300 dark:border-gray-600 
                          rounded-lg
                          bg-white dark:bg-gray-700
                          text-gray-900 dark:text-gray-100
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          resize-none
                        "
                        rows={3}
                        disabled={isProcessing}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(action.id)}
                          disabled={isProcessing || !editingText.trim()}
                          className="
                            px-3 py-1
                            text-xs font-medium
                            bg-blue-600 hover:bg-blue-700
                            disabled:bg-blue-400 disabled:cursor-not-allowed
                            text-white
                            rounded
                            transition-colors
                            cursor-pointer
                          "
                        >
                          {isProcessing ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isProcessing}
                          className="
                            px-3 py-1
                            text-xs font-medium
                            text-gray-700 dark:text-gray-300
                            hover:bg-gray-100 dark:hover:bg-gray-600
                            rounded
                            transition-colors
                            cursor-pointer
                          "
                        >
                          Отмена
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {action.description}
                      </p>
                      
                      {/* Кнопки действий - показываются при наведении */}
                      {isOwnComment && !isProcessing && (
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(action)}
                            className="
                              text-xs
                              text-gray-500 hover:text-gray-700
                              dark:text-gray-400 dark:hover:text-gray-200
                              transition-colors
                              cursor-pointer
                            "
                          >
                            Изменить
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <button
                            onClick={() => handleDelete(action.id)}
                            className="
                              text-xs
                              text-gray-500 hover:text-red-600
                              dark:text-gray-400 dark:hover:text-red-400
                              transition-colors
                              cursor-pointer
                            "
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                      
                      {isProcessing && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Обработка...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
