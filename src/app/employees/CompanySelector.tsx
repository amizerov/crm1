'use client';

import { useState, useEffect } from 'react';

type Company = {
  id: number;
  companyName: string;
};

interface CompanySelectorProps {
  companies: Company[];
  defaultCompanyId?: number;
  onCompanyChange: (companyId: number) => void;
  isPending?: boolean;
  storageKey?: string;
}

export default function CompanySelector({ 
  companies, 
  defaultCompanyId, 
  onCompanyChange, 
  isPending = false,
  storageKey = 'selectedCompanyId'
}: CompanySelectorProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(() => {
    // Инициализируем из localStorage или defaultCompanyId
    if (typeof window !== 'undefined') {
      const savedCompanyId = localStorage.getItem(storageKey);
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId, 10);
        return companyId;
      }
    }
    return defaultCompanyId || 0;
  });

  // Синхронизируем выбранную компанию при изменении списка компаний
  useEffect(() => {
    // Проверяем, что выбранная компания существует в списке
    if (selectedCompanyId !== 0 && !companies.some(c => c.id === selectedCompanyId)) {
      setSelectedCompanyId(defaultCompanyId || 0);
    }
  }, [companies, defaultCompanyId, selectedCompanyId]);

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    // Сохраняем выбор в localStorage
    localStorage.setItem(storageKey, companyId.toString());
    onCompanyChange(companyId);
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8 
    }}>
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