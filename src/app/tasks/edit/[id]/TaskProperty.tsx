'use client';

import Link from 'next/link';
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
  onSubmit: (formData: FormData) => void;
  onDelete: (taskId: number, taskName: string) => void;
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

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: 8, 
      padding: 20,
      backgroundColor: 'white'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="hidden" name="id" value={task.id} />
        
        {/* Название и исполнитель в одну строку */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
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
        </div>

        {/* Статус, приоритет, начало работы, дедлайн в одну строку */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
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

        {/* Родительская задача и Компания в одну строку */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
              Родительская задача
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select 
                name="parentId" 
                defaultValue={task.parentId || ''}
                style={{ 
                  flex: 1,
                  padding: '10px 12px', 
                  border: '1px solid #ced4da', 
                  borderRadius: 4,
                  fontSize: 14
                }}
              >
                <option value="">Нет (корневая задача)</option>
                {parentTasks.map((parentTask) => (
                  <option key={parentTask.id} value={parentTask.id}>
                    {'—'.repeat(parentTask.level)} {parentTask.taskName}
                  </option>
                ))}
              </select>
              {task.parentId && (
                <Link 
                  href={`/tasks/edit/${task.parentId}`}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Перейти к родительской задаче"
                >
                  ↗️ Перейти
                </Link>
              )}
            </div>
          </div>

          {/* Компания (только для корневых задач) */}
          {!task.parentId && (
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
                <option value="">Без компании</option>
                {userCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName} {company.isOwner ? '👑' : '👤'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Описание */}
        <div>
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
              minHeight: 80,
              fontSize: 14,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Кнопки */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
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
            <Link href="/tasks">
              <button 
                type="button" 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#6c757d',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Отмена
              </button>
            </Link>
          </div>

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
      </form>
    </div>
  );
}
