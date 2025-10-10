'use client';

import ClientRow from './ClientRow';

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
  // Создаем карту статусов для быстрого поиска
  const statusMap = new Map(statuses.map(s => [s.id, s.status]));

  return (
    <div>
      {/* Таблица клиентов */}
      <div style={{ position: 'relative' }}>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            <p>Клиенты не найдены</p>
            <a href="/clients/add">
              <button style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer', 
                marginTop: 16 
              }}>
                Добавить первого клиента
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
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Компания</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Описание</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Контакты</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <ClientRow 
                  key={client.id} 
                  client={client} 
                  statusName={statusMap.get(client.statusId) || `ID: ${client.statusId}`}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}