import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TemplatesTable from './TemplatesTable';

export default async function TemplatesPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          📝 Шаблоны процессов
        </h1>
        <Link 
          href="/templates/add"
          className="
            px-4 py-2
            bg-green-600 hover:bg-green-700
            dark:bg-green-500 dark:hover:bg-green-600
            text-white
            rounded-lg
            font-medium
            transition-colors
            no-underline
          "
        >
          + Добавить шаблон
        </Link>
      </div>

      <TemplatesTable />
    </div>
  );
}
