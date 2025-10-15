'use client';

import Link from 'next/link';
import CompanySwitcher from '@/components/CompanySwitcher';

interface Company {
  id: number;
  companyName: string;
  ownerId: number;
  ownerName?: string;
  isOwner: boolean;
}

interface CompanyCardProps {
  company: Company;
  currentCompanyId: number;
  companies: Company[];
}

export default function CompanyCard({ company, currentCompanyId, companies }: CompanyCardProps) {
  const isActive = currentCompanyId === company.id;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Заголовок и бейдж активности */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {company.companyName}
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              company.isOwner
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            }`}
          >
            {company.isOwner ? 'Владелец' : 'Сотрудник'}
          </span>
        </div>

        {isActive && (
          <div className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded text-xs font-medium">
            Активная
          </div>
        )}
      </div>

      {/* Информация о владельце */}
      {company.ownerName && !company.isOwner && (
        <p className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
          Владелец: {company.ownerName}
        </p>
      )}

      {/* Кнопки действий */}
      <div className="flex gap-2 flex-wrap">
        {company.isOwner && (
          <Link
            href={`/companies/edit/${company.id}`}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Редактировать
          </Link>
        )}

        {!isActive && (
          <CompanySwitcher companies={companies} currentCompanyId={currentCompanyId}>
            <input type="hidden" name="companyId" value={company.id} />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Сделать активной
            </button>
          </CompanySwitcher>
        )}
      </div>
    </div>
  );
}
