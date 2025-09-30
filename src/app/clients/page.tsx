import { getClientsWithPagination, getStatuses, getTotalSum } from './actions';
import Link from 'next/link';
import ClientRow from './ClientRow';
import Pagination from './Pagination';
import PageSizeSelector from './PageSizeSelector';
import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';

type Client = {
  id: number;
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
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

interface ClientsPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10; // По умолчанию 10 клиентов на странице

  const [{ clients, pagination }, statuses, totalSum] = await Promise.all([
    getClientsWithPagination(currentPage, pageSize),
    getStatuses(),
    getTotalSum()
  ]);

  // Создаем карту статусов для быстрого поиска
  const statusMap = new Map(statuses.map(s => [s.id, s.status]));

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Клиенты</h1>
          <div style={{ backgroundColor: '#f8f9fa', padding: '8px 16px', borderRadius: 6, border: '1px solid #dee2e6' }}>
            <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
              Всего клиентов: {pagination.total}
            </span>
          </div>
          <div style={{ backgroundColor: '#e8f5e8', padding: '8px 16px', borderRadius: 6, border: '1px solid #28a745' }}>
            <span style={{ fontSize: 14, color: '#155724', fontWeight: 'bold' }}>
              Общая сумма: {totalSum.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <PageSizeSelector 
            currentPageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
          />
          <Link href="/clients/add">
            <button style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              + Добавить клиента
            </button>
          </Link>
        </div>
      </div>

      {/* Таблица клиентов */}
      {clients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <p>Клиенты не найдены</p>
          <Link href="/clients/add">
            <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 16 }}>
              Добавить первого клиента
            </button>
          </Link>
        </div>
      ) : (
        <>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Имя</th>
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

          {/* Компонент пагинации */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            pageSize={pagination.pageSize}
            total={pagination.total}
          />
        </>
      )}
    </div>
  );
}
