import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getRelatedUsers, getCompanies } from '../actions/actions';
import ButtonBack from '@/components/ButtonBack';
import FormPageLayout from '@/components/FormPageLayout';
import AddEmployeeForm from './AddEmployeeForm';

export default async function AddEmployeePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [relatedUsers, companies] = await Promise.all([
    getRelatedUsers(),
    getCompanies()
  ]);

  return (
    <FormPageLayout
      title="Добавить сотрудника"
      subtitle="Свяжите существующего пользователя или пригласите нового"
      actionButton={<ButtonBack />}
    >
      <AddEmployeeForm relatedUsers={relatedUsers} companies={companies} />
    </FormPageLayout>
  );
}
