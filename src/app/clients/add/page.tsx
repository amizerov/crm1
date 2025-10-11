import { addClient, getUserCompanies, getStatuses } from '../actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';
import ButtonBack from '@/components/ButtonBack';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect, StandardTextarea } from '@/components/StandardInputs';

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
    <FormPageLayout
      title="Добавить нового клиента"
      subtitle="Заполните информацию о новом клиенте"
      actionButton={<ButtonBack />}
    >
      <FormContainer 
        action={handleAddClient}
        useGrid={true}
        buttons={
          <>
            <ButtonCancel />
            <ButtonSave />
          </>
        }
      >
        {/* Первая строка: Имя клиента | Контакты */}
        <FormFieldStandard label="Имя клиента" required>
          <StandardInput
            name="clientName"
            type="text"
            placeholder="Введите имя клиента"
            required
          />
        </FormFieldStandard>
        
        <FormFieldStandard label="Контакты">
          <StandardInput
            name="contacts"
            type="text"
            placeholder="Телефон, email или другие контакты"
          />
        </FormFieldStandard>

        {/* Вторая строка: Статус | Компания */}
        <FormFieldStandard label="Статус" required>
          <StandardSelect name="statusId" required>
            <option value="">Выберите статус</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>
        
        <FormFieldStandard label="Компания" required>
          <StandardSelect name="companyId" required>
            <option value="">Выберите компанию</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>

        {/* Третья строка: нужно изменить grid на 3 колонки для этой части */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <FormFieldStandard label="Сумма">
            <StandardInput
              name="summa"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </FormFieldStandard>
          
          <FormFieldStandard label="Дата платежа">
            <StandardInput
              name="payDate"
              type="date"
            />
          </FormFieldStandard>
          
          <FormFieldStandard label="Тип платежа">
            <StandardInput
              name="payType"
              type="text"
              placeholder="Наличные, карта, перевод..."
            />
          </FormFieldStandard>
        </div>

        {/* Четвертая строка: Описание на полную ширину */}
        <FormFieldStandard label="Описание" style={{ gridColumn: '1 / -1' }}>
          <StandardTextarea
            name="description"
            rows={3}
            placeholder="Дополнительная информация о клиенте..."
          />
        </FormFieldStandard>
      </FormContainer>
    </FormPageLayout>
  );
}
