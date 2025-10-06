import { Suspense } from 'react';
import VerifyEmail from './VerifyEmail';

export default function VerifyPage() {
  return (
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
  );
}
