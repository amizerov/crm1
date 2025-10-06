import { Suspense } from 'react';
import VerifyEmail from './VerifyEmail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Подтверждение email - Argo CRM',
  description: 'Подтверждение регистрации',
};

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      }>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
