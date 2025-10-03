'use client';

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
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Фильтры
        </h2>
        
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
            <option value={0}>Все проекты</option>
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
