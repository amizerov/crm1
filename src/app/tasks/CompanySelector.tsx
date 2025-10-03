'use client';

import { useEffect, useState } from 'react';

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface CompanySelectorProps {
  userCompanies: UserCompany[];
  selectedCompanyId: number;
  onCompanyChange: (companyId: number) => void;
}

export default function CompanySelector({ userCompanies, selectedCompanyId, onCompanyChange }: CompanySelectorProps) {
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = Number(e.target.value);
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCompanyId', newCompanyId.toString());
    
    // Вызываем callback для обновления данных
    onCompanyChange(newCompanyId);
  };

  return (
    <select
      value={selectedCompanyId}
      onChange={handleCompanyChange}
      className="
        px-3 py-2 border border-gray-300 dark:border-gray-600 
        rounded-md text-lg bg-white dark:bg-gray-700 
        text-gray-900 dark:text-gray-100
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        min-w-[250px] font-medium
      "
    >
      <option value={0}>Все доступные компании</option>
      {userCompanies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.companyName} {company.isOwner ? '👑' : '👤'}
        </option>
      ))}
    </select>
  );
}
