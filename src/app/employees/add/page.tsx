import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { addEmployee, getUsers, getCompanies } from '../actions';
import Link from 'next/link';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonBack from '@/components/ButtonBack';

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
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontWeight: 'bold' }}>Добавить сотрудника</h1>
          <ButtonBack />
        </div>
      </div>

      <form action={addEmployee} style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 32, 
        borderRadius: 8, 
        border: '1px solid #dee2e6' 
      }}>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="Name" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Имя сотрудника *
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Введите имя сотрудника"
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label htmlFor="userId" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Связать с пользователем (опционально)
          </label>
          <select
            id="userId"
            name="userId"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Выберите пользователя</option>
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
            Компания (опционально)
          </label>
          <select
            id="companyId"
            name="companyId"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Выберите компанию</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <ButtonCancel href='/employees' />
          <ButtonSave />
        </div>
      </form>
    </div>
  );
}
