'use client';

import { useState } from 'react';
import ClientsTable from './ClientsTable';
import CompanySelector from './CompanySelector';

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

interface ClientsPageWrapperProps {
  initialClients: Client[];
  companies: Company[];
  statuses: Status[];
  initialTotalSum: number;
  defaultCompanyId?: number;
}

export default function ClientsPageWrapper({ 
  initialClients, 
  companies, 
  statuses, 
  initialTotalSum, 
  defaultCompanyId
}: ClientsPageWrapperProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [totalSum, setTotalSum] = useState<number>(initialTotalSum);

  const handleDataChange = (newClients: Client[], newTotalSum: number, companyId: number) => {
    setClients(newClients);
    setTotalSum(newTotalSum);
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
          
          <CompanySelector 
            companies={companies}
            defaultCompanyId={defaultCompanyId}
            onDataChange={handleDataChange}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/clients/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
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

      <ClientsTable 
        clients={clients}
        statuses={statuses}
      />
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '20px',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
      }}>
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
    </div>
  );
}