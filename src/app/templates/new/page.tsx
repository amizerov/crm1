import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import TemplateEditor from '../components/TemplateEditor';
import Link from 'next/link';

export default async function NewTemplatePage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/templates"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 
                   dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          ← Назад к списку шаблонов
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Создать новый шаблон процесса
        </h1>

        <TemplateEditor />
      </div>
    </div>
  );
}
