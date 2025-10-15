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
    <div className="flex items-center gap-2">
      <label 
        htmlFor="company-select" 
        className="text-sm font-bold text-gray-700 dark:text-gray-300"
      >
        Компания:
      </label>
      <select
        id="company-select"
        value={currentSelectedId}
        onChange={(e) => handleCompanyChange(Number(e.target.value))}
        disabled={isPending}
        className={`
          px-3 py-2 border rounded text-sm min-w-[180px]
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${isPending 
            ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-70' 
            : 'cursor-pointer'
          }
          transition-colors
        `}
      >
        <option value={0}>Все компании</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.companyName}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
          Загрузка...
        </span>
      )}
    </div>
  );
}