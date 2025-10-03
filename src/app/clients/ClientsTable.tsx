'use client';

import { useState, useTransition, useEffect } from 'react';
import { getClientsByCompany, getTotalSum } from './actions';
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

type Company = {
  id: number;
  companyName: string;
};

type Status = {
  id: number;
  status: string;
};

interface ClientsTableProps {
  initialClients: Client[];
  companies: Company[];
  statuses: Status[];
  initialTotalSum: number;
  defaultCompanyId?: number;
}

export default function ClientsTable({ 
  initialClients, 
  companies, 
  statuses, 
  initialTotalSum, 
  defaultCompanyId
}: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(defaultCompanyId || 0);
  const [totalSum, setTotalSum] = useState<number>(initialTotalSum);
  const [isPending, startTransition] = useTransition();

  // При загрузке компонента проверяем localStorage
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId_clients');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId);
      // Проверяем, что сохраненная компания есть в списке доступных
      if (companyId === 0 || companies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId);
        // Загружаем данные для сохраненной компании
        if (companyId !== (defaultCompanyId || 0)) {
          handleCompanyChange(companyId);
        }
      }
    }
  }, [companies, defaultCompanyId]);

  // Создаем карту статусов для быстрого поиска
  const statusMap = new Map(statuses.map(s => [s.id, s.status]));

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId_clients', companyId.toString());
    
    startTransition(async () => {
      const [newClients, newTotalSum] = await Promise.all([
        getClientsByCompany(companyId === 0 ? undefined : companyId),
        getTotalSum(companyId === 0 ? undefined : companyId)
      ]);
      setClients(newClients);
      setTotalSum(newTotalSum);
    });
  };

  return (
    <div>
      {/* Заголовок и селектор компании */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Клиенты</h1>
          
          {/* Селектор компании */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="company-select" style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
              Компания:
            </label>
            <select
              id="company-select"
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(Number(e.target.value))}
              disabled={isPending}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                backgroundColor: isPending ? '#f5f5f5' : 'white',
                cursor: isPending ? 'not-allowed' : 'pointer',
                minWidth: 180,
                opacity: isPending ? 0.7 : 1
              }}
            >
              <option value={0}>Все компании</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            {isPending && (
              <span style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                Загрузка...
              </span>
            )}
          </div>
          
          <div style={{ backgroundColor: '#f8f9fa', padding: '8px 16px', borderRadius: 6, border: '1px solid #dee2e6' }}>
            <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
              Всего клиентов: {clients.length}
            </span>
          </div>
          
          <div style={{ backgroundColor: '#e8f5e8', padding: '8px 16px', borderRadius: 6, border: '1px solid #28a745' }}>
            <span style={{ fontSize: 14, color: '#155724', fontWeight: 'bold' }}>
              Общая сумма: {totalSum.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/clients/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              + Добавить клиента
            </button>
          </a>
        </div>
      </div>

      {/* Таблица клиентов */}
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
            <span style={{ fontSize: 16, color: '#666' }}>Загрузка клиентов...</span>
          </div>
        )}
        
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