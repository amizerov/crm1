'use client';

import { useState } from 'react';
import { updateUserProfile } from './actions/user';
import Notification from '@/components/Notification';
import { useRouter } from 'next/navigation';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';
import { COMPONENT_STYLES } from '@/styles/constants';
import Link from 'next/link';

type Users = {
  id: number;
  nicName: string;
  login: string;
  email?: string;
  phone?: string;
  fullName?: string;
  companyId?: number;
  companyName?: string;
  isOwner?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

type Company = {
  id: number;
  companyName: string;
  ownerId: number;
  ownerName?: string;
  isOwner?: boolean;
};

type ProfileFormProps = {
  user: Users;
  companies: Company[];
};

export default function ProfileForm({ user, companies }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; isVisible: boolean }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setNotification({ type: 'success', message: '', isVisible: false });

    try {
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        router.refresh();
        setNotification({
          type: 'success',
          message: 'Профиль успешно обновлен!',
          isVisible: true
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Произошла ошибка',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setNotification({
        type: 'error',
        message: 'Произошла ошибка при обновлении профиля',
        isVisible: true
      });
    } finally {
      setIsSubmitting(false);
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
      
      <FormContainer
        action={handleSubmit}
        useGrid={true}
        buttons={
          <>
            <ButtonCancel />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <input type="hidden" name="userId" value={user.id} />

        {/* Информация о пользователе */}
        {(user.createdAt || user.lastLogin) && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '10px',
            }}
          >
            <p style={{ fontSize: '14px', color: '#1976d2', margin: 0 }}>
              <strong>Информация о пользователе:</strong>
            </p>
            {user.createdAt && (
              <p style={{ fontSize: '13px', color: '#555', margin: '5px 0 0 0' }}>
                Создан: <strong>{new Date(user.createdAt).toLocaleString('ru-RU')}</strong>
              </p>
            )}
            {user.lastLogin && (
              <p style={{ fontSize: '13px', color: '#555', margin: '5px 0 0 0' }}>
                Последний вход: <strong>{new Date(user.lastLogin).toLocaleString('ru-RU')}</strong>
              </p>
            )}
          </div>
        )}

        {/* Активная компания с кнопкой */}
        <FormFieldStandard label="Активная компания" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              key={`company-${user.companyId ?? 'none'}`}
              id="companyId"
              name="companyId"
              defaultValue={user.companyId ? user.companyId.toString() : ''}
              style={{ ...COMPONENT_STYLES.input, flex: 1 }}
            >
              <option value="">Не выбрана</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                  {company.isOwner ? ' (владелец)' : ' (сотрудник)'}
                </option>
              ))}
            </select>
            <Link
              href="/companies"
              aria-label="Перейти к списку компаний"
              title="Перейти к списку компаний"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6c757d',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </Link>
          </div>
        </FormFieldStandard>

        {/* Логин (disabled) */}
        <FormFieldStandard label="Логин (нельзя изменить)">
          <input
            type="text"
            id="login"
            value={user.login}
            disabled
            style={{ ...COMPONENT_STYLES.input, backgroundColor: '#f5f5f5' }}
          />
        </FormFieldStandard>

        {/* Никнейм */}
        <FormFieldStandard label="Никнейм" required>
          <input
            type="text"
            id="nicName"
            name="nicName"
            defaultValue={user.nicName}
            required
            style={COMPONENT_STYLES.input}
          />
        </FormFieldStandard>

        {/* Полное имя - на всю ширину */}
        <FormFieldStandard label="Полное имя" style={{ gridColumn: '1 / -1' }}>
          <input
            type="text"
            id="fullName"
            name="fullName"
            defaultValue={user.fullName || ''}
            style={COMPONENT_STYLES.input}
          />
        </FormFieldStandard>

        {/* Email */}
        <FormFieldStandard label="Email">
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email || ''}
            style={COMPONENT_STYLES.input}
          />
        </FormFieldStandard>

        {/* Телефон */}
        <FormFieldStandard label="Телефон">
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={user.phone || ''}
            style={COMPONENT_STYLES.input}
          />
        </FormFieldStandard>
      </FormContainer>
    </>
  );
}
