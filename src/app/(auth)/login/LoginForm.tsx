'use client';

import { useState, useTransition, useEffect } from 'react';
import { loginAction } from '../actions/login';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';

type LoginFormProps = {
  returnTo?: string;
};

export default function LoginForm({ returnTo }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [savedLogin, setSavedLogin] = useState('');
  const router = useRouter();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
    isVisible: boolean;
  }>({
    message: '',
    type: 'error',
    isVisible: false
  });

  // Загружаем сохраненный логин из куки при загрузке компонента
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const lastLoginCookie = cookies.find(row => row.startsWith('lastLogin='));
    
    if (lastLoginCookie) {
      const savedLoginValue = lastLoginCookie.split('=')[1];
      const decodedLogin = decodeURIComponent(savedLoginValue);
      setSavedLogin(decodedLogin);
    }
  }, []);

  // Функция для сохранения логина в куки
  const saveLoginToCookie = (login: string) => {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 дней
    document.cookie = `lastLogin=${encodeURIComponent(login)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const loginValue = formData.get('login') as string;
    
    // Добавляем returnTo в формData если есть
    if (returnTo) {
      formData.set('returnTo', returnTo);
    }
    
    // Сохраняем логин в куки сразу при попытке входа
    if (loginValue) {
      saveLoginToCookie(loginValue);
    }
    
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        
        if (result.success && result.redirectTo) {
          // Сразу перенаправляем без показа сообщения
          router.push(result.redirectTo);
        } else {
          // Показываем ошибку из result
          setNotification({
            message: result.error || 'Произошла ошибка при входе',
            type: 'error',
            isVisible: true
          });
        }
      } catch (error) {
        // Показываем ошибку только если это действительно ошибка
        setNotification({
          message: error instanceof Error ? error.message : 'Произошла ошибка при входе',
          type: 'error',
          isVisible: true
        });
      }
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Логин
          </label>
          <input 
            type="text" 
            name="login" 
            required
            disabled={isPending}
            placeholder="Введите логин"
            value={savedLogin}
            onChange={(e) => setSavedLogin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Пароль
          </label>
          <input 
            type="password" 
            name="password" 
            required
            disabled={isPending}
            placeholder="Введите пароль"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                   text-white rounded-md font-medium cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed transition-colors
                   flex items-center justify-center gap-2"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Нет аккаунта?{' '}
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
          >
            Зарегистрироваться
          </a>
        </p>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </>
  );
}