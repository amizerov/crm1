'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Company = {
  id: number;
  companyName: string;
};

interface CompanySelectorProps {
  companies: Company[];
  currentCompanyId?: number;
}

export default function CompanySelector({ companies, currentCompanyId }: CompanySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCompanyChange = (companyId: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (companyId === '0') {
      params.delete('companyId');
    } else {
      params.set('companyId', companyId);
    }
    
    // Сбрасываем страницу на первую при смене компании
    params.delete('page');
    
    router.push(`/clients?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor="company-select" style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
        Компания:
      </label>
      <select
        id="company-select"
        value={currentCompanyId || 0}
        onChange={(e) => handleCompanyChange(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: 4,
          fontSize: 14,
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: 180
        }}
      >
        <option value={0}>Все компании</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.companyName}
          </option>
        ))}
      </select>
    </div>
  );
}