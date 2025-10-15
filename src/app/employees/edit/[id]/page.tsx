import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getEmployeeById, getUsers, getCompanies } from '../../actions/actions';
import { updateEmployeeAction } from './actions';
import ButtonBack from '@/components/ButtonBack';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonDelete from '@/components/ButtonDelete';
import { deleteEmployee } from './actions';
import ButtonSave from '@/components/ButtonSave';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect } from '@/components/StandardInputs';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const { id } = await params;
  const [employee, users, companies] = await Promise.all([
    getEmployeeById(Number(id)),
    getUsers(),
    getCompanies()
  ]);

  const employeeId = +id;
  if (!employeeId) redirect('/employees');

  if (!employee) {
    redirect('/employees');
  }

  return (
    <FormPageLayout
      title="Редактировать сотрудника"
      subtitle={`Изменение данных сотрудника "${employee.Name}" (ID: ${employee.id})`}
      actionButton={<ButtonBack />}
    >
      <FormContainer 
        action={updateEmployeeAction}
        useGrid={true}
        buttons={
          <>
            <ButtonDelete
              confirmTitle="Удаление сотрудника"
              confirmMessage={`Вы уверены, что хотите удалить сотрудника "${employee.Name}"? Это действие нельзя отменить.`}
              deleteAction={deleteEmployee.bind(null, employeeId)}
              redirectTo="/employees"
            />
            <div style={{ flex: 1 }} />
            <ButtonCancel />
            <ButtonSave />
          </>
        }
      >
        <input type="hidden" name="id" value={employee.id} />

        {/* Имя сотрудника */}
        <FormFieldStandard label="Имя сотрудника" required>
          <StandardInput
            type="text"
            id="Name"
            name="Name"
            defaultValue={employee.Name}
            required
            placeholder="Имя сотрудника"
          />
        </FormFieldStandard>

        {/* Связать с пользователем */}
        <FormFieldStandard label="Связать с пользователем">
          <StandardSelect
            id="userId"
            name="userId"
            defaultValue={employee.userId || ''}
          >
            <option value="">Не связан с пользователем</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nicName} ({user.login})
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>

        {/* Компания на полную ширину */}
        <FormFieldStandard label="Компания" required className="col-span-full">
          <StandardSelect
            id="companyId"
            name="companyId"
            defaultValue={employee.companyId || ''}
            required
          >
            <option value="">Выберите компанию</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>
      </FormContainer>
    </FormPageLayout>
  );
}
