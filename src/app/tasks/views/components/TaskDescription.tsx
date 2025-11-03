'use client';

import { useState } from 'react';
import TiptapEditor from '../project/components/TiptapEditor';
import { updateTaskDescription } from '../../actions/updateTaskDescription';

interface TaskDescriptionProps {
  taskId: number;
  projectId: number;
  taskName: string;
  description: string;
  onDescriptionUpdate?: (newDescription: string) => void;
  isEditable?: boolean;
}

export default function TaskDescription({ 
  taskId, 
  projectId, 
  taskName,
  description, 
  onDescriptionUpdate, 
  isEditable = true 
}: TaskDescriptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const result = await updateTaskDescription(taskId, content);
      
      if (result.success) {
        setIsEditing(false);
        onDescriptionUpdate?.(content);
      } else {
        alert(result.message || 'Ошибка сохранения описания');
      }
    } catch (error) {
      console.error('Ошибка сохранения описания:', error);
      alert('Ошибка сохранения описания');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(description);
    setIsEditing(false);
  };

  const openModal = () => {
    setContent(description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isEditing) {
      if (confirm('У вас есть несохраненные изменения. Закрыть без сохранения?')) {
        setContent(description);
        setIsEditing(false);
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Краткое отображение в карточке задачи */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col flex-1 min-h-0 mb-0">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание / Цель задачи:
          </div>
          <button
            onClick={openModal}
            className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors cursor-pointer"
            title={description ? 'Открыть описание' : 'Добавить описание'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded min-h-[100px] overflow-y-auto flex-1 mb-4">
          <div 
            className="task-description-content"
            dangerouslySetInnerHTML={{ __html: description || '<p>Описание не указано</p>' }} 
          />
        </div>
      </div>

      {/* Модальное окно с редактором */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Заголовок */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {taskName}
              </h2>
              <div className="flex items-center gap-2">
                {isEditable && (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving || isImageUploading}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить'
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors cursor-pointer"
                      >
                        Редактировать
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Контент с редактором */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <TiptapEditor
                content={content}
                onChange={setContent}
                editable={isEditing}
                projectId={projectId}
                taskId={taskId}
                onImageUploadStart={() => setIsImageUploading(true)}
                onImageUploadEnd={() => setIsImageUploading(false)}
                isFullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}