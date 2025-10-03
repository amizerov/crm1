'use client';

import { useState } from 'react';
import Link from 'next/link';
import WindowsWindow from '@/components/WindowsWindow';

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <WindowsWindow
      title={`Подзадачи (${subtasks.length})`}
      icon="📋"
      isExpanded={isExpanded}
      onToggleExpanded={() => setIsExpanded(!isExpanded)}
      defaultSize={{ width: 900, height: 700 }}
      minSize={{ width: 500, height: 400 }}
    >
      {/* Кнопка добавления подзадачи - показываем всегда */}
      {!isExpanded && (
        <div style={{ marginBottom: 16 }}>
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
              gap: 6,
              width: '100%',
              justifyContent: 'center'
            }}>
              ➕ Добавить подзадачу
            </button>
          </Link>
        </div>
      )}

      {/* Контент */}
      <div style={{ 
        flex: 1, 
        overflow: isExpanded ? 'auto' : 'auto'
      }}>
        {subtasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isExpanded ? 40 : 20,
            color: '#6c757d',
            fontSize: 14
          }}>
            <div style={{ fontSize: isExpanded ? 48 : 32, marginBottom: 16 }}>📝</div>
            <p style={{ margin: 0 }}>У этой задачи пока нет подзадач</p>
            {isExpanded && (
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
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isExpanded ? 12 : 8 }}>
            {/* В свернутом виде показываем только первые 3-4 подзадачи */}
            {(isExpanded ? subtasks : subtasks.slice(0, 4)).map((subtask) => (
              <Link
                key={subtask.id}
                href={`/tasks/edit/${subtask.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isExpanded ? 16 : 12,
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
                {/* Отступ для иерархии - только в развернутом виде */}
                {isExpanded && (
                  <div style={{ 
                    width: (subtask.level || 0) * 20, 
                    flexShrink: 0 
                  }} />
                )}

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
                      fontSize: isExpanded ? 15 : 14
                    }}>
                      {isExpanded ? subtask.taskName : (
                        subtask.taskName.length > 30 
                          ? `${subtask.taskName.substring(0, 30)}...` 
                          : subtask.taskName
                      )}
                    </span>
                    {getPriorityIcon(subtask.priorityName) && (
                      <span title={`Приоритет: ${subtask.priorityName}`}>
                        {getPriorityIcon(subtask.priorityName)}
                      </span>
                    )}
                  </div>
                  
                  {subtask.description && isExpanded && (
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
                    gap: isExpanded ? 16 : 8,
                    fontSize: isExpanded ? 12 : 11,
                    color: '#6c757d'
                  }}>
                    {subtask.executorName && (
                      <span>
                        {isExpanded ? `👤 ${subtask.executorName}` : subtask.executorName.split(' ')[0]}
                      </span>
                    )}
                    {subtask.dedline && (
                      <span>
                        {isExpanded ? `📅 ${formatDate(subtask.dedline)}` : formatDate(subtask.dedline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Статус и иконка перехода */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    padding: isExpanded ? '4px 12px' : '3px 8px',
                    borderRadius: 12,
                    fontSize: isExpanded ? 12 : 10,
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: getStatusColor(subtask.statusName),
                    flexShrink: 0
                  }}>
                    {isExpanded ? subtask.statusName : subtask.statusName.substring(0, 6)}
                  </div>
                  <div style={{
                    color: '#007bff',
                    fontSize: isExpanded ? 16 : 14,
                    flexShrink: 0
                  }}>
                    ➤
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Показать количество скрытых подзадач в свернутом виде */}
            {!isExpanded && subtasks.length > 4 && (
              <div style={{
                padding: 8,
                textAlign: 'center',
                color: '#6c757d',
                fontSize: 12,
                fontStyle: 'italic'
              }}>
                ... и еще {subtasks.length - 4} подзадач(и)
              </div>
            )}

            {/* Кнопка добавления в развернутом виде */}
            {isExpanded && (
              <Link href={`/tasks/add?parentId=${parentTaskId}`}>
                <button style={{
                  padding: '12px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 16
                }}>
                  ➕ Добавить подзадачу
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </WindowsWindow>
  );
}
