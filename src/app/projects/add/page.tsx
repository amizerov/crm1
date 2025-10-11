import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getCompanies } from '../actions';
import { getTemplates } from '@/app/templates/actions/getTemplates';
import ButtonBack from '@/components/ButtonBack';
import FormPageLayout from '@/components/FormPageLayout';
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
    <FormPageLayout
      title="Добавить проект"
      subtitle="Создайте новый проект для организации задач"
      actionButton={<ButtonBack />}
    >
      <AddProjectForm 
        companies={companies}
        templates={templates}
        defaultCompanyId={currentUser.companyId}
      />
    </FormPageLayout>
  );
}