'use client';

import { useEffect, useState } from 'react';

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface CompanySelectorProps {
  userCompanies: UserCompany[];
  companyId: number | undefined;
}

export default function CompanySelector({ userCompanies, companyId }: CompanySelectorProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId?.toString() || '');

  // При загрузке компонента проверяем localStorage
  useEffect(() => {
    // Если компания не выбрана через URL, пытаемся восстановить из localStorage
    if (!companyId) {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId && userCompanies.some(c => c.id.toString() === savedCompanyId)) {
        // Если сохраненная компания есть в списке доступных, перенаправляем
        const url = new URL(window.location.href);
        url.searchParams.set('company', savedCompanyId);
        window.location.href = url.toString();
        return;
      }
    }
    
    // Обновляем локальное состояние
    setSelectedCompanyId(companyId?.toString() || '');
  }, [companyId, userCompanies]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    
    // Сохраняем выбор в localStorage
    if (newCompanyId) {
      localStorage.setItem('selectedCompanyId', newCompanyId);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
    
    // Обновляем URL
    const url = new URL(window.location.href);
    if (newCompanyId) {
      url.searchParams.set('company', newCompanyId);
    } else {
      url.searchParams.delete('company');
    }
    window.location.href = url.toString();
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
      <option value="">Все доступные компании</option>
      {userCompanies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.companyName} {company.isOwner ? '👑' : '👤'}
        </option>
      ))}
    </select>
  );
}
