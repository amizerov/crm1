'use client';

import { useRouter } from 'next/navigation';
import { switchCompany } from '@/app/companies/actions';

interface CompanySwitcherProps {
  companies: Array<{
    id: number;
    companyName: string;
    isOwner: boolean;
  }>;
  currentCompanyId?: number;
  children: React.ReactNode;
}

export default function CompanySwitcher({ companies, currentCompanyId, children }: CompanySwitcherProps) {
  const router = useRouter();

  const handleSwitchCompany = async (formData: FormData) => {
    const companyId = formData.get('companyId') as string;
    
    try {
      // Сохраняем в localStorage перед отправкой на сервер
      if (companyId) {
        localStorage.setItem('selectedCompanyId', companyId);
      }
      
      // Вызываем server action
      await switchCompany(formData);
      
      // Обновляем страницу
      router.refresh();
    } catch (error) {
      console.error('Ошибка при переключении компании:', error);
      // Если ошибка - убираем из localStorage
      localStorage.removeItem('selectedCompanyId');
    }
  };

  return (
    <form action={handleSwitchCompany}>
      {children}
    </form>
  );
}