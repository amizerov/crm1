'use client';

import Link from 'next/link';
import { Employee } from './actions';
import { useRouter } from 'next/navigation';

interface EmployeeRowProps {
  employee: Employee;
}

export default function EmployeeRow({ employee }: EmployeeRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/employees/edit/${employee.id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      style={{ 
        borderBottom: '1px solid #ddd',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td style={{ padding: 12, border: '1px solid #ddd' }}>
        {employee.id}
      </td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>
        <div style={{ fontWeight: 'bold' }}>
          {employee.Name}
        </div>
      </td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>
        {employee.userId ? `User ID: ${employee.userId}` : 'Не связан с пользователем'}
      </td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>
        {employee.companyName || 'Не указана'}
      </td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>
        {new Date(employee.dtc).toLocaleDateString('ru-RU')}
      </td>
    </tr>
  );
}
