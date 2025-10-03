import { getCurrentUser } from '@/db/loginUser';
import { redirect, notFound } from 'next/navigation';
import { getTemplateById, getProjects } from '../../actions';
import TemplateForm from './TemplateForm';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const { id } = await params;
  const templateId = parseInt(id);

  if (isNaN(templateId)) {
    notFound();
  }

  const [template, projects] = await Promise.all([
    getTemplateById(templateId),
    getProjects()
  ]);

  if (!template) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/templates"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 no-underline"
        >
          ← Назад к списку
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Редактировать шаблон процесса
      </h1>

      <TemplateForm template={template} projects={projects} />
    </div>
  );
}
