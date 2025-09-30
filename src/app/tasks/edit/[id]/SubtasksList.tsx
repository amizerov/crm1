'use client';

import Link from 'next/link';

interface Task {
  id: number;
  taskName: string;
  description?: string;
  statusId: number;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  dedline?: string;
  level?: number;
}

interface SubtasksListProps {
  parentTaskId: number;
  subtasks: Task[];
}

export default function SubtasksList({ parentTaskId, subtasks }: SubtasksListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'готово': return '#28a745';
      case 'в работе': return '#007bff';
      case 'идея': return '#6c757d';
      case 'готово к взятию': return '#17a2b8';
      case 'тестирование': return '#fd7e14';
      case 'на паузе': return '#ffc107';
      case 'отменено': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityIcon = (priorityName?: string) => {
    switch (priorityName?.toLowerCase()) {
      case 'высокий': return '🔥';
      case 'критичный': return '⚡';
      case 'средний': return '🔶';
      case 'низкий': return '🔽';
      default: return '';
    }
  };

  return (
    <div style={{
      border: '1px solid #e9ecef',
      borderRadius: 8,
      backgroundColor: 'white'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📋 Подзадачи ({subtasks.length})
        </h3>
        <Link href={`/tasks/add?parentId=${parentTaskId}`}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            ➕ Добавить подзадачу
          </button>
        </Link>
      </div>

      {/* Список подзадач */}
      <div style={{ padding: 20 }}>
        {subtasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: '#6c757d',
            fontSize: 14
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <p style={{ margin: 0 }}>У этой задачи пока нет подзадач</p>
            <Link href={`/tasks/add?parentId=${parentTaskId}`}>
              <button style={{
                marginTop: 16,
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14
              }}>
                Создать первую подзадачу
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subtasks.map((subtask) => (
              <Link
                key={subtask.id}
                href={`/tasks/edit/${subtask.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  backgroundColor: '#fafbfc',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f3f4';
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,123,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafbfc';
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Отступ для иерархии */}
                <div style={{ 
                  width: (subtask.level || 0) * 20, 
                  flexShrink: 0 
                }} />

                {/* Основная информация */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4
                  }}>
                    <span style={{
                      color: '#495057',
                      fontWeight: 500,
                      fontSize: 15
                    }}>
                      {subtask.taskName}
                    </span>
                    {getPriorityIcon(subtask.priorityName) && (
                      <span title={`Приоритет: ${subtask.priorityName}`}>
                        {getPriorityIcon(subtask.priorityName)}
                      </span>
                    )}
                  </div>
                  
                  {subtask.description && (
                    <div style={{
                      color: '#6c757d',
                      fontSize: 13,
                      lineHeight: 1.4,
                      marginBottom: 8
                    }}>
                      {subtask.description.length > 100 
                        ? `${subtask.description.substring(0, 100)}...` 
                        : subtask.description
                      }
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 12,
                    color: '#6c757d'
                  }}>
                    {subtask.executorName && (
                      <span>👤 {subtask.executorName}</span>
                    )}
                    {subtask.dedline && (
                      <span>📅 {formatDate(subtask.dedline)}</span>
                    )}
                  </div>
                </div>

                {/* Статус и иконка перехода */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: getStatusColor(subtask.statusName),
                    flexShrink: 0
                  }}>
                    {subtask.statusName}
                  </div>
                  <div style={{
                    color: '#007bff',
                    fontSize: 16,
                    flexShrink: 0
                  }}>
                    ➤
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
