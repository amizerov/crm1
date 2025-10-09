import Link from 'next/link';
import TaskManager from './TaskManager';
import { getTasks } from './actions/getTasks';
import { getUserCompanies } from './actions/getUserCompanies';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [tasks, userCompanies] = await Promise.all([
    getTasks(),
    getUserCompanies()
  ]);

  return (
    <div className="py-5">
      <TaskManager 
        tasks={tasks}
        userId={currentUser.id}
        userCompanies={userCompanies}
      />
    </div>
  );
}