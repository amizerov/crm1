import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import { getProjectById, getCompanies } from '../../actions';
import { getTemplates } from '@/app/templates/actions/getTemplates';
import ProjectForm from './ProjectForm';
import DelBtn from './DelBtn';
import Link from 'next/link';

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

  const [project, companies, templates] = await Promise.all([
    getProjectById(projectId),
    getCompanies(),
    getTemplates()
  ]);

  if (!project) {
    redirect('/projects');
  }

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <ProjectForm project={project} companies={companies} templates={templates} />
    </div>
  );
}
