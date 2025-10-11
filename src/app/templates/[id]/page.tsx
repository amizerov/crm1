import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getTemplateById } from '../actions/getTemplateById';
import TemplateEditor from '../components/TemplateEditor';
import BackButton from '@/components/ButtonBack';

export default async function EditTemplatePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const templateId = parseInt(resolvedParams.id);
  
  if (isNaN(templateId)) {
    redirect('/templates');
  }

  const template = await getTemplateById(templateId);

  if (!template) {
    redirect('/templates');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Редактировать шаблон процесса
          </h1>
          <BackButton />
        </div>

        <TemplateEditor template={template} />
      </div>
    </div>
  );
}
