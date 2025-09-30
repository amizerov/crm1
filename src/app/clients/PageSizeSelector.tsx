'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type PageSizeSelectorProps = {
  currentPageSize: number;
  currentPage: number;
};

export default function PageSizeSelector({ currentPageSize, currentPage }: PageSizeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageSizeOptions = [
    { value: 5, label: '5 на странице' },
    { value: 10, label: '10 на странице' },
    { value: 20, label: '20 на странице' },
    { value: 50, label: '50 на странице' },
    { value: 100, label: '100 на странице' }
  ];

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', newPageSize.toString());
    
    // При изменении размера страницы сбрасываем на первую страницу
    params.set('page', '1');
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label 
        htmlFor="pageSize" 
        style={{ 
          fontSize: '14px', 
          color: '#6c757d',
          fontWeight: '500'
        }}
      >
        Показывать:
      </label>
      <select
        id="pageSize"
        value={currentPageSize}
        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        style={{
          padding: '6px 8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: 'white',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '120px'
        }}
      >
        {pageSizeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
