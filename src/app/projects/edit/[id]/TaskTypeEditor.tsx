'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskType } from '../../actions/taskTypeActions';
import {
  createTaskType,
  updateTaskType,
  deleteTaskType,
  reorderTaskTypes
} from '../../actions/taskTypeActions';

interface ProjectTaskTypeEditorProps {
  projectId: number;
  initialTaskTypes: TaskType[];
}

export default function ProjectTaskTypeEditor({ projectId, initialTaskTypes }: ProjectTaskTypeEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(initialTaskTypes);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#3B82F6');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [draggedId, setDraggedId] = useState<number | null>(null);

  // Добавление типа задач
  const handleAddTaskType = async () => {
    if (!newTypeName.trim()) return;

    setIsSaving(true);
    const maxOrder = taskTypes.length > 0 ? Math.max(...taskTypes.map(t => t.typeOrder)) : 0;

    const result = await createTaskType({
      projectId,
      typeName: newTypeName.trim(),
      typeOrder: maxOrder + 1,
      typeColor: newTypeColor
    });

    if (result.success && result.taskTypeId) {
      const newTaskType: TaskType = {
        id: result.taskTypeId,
        projectId,
        typeName: newTypeName.trim(),
        typeOrder: maxOrder + 1,
        typeColor: newTypeColor
      };

      setTaskTypes([...taskTypes, newTaskType]);
      setNewTypeName('');
      setNewTypeColor('#3B82F6');
      router.refresh();
    }

    setIsSaving(false);
  };

  // Начать редактирование
  const startEditing = (taskType: TaskType) => {
    setEditingId(taskType.id);
    setEditingName(taskType.typeName);
    setEditingColor(taskType.typeColor || '#3B82F6');
  };

  // Сохранить изменения
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    setIsSaving(true);

    const result = await updateTaskType({
      id: editingId,
      typeName: editingName.trim(),
      typeColor: editingColor
    });

    if (result.success) {
      setTaskTypes(taskTypes.map(taskType =>
        taskType.id === editingId
          ? { ...taskType, typeName: editingName.trim(), typeColor: editingColor }
          : taskType
      ));
      setEditingId(null);
      router.refresh();
    }

    setIsSaving(false);
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('');
  };

  // Удалить тип задач
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тип задач?')) return;

    setIsSaving(true);

    const result = await deleteTaskType(id);

    if (result.success) {
      setTaskTypes(taskTypes.filter(taskType => taskType.id !== id));
      router.refresh();
    }

    setIsSaving(false);
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = taskTypes.findIndex(t => t.id === draggedId);
    const targetIndex = taskTypes.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newTaskTypes = [...taskTypes];
    const [draggedTaskType] = newTaskTypes.splice(draggedIndex, 1);
    newTaskTypes.splice(targetIndex, 0, draggedTaskType);

    // Обновляем порядок
    const updatedTaskTypes = newTaskTypes.map((taskType, index) => ({
      ...taskType,
      typeOrder: index + 1
    }));

    setTaskTypes(updatedTaskTypes);
    setDraggedId(null);

    // Сохраняем новый порядок
    const updates = updatedTaskTypes.map(taskType => ({
      id: taskType.id,
      typeOrder: taskType.typeOrder
    }));

    await reorderTaskTypes(updates);
    router.refresh();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Типы задач проекта
      </h2>

      {/* Форма добавления нового типа */}
      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4 mb-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название типа
            </label>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Введите название типа задач"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTaskType()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Цвет
            </label>
            <input
              type="color"
              value={newTypeColor}
              onChange={(e) => setNewTypeColor(e.target.value)}
              className="w-15 h-9 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
            />
          </div>
          <button
            onClick={handleAddTaskType}
            disabled={!newTypeName.trim() || isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white border-none rounded-md text-sm font-medium cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>


      {/* Список типов задач */}
      <div className="flex flex-col gap-2">
        {taskTypes.map((taskType) => (
          <div
            key={taskType.id}
            draggable
            onDragStart={(e) => handleDragStart(e, taskType.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, taskType.id)}
            className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 flex items-center gap-3 cursor-move transition-opacity ${
              draggedId === taskType.id ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {/* Индикатор порядка */}
            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {taskType.typeOrder}
            </div>

            {/* Цветовой индикатор */}
            <div
              className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: taskType.typeColor || '#3B82F6' }}
            />

            {/* Название типа */}
            <div className="flex-1">
              {editingId === taskType.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {taskType.typeName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {taskType.id}
                  </span>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2">
              {editingId === taskType.id ? (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={!editingName.trim() || isSaving}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white border-none rounded text-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white border-none rounded text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(taskType)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white border-none rounded text-xs cursor-pointer"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => handleDelete(taskType.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white border-none rounded text-xs cursor-pointer"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {taskTypes.length === 0 && (
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            Типы задач не добавлены. Добавьте первый тип задач для этого проекта.
          </div>
        )}
      </div>
    </div>
  );
}