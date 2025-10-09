import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getTasks } from '../actions/getTasks';
import { getUserCompanies } from '../actions/getUserCompanies';
import { getTaskStatuses } from '../actions/getTaskStatuses';
import TaskViewLayout from './TaskViewLayout';

export const metadata = {
  title: 'Задачи - Argo CRM',
  description: 'Управление задачами',
};

export default async function TasksPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Загружаем только начальные данные
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
