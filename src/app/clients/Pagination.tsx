'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  pageSize: number;
  total: number;
};

export default function Pagination({ currentPage, totalPages, hasNext, hasPrev, pageSize, total }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.push(createPageURL(page));
  };

  if (totalPages <= 1) return null;

  // Генерируем номера страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '32px',
      flexWrap: 'wrap'
    }}>
      {/* Кнопка "Предыдущая" */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={!hasPrev}
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          backgroundColor: hasPrev ? 'white' : '#f5f5f5',
          color: hasPrev ? '#007bff' : '#6c757d',
          cursor: hasPrev ? 'pointer' : 'not-allowed',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      >
        ← Предыдущая
      </button>

      {/* Номера страниц */}
      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span style={{ padding: '8px 4px', color: '#6c757d' }}>...</span>
          ) : (
            <button
              onClick={() => goToPage(page as number)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: currentPage === page ? '#007bff' : 'white',
                color: currentPage === page ? 'white' : '#007bff',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: currentPage === page ? 'bold' : 'normal'
              }}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      {/* Кнопка "Следующая" */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNext}
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          backgroundColor: hasNext ? 'white' : '#f5f5f5',
          color: hasNext ? '#007bff' : '#6c757d',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      >
        Следующая →
      </button>

      {/* Информация о странице */}
      <div style={{
        marginLeft: '16px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <div>Страница {currentPage} из {totalPages}</div>
        <div style={{ fontSize: '12px', marginTop: '2px' }}>
          Записи {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} из {total}
        </div>
      </div>
    </div>
  );
}
