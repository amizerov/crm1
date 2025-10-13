'use client';

import { useState, useEffect } from 'react';
import { getEmployeesByCompany } from '@/app/employees/actions/actions';

interface Employee {
  id: number;
  Name: string;
  displayName?: string;
}

interface EmployeeSelectorProps {
  companyId: number | null;
  initialEmployees: Employee[];
  selectedEmployeeId?: number;
  name?: string;
}

export default function EmployeeSelector({ 
  companyId, 
  initialEmployees, 
  selectedEmployeeId,
  name = 'executorId' 
}: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      if (companyId === null) {
        // Для личных задач показываем всех сотрудников
        setEmployees(initialEmployees);
        return;
      }

      setIsLoading(true);
      try {
        const newEmployees = await getEmployeesByCompany(companyId);
        setEmployees(newEmployees);
      } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [companyId, initialEmployees]);

  return (
    <select 
      name={name}
      defaultValue={selectedEmployeeId || ''}
      disabled={isLoading}
      style={{ 
        width: '100%', 
        padding: 10, 
        border: '1px solid #ccc', 
        borderRadius: 4,
        opacity: isLoading ? 0.7 : 1
      }}
    >
      <option value="">Не назначен</option>
      {employees.map((employee: Employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.displayName || employee.Name}
        </option>
      ))}
    </select>
  );
}