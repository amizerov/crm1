import Link from 'next/link';
import TaskManager from './TaskManager';
import CompanySelector from './CompanySelector';
import { getTasks } from './actions/getTasks';
import { getUserCompanies } from './actions/getUserCompanies';
import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';

type Task = {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number;
  companyId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
};

interface TasksPageProps {
  searchParams: Promise<{ executor?: string; company?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  const executorId = params.executor ? Number(params.executor) : undefined;
  const companyId = params.company ? Number(params.company) : undefined;

  const [tasks, userCompanies] = await Promise.all([
    getTasks(executorId, companyId),
    getUserCompanies()
  ]);
  
  // Если есть фильтр по исполнителю, получим имя исполнителя
  let executorName = '';
  if (executorId) {
    const executorInfo = tasks.find(task => task.executorId === executorId);
    executorName = executorInfo?.executorName || `ID: ${executorId}`;
  }

  // Найдем выбранную компанию
  const selectedCompany = companyId ? userCompanies.find(c => c.id === companyId) || null : null;

  return (
    <div className="py-5">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 m-0">
              Задачи компании:
            </h1>
            <CompanySelector 
              userCompanies={userCompanies}
              companyId={companyId}
            />
            {executorId && (
              <span className="text-lg font-normal text-blue-600 dark:text-blue-400">
                → {executorName}
              </span>
            )}
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Всего задач: {tasks.length}
            </span>
          </div>
          {executorId && (
            <Link href="/tasks" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              ← Показать все задачи
            </Link>
          )}
        </div>
        <Link 
          href="/tasks/add"
          className="
            px-6 py-3
            bg-green-600 hover:bg-green-700 
            dark:bg-green-500 dark:hover:bg-green-600
            text-white
            rounded
            text-base font-medium
            no-underline inline-block
            transition-all duration-200
            hover:shadow-lg dark:hover:shadow-green-500/20
            hover:-translate-y-0.5
          "
        >
          + Добавить задачу
        </Link>
      </div>

      {/* Таблица задач */}
      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
            Задачи не найдены
          </p>
          <Link 
            href="/tasks/add"
            className="
              px-5 py-2.5
              bg-green-600 hover:bg-green-700 
              dark:bg-green-500 dark:hover:bg-green-600
              text-white
              rounded
              no-underline inline-block
              transition-all duration-200
              hover:shadow-lg dark:hover:shadow-green-500/20
              mt-4
            "
          >
            Добавить первую задачу
          </Link>
        </div>
      ) : (
        <TaskManager 
          tasks={tasks} 
          userId={currentUser.id} 
          executorId={executorId}
          executorName={executorName}
        />
      )}
    </div>
  );
}