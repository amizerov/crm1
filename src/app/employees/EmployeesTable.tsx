'use client';

import EmployeeRow from './EmployeeRow';

export type Employee = {
  id: number;
  Name: string;
  companyId: number;
  userId?: number;
  companyName?: string;
  userNicName?: string;
  userFullName?: string;
  displayName: string;
  dtc: string;
  dtu?: string;
};

interface EmployeesTableProps {
  employees: Employee[];
  isPending: boolean;
}

export default function EmployeesTable({ employees, isPending }: EmployeesTableProps) {
  return (
    <div>
      {/* Таблица сотрудников */}
      <div style={{ position: 'relative' }}>
        {isPending && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: 16, color: '#666' }}>Загрузка сотрудников...</span>
          </div>
        )}
        
        {employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            <p>Сотрудники не найдены</p>
            <a href="/employees/add">
              <button style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer', 
                marginTop: 16 
              }}>
                Добавить первого сотрудника
              </button>
            </a>
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Имя</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Пользователь</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Компания</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Дата создания</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee: Employee) => (
                <EmployeeRow 
                  key={employee.id} 
                  employee={employee} 
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Информация под таблицей */}
      {employees.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 16, 
          flexWrap: 'wrap', 
          gap: 16 
        }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '8px 16px', 
            borderRadius: 6, 
            border: '1px solid #dee2e6' 
          }}>
            <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
              Всего сотрудников: {employees.length}
            </span>
          </div>
          
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '6px 12px', 
            borderRadius: 4, 
            border: '1px solid #b3d9ff' 
          }}>
            <span style={{ fontSize: 12, color: '#0056b3', fontStyle: 'italic' }}>
              💡 Нажмите на строку для редактирования
            </span>
          </div>
        </div>
      )}
    </div>
  );
}