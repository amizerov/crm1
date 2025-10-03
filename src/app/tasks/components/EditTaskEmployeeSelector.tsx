'use client';

import { useState, useEffect } from 'react';
import { getEmployeesByCompany } from '@/app/employees/actions';

interface Employee {
  id: number;
  Name: string;
  displayName?: string;
  userId?: number;
  userNicName?: string;
  userFullName?: string;
}

interface EditTaskEmployeeSelectorProps {
  task: {
    id: number;
    companyId?: number;
    executorId?: number;
  };
  currentUserId: number;
  initialEmployees: Employee[];
}

export default function EditTaskEmployeeSelector({ 
  task, 
  currentUserId, 
  initialEmployees 
}: EditTaskEmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!task.companyId) {
        // Для личных задач показываем всех сотрудников
        setEmployees(initialEmployees);
        return;
      }

      setIsLoading(true);
      try {
        const newEmployees = await getEmployeesByCompany(task.companyId);
        setEmployees(newEmployees);
      } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [task.companyId, initialEmployees]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 14 }}>
        Исполнитель
      </label>
      <select 
        name="executorId" 
        defaultValue={task.executorId || ''}
        disabled={isLoading}
        style={{ 
          width: '100%', 
          padding: '10px 12px', 
          border: '1px solid #ced4da', 
          borderRadius: 4,
          fontSize: 14,
          opacity: isLoading ? 0.7 : 1
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
  );
}