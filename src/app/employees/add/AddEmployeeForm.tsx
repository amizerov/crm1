'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect } from '@/components/StandardInputs';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import Notification from '@/components/Notification';
import { addEmployee } from '../actions/actions';
import { createInvitation, InvitationRole } from '../actions/invitations';

interface Users {
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
  relatedUsers: Users[];
  companies: Company[];
}

export default function AddEmployeeForm({ relatedUsers, companies }: Props) {
  const [mode, setMode] = useState<'link' | 'invite'>('link');
  const [isPending, startTransition] = useTransition();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; isVisible: boolean }>({
    type: 'success',
    message: '',
    isVisible: false
  });
  const router = useRouter();

  // Загружаем выбранную компанию из localStorage при инициализации
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId, 10);
      // Проверяем, что компания существует в списке доступных компаний
      if (companyId === 0 || companies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId);
      }
    }
  }, [companies]);

  // Обработчик изменения компании
  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('selectedCompanyId', companyId.toString());
  };

  const handleSubmit = async (formData: FormData) => {
    setNotification({ type: 'success', message: '', isVisible: false });

    try {
      if (mode === 'link') {
        // Связываем существующего пользователя
        // Добавляем selectedCompanyId в FormData если он не установлен
        if (selectedCompanyId) {
          formData.set('companyId', selectedCompanyId.toString());
        }
        
        startTransition(() => {
          addEmployee(formData);
        });
      } else {
        // Отправляем приглашение
        const email = formData.get('email') as string;
        const companyId = selectedCompanyId; // Используем selectedCompanyId вместо formData
        const role = formData.get('role') as InvitationRole;

        if (!email || !companyId || !role) {
          setNotification({
            type: 'error',
            message: 'Заполните все обязательные поля',
            isVisible: true
          });
          return;
        }

        startTransition(async () => {
          const result = await createInvitation({ email, companyId, role });

          if (result.error) {
            setNotification({
              type: 'error',
              message: result.error,
              isVisible: true
            });
          } else {
            setNotification({
              type: 'success',
              message: 'Приглашение успешно отправлено на ' + email,
              isVisible: true
            });
            setTimeout(() => router.push('/employees'), 2000);
          }
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Произошла ошибка',
        isVisible: true
      });
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

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
                      {user.displayName} ({user.email || user.fullName || user.login})
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
              <StandardSelect 
                name="companyId" 
                value={selectedCompanyId || ''} 
                onChange={(e) => handleCompanyChange(Number(e.target.value))}
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
              <StandardSelect 
                name="companyId" 
                value={selectedCompanyId || ''} 
                onChange={(e) => handleCompanyChange(Number(e.target.value))}
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
          </div>
        )}

        <div className="pt-6 flex justify-end gap-3">
          <ButtonCancel href="/employees" />
          <ButtonSave disabled={isPending}>
            {isPending 
              ? (mode === 'link' ? 'Сохранение...' : 'Отправка...') 
              : (mode === 'link' ? 'Сохранить' : 'Отправить приглашение')
            }
          </ButtonSave>
        </div>
      </FormContainer>
    </>
  );
}
