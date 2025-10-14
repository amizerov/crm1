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
    <>
      {/* Уведомления */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
          <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</p>
              <p className="text-green-600 dark:text-green-400 text-xs mt-1 opacity-75">
                Перенаправление на страницу входа...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            placeholder="ivan@example.com"
          />
        </div>

        {/* Пароли в две колонки */}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
          className="w-full py-2.5 bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400
                   text-white rounded-md font-medium cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed transition-colors
                   flex items-center justify-center gap-2"
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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт?{' '}
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
          >
            Войти
          </a>
        </p>
      </div>
    </>
  );
}
