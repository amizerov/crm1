'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect } from '@/components/StandardInputs';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import { addEmployee } from '../actions/actions';
import { createInvitation, InvitationRole } from '../actions/invitations';

interface User {
  id: number;
  login: string;
  nicName: string;
  fullName: string;
  email: string;
  displayName: string;
}

interface Company {
  id: number;
  companyName: string;
}

interface Props {
  relatedUsers: User[];
  companies: Company[];
}

export default function AddEmployeeForm({ relatedUsers, companies }: Props) {
  const [mode, setMode] = useState<'link' | 'invite'>('link');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'link') {
        // Связываем существующего пользователя
        startTransition(() => {
          addEmployee(formData);
        });
      } else {
        // Отправляем приглашение
        const email = formData.get('email') as string;
        const companyId = Number(formData.get('companyId'));
        const role = formData.get('role') as InvitationRole;

        if (!email || !companyId || !role) {
          setError('Заполните все обязательные поля');
          return;
        }

        const result = await createInvitation({ email, companyId, role });

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Приглашение успешно отправлено на ' + email);
          setTimeout(() => router.push('/employees'), 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  return (
    <>
      {/* Переключатель режимов */}
      <div className="mb-6 flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            mode === 'link'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer'
          }`}
        >
          🔗 Связать существующего
        </button>
        <button
          type="button"
          onClick={() => setMode('invite')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            mode === 'invite'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer'
          }`}
        >
          ✉️ Пригласить нового
        </button>
      </div>

      {/* Сообщения об ошибках/успехе */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
          {success}
        </div>
      )}

      <FormContainer action={handleSubmit}>
        {mode === 'link' ? (
          /* Режим: Связать существующего пользователя */
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
                <option value="">Не связывать</option>
                {relatedUsers.length > 0 ? (
                  relatedUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} ({user.email})
                    </option>
                  ))
                ) : (
                  <option disabled>Нет доступных пользователей</option>
                )}
              </StandardSelect>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Отображаются только коллеги из других ваших компаний
              </p>
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
          </div>
        ) : (
          /* Режим: Пригласить нового по email */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldStandard label="Email для приглашения" required>
              <StandardInput
                name="email"
                type="email"
                placeholder="email@example.com"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                На этот адрес будет отправлено приглашение
              </p>
            </FormFieldStandard>

            <FormFieldStandard label="Роль" required>
              <StandardSelect name="role" required>
                <option value="Employee">👤 Сотрудник</option>
                <option value="Partner">👔 Партнёр</option>
              </StandardSelect>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Партнёр может управлять проектами и приглашать других
              </p>
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
          </div>
        )}

        <div className="pt-6 flex justify-end gap-3">
          <ButtonCancel href="/employees" />
          <ButtonSave disabled={isPending}>
            {mode === 'link' ? 'Сохранить' : 'Отправить приглашение'}
          </ButtonSave>
        </div>
      </FormContainer>
    </>
  );
}
