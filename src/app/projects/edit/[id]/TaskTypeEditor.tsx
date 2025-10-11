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
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px'
      }}>
        Типы задач проекта
      </h2>

      {/* Форма добавления нового типа */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Название типа
            </label>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Введите название типа задач"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTaskType()}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Цвет
            </label>
            <input
              type="color"
              value={newTypeColor}
              onChange={(e) => setNewTypeColor(e.target.value)}
              style={{
                width: '60px',
                height: '36px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
          </div>
          <button
            onClick={handleAddTaskType}
            disabled={!newTypeName.trim() || isSaving}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: newTypeName.trim() && !isSaving ? 'pointer' : 'not-allowed',
              opacity: newTypeName.trim() && !isSaving ? 1 : 0.6
            }}
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Список типов задач */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {taskTypes.map((taskType) => (
          <div
            key={taskType.id}
            draggable
            onDragStart={(e) => handleDragStart(e, taskType.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, taskType.id)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'move',
              opacity: draggedId === taskType.id ? 0.5 : 1
            }}
          >
            {/* Индикатор порядка */}
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: '#64748b'
            }}>
              {taskType.typeOrder}
            </div>

            {/* Цветовой индикатор */}
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: taskType.typeColor || '#3B82F6',
                borderRadius: '50%',
                border: '1px solid #e2e8f0'
              }}
            />

            {/* Название типа */}
            <div style={{ flex: 1 }}>
              {editingId === taskType.id ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ) : (
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b'
                }}>
                  {taskType.typeName}
                </span>
              )}
            </div>

            {/* Кнопки действий */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {editingId === taskType.id ? (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={!editingName.trim() || isSaving}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: editingName.trim() && !isSaving ? 'pointer' : 'not-allowed'
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(taskType)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => handleDelete(taskType.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {taskTypes.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '24px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Типы задач не добавлены. Добавьте первый тип задач для этого проекта.
          </div>
        )}
      </div>
    </div>
  );
}