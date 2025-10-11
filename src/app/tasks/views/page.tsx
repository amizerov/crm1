import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getTasks } from '../actions/getTasks';
import { getUserCompanies } from '../actions/getUserCompanies';
import { getTaskStatuses } from '../actions/getTaskStatuses';
import { query } from '@/db/connect';
import TaskViewLayout from './TaskViewLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Задачи - Argo CRM',
  description: 'Управление задачами',
};

export default async function TasksPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Проверяем наличие необходимых данных
  const [companiesCount, projectsCount, employeesCount] = await Promise.all([
    query('SELECT COUNT(*) as count FROM Company'),
    query('SELECT COUNT(*) as count FROM Project'),
    query('SELECT COUNT(*) as count FROM Employee')
  ]);

  const hasCompanies = companiesCount[0]?.count > 0;
  const hasProjects = projectsCount[0]?.count > 0;
  const hasEmployees = employeesCount[0]?.count > 0;

  // Если нет компаний - показываем сообщение
  if (!hasCompanies) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Нет компаний
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для работы с задачами необходимо создать хотя бы одну компанию.
          </p>
          <Link
            href="/companies/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Создать компанию
          </Link>
        </div>
      </div>
    );
  }

  // Если нет проектов - показываем сообщение
  if (!hasProjects) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Нет проектов
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для работы с задачами необходимо создать хотя бы один проект.
          </p>
          <Link
            href="/projects/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Создать проект
          </Link>
        </div>
      </div>
    );
  }

  // Если нет сотрудников - показываем сообщение
  if (!hasEmployees) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Нет сотрудников
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для работы с задачами необходимо добавить хотя бы одного сотрудника.
          </p>
          <Link
            href="/employees/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Добавить сотрудника
          </Link>
        </div>
      </div>
    );
  }

  // Если все проверки пройдены - загружаем данные для задач
  const [initialTasks, userCompanies, statuses] = await Promise.all([
    getTasks(),
    getUserCompanies(),
    getTaskStatuses()
  ]);

  return (
    <TaskViewLayout
      initialTasks={initialTasks}
      userCompanies={userCompanies}
      statuses={statuses}
      currentUserId={currentUser.id}
    />
  );
}
