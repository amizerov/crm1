'use client';

import { useState } from 'react';
import Link from 'next/link';
import WindowsWindow from '@/components/WindowsWindow';
import { Employee } from '@/app/employees/actions';

interface Task {
  id: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number; // Создатель задачи (ID пользователя)
  parentId?: number;
  companyId?: number;
}

interface TaskStatus {
  id: number;
  status: string;
}

interface Priority {
  id: number;
  priority: string;
}

interface ParentTask {
  id: number;
  taskName: string;
  level: number;
}

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface TaskPropertyProps {
  task: Task;
  statuses: TaskStatus[];
  priorities: Priority[];
  employees: Employee[];
  parentTasks: ParentTask[];
  userCompanies: UserCompany[];
  currentUserId: number;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: (taskId: number, taskName: string) => Promise<void>;
}

export default function TaskProperty({ 
  task, 
  statuses, 
  priorities, 
  employees, 
  parentTasks, 
  userCompanies, 
  currentUserId,
  onSubmit,
  onDelete 
}: TaskPropertyProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Форматируем дату для input date
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Найдем родительскую задачу для отображения ссылки
  const parentTask = task.parentId ? parentTasks.find(p => p.id === task.parentId) : null;

  // Фильтруем сотрудников, у которых есть userId (связанные с пользователями)
  const employeesWithUserId = employees.filter(emp => emp.userId);

  return (
    <WindowsWindow
      title="Свойства задачи"
      icon="⚙️"
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      defaultSize={{ width: 900, height: 600 }}
      minSize={{ width: 600, height: 400 }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: 16 }}>
        <input type="hidden" name="id" value={task.id} />
        
        {/* Минимальные поля в свернутом виде */}
        <div style={{ flexShrink: 0 }}>
          {/* Название задачи и компания (только в развернутом виде для корневых задач) */}
          <div style={{ display: 'grid', gridTemplateColumns: (isExpanded && !task.parentId) ? '2fr 1fr' : '1fr', gap: 16, marginBottom: 8 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
                Название задачи *
              </label>
              <input 
                name="taskName" 
                required 
                defaultValue={task.taskName}
                placeholder="Введите название задачи"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: '1px solid #ced4da', 
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>

            {/* Компания - только для корневых задач в развернутом виде */}
            {!task.parentId && isExpanded && (
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
                  Компания
                </label>
                <select 
                  name="companyId" 
                  defaultValue={task.companyId || ''}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 14
                  }}
                >
                  <option value="">Личная задача</option>
                  {userCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                      {company.isOwner && ' 👑'}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                  {task.companyId ? 
                    '🏢 Задача - видна всем сотрудникам компании' : 
                    '👤 Личная задача - видна только вам'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Кликабельная ссылка на родительскую задачу - только для подзадач, отдельной строкой */}
          {parentTask && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
                Родительская задача
              </label>
              <Link 
                href={`/tasks/edit/${task.parentId}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  borderRadius: 4,
                  fontSize: 14,
                  color: '#1565c0',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Кликните для перехода к родительской задаче"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#bbdefb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔗 {'—'.repeat(parentTask.level)} {parentTask.taskName}
              </Link>
            </div>
          )}

          {/* Цель задачи - всегда видно */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
              Цель задачи
            </label>
            <textarea 
              name="description" 
              defaultValue={task.description || ''}
              placeholder="Введите описание задачи"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '1px solid #ced4da', 
                borderRadius: 4, 
                minHeight: isExpanded ? 80 : 40,
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Развернутые поля - показываем только в развернутом состоянии */}
        {isExpanded && (
          <div style={{ flex: 1, overflow: 'auto', paddingRight: 8 }}>
            {/* Исполнитель и Создатель в одной строке */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
                  Исполнитель
                </label>
                <select 
                  name="executorId" 
                  defaultValue={task.executorId || ''}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 14
                  }}
                >
                  <option value="">Не назначен</option>
                  {employees.map((employee: Employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName || employee.Name}
                      {employee.userId && employee.userId === currentUserId && ' 👤 (это вы)'}
                    </option>
                  ))}
                </select>
                {/* Показываем информацию о текущем исполнителе */}
                {task.executorId && (
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                    {(() => {
                      const executor = employees.find((emp: Employee) => emp.id === task.executorId);
                      if (executor?.userId === currentUserId) {
                        return '✅ Вы являетесь исполнителем этой задачи';
                      }
                      if (executor?.userId) {
                        return `👤 Исполнитель связан с пользователем: ${executor.userNicName || executor.userFullName}`;
                      }
                      return '👷 Исполнитель - только сотрудник (без доступа к системе)';
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
                  Создатель
                </label>
                <div style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: '1px solid #e9ecef', 
                  borderRadius: 4,
                  fontSize: 14,
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    if (!task.userId) {
                      return 'Не указан';
                    }
                    const creator = employees.find((emp: Employee) => emp.userId === task.userId);
                    const creatorName = creator ? (creator.displayName || creator.Name) : 'Неизвестный пользователь';
                    const isCurrentUser = task.userId === currentUserId;
                    
                    return (
                      <span>
                        👤 {creatorName}
                        {isCurrentUser && ' (это вы)'}
                      </span>
                    );
                  })()}
                </div>
                {/* Показываем дополнительную информацию о создателе */}
                {task.userId && (
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                    {task.userId === currentUserId 
                      ? '✅ Вы создали эту задачу' 
                      : '� Только создатель и администратор могут удалить задачу'
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Статус, приоритет, начало работы, дедлайн в одну строку */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                  Статус *
                </label>
                <select 
                  name="statusId" 
                  required 
                  defaultValue={task.statusId}
                  style={{ 
                    width: '100%', 
                    padding: '7px 8px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 12
                  }}
                >
                  <option value="">Статус</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                  Приоритет
                </label>
                <select 
                  name="priorityId" 
                  defaultValue={task.priorityId || ''}
                  style={{ 
                    width: '100%', 
                    padding: '7px 8px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 12
                  }}
                >
                  <option value="">Приоритет</option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                  Начало
                </label>
                <input 
                  name="startDate" 
                  type="date"
                  defaultValue={task.startDate ? formatDateForInput(task.startDate) : ''}
                  style={{ 
                    width: '100%', 
                    padding: '7px 8px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 12
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                  Дедлайн
                </label>
                <input 
                  name="dedline" 
                  type="date"
                  defaultValue={task.dedline ? formatDateForInput(task.dedline) : ''}
                  style={{ 
                    width: '100%', 
                    padding: '7px 8px', 
                    border: '1px solid #ced4da', 
                    borderRadius: 4,
                    fontSize: 12
                  }}
                />
              </div>
            </div>

            {/* Кнопки - только в развернутом состоянии */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #e9ecef'
            }}>
              <button 
                type="submit" 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#007bff',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                💾 Сохранить
              </button>

              <button
                type="button"
                onClick={() => onDelete(task.id, task.taskName)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        )}
      </form>
    </WindowsWindow>
  );
}
