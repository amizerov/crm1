'use client';

import { useState, useEffect } from 'react';

export type Company = {
  id: number;
  companyName: string;
};

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId?: number;
  onCompanyChange: (companyId: number) => void;
  isPending?: boolean;
  storageKey?: string;
}

export default function CompanySelector({ 
  companies, 
  selectedCompanyId = 0, 
  onCompanyChange, 
  isPending = false,
  storageKey = 'selectedCompanyId'
}: CompanySelectorProps) {
  const [currentSelectedId, setCurrentSelectedId] = useState<number>(selectedCompanyId);

  // Синхронизируем внутреннее состояние с переданным selectedCompanyId
  useEffect(() => {
    setCurrentSelectedId(selectedCompanyId);
  }, [selectedCompanyId]);

  // Синхронизируем выбранную компанию при изменении списка компаний
  useEffect(() => {
    // Проверяем, что выбранная компания существует в списке
    if (currentSelectedId !== 0 && !companies.some(c => c.id === currentSelectedId)) {
      setCurrentSelectedId(selectedCompanyId || 0);
    }
  }, [companies, selectedCompanyId, currentSelectedId]);

  const handleCompanyChange = (companyId: number) => {
    setCurrentSelectedId(companyId);
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
        value={currentSelectedId}
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