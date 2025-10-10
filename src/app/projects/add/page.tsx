import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getCompanies } from '../actions';
import { getTemplates } from '@/app/templates/actions/getTemplates';
import BackButton from '@/components/ButtonBack';
import AddProjectForm from './AddProjectForm';

export default async function AddProjectPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [companies, templates] = await Promise.all([
    getCompanies(),
    getTemplates()
  ]);

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Добавить проект</h1>
        <BackButton />
      </div>

      <AddProjectForm 
        companies={companies}
        templates={templates}
        defaultCompanyId={currentUser.companyId}
      />
    </div>
  );
}