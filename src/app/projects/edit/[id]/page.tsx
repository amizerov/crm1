import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getProjectById, getCompanies } from '../../actions/actions';
import { getProjectStatuses } from '../../actions/statusActions';
import { getProjectTaskTypes } from '../../actions/taskTypeActions';
import { getTemplates } from '@/app/templates/actions/getTemplates';
import ProjectForm from './ProjectForm';
import ProjectStatusEditor from './ProjectStatusEditor';
import ProjectTaskTypeEditor from './TaskTypeEditor';

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

  const [project, companies, statuses, taskTypes, templates] = await Promise.all([
    getProjectById(projectId),
    getCompanies(),
    getProjectStatuses(projectId),
    getProjectTaskTypes(projectId),
    getTemplates()
  ]);

  if (!project) {
    redirect('/projects');
  }

  return (
    <div style={{ padding: '20px 0', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <ProjectForm project={project} companies={companies} />
      </div>
      
      <ProjectStatusEditor 
        projectId={project.id} 
        initialStatuses={statuses} 
        templates={templates}
      />

      <ProjectTaskTypeEditor 
        projectId={project.id} 
        initialTaskTypes={taskTypes}
      />
    </div>
  );
}
