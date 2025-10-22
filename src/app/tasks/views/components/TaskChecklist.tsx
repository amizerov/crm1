'use client';

import { useState, useTransition } from 'react';
import {
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  ChecklistItem,
} from '../../actions/taskChecklist';

interface TaskChecklistProps {
  taskId: number;
  currentUserId: number;
  checklist: ChecklistItem[];
  onUpdate?: () => void;
}

export default function TaskChecklist({
  taskId,
  currentUserId,
  checklist,
  onUpdate,
}: TaskChecklistProps) {
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showAddInput, setShowAddInput] = useState(false);
  
  // Локальное состояние для оптимистичного обновления
  const [optimisticChecklist, setOptimisticChecklist] = useState<ChecklistItem[]>(checklist);

  // Синхронизируем локальное состояние с входящим checklist
  if (checklist !== optimisticChecklist && !isPending) {
    setOptimisticChecklist(checklist);
  }

  const completedCount = optimisticChecklist.filter((item) => item.isCompleted).length;
  const totalCount = optimisticChecklist.length;

  // === ОБРАБОТЧИКИ ===

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    startTransition(async () => {
      try {
        await addChecklistItem(taskId, newChecklistItem.trim(), currentUserId);
        setNewChecklistItem('');
        setShowAddInput(false);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error adding checklist item:', error);
        alert('Ошибка при добавлении пункта');
      }
    });
  };

  const handleToggleChecklistItem = (itemId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    startTransition(async () => {
      try {
        await toggleChecklistItem(itemId, newStatus);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error toggling checklist item:', error);
        alert('Ошибка при изменении статуса');
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

    setEditingChecklistId(null);
    const textToSave = editingChecklistText.trim();
    setEditingChecklistText('');

    startTransition(async () => {
      try {
        await updateChecklistItem(itemId, textToSave);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error updating checklist item:', error);
        alert('Ошибка при обновлении пункта');
      }
    });
  };

  const handleDeleteChecklistItem = (itemId: number) => {
    if (!confirm('Удалить этот пункт чеклиста?')) return;

    startTransition(async () => {
      try {
        await deleteChecklistItem(itemId);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error deleting checklist item:', error);
        alert('Ошибка при удалении пункта');
      }
    });
  };

  const handleMoveUp = (itemId: number) => {
    const currentIndex = optimisticChecklist.findIndex((item) => item.id === itemId);
    if (currentIndex <= 0) return; // Уже первый элемент

    const targetIndex = currentIndex - 1;
    const targetItem = optimisticChecklist[targetIndex];

    // Оптимистичное обновление - сразу меняем порядок локально
    const newList = [...optimisticChecklist];
    [newList[currentIndex], newList[targetIndex]] = [newList[targetIndex], newList[currentIndex]];
    setOptimisticChecklist(newList);

    // Потом обновляем базу
    startTransition(async () => {
      try {
        await reorderChecklistItems(taskId, itemId, targetItem.orderInList);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error moving item up:', error);
        alert('Ошибка при изменении порядка');
        // Откатываем оптимистичное изменение
        setOptimisticChecklist(checklist);
      }
    });
  };

  const handleMoveDown = (itemId: number) => {
    const currentIndex = optimisticChecklist.findIndex((item) => item.id === itemId);
    if (currentIndex < 0 || currentIndex >= optimisticChecklist.length - 1) return; // Уже последний элемент

    const targetIndex = currentIndex + 1;
    const targetItem = optimisticChecklist[targetIndex];

    // Оптимистичное обновление - сразу меняем порядок локально
    const newList = [...optimisticChecklist];
    [newList[currentIndex], newList[targetIndex]] = [newList[targetIndex], newList[currentIndex]];
    setOptimisticChecklist(newList);

    // Потом обновляем базу
    startTransition(async () => {
      try {
        await reorderChecklistItems(taskId, itemId, targetItem.orderInList);
        if (onUpdate) {
          await onUpdate();
        }
      } catch (error) {
        console.error('Error moving item down:', error);
        alert('Ошибка при изменении порядка');
        // Откатываем оптимистичное изменение
        setOptimisticChecklist(checklist);
      }
    });
  };

  // === RENDER ===

  if (totalCount === 0 && !showAddInput) {
    return (
      <div className="flex-shrink-0 mb-6">
        <button
          onClick={() => setShowAddInput(true)}
          className="
            flex items-center gap-2
            text-sm text-gray-500 hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200
            transition-colors
            cursor-pointer
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Добавить чеклист</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Чеклист</h3>
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
            cursor-pointer
          "
          title={showAddInput ? 'Отменить' : 'Добавить пункт'}
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
              } else if (e.key === 'Escape') {
                setNewChecklistItem('');
                setShowAddInput(false);
              }
            }}
            onBlur={() => {
              if (newChecklistItem.trim()) {
                handleAddChecklistItem();
              } else {
                setShowAddInput(false);
              }
            }}
          />
        </div>
      )}

      {/* Список пунктов чеклиста */}
      <div className="space-y-1">
        {optimisticChecklist.map((item, index) => {
          const isEditingThis = editingChecklistId === item.id;
          const isFirst = index === 0;
          const isLast = index === optimisticChecklist.length - 1;

          return (
            <div
              key={item.id}
              className="
                group flex items-center gap-2 p-2 rounded
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors
              "
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
                    className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Сохр.
                  </button>
                  <button
                    onClick={handleCancelEditChecklist}
                    className="text-xs px-2 py-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
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
                      ${
                        item.isCompleted
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    title={item.description}
                  >
                    {item.description}
                  </span>
                  
                  {/* Кнопки управления - показываются при наведении */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {/* Стрелки вверх/вниз */}
                    <button
                      onClick={() => handleMoveUp(item.id)}
                      disabled={isFirst || isPending}
                      className="
                        px-1 rounded
                        text-gray-400 hover:text-gray-600 hover:bg-gray-100
                        dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                        transition-colors
                        cursor-pointer
                        text-base leading-none
                      "
                      title="Переместить вверх"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(item.id)}
                      disabled={isLast || isPending}
                      className="
                        px-1 rounded
                        text-gray-400 hover:text-gray-600 hover:bg-gray-100
                        dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                        transition-colors
                        cursor-pointer
                        text-base leading-none
                      "
                      title="Переместить вниз"
                    >
                      ↓
                    </button>
                    
                    {/* Редактировать и удалить */}
                    <button
                      onClick={() => handleStartEditChecklist(item)}
                      className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                      title="Редактировать"
                    >
                      Ред.
                    </button>
                    <button
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="text-xs px-2 py-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer"
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
  );
}
