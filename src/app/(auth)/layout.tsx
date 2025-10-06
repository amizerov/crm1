import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Аутентификация - Argo CRM',
  description: 'Вход и регистрация в системе Argo CRM',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Основной контент с градиентным фоном */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {children}
      </div>

      {/* Футер всегда внизу */}
      <Footer />
    </div>
  );
}
