'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../actions/register';

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;

    // Валидация на клиенте
    if (!email || !password || !fullName) {
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

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email адрес');
      return;
    }

    startTransition(async () => {
      const result = await registerUser(email, password, fullName);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || 'Регистрация успешна!');
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {/* Заголовок */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Создать аккаунт
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Присоединяйтесь к Argo CRM
          </p>
        </div>

        {/* Уведомления */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-600 dark:text-green-400 text-xs font-medium">{success}</p>
                <p className="text-green-600 dark:text-green-400 text-xs mt-0.5 opacity-75">
                  Перенаправление на страницу входа...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Полное имя */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Полное имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending || success !== ''}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800
                       transition-all duration-200"
              placeholder="Иван Иванов"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending || success !== ''}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800
                       transition-all duration-200"
              placeholder="ivan@example.com"
            />
          </div>

          {/* Пароли в одну строку */}
          <div className="grid grid-cols-2 gap-3">
            {/* Пароль */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                disabled={isPending || success !== ''}
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800
                         transition-all duration-200"
                placeholder="Минимум 6"
              />
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Повторите <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                disabled={isPending || success !== ''}
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800
                         transition-all duration-200"
                placeholder="Повторите"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Используйте минимум 6 символов
          </p>

          {/* Кнопка регистрации */}
          <button
            type="submit"
            disabled={isPending || success !== ''}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                     py-2.5 px-4 rounded-lg font-medium text-sm
                     hover:from-blue-600 hover:to-indigo-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Регистрация...</span>
              </>
            ) : success ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Успешно!</span>
              </>
            ) : (
              <span>Зарегистрироваться</span>
            )}
          </button>
        </form>

        {/* Ссылка на вход */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
