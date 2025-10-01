import { addClient, getUserCompanies } from '../actions';
import { getStatuses } from '../actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/db/loginUser';

export default async function AddClientPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  
  const [statuses, companies] = await Promise.all([
    getStatuses(),
    getUserCompanies()
  ]);
  
  if (companies.length === 0) {
    return (
      <main className="p-8">
        <h1>Нет доступных компаний</h1>
        <p>Вы должны быть сотрудником или владельцем компании для создания клиентов.</p>
        <Link href="/clients">← Назад к списку клиентов</Link>
      </main>
    );
  }
  
  async function handleAddClient(formData: FormData) {
    'use server';
    
    const clientName = formData.get('clientName') as string;
    const description = formData.get('description') as string;
    const contacts = formData.get('contacts') as string;
    const statusId = parseInt(formData.get('statusId') as string);
    const companyId = parseInt(formData.get('companyId') as string);
    const summa = formData.get('summa') ? parseFloat(formData.get('summa') as string) : undefined;
    const payDate = formData.get('payDate') as string;
    const payType = formData.get('payType') as string;

    await addClient({
      clientName,
      description: description || undefined,
      contacts: contacts || undefined,
      statusId,
      companyId,
      summa,
      payDate: payDate || undefined,
      payType: payType || undefined,
    });

    revalidatePath('/clients');
    redirect('/clients');
  }

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/clients" style={{ textDecoration: 'none', color: '#007bff' }}>
          ← Назад к списку клиентов
        </Link>
      </div>
      
      <h1>Добавить нового клиента</h1>
      
      <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
        <form action={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Имя клиента *
            </label>
            <input 
              name="clientName" 
              required 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Описание
            </label>
            <textarea 
              name="description" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, minHeight: 80 }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Контакты
            </label>
            <input 
              name="contacts" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Компания *
            </label>
            <select 
              name="companyId" 
              required 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Выберите компанию</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Статус *
            </label>
            <select 
              name="statusId" 
              required 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            >
              <option value="">Выберите статус</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.status}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Сумма
            </label>
            <input 
              name="summa" 
              type="number" 
              step="0.01" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Дата платежа
            </label>
            <input 
              name="payDate" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Тип платежа
            </label>
            <input 
              name="payType" 
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button 
              type="submit" 
              className="btn-success"
              style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', flex: 1 }}
            >
              Добавить клиента
            </button>
            <Link href="/clients">
              <button 
                type="button" 
                className="btn-secondary"
                style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                Отмена
              </button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
