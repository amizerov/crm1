'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateWithProcesses, Process } from '../actions/getTemplateById';
import { createTemplate, updateTemplate } from '../actions/templateActions';
import { createProcess, updateProcess, deleteProcess, reorderProcesses } from '../actions/processActions';

interface TemplateEditorProps {
  template?: TemplateWithProcesses;
}

export default function TemplateEditor({ template }: TemplateEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Данные шаблона
  const [templName, setTemplName] = useState(template?.templName || '');
  const [description, setDescription] = useState(template?.description || '');

  // Процессы
  const [processes, setProcesses] = useState<Process[]>(template?.processes || []);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  // Drag & Drop
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const isNewTemplate = !template;

  // Сохранение шаблона
  const handleSaveTemplate = async () => {
    if (!templName.trim()) {
      alert('Укажите название шаблона');
      return;
    }

    setIsSaving(true);

    if (isNewTemplate) {
      // Создание нового шаблона
      const result = await createTemplate({ templName, description });
      
      if (result.success && result.templateId) {
        router.push(`/templates/${result.templateId}`);
      } else {
        alert(result.error || 'Ошибка при создании шаблона');
        setIsSaving(false);
      }
    } else {
      // Обновление существующего шаблона
      const result = await updateTemplate(template!.id, { templName, description });
      
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Ошибка при обновлении шаблона');
      }
      setIsSaving(false);
    }
  };

  // Добавление шага
  const handleAddStep = async () => {
    if (!newStepName.trim()) return;
    if (isNewTemplate) {
      alert('Сначала сохраните шаблон');
      return;
    }

    setIsSaving(true);
    const maxOrder = processes.length > 0 ? Math.max(...processes.map(p => p.stepOrder)) : 0;

    const result = await createProcess({
      templateId: template!.id,
      stepName: newStepName.trim(),
      description: newStepDescription.trim() || undefined,
      stepOrder: maxOrder + 1
    });

    if (result.success && result.processId) {
      const newProcess: Process = {
        id: result.processId,
        stepName: newStepName.trim(),
        description: newStepDescription.trim() || undefined,
        stepOrder: maxOrder + 1,
        templateId: template!.id,
        dtc: new Date().toISOString()
      };
      setProcesses([...processes, newProcess]);
      setNewStepName('');
      setNewStepDescription('');
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при добавлении шага');
    }
    setIsSaving(false);
  };

  // Редактирование шага
  const handleEditStep = (process: Process) => {
    setEditingId(process.id);
    setEditingName(process.stepName);
    setEditingDescription(process.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || editingId === null) return;

    setIsSaving(true);
    const process = processes.find(p => p.id === editingId);
    if (!process) return;

    const result = await updateProcess(editingId, {
      stepName: editingName.trim(),
      description: editingDescription.trim() || undefined,
      stepOrder: process.stepOrder
    });

    if (result.success) {
      setProcesses(processes.map(p => 
        p.id === editingId 
          ? { ...p, stepName: editingName.trim(), description: editingDescription.trim() || undefined } 
          : p
      ));
      setEditingId(null);
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при обновлении шага');
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  // Удаление шага
  const handleDeleteStep = async (processId: number) => {
    if (!confirm('Удалить этот шаг?')) return;

    setIsSaving(true);
    const result = await deleteProcess(processId);

    if (result.success) {
      const newProcesses = processes.filter(p => p.id !== processId);
      // Пересчитываем порядок
      const reordered = newProcesses.map((p, index) => ({
        ...p,
        stepOrder: index + 1
      }));

      if (template) {
        await reorderProcesses(template.id, reordered.map(p => p.id));
      }

      setProcesses(reordered);
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при удалении шага');
    }
    setIsSaving(false);
  };

  // Drag & Drop
  const handleDragStart = (processId: number) => {
    setDraggedId(processId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = processes.findIndex(p => p.id === draggedId);
    const targetIndex = processes.findIndex(p => p.id === targetId);

    const newProcesses = [...processes];
    const [draggedItem] = newProcesses.splice(draggedIndex, 1);
    newProcesses.splice(targetIndex, 0, draggedItem);

    // Обновляем порядок
    const reordered = newProcesses.map((p, index) => ({
      ...p,
      stepOrder: index + 1
    }));

    setProcesses(reordered);
  };

  const handleDragEnd = async () => {
    if (!draggedId || !template) {
      setDraggedId(null);
      return;
    }

    setIsSaving(true);
    await reorderProcesses(template.id, processes.map(p => p.id));
    setDraggedId(null);
    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Информация о шаблоне */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название шаблона *
            </label>
            <input
              type="text"
              value={templName}
              onChange={(e) => setTemplName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Например: Разработка ПО"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Описание шаблона процесса"
            />
          </div>

          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templName.trim()}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 
                     text-white rounded-lg font-medium transition-colors"
          >
            {isSaving ? 'Сохранение...' : isNewTemplate ? 'Создать шаблон' : 'Сохранить изменения'}
          </button>

          {isNewTemplate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 После создания шаблона вы сможете добавить шаги процесса
            </p>
          )}
        </div>
      </div>

      {/* Шаги процесса */}
      {!isNewTemplate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Шаги процесса (будут использоваться как статусы)
          </h2>

          {processes.length > 0 ? (
            <div className="space-y-2 mb-4">
              {processes.map((process) => (
                <div
                  key={process.id}
                  draggable
                  onDragStart={() => handleDragStart(process.id)}
                  onDragOver={(e) => handleDragOver(e, process.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all
                    ${draggedId === process.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                    bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md
                  `}
                >
                  {/* Drag handle */}
                  <div className="text-gray-400 dark:text-gray-500 text-lg">⋮⋮</div>

                  {/* Порядковый номер */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                                bg-gray-200 dark:bg-gray-600 rounded-full font-bold text-sm
                                text-gray-700 dark:text-gray-300">
                    {process.stepOrder}
                  </div>

                  {editingId === process.id ? (
                    <>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                          placeholder="Название шага"
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
                          {process.stepName}
                        </div>
                        {process.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {process.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditStep(process)}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm self-start"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteStep(process.id)}
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
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 mb-4">
              Шаги процесса не добавлены. Добавьте первый шаг ниже.
            </p>
          )}

          {/* Добавление нового шага */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddStep()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Название нового шага (например: Анализ, Разработка, Тестирование)"
                />
                <textarea
                  value={newStepDescription}
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Описание шага (необязательно)"
                />
              </div>
              <button
                onClick={handleAddStep}
                disabled={isSaving || !newStepName.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                         text-white rounded-lg font-medium transition-colors whitespace-nowrap self-start"
              >
                + Добавить шаг
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            💡 Перетаскивайте шаги мышкой для изменения порядка
          </p>
        </div>
      )}
    </div>
  );
}
