'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithInvitation } from '../../actions/register';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import ButtonSave from '@/components/ButtonSave';
import Notification from '@/components/Notification';
import { COMPONENT_STYLES } from '@/styles/constants';

interface Invitation {
  id: number;
  email: string;
  companyId: number;
  companyName: string;
  role: string;
  inviterName: string;
}

interface Props {
  token: string;
  invitation: Invitation;
}

export default function InvitationRegisterForm({ token, invitation }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setError('');
    setSuccess('');

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;

    // Валидация на клиенте
    if (!password || !fullName) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    startTransition(async () => {
      const result = await registerWithInvitation(token, password, fullName);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || 'Регистрация успешна!');
        // Перенаправляем на дашборд через 2 секунды
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    });
  };

  return (
    <>
      {/* Уведомления в правом верхнем углу */}
      <Notification 
        message={error} 
        type="error" 
        isVisible={!!error} 
        onClose={() => setError('')} 
      />
      
      <Notification 
        message={success} 
        type="success" 
        isVisible={!!success} 
        onClose={() => setSuccess('')} 
      />

      <FormContainer action={handleSubmit}>
          {/* Полное имя */}
          <FormFieldStandard label="Полное имя" required>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending || success !== ''}
              placeholder="Иван Иванов"
              style={{
                ...COMPONENT_STYLES.input,
                ...(isPending || success ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COMPONENT_STYLES.inputFocus.borderColor;
                e.target.style.boxShadow = COMPONENT_STYLES.inputFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </FormFieldStandard>

          {/* Пароли в две колонки */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Пароль */}
            <FormFieldStandard label="Пароль" required>
              <input
                type="password"
                id="password"
                name="password"
                required
                disabled={isPending || success !== ''}
                minLength={6}
                placeholder="Минимум 6 символов"
                style={{
                  ...COMPONENT_STYLES.input,
                  ...(isPending || success ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COMPONENT_STYLES.inputFocus.borderColor;
                  e.target.style.boxShadow = COMPONENT_STYLES.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </FormFieldStandard>

            {/* Подтверждение пароля */}
            <FormFieldStandard label="Повторите пароль" required isLast>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                disabled={isPending || success !== ''}
                minLength={6}
                placeholder="Повторите пароль"
                style={{
                  ...COMPONENT_STYLES.input,
                  ...(isPending || success ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COMPONENT_STYLES.inputFocus.borderColor;
                  e.target.style.boxShadow = COMPONENT_STYLES.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </FormFieldStandard>
          </div>

          {/* Кнопки */}
          <div style={{
            ...COMPONENT_STYLES.buttonContainer,
            justifyContent: 'center'
          }}>
            <ButtonSave disabled={isPending || success !== ''}>
              {isPending ? 'Создаю аккаунт...' : success ? 'Успешно!' : 'Создать аккаунт'}
            </ButtonSave>
          </div>
        </FormContainer>
    </>
  );
}