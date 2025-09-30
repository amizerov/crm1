'use client';

import { useState, useTransition, useEffect } from 'react';
import { loginUser } from '@/db/loginUser';
import Notification from '@/components/Notification';

type LoginFormProps = {
  returnTo?: string;
};

export default function LoginForm({ returnTo }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [savedLogin, setSavedLogin] = useState('');
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
    
    // Сохраняем логин в куки сразу при попытке входа
    if (loginValue) {
      saveLoginToCookie(loginValue);
    }
    
    startTransition(async () => {
      try {
        await loginUser(formData);
        
        // Если успешно, показываем уведомление (хотя пользователь будет перенаправлен)
        setNotification({
          message: 'Добро пожаловать!',
          type: 'success',
          isVisible: true
        });
      } catch (error) {
        // Показываем ошибку
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
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
            className={`
              w-full px-3 py-3 
              border border-gray-300 dark:border-gray-600 
              rounded 
              text-base 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              transition-all duration-200
              ${isPending ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300 text-sm">
            Пароль
          </label>
          <input 
            type="password" 
            name="password" 
            required
            disabled={isPending}
            placeholder="Введите пароль"
            className={`
              w-full px-3 py-3 
              border border-gray-300 dark:border-gray-600 
              rounded 
              text-base 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              transition-all duration-200
              ${isPending ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className={`
            w-full py-3.5 px-4
            ${isPending 
              ? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer'
            }
            text-white 
            rounded 
            text-base 
            font-semibold 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          `}
        >
          {isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />
    </>
  );
}