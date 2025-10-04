import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/db/loginUser';
import { getTasks } from '../actions/getTasks';
import { getUserCompanies } from '../actions/getUserCompanies';
import { getTaskStatuses } from '../actions/getTaskStatuses';
import TasksViewLayout from './common/TasksViewLayout';

export default async function TasksViewsPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [tasks, userCompanies, statuses] = await Promise.all([
    getTasks(),
    getUserCompanies(),
    getTaskStatuses()
  ]);

  return (
    <TasksViewLayout 
      initialTasks={tasks}
      userCompanies={userCompanies}
      statuses={statuses}
      currentUserId={currentUser.id}
      initialView="desk" // По умолчанию канбан
    />
  );
}
