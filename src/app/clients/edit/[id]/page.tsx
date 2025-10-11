import { getStatuses, updateClient, getUserCompanies } from '../../actions';
import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import ButtonBack from '@/components/ButtonBack';
import ButtonDelete from '@/components/ButtonDelete';
import { handleDeleteClient } from './actions';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect, StandardTextarea } from '@/components/StandardInputs';

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
    <FormPageLayout
      title="Редактировать клиента"
      subtitle={`Изменение данных клиента "${client.clientName}"`}
      actionButton={<ButtonBack />}
    >
      <FormContainer 
        action={handleUpdateClient}
        useGrid={true}
        buttons={
          <>
            <ButtonDelete 
              confirmTitle="Удаление клиента"
              confirmMessage={`Точно хотите удалить клиента "${client.clientName}"?`}
              deleteAction={handleDeleteClient.bind(null, client.id)}
              redirectTo="/clients"
            />
            <div style={{ flex: 1 }} />
            <ButtonCancel />
            <ButtonSave />
          </>
        }
      >
        <input name="id" type="hidden" value={client.id} />
        
        {/* Первая строка: Имя клиента | Контакты */}
        <FormFieldStandard label="Имя клиента" required>
          <StandardInput
            name="clientName"
            type="text"
            placeholder="Введите имя клиента"
            defaultValue={client.clientName}
            required
          />
        </FormFieldStandard>
        
        <FormFieldStandard label="Контакты">
          <StandardInput
            name="contacts"
            type="text"
            placeholder="Телефон, email или другие контакты"
            defaultValue={client.contacts || ''}
          />
        </FormFieldStandard>

        {/* Вторая строка: Статус | Компания */}
        <FormFieldStandard label="Статус" required>
          <StandardSelect name="statusId" defaultValue={client.statusId} required>
            <option value="">Выберите статус</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>
        
        <FormFieldStandard label="Компания" required>
          <StandardSelect name="companyId" defaultValue={client.companyId || ''} required>
            <option value="">Выберите компанию</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>

        {/* Третья строка: Сумма | Дата платежа | Тип платежа */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <FormFieldStandard label="Сумма">
            <StandardInput
              name="summa"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={client.summa || ''}
            />
          </FormFieldStandard>
          
          <FormFieldStandard label="Дата платежа">
            <StandardInput
              name="payDate"
              type="date"
              defaultValue={client.payDate || ''}
            />
          </FormFieldStandard>
          
          <FormFieldStandard label="Тип платежа">
            <StandardInput
              name="payType"
              type="text"
              placeholder="Наличные, карта, перевод..."
              defaultValue={client.payType || ''}
            />
          </FormFieldStandard>
        </div>

        {/* Четвертая строка: Описание на полную ширину */}
        <FormFieldStandard label="Описание" style={{ gridColumn: '1 / -1' }}>
          <StandardTextarea
            name="description"
            rows={3}
            placeholder="Дополнительная информация о клиенте..."
            defaultValue={client.description || ''}
          />
        </FormFieldStandard>
      </FormContainer>
    </FormPageLayout>
  );
}