import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { getEmployeeById, getUsers, getCompanies } from '../../actions';
import { updateEmployeeAction } from './actions';
import BackButton from '@/components/ButtonBack';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonDelete from '@/components/ButtonDelete';
import { deleteEmployee } from './actions';
import ButtonSave from '@/components/ButtonSave';

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
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ color: '#666', margin: 0 }}>ID: {employee.id} | Имя: {employee.Name}</p>
          <BackButton />
        </div>
      </div>

      <form action={updateEmployeeAction} style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 32, 
        borderRadius: 8, 
        border: '1px solid #dee2e6',
        marginBottom: 20
      }}>
        <input type="hidden" name="id" value={employee.id} />

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="Name" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Имя сотрудника
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            defaultValue={employee.Name}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Имя сотрудника"
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label htmlFor="userId" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Связать с пользователем
          </label>
          <select
            id="userId"
            name="userId"
            defaultValue={employee.userId || ''}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Не связан с пользователем</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nicName} ({user.login})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label htmlFor="companyId" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Компания
          </label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={employee.companyId || ''}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Не привязан к компании</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
          <ButtonDelete
            confirmTitle="Удаление сотрудника"
            confirmMessage={`Вы уверены, что хотите удалить сотрудника "${employee.Name}"? Это действие нельзя отменить.`}
            deleteAction={deleteEmployee.bind(null, employeeId)}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <ButtonCancel href="/employees" />
            <ButtonSave />
          </div>
        </div>
      </form>
    </div>
  );
}
