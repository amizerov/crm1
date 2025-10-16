import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import InboxView from './InboxView';
import { getInboxTasks } from './actions';

export default async function InboxPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const tasks = await getInboxTasks(currentUser.id);

  return (
    <InboxView 
      tasks={tasks}
      currentUserId={currentUser.id}
    />
  );
}
