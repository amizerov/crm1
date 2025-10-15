import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getUserCompanies } from '@/db/getUsers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CompanyCard from './CompanyCard';

type Company = {
  id: number;
  companyName: string;
  ownerId: number;
  ownerName?: string;
  isOwner: boolean;
};

export default async function CompaniesPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  console.log('Current User:', currentUser);

  if (!currentUser) {
    redirect('/login');
  }

  // Получаем компании пользователя
  const companies = await getUserCompanies(currentUser.id);

  return (
    <div className="py-5 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Мои компании
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Управление компаниями и переключение между ними
          </p>
        </div>
        
        <Link 
          href="/companies/add"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Создать компанию
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 px-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-6">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            У вас пока нет компаний
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Создайте первую компанию или попросите коллег добавить вас в существующую
          </p>
          <Link 
            href="/companies/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Создать первую компанию
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              currentCompanyId={currentUser.companyId}
              companies={companies}
            />
          ))}
        </div>
      )}
    </div>
  );
}
