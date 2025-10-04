'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusTask } from '../../actions/statusActions';
import {
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus,
  reorderProjectStatuses,
  createProjectStatusesFromDefault,
  createProjectStatusesFromTemplate
} from '../../actions/statusActions';

interface ProjectStatusEditorProps {
  projectId: number;
  initialStatuses: StatusTask[];
  templates: { id: number; templName: string }[];
}

export default function ProjectStatusEditor({ projectId, initialStatuses, templates }: ProjectStatusEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [statuses, setStatuses] = useState<StatusTask[]>(initialStatuses);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusDescription, setNewStatusDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [showCopyOptions, setShowCopyOptions] = useState(false);

  // Добавление статуса
  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;

    setIsSaving(true);
    const maxOrder = statuses.length > 0 ? Math.max(...statuses.map(s => s.stepOrder)) : 0;

    const result = await createProjectStatus({
      projectId,
      status: newStatusName.trim(),
      description: newStatusDescription.trim() || undefined,
      stepOrder: maxOrder + 1
    });

    if (result.success && result.statusId) {
      const newStatus: StatusTask = {
        id: result.statusId,
        projectId,
        status: newStatusName.trim(),
        statusEng: newStatusName.trim().replace(/\s+/g, '_'),
        description: newStatusDescription.trim() || undefined,
        stepOrder: maxOrder + 1
      };
      setStatuses([...statuses, newStatus]);
      setNewStatusName('');
      setNewStatusDescription('');
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при добавлении статуса');
    }
    setIsSaving(false);
  };

  // Редактирование статуса
  const handleEditStatus = (status: StatusTask) => {
    setEditingId(status.id);
    setEditingName(status.status);
    setEditingDescription(status.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || editingId === null) return;

    setIsSaving(true);
    const status = statuses.find(s => s.id === editingId);
    if (!status) return;

    const result = await updateProjectStatus({
      id: editingId,
      projectId,
      status: editingName.trim(),
      description: editingDescription.trim() || undefined,
      stepOrder: status.stepOrder
    });

    if (result.success) {
      setStatuses(statuses.map(s =>
        s.id === editingId
          ? { ...s, status: editingName.trim(), description: editingDescription.trim() || undefined }
          : s
      ));
      setEditingId(null);
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при обновлении статуса');
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  // Копирование статусов по умолчанию
  const handleCopyFromDefault = async () => {
    if (!confirm('Скопировать статусы по умолчанию? Это создаст новые статусы для проекта.')) return;

    setIsSaving(true);
    const result = await createProjectStatusesFromDefault(projectId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при копировании статусов');
    }
    setIsSaving(false);
  };

  // Копирование статусов из шаблона
  const handleCopyFromTemplate = async (templateId: number) => {
    if (!confirm('Скопировать статусы из выбранного шаблона? Это создаст новые статусы для проекта.')) return;

    setIsSaving(true);
    const result = await createProjectStatusesFromTemplate(projectId, templateId);

    if (result.success) {
      setShowCopyOptions(false);
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при копировании статусов из шаблона');
    }
    setIsSaving(false);
  };

  // Удаление статуса
  const handleDeleteStatus = async (statusId: number) => {
    if (!confirm('Удалить этот статус? Это действие нельзя отменить.')) return;

    setIsSaving(true);
    const result = await deleteProjectStatus(statusId, projectId);

    if (result.success) {
      const newStatuses = statuses.filter(s => s.id !== statusId);
      const reordered = newStatuses.map((s, index) => ({
        ...s,
        stepOrder: index + 1
      }));

      await reorderProjectStatuses(projectId, reordered.map(s => s.id));
      setStatuses(reordered);
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при удалении шага');
    }
    setIsSaving(false);
  };

  // Drag & Drop
  const handleDragStart = (statusId: number) => {
    setDraggedId(statusId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = statuses.findIndex(s => s.id === draggedId);
    const targetIndex = statuses.findIndex(s => s.id === targetId);

    const newStatuses = [...statuses];
    const [draggedItem] = newStatuses.splice(draggedIndex, 1);
    newStatuses.splice(targetIndex, 0, draggedItem);

    const reordered = newStatuses.map((s, index) => ({
      ...s,
      stepOrder: index + 1
    }));

    setStatuses(reordered);
  };

  const handleDragEnd = async () => {
    if (!draggedId) {
      setDraggedId(null);
      return;
    }

    setIsSaving(true);
    await reorderProjectStatuses(projectId, statuses.map(s => s.id));
    setDraggedId(null);
    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Статусы задач проекта
      </h2>

      {statuses.length > 0 ? (
        <div className="space-y-2 mb-4">
          {statuses.map((status) => (
            <div
              key={status.id}
              draggable
              onDragStart={() => handleDragStart(status.id)}
              onDragOver={(e) => handleDragOver(e, status.id)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all
                ${draggedId === status.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md
              `}
            >
              <div className="text-gray-400 dark:text-gray-500 text-lg">⋮⋮</div>

              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                            bg-gray-200 dark:bg-gray-600 rounded-full font-bold text-sm
                            text-gray-700 dark:text-gray-300">
                {status.stepOrder}
              </div>

              {editingId === status.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                      placeholder="Название статуса"
                      autoFocus
                    />
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      placeholder="Описание (необязательно)"
                    />
                  </div>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium self-start"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium self-start"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {status.status}
                    </div>
                    {status.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {status.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditStatus(status)}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm self-start"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteStatus(status.id)}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm self-start"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-center py-6 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
              ⚠️ У проекта нет статусов задач
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Вы можете скопировать статусы по умолчанию или из шаблона
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleCopyFromDefault}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                📋 Скопировать статусы по умолчанию
              </button>
              
              {templates.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowCopyOptions(!showCopyOptions)}
                    disabled={isSaving}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                             text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    📑 Скопировать из шаблона
                  </button>
                  
                  {showCopyOptions && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 
                                  border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl 
                                  min-w-[280px] max-h-60 overflow-y-auto z-10">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleCopyFromTemplate(template.id)}
                          disabled={isSaving}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 
                                   text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700
                                   last:border-b-0 transition-colors"
                        >
                          {template.templName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Добавление нового статуса */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddStatus()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Название нового статуса"
            />
            <textarea
              value={newStatusDescription}
              onChange={(e) => setNewStatusDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Описание статуса (необязательно)"
            />
          </div>
          <button
            onClick={handleAddStatus}
            disabled={isSaving || !newStatusName.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                     text-white rounded-lg font-medium transition-colors whitespace-nowrap self-start"
          >
            + Добавить статус
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        💡 Перетаскивайте статусы мышкой для изменения порядка (слева направо: Бэклог → Готово)
      </p>
    </div>
  );
}
