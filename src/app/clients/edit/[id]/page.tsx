import { getStatuses, updateClient, getUserCompanies } from '../../actions';
import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteButton from './DelBtn';
import FormField from '@/components/FormField';
import { getCurrentUser } from '@/db/loginUser';

type Client = {
  id: number;
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
  companyId?: number;
  summa?: number;
  payDate?: string;
  payType?: string;
  dtc: string;
  dtu?: string;
};

export default async function EditClientPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const clientId = parseInt(id);
  
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  
  // Получаем данные клиента, статусы и компании параллельно
  const [clients, statuses, companies] = await Promise.all([
    query('SELECT * FROM Client WHERE id = @id', { id: clientId }) as Promise<Client[]>,
    getStatuses(),
    getUserCompanies()
  ]);
  
  const client = clients[0];
  
  if (!client) {
    return (
      <main className="p-8">
        <h1>Клиент не найден</h1>
        <Link href="/clients">← Назад к списку клиентов</Link>
      </main>
    );
  }

  async function handleUpdateClient(formData: FormData) {
    'use server';
    
    const id = parseInt(formData.get('id') as string);
    const clientName = formData.get('clientName') as string;
    const description = formData.get('description') as string;
    const contacts = formData.get('contacts') as string;
    const statusId = parseInt(formData.get('statusId') as string);
    const companyId = parseInt(formData.get('companyId') as string);
    const summa = formData.get('summa') ? parseFloat(formData.get('summa') as string) : undefined;
    const payDate = formData.get('payDate') as string;
    const payType = formData.get('payType') as string;

    await updateClient({
      id,
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
    <main className="px-4 py-8 min-h-[50vh] bg-gray-50 dark:bg-gray-900">
      
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 m-0">
          Редактировать клиента
        </h1>
      </div>
      
      {/* Форма */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <form action={handleUpdateClient}>
            <input name="id" type="hidden" value={client.id} />
            
            {/* Grid для полей формы */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Имя клиента */}
              <FormField label="Имя клиента" htmlFor="clientName" required>
                <input
                  name="clientName" 
                  defaultValue={client.clientName}
                  required
                />
              </FormField>
              
              {/* Контакты */}
              <FormField label="Контакты" htmlFor="contacts">
                <input
                  name="contacts" 
                  defaultValue={client.contacts || ''}
                />
              </FormField>
              
              {/* Компания */}
              <FormField label="Компания" htmlFor="companyId" required>
                <select
                  name="companyId" 
                  defaultValue={client.companyId || ''}
                  required
                >
                  <option value="">Выберите компанию</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
              </FormField>
              
              {/* Статус */}
              <FormField label="Статус" htmlFor="statusId" required>
                <select
                  name="statusId" 
                  defaultValue={client.statusId}
                  required
                >
                  <option value="">Выберите статус</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.status}
                    </option>
                  ))}
                </select>
              </FormField>
              
              {/* Сумма */}
              <FormField label="Сумма" htmlFor="summa">
                <input
                  name="summa" 
                  type="number" 
                  step="0.01" 
                  defaultValue={client.summa || ''}
                />
              </FormField>
              
              {/* Дата платежа */}
              <FormField label="Дата платежа" htmlFor="payDate">
                <input
                  name="payDate" 
                  defaultValue={client.payDate || ''}
                />
              </FormField>
              
              {/* Тип платежа */}
              <FormField label="Тип платежа" htmlFor="payType">
                <input
                  name="payType" 
                  defaultValue={client.payType || ''}
                />
              </FormField>
            </div>
            
            {/* Описание на всю ширину */}
            <div className="mb-8">
              <FormField label="Описание" htmlFor="description">
                <textarea
                  name="description" 
                  defaultValue={client.description || ''}
                  rows={4}
                />
              </FormField>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  type="submit" 
                  className="btn-success py-3.5 px-7 text-white rounded-lg cursor-pointer text-base font-semibold min-w-40"
                >
                  💾 Сохранить изменения
                </button>
                <Link href="/clients">
                  <button 
                    type="button" 
                    className="btn-secondary py-3.5 px-7 text-white rounded-lg cursor-pointer text-base font-semibold min-w-30"
                  >
                    ↩️ Отмена
                  </button>
                </Link>
              </div>
              
              {/* Кнопка удаления справа */}
              <DeleteButton clientName={client.clientName} clientId={client.id} />
            </div>
          </form>
        </div>
    </main>
  );
}