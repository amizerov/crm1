'use client';

import { useState } from 'react';
import WindowsWindow from '@/components/WindowsWindow';

interface TaskAction {
  id: number;
  taskId: number;
  description: string;
  userId: number;
  dtc: string;
  dtu?: string;
  userName?: string;
}

interface TaskActionsProps {
  taskId: number;
  actions: TaskAction[];
  currentUserId: number;
  addActionFunction: (formData: FormData) => Promise<void>;
}

export default function TaskActions({ taskId, actions, currentUserId, addActionFunction }: TaskActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsAdding(true);
    try {
      await addActionFunction(formData);
      // Очищаем форму
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        const textarea = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        if (textarea) textarea.value = '';
      }
    } catch (error) {
      console.error('Ошибка при добавлении действия:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <WindowsWindow
      title="Действия по задаче"
      icon="📝"
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      defaultSize={{ width: 800, height: 600 }}
      minSize={{ width: 400, height: 300 }}
    >
      {/* Форма добавления нового действия */}
      <div style={{ 
        flexShrink: 0,
        marginBottom: 16
      }}>
        <form action={handleSubmit} style={{ 
          margin: 0
        }}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="userId" value={currentUserId} />
          
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              name="description"
              placeholder="Добавить действие или комментарий..."
              required
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ced4da',
                borderRadius: 4,
                fontSize: 14,
                minHeight: 38,
                maxHeight: 120,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              disabled={isAdding}
              style={{
                padding: '10px 16px',
                backgroundColor: isAdding ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: isAdding ? 'not-allowed' : 'pointer',
                fontSize: 18,
                fontWeight: 'bold',
                minWidth: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Добавить действие"
            >
              {isAdding ? '⏳' : '+'}
            </button>
          </div>
        </form>
      </div>

      {/* Список действий */}
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        paddingRight: isExpanded ? 8 : 0
      }}>
        {actions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: 14,
            fontStyle: 'italic',
            padding: 20
          }}>
            Пока нет действий по задаче
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12
          }}>
            {actions.map((action) => (
              <div
                key={action.id}
                style={{
                  padding: 12,
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  borderLeft: '4px solid #007bff'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8
                }}>
                  <span style={{
                    fontSize: 13,
                    color: '#6c757d',
                    fontWeight: 500
                  }}>
                    {action.userName || 'Пользователь'}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: '#6c757d'
                  }}>
                    {formatDateTime(action.dtc)}
                  </span>
                </div>
                
                <div style={{
                  fontSize: 14,
                  color: '#495057',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap'
                }}>
                  {action.description}
                </div>
                
                {action.dtu && (
                  <div style={{
                    fontSize: 12,
                    color: '#6c757d',
                    marginTop: 8,
                    fontStyle: 'italic'
                  }}>
                    Изменено: {formatDateTime(action.dtu)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </WindowsWindow>
  );
}
