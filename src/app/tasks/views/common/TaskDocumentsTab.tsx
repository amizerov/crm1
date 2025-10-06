'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadTaskDocument, deleteTaskDocument, getTaskDocuments } from '../../actions/taskDocuments';

interface TaskDocumentsTabProps {
  taskId: number;
}

interface Document {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  dtc: string;
  uploadedByName: string;
}

export default function TaskDocumentsTab({ taskId }: TaskDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Состояния для прогресса загрузки
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadStartTime, setUploadStartTime] = useState(0);

  // Загружаем документы
  useEffect(() => {
    loadDocuments();
  }, [taskId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getTaskDocuments(taskId);
      setDocuments(docs);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return '🗜️';
    return '📎';
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setUploadSpeed(0);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Создаем новый AbortController для этой загрузки
    abortControllerRef.current = new AbortController();
    
    setUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);
    setUploadSpeed(0);
    const startTime = Date.now();
    setUploadStartTime(startTime);

    try {
      // Для файлов меньше 900KB загружаем напрямую
      if (file.size <= 900 * 1024) {
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await uploadTaskDocument(taskId, formData);
        if (result.success) {
          setUploadProgress(100);
          setUploadedBytes(file.size);
          await loadDocuments();
        } else {
          alert(result.message);
        }
      } else {
        // Для больших файлов разбиваем на чанки по 900KB
        const chunkSize = 900 * 1024; // 900KB чанки
        const chunks = Math.ceil(file.size / chunkSize);
        
        // Генерируем уникальный ID для этого файла (используется для всех чанков)
        const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        for (let i = 0; i < chunks; i++) {
          // Проверяем, не была ли отменена загрузка
          if (abortControllerRef.current?.signal.aborted) {
            console.log('Загрузка отменена пользователем');
            return;
          }
          
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          
          // Создаём временный файл из чанка
          const chunkFile = new File(
            [chunk], 
            i === chunks - 1 ? file.name : `${file.name}.part${i}`,
            { type: file.type }
          );
          
          const formData = new FormData();
          formData.append('file', chunkFile);
          formData.append('isChunk', 'true');
          formData.append('chunkIndex', i.toString());
          formData.append('totalChunks', chunks.toString());
          formData.append('originalName', file.name);
          formData.append('fileId', fileId);
          
          const result = await uploadTaskDocument(taskId, formData);
          
          if (!result.success) {
            alert(`Ошибка загрузки чанка ${i + 1}: ${result.message}`);
            return;
          }
          
          // Обновляем прогресс
          const uploaded = end;
          const progress = Math.round((uploaded / file.size) * 100);
          const elapsedTime = (Date.now() - startTime) / 1000; // в секундах
          const speed = uploaded / elapsedTime; // байт/сек
          
          setUploadedBytes(uploaded);
          setUploadProgress(progress);
          setUploadSpeed(speed);
        }
        
        await loadDocuments();
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки документа');
    } finally {
      setUploading(false);
      // Сбрасываем прогресс через небольшую задержку
      setTimeout(() => {
        setUploadProgress(0);
        setUploadedBytes(0);
        setTotalBytes(0);
        setUploadSpeed(0);
      }, 2000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Удалить документ?')) return;
    
    try {
      const result = await deleteTaskDocument(documentId, taskId);
      if (result.success) {
        await loadDocuments(); // Перезагружаем список
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления документа');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Область загрузки в стиле Asana */}
      <div
        className={`
          relative m-4 p-6 rounded-lg border-2 border-dashed transition-all cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none' : 'hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col gap-3">
            {/* Прогресс-бар */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            {/* Информация о загрузке */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {uploadProgress}% • {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
                </p>
                {uploadSpeed > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Скорость: {formatFileSize(uploadSpeed)}/с
                  </p>
                )}
              </div>
              
              {/* Кнопка отмены */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelUpload();
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                Отменить
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">📎</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Перетащите файл сюда или{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline">
                  выберите файл
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, XLS, изображения, архивы • Максимум 10MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
      </div>

      {/* Список документов */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-3 opacity-50">📭</div>
            <p className="text-sm">Пока нет прикрепленных файлов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
              >
                {/* Иконка файла */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl">{getFileIcon(doc.mimeType)}</span>
                </div>

                {/* Информация о файле */}
                <div className="flex-1 min-w-0">
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {doc.originalName}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>
                      {new Date(doc.dtc).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>•</span>
                    <span>{doc.uploadedByName}</span>
                  </div>
                </div>

                {/* Кнопка удаления */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-all cursor-pointer"
                  title="Удалить файл"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
