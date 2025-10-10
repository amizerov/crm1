import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { addEmployee, getUsers, getCompanies } from '../actions';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonBack from '@/components/ButtonBack';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect } from '@/components/StandardInputs';

export default async function AddEmployeePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [users, companies] = await Promise.all([
    getUsers(),
    getCompanies()
  ]);

  return (
    <FormPageLayout
      title="Добавить сотрудника"
      subtitle="Заполните информацию о новом сотруднике"
      actionButton={<ButtonBack />}
    >
      <FormContainer action={addEmployee}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldStandard label="Имя сотрудника" required>
            <StandardInput
              name="Name"
              type="text"
              placeholder="Введите имя сотрудника"
              required
            />
          </FormFieldStandard>

          <FormFieldStandard label="Связать с пользователем">
            <StandardSelect name="userId">
              <option value="">Выберите пользователя</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nicName} ({user.login})
                </option>
              ))}
            </StandardSelect>
          </FormFieldStandard>

          <FormFieldStandard label="Компания">
            <StandardSelect name="companyId">
              <option value="">Выберите компанию</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </StandardSelect>
          </FormFieldStandard>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <ButtonCancel href="/employees" />
          <ButtonSave />
        </div>
      </FormContainer>
    </FormPageLayout>
  );
}
