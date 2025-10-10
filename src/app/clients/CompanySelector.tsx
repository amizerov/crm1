'use client';

import { useState, useTransition, useEffect } from 'react';
import { getClientsByCompany, getTotalSum } from './actions';

type Company = {
  id: number;
  companyName: string;
};

interface CompanySelectorProps {
  companies: Company[];
  defaultCompanyId?: number;
  onDataChange: (clients: any[], totalSum: number, companyId: number) => void;
}

export default function CompanySelector({ 
  companies, 
  defaultCompanyId, 
  onDataChange 
}: CompanySelectorProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(defaultCompanyId || 0);
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

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId_clients', companyId.toString());
    
    startTransition(async () => {
      const [newClients, newTotalSum] = await Promise.all([
        getClientsByCompany(companyId === 0 ? undefined : companyId),
        getTotalSum(companyId === 0 ? undefined : companyId)
      ]);
      onDataChange(newClients, newTotalSum, companyId);
    });
  };

  return (
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
  );
}