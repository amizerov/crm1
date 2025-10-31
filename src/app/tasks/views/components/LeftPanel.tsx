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
  onViewChange?: (view: 'list' | 'desk' | 'gantt' | 'inbox' | 'project') => void;
  currentView?: 'list' | 'desk' | 'gantt' | 'inbox' | 'project';
  unreadCount?: number;
  onCloseTaskDetails?: () => void;
}

export default function LeftPanel({ 
  userCompanies, 
  selectedCompanyId, 
  onCompanyChange,
  projects,
  selectedProjectId,
  onProjectChange,
  isPending,
  onViewChange,
  currentView,
  unreadCount = 0,
  onCloseTaskDetails
}: LeftPanelProps) {
  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        
        {/* Навигационный блок */}
        <div className="mb-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            onClick={() => onCloseTaskDetails?.()}
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Главная</span>
          </Link>
          
          <Link 
            href="/tasks/views" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            onClick={() => onCloseTaskDetails?.()}
          >
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Мои задачи</span>
          </Link>
          
          <button
            onClick={() => {
              onViewChange?.('inbox');
              onCloseTaskDetails?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group cursor-pointer relative ${
              currentView === 'inbox'
                ? 'bg-gray-500 text-white dark:bg-gray-500'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg 
              className={`w-4 h-4 ${
                currentView === 'inbox'
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-blue-500'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>Входящие</span>
            {unreadCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[20px]">
                {unreadCount}
              </span>
            )}
          </button>
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
            {/*<option value={0}>Все компании</option>*/}
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
          <div className="flex gap-1">
            <select
              value={selectedProjectId}
              onChange={(e) => onProjectChange(Number(e.target.value))}
              disabled={selectedCompanyId === 0 || projects.length === 0}
              className="
                flex-1 px-3 py-2 
                border border-gray-300 dark:border-gray-600 
                rounded-md text-sm 
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {/* <option value={0}>Без проекта</option> */}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
            
            {/* Кнопка просмотра деталей проекта */}
            {selectedProjectId > 0 && (
              <button
                onClick={() => {
                  onViewChange?.('project');
                  onCloseTaskDetails?.();
                }}
                className={`px-2 py-2 border rounded-md text-sm transition-colors flex items-center justify-center cursor-pointer ${
                  currentView === 'project'
                    ? 'border-gray-500 bg-gray-500 text-white dark:bg-gray-500 dark:border-gray-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title="Детали проекта"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
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
