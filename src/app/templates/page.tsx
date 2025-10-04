import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/db/loginUser';
import { getTemplates } from './actions/getTemplates';
import TemplatesList from './components/TemplatesList';
import Link from 'next/link';

export default async function TemplatesPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const templates = await getTemplates();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Шаблоны процессов
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Создавайте шаблоны с шагами процесса для использования в проектах
            </p>
          </div>
          <Link
            href="/templates/new"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg 
                     font-medium transition-colors shadow-sm hover:shadow-md"
          >
            + Создать шаблон
          </Link>
        </div>

        <TemplatesList templates={templates} />
      </div>
    </div>
  );
}
