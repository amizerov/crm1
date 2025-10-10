'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addTask } from '../actions/addTask';
import EmployeeSelector from './EmployeeSelector';
import BackButton from '@/components/ButtonBack';

interface Employee {
  id: number;
  Name: string;
  displayName?: string;
}

interface Status {
  id: number;
  status: string;
}

interface Priority {
  id: number;
  priority: string;
}

interface Task {
  id: number;
  name: string;
}

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface AddTaskFormProps {
  statuses: Status[];
  priorities: Priority[];
  initialEmployees: Employee[];
  parentTasks: Task[];
  userCompanies: UserCompany[];
  preselectedParentId?: number;
}

export default function AddTaskForm({
  statuses,
  priorities,
  initialEmployees,
  parentTasks,
  userCompanies,
  preselectedParentId
}: AddTaskFormProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCompanyId(value === '' ? null : parseInt(value));
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addTask(formData);
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>
          Создание новой задачи
        </h1>
        {preselectedParentId && (
          <span style={{ 
            padding: '4px 12px', 
            backgroundColor: '#e3f2fd', 
            color: '#1976d2', 
            borderRadius: 16, 
            fontSize: 14 
          }}>
            Подзадача
          </span>
        )}
      </div>

      <form action={handleSubmit}>
        {preselectedParentId && (
          <input type="hidden" name="parentId" value={preselectedParentId} />
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Название задачи *
          </label>
          <input 
            name="name" 
            required 
            placeholder="Введите название задачи"
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Исполнитель
            </label>
            <EmployeeSelector
              companyId={selectedCompanyId}
              initialEmployees={initialEmployees}
              name="executorId"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Родительская задача
            </label>
            <select 
              name="parentId" 
              defaultValue={preselectedParentId || ''}
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Корневая задача</option>
              {parentTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Компания
          </label>
          <select 
            name="companyId" 
            onChange={handleCompanyChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option value="">Личная задача</option>
            {userCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
                {company.isOwner && ' 👑'}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            💡 Корпоративные задачи видны всем сотрудникам компании, личные - только вам
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Описание
          </label>
          <textarea 
            name="description" 
            placeholder="Введите описание задачи"
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, minHeight: 80 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Статус *
            </label>
            <select 
              name="statusId" 
              required 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Выберите статус</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Приоритет
            </label>
            <select 
              name="priorityId" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Не выбран</option>
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Начало работы
            </label>
            <input 
              name="startDate" 
              type="date"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Дедлайн
            </label>
            <input 
              name="dedline" 
              type="date"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-success"
            style={{ 
              padding: '12px 24px', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: isPending ? 'not-allowed' : 'pointer', 
              flex: 1,
              opacity: isPending ? 0.7 : 1
            }}
          >
            {isPending ? 'Создание...' : 'Создать задачу'}
          </button>
          <BackButton 
            className="btn-secondary"
            style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', backgroundColor: '#6c757d' }}
          >
            Отмена
          </BackButton>
        </div>
      </form>
    </div>
  );
}