'use client';

import { useState, useEffect } from 'react';
import { updateProjectDescription } from '../actions/setDescription';
import TiptapEditor from './TiptapEditor';

interface DescriptionProps {
  projectId: number;
  initialDescription?: string;
  onDescriptionUpdated?: () => void;
}

export default function Description({ projectId, initialDescription = '', onDescriptionUpdated }: DescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [currentContent, setCurrentContent] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setDescription(initialDescription);
    setCurrentContent(initialDescription);
  }, [initialDescription]);

  // Обработка ESC для выхода из полноэкранного режима
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Переключение в режим редактирования
  const handleEdit = () => {
    setCurrentContent(description); // Сохраняем текущее состояние
    setIsEditing(true);
  };

  // Сохранение описания
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await updateProjectDescription(projectId, currentContent);
      
      if (result.success) {
        setDescription(currentContent);
        setIsEditing(false);
        onDescriptionUpdated?.();
      } else {
        alert(result.error || 'Ошибка при сохранении описания');
      }
    } catch (error) {
      console.error('Ошибка при сохранении описания:', error);
      alert('Ошибка при сохранении описания');
    } finally {
      setIsSaving(false);
    }
  };

  // Отмена редактирования
  const handleCancel = () => {
    setCurrentContent(description); // Восстанавливаем сохраненное состояние
    setIsEditing(false);
  };

  // Обработка изменений в редакторе
  const handleContentChange = (html: string) => {
    setCurrentContent(html);
  };

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-800 p-6' : ''}`}>
      {/* Заголовок с кнопками */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Описание проекта
        </h3>
        
        <div className="flex gap-2">
          {/* Кнопка полноэкранного режима */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors text-sm flex items-center gap-2 cursor-pointer"
            title={isFullscreen ? 'Выйти из полноэкранного режима (ESC)' : 'Полноэкранный режим'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors text-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редактировать
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || isUploadingImage}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Сохранить
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving || isUploadingImage}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm cursor-pointer"
              >
                Отмена
              </button>
            </>
          )}
        </div>
      </div>

      {/* Редактор Tiptap */}
      <div className="flex-1">
        <TiptapEditor
          content={isEditing ? currentContent : description}
          onChange={handleContentChange}
          editable={isEditing}
          projectId={projectId}
          onImageUploadStart={() => setIsUploadingImage(true)}
          onImageUploadEnd={() => setIsUploadingImage(false)}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
}
