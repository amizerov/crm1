import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getProjectById, getCompanies } from '../../actions/actions';
import { getProjectStatuses } from '../../actions/statusActions';
import { getTemplates } from '@/app/templates/actions/getTemplates';
import ButtonBack from '@/components/ButtonBack';
import ProjectEditTabs from './ProjectEditTabs';
import { getProjectAccessEmployees } from './actions';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    redirect('/projects');
  }

  const [project, companies, statuses, templates, accessEmployees] = await Promise.all([
    getProjectById(projectId),
    getCompanies(),
    getProjectStatuses(projectId),
    getTemplates(),
    getProjectAccessEmployees(projectId)
  ]);

  if (!project) {
    redirect('/projects');
  }

  return (
    <div className="mx-auto max-w-[900px] py-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[28px] font-bold text-gray-900">
            Редактирование проекта
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Изменение данных проекта &quot;{project.projectName}&quot; (ID: {project.id})
          </p>
        </div>
        <ButtonBack />
      </div>

      <ProjectEditTabs
        project={project}
        companies={companies}
        statuses={statuses}
        templates={templates}
        accessEmployees={accessEmployees}
      />
    </div>
  );
}
