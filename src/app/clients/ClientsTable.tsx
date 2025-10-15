'use client';

import { useRouter } from 'next/navigation';
import TableBase, { Column } from '@/components/TableBase';

export type Client = {
  id: number;
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
  companyId?: number;
  companyName?: string;
  summa?: number;
  payDate?: string;
  payType?: string;
  dtc: string;
  dtu?: string;
};

type Status = {
  id: number;
  status: string;
};

interface ClientsTableProps {
  clients: Client[];
  statuses: Status[];
}

export default function ClientsTable({ 
  clients, 
  statuses
}: ClientsTableProps) {
  const router = useRouter();
  
  // Создаем карту статусов для быстрого поиска
  const statusMap = new Map(statuses.map(s => [s.id, s.status]));

  const columns: Column<Client>[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16 font-mono'
    },
    {
      key: 'clientName',
      label: 'Имя'
    },
    {
      key: 'companyName',
      label: 'Компания',
      render: (client) => client.companyName || '-'
    },
    {
      key: 'description',
      label: 'Описание',
      render: (client) => client.description || '-'
    },
    {
      key: 'contacts',
      label: 'Контакты',
      render: (client) => client.contacts || '-'
    },
    {
      key: 'statusId',
      label: 'Статус',
      render: (client) => statusMap.get(client.statusId) || `ID: ${client.statusId}`
    },
    {
      key: 'summa',
      label: 'Сумма',
      className: 'text-right font-mono',
      render: (client) => client.summa ? `${client.summa.toLocaleString()} ₽` : '-'
    }
  ];

  const handleRowClick = (client: Client) => {
    router.push(`/clients/edit/${client.id}`);
  };

  return (
    <TableBase
      data={clients}
      columns={columns}
      onRowClick={handleRowClick}
      emptyMessage="Клиенты не найдены"
      addButtonText="Добавить первого клиента"
      addButtonLink="/clients/add"
    />
  );
}