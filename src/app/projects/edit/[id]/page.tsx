import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import { getProjectById, getCompanies } from '../../actions';
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

  const [project, companies] = await Promise.all([
    getProjectById(projectId),
    getCompanies()
  ]);

  if (!project) {
    redirect('/projects');
  }

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/projects">
              <button style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer' 
              }}>
                ← Назад к списку
              </button>
            </Link>
            <h1 style={{ margin: 0 }}>Редактировать проект</h1>
          </div>
          <DelBtn projectId={project.id} />
        </div>
      </div>

      <ProjectForm project={project} companies={companies} />
    </div>
  );
}
