import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/db/loginUser';
import { getTasks } from '../../actions/getTasks';
import { getUserCompanies } from '../../actions/getUserCompanies';
import { getTaskStatuses } from '../../actions/getTaskStatuses';
import DeskView from './DeskView';

export default async function DeskPage() {
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
    <DeskView 
      initialTasks={tasks}
      userCompanies={userCompanies}
      statuses={statuses}
      currentUserId={currentUser.id}
    />
  );
}
