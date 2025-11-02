'use client';

import { useState, useEffect } from 'react';
import { uploadProjectImage } from '../actions/uploadImage';
import { getProjectImages, deleteProjectImage, ProjectImage } from '../actions/mediaLibrary';

interface MediaLibraryProps {
  projectId: number;
  onImageSelect: (imagePath: string) => void;
  onClose: () => void;
}

export default function MediaLibrary({ projectId, onImageSelect, onClose }: MediaLibraryProps) {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [projectId]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const result = await getProjectImages(projectId);
      if (result.success && result.images) {
        setImages(result.images);
      } else {
        console.error('Ошибка загрузки изображений:', result.message);
      }
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProjectImage(projectId, formData);
      
      if (result.success) {
        await loadImages(); // Перезагружаем список
        event.target.value = ''; // Сбрасываем input
      } else {
        alert(result.message || 'Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки изображения');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!confirm('Вы уверены, что хотите удалить это изображение?')) return;

    try {
      const result = await deleteProjectImage(projectId, imagePath);

      if (result.success) {
        await loadImages(); // Перезагружаем список
        if (selectedImage === imagePath) {
          setSelectedImage(null);
        }
      } else {
        alert(result.message || 'Ошибка удаления изображения');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления изображения');
    }
  };

  const handleImageSelect = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-600">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            📁 Медиатека проекта
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Панель инструментов */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Загрузка...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Загрузить изображение
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          
          <button
            onClick={handleImageSelect}
            disabled={!selectedImage}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Вставить выбранное
          </button>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-hidden flex">
          {/* Список изображений */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">📸</div>
                <p>Изображений пока нет</p>
                <p className="text-sm mt-2">Загрузите первое изображение</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {images.map((image) => (
                  <div
                    key={image.path}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                      selectedImage === image.path
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedImage(image.path)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={image.path}
                        alt={image.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.path);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Предпросмотр */}
          <div className="flex-1 p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
            {selectedImage ? (
              <div className="text-center">
                <img
                  src={selectedImage}
                  alt="Предпросмотр"
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                />
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {images.find(img => img.path === selectedImage)?.name}
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🖼️</div>
                <p>Выберите изображение для предпросмотра</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}