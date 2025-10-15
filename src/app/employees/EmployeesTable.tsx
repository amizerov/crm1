'use client';

import { useRouter } from 'next/navigation';
import TableBase, { Column } from '@/components/TableBase';

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
  const router = useRouter();

  const columns: Column<Employee>[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16 font-mono text-center'
    },
    {
      key: 'Name',
      label: 'Имя'
    },
    {
      key: 'displayName',
      label: 'Статус',
      render: (employee) => {
        if (employee.userId) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Активен ({employee.userNicName})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Приглашение отправлено
          </span>
        );
      }
    },
    {
      key: 'companyName',
      label: 'Компания',
      render: (employee) => employee.companyName || '-'
    },
    {
      key: 'dtc',
      label: 'Дата создания',
      className: 'font-mono',
      render: (employee) => {
        if (!employee.dtc) return '-';
        const date = new Date(employee.dtc);
        return date.toLocaleDateString('ru-RU');
      }
    }
  ];

  const handleRowClick = (employee: Employee) => {
    router.push(`/employees/edit/${employee.id}`);
  };

  return (
    <TableBase
      data={employees}
      columns={columns}
      onRowClick={handleRowClick}
      loading={isPending}
      emptyMessage="Сотрудники не найдены"
      addButtonText="Добавить первого сотрудника"
      addButtonLink="/employees/add"
    />
  );
}