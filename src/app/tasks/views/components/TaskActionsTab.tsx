'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { addTaskAction, updateTaskAction, deleteTaskAction, TaskAction } from '../../actions/taskActions';
import {
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  ChecklistItem,
} from '../../actions/taskChecklist';

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
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<number | null>(null);

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

  // === ОБРАБОТЧИКИ ЧЕКЛИСТА ===
  
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    const optimisticItem: ChecklistItem = {
      id: Date.now(),
      taskId,
      description: newChecklistItem.trim(),
      isCompleted: false,
      orderInList: checklist.length,
      userId: currentUserId,
      dtc: new Date().toISOString(),
      dtu: null,
    };

    setChecklist(prev => [...prev, optimisticItem]);
    setNewChecklistItem('');

    startTransition(async () => {
      try {
        await addChecklistItem(taskId, newChecklistItem.trim(), currentUserId);
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error adding checklist item:', error);
        alert('Ошибка при добавлении пункта');
        setChecklist(prev => prev.filter(item => item.id !== optimisticItem.id));
      }
    });
  };

  const handleToggleChecklistItem = (itemId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, isCompleted: newStatus } : item
    ));

    startTransition(async () => {
      try {
        await toggleChecklistItem(itemId, newStatus);
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error toggling checklist item:', error);
        alert('Ошибка при изменении статуса');
        setChecklist(prev => prev.map(item =>
          item.id === itemId ? { ...item, isCompleted: currentStatus } : item
        ));
      }
    });
  };

  const handleStartEditChecklist = (item: ChecklistItem) => {
    setEditingChecklistId(item.id);
    setEditingChecklistText(item.description);
  };

  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  const handleSaveEditChecklist = (itemId: number) => {
    if (!editingChecklistText.trim()) return;

    const oldItem = checklist.find(item => item.id === itemId);
    
    setChecklist(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, description: editingChecklistText.trim(), dtu: new Date().toISOString() }
        : item
    ));

    setEditingChecklistId(null);
    setEditingChecklistText('');

    startTransition(async () => {
      try {
        await updateChecklistItem(itemId, editingChecklistText.trim());
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error updating checklist item:', error);
        alert('Ошибка при обновлении пункта');
        if (oldItem) {
          setChecklist(prev => prev.map(item => item.id === itemId ? oldItem : item));
        }
      }
    });
  };

  const handleDeleteChecklistItem = (itemId: number) => {
    if (!confirm('Удалить этот пункт чеклиста?')) return;

    const deletedItem = checklist.find(item => item.id === itemId);
    
    setChecklist(prev => prev.filter(item => item.id !== itemId));

    startTransition(async () => {
      try {
        await deleteChecklistItem(itemId);
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error deleting checklist item:', error);
        alert('Ошибка при удалении пункта');
        if (deletedItem) {
          setChecklist(prev => [...prev, deletedItem].sort((a, b) => a.orderInList - b.orderInList));
        }
      }
    });
  };

  const handleDragStart = (itemId: number) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: number) => {
    e.preventDefault();
    if (draggedItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetItemId: number) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const draggedItem = checklist.find(item => item.id === draggedItemId);
    const targetItem = checklist.find(item => item.id === targetItemId);

    if (!draggedItem || !targetItem) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    // Оптимистичное обновление порядка
    const newChecklist = [...checklist];
    const draggedIndex = newChecklist.findIndex(item => item.id === draggedItemId);
    const targetIndex = newChecklist.findIndex(item => item.id === targetItemId);
    
    newChecklist.splice(draggedIndex, 1);
    newChecklist.splice(targetIndex, 0, draggedItem);
    
    newChecklist.forEach((item, index) => {
      item.orderInList = index;
    });

    setChecklist(newChecklist);
    setDraggedItemId(null);
    setDragOverItemId(null);

    startTransition(async () => {
      try {
        await reorderChecklistItems(taskId, draggedItemId, targetItem.orderInList);
        if (onActionsUpdate) {
          await onActionsUpdate();
        }
      } catch (error) {
        console.error('Error reordering checklist:', error);
        alert('Ошибка при изменении порядка');
        setChecklist(initialChecklist);
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

  const [showAddInput, setShowAddInput] = useState(false);
  
  const completedCount = checklist.filter(item => item.isCompleted).length;
  const totalCount = checklist.length;

  return (
    <div className="flex flex-col h-full">
      {/* ЧЕКЛИСТ */}
      {(totalCount > 0 || showAddInput) && (
        <div className="flex-shrink-0 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Чеклист
              </h3>
              {totalCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {completedCount} / {totalCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddInput(!showAddInput)}
              className="
                w-5 h-5 flex items-center justify-center
                text-gray-500 hover:text-gray-700 
                dark:text-gray-400 dark:hover:text-gray-200
                transition-colors
              "
              title={showAddInput ? "Отменить" : "Добавить пункт"}
            >
              {showAddInput ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>

          {/* Форма добавления пункта */}
          {showAddInput && (
            <div className="mb-3">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Добавить пункт..."
                className="
                  w-full px-3 py-2
                  text-sm
                  border border-gray-300 dark:border-gray-600
                  rounded
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
                disabled={isPending}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newChecklistItem.trim()) {
                    handleAddChecklistItem();
                    setShowAddInput(false);
                  } else if (e.key === 'Escape') {
                    setNewChecklistItem('');
                    setShowAddInput(false);
                  }
                }}
                onBlur={() => {
                  if (newChecklistItem.trim()) {
                    handleAddChecklistItem();
                  }
                  setShowAddInput(false);
                }}
              />
            </div>
          )}

        {/* Список пунктов чеклиста */}
        <div className="space-y-1">
          {checklist.map((item) => {
            const isEditingThis = editingChecklistId === item.id;
            
            return (
              <div
                key={item.id}
                draggable={!isEditingThis}
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`
                  group flex items-center gap-2 p-2 rounded
                  ${draggedItemId === item.id ? 'opacity-50' : ''}
                  ${dragOverItemId === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                  transition-colors cursor-move
                `}
              >
                {isEditingThis ? (
                  <>
                    <input
                      type="text"
                      value={editingChecklistText}
                      onChange={(e) => setEditingChecklistText(e.target.value)}
                      className="
                        flex-1 px-2 py-1
                        text-sm
                        border border-gray-300 dark:border-gray-600
                        rounded
                        bg-white dark:bg-gray-700
                        text-gray-900 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      "
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEditChecklist(item.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEditChecklist();
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSaveEditChecklist(item.id)}
                      disabled={!editingChecklistText.trim()}
                      className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50"
                    >
                      Сохр.
                    </button>
                    <button
                      onClick={handleCancelEditChecklist}
                      className="text-xs px-2 py-1 text-gray-600 hover:text-gray-700 dark:text-gray-400"
                    >
                      Отм.
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                      className="
                        w-4 h-4 flex-shrink-0
                        text-blue-600
                        border-gray-300 dark:border-gray-600
                        rounded
                        focus:ring-2 focus:ring-blue-500
                        cursor-pointer
                      "
                    />
                    <span
                      className={`
                        flex-1 text-sm truncate
                        ${item.isCompleted 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                      title={item.description}
                    >
                      {item.description}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEditChecklist(item)}
                        className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Редактировать"
                      >
                        Ред.
                      </button>
                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="text-xs px-2 py-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Удалить"
                      >
                        Удал.
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {checklist.length === 0 && !showAddInput && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
            Пунктов чеклиста пока нет
          </div>
        )}
        </div>
      )}

      {/* Кнопка добавления чеклиста, если его нет */}
      {totalCount === 0 && !showAddInput && (
        <div className="flex-shrink-0 mb-6">
          <button
            onClick={() => setShowAddInput(true)}
            className="
              flex items-center gap-2
              text-sm text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              transition-colors
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Добавить чеклист</span>
          </button>
        </div>
      )}

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
