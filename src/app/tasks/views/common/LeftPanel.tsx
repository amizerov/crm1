'use client';

import Link from 'next/link';

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface Project {
  id: number;
  projectName: string;
}

interface LeftPanelProps {
  userCompanies: UserCompany[];
  selectedCompanyId: number;
  onCompanyChange: (companyId: number) => void;
  projects: Project[];
  selectedProjectId: number;
  onProjectChange: (projectId: number) => void;
  isPending: boolean;
}

export default function LeftPanel({ 
  userCompanies, 
  selectedCompanyId, 
  onCompanyChange,
  projects,
  selectedProjectId,
  onProjectChange,
  isPending 
}: LeftPanelProps) {
  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        
        {/* Навигационный блок */}
        <div className="mb-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Главная</span>
          </Link>
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Мои задачи</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>Входящие</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-gray-200 dark:border-gray-600 mb-6"></div>

        {/* Селектор компании */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Компания
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => onCompanyChange(Number(e.target.value))}
            disabled={isPending}
            className="
              w-full px-3 py-2 
              border border-gray-300 dark:border-gray-600 
              rounded-md text-sm 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <option value={0}>Все компании</option>
            {userCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName} {company.isOwner ? '👑' : '👤'}
              </option>
            ))}
          </select>
        </div>

        {/* Селектор проекта */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Проект
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => onProjectChange(Number(e.target.value))}
            disabled={selectedCompanyId === 0 || projects.length === 0}
            className="
              w-full px-3 py-2 
              border border-gray-300 dark:border-gray-600 
              rounded-md text-sm 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <option value={0}>Без проекта</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
          {selectedCompanyId === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Выберите компанию
            </p>
          )}
          {selectedCompanyId !== 0 && projects.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Нет проектов в компании
            </p>
          )}
        </div>
      </div>

      {/* Дополнительные фильтры можно добавить здесь */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isPending && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Загрузка...</p>
          </div>
        )}
      </div>
    </div>
  );
}
