'use client';

import { useEffect } from 'react';

/**
 * Хук для синхронизации активной компании с localStorage
 */
export function useCompanySync(currentCompanyId?: number) {
  useEffect(() => {
    if (currentCompanyId) {
      // Сохраняем текущую компанию в localStorage
      localStorage.setItem('selectedCompanyId', currentCompanyId.toString());
    }
  }, [currentCompanyId]);

  // Функция для получения сохранённой компании
  const getSavedCompanyId = (): number | null => {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem('selectedCompanyId');
    return saved ? parseInt(saved, 10) : null;
  };

  return { getSavedCompanyId };
}