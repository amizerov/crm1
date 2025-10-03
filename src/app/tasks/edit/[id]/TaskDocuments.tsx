'use client';

import { useState } from 'react';
import { uploadTaskDocument, deleteTaskDocument } from '../../actions/taskDocuments';
import WindowsWindow from '@/components/WindowsWindow';

interface TaskDocumentsProps {
  taskId: number;
  documents: any[];
}

export default function TaskDocuments({ taskId, documents }: TaskDocumentsProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadTaskDocument(taskId, formData);
      if (result.success) {
        // Документ загружен, страница обновится автоматически через revalidatePath
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки документа');
    } finally {
      setUploading(false);
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
    // Сбрасываем значение input для возможности загрузки того же файла повторно
    e.target.value = '';
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Удалить документ?')) return;
    
    try {
      const result = await deleteTaskDocument(documentId, taskId);
      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления документа');
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <WindowsWindow
      title={`Документы задачи (${documents.length})`}
      icon="📎"
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      defaultSize={{ width: 900, height: 700 }}
      minSize={{ width: 500, height: 400 }}
    >
      {/* Область загрузки */}
      <div
        style={{
          border: `2px dashed ${dragOver ? '#007bff' : '#dee2e6'}`,
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          backgroundColor: dragOver ? '#f8f9ff' : '#fafbfc',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginBottom: 20,
          flexShrink: 0
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div style={{ color: '#007bff' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ margin: 0, fontSize: 16 }}>Загрузка документа...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <p style={{ 
              color: '#6c757d', 
              marginBottom: 16,
              fontSize: 16 
            }}>
              Перетащите документ сюда или
            </p>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
            >
              📎 Выберите документ
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />
            </label>
            <p style={{ 
              fontSize: 12, 
              color: '#6c757d', 
              marginTop: 12,
              margin: '12px 0 0 0'
            }}>
              Максимум 10MB. Поддерживаются: PDF, DOC, XLS, изображения, архивы
            </p>
          </>
        )}
      </div>

      {/* Список документов */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingRight: isExpanded ? 8 : 0
      }}>
        {documents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 14,
            fontStyle: 'italic',
            padding: 20
          }}>
            Пока нет документов для этой задачи
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 6,
                marginBottom: 12,
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flex: 1
              }}>
                <span style={{ fontSize: 24 }}>
                  {getFileIcon(document.mimeType)}
                </span>
                <div style={{ flex: 1 }}>
                  <a
                    href={document.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#007bff',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: 15,
                      display: 'block',
                      marginBottom: 4
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {document.originalName}
                  </a>
                  <div style={{
                    fontSize: 12,
                    color: '#6c757d'
                  }}>
                    {formatFileSize(document.fileSize)} • {' '}
                    {new Date(document.dtc).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {' '}
                    {document.uploadedByName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(document.id)}
                style={{
                  color: '#dc3545',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8d7da';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Удалить документ"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </WindowsWindow>
  );
}
