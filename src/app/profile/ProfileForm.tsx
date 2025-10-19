'use client';

import { useState, useTransition } from 'react';
import { updateUserProfile } from './actions/user';
import { resendVerificationEmail } from './actions/resendVerification';
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
  isVerified?: boolean | number;
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
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleResendVerification = async () => {
    if (!user.email || !user.id) return;

    startTransition(async () => {
      const result = await resendVerificationEmail(user.id, user.email!);
      
      if (result.success) {
        setEmailSentMessage(true);
        setTimeout(() => setEmailSentMessage(false), 5000); // Скрыть через 5 секунд
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Не удалось отправить письмо',
          isVisible: true
        });
      }
    });
  };

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
        <FormFieldStandard label="Активная компания" className="col-span-full">
          <div className="flex gap-2.5 items-center">
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
        <FormFieldStandard label="Полное имя" className="col-span-full">
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
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email || ''}
              className={`
                w-full px-3 py-2 rounded-md
                border focus:outline-none focus:ring-2
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                ${user.email && (user.isVerified === 0 || user.isVerified === false || user.isVerified === null) 
                  ? 'border-2 border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              onFocus={() => setShowEmailTooltip(true)}
              onBlur={() => setTimeout(() => setShowEmailTooltip(false), 200)}
            />
            
            {/* Кнопка отправки письма подтверждения */}
            {user.email && (user.isVerified === 0 || user.isVerified === false || user.isVerified === null) && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isPending}
                className="
                  group
                  absolute right-2 top-1/2 -translate-y-1/2
                  px-2 py-1
                  text-xs font-medium
                  bg-blue-600 hover:bg-blue-700
                  disabled:bg-blue-400 disabled:cursor-not-allowed
                  text-white
                  rounded
                  transition-all duration-200
                  overflow-hidden
                  w-6 hover:w-auto
                  cursor-pointer
                "
                title="Отправить письмо подтверждения"
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <svg 
                    className="w-3 h-3 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  <span className="hidden group-hover:inline">
                    {isPending ? 'Отправка...' : 'Подтвердить'}
                  </span>
                </span>
              </button>
            )}
            
            {/* Облачко с предупреждением */}
            {showEmailTooltip && user.email && (user.isVerified === 0 || user.isVerified === false || user.isVerified === null) && (
              <div className="
                absolute left-0 top-full mt-2 z-10
                w-full min-w-[300px]
                p-3
                bg-red-50 dark:bg-red-900/30
                border border-red-300 dark:border-red-700
                rounded-lg shadow-lg
                text-sm text-red-800 dark:text-red-200
              ">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold mb-1">Email не подтверждён</p>
                    <p className="text-xs opacity-90">
                      Наведите на галочку и нажмите "Подтвердить" для отправки письма
                    </p>
                  </div>
                </div>
                {/* Треугольник */}
                <div className="
                  absolute -top-2 left-4
                  w-4 h-4
                  bg-red-50 dark:bg-red-900/30
                  border-t border-l border-red-300 dark:border-red-700
                  transform rotate-45
                "></div>
              </div>
            )}
            
            {/* Облачко с сообщением об отправке */}
            {emailSentMessage && (
              <div className="
                absolute left-0 top-full mt-2 z-10
                w-full min-w-[300px]
                p-3
                bg-green-50 dark:bg-green-900/30
                border border-green-300 dark:border-green-700
                rounded-lg shadow-lg
                text-sm text-green-800 dark:text-green-200
              ">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="font-semibold mb-1">Письмо отправлено!</p>
                    <p className="text-xs opacity-90">
                      Проверьте почту и перейдите по ссылке для подтверждения
                    </p>
                  </div>
                </div>
                {/* Треугольник */}
                <div className="
                  absolute -top-2 left-4
                  w-4 h-4
                  bg-green-50 dark:bg-green-900/30
                  border-t border-l border-green-300 dark:border-green-700
                  transform rotate-45
                "></div>
              </div>
            )}
          </div>
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
