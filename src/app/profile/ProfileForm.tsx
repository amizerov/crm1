'use client';

import { useState } from 'react';
import { updateUserProfile } from './actions/user';
import Notification from '@/components/Notification';
import { useRouter } from 'next/navigation';
import FormField from '@/components/FormField';
import Link from 'next/link';

type User = {
  id: number;
  nicName: string;
  login: string;
  email?: string;
  phone?: string;
  fullName?: string;
  companyId?: number;
  companyName?: string;
  isOwner?: boolean;
};

type Company = {
  id: number;
  companyName: string;
  ownerId: number;
  ownerName?: string;
  isOwner?: boolean;
};

type ProfileFormProps = {
  user: User;
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
      
      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <form action={handleSubmit}>
          <input type="hidden" name="userId" value={user.id} />
        
          {/* Активная компания */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Активная компания" htmlFor="companyId">
                <select
                  key={`company-${user.companyId ?? 'none'}`}
                  id="companyId"
                  name="companyId"
                  defaultValue={user.companyId ? user.companyId.toString() : ''}
                >
                  <option value="">Не выбрана</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}{company.isOwner ? ' (владелец)' : ' (сотрудник)'}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Кнопка-переход к списку компаний */}
            <div>
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
                  cursor: 'pointer'
                }}
              >
                {/* Иконка карандаша (SVG) */}
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
          </div>

          {/* Логин и Никнейм */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <FormField label="Логин" htmlFor="login" hint="Логин нельзя изменить">
                <input type="text" id="login" value={user.login} disabled />
              </FormField>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <FormField label="Никнейм" htmlFor="nicName" required>
                <input type="text" id="nicName" name="nicName" defaultValue={user.nicName} required />
              </FormField>
            </div>
          </div>

          {/* Полное имя */}
          <div style={{ marginBottom: '24px' }}>
            <FormField label="Полное имя" htmlFor="fullName">
              <input type="text" id="fullName" name="fullName" defaultValue={user.fullName || ''} />
            </FormField>
          </div>

          {/* Email и Телефон */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <FormField label="Email" htmlFor="email">
                <input type="email" id="email" name="email" defaultValue={user.email || ''} />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Телефон" htmlFor="phone">
                <input type="tel" id="phone" name="phone" defaultValue={user.phone || ''} />
              </FormField>
            </div>
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                border: '1px solid #6c757d',
                backgroundColor: 'transparent',
                color: '#6c757d',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Отмена
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
