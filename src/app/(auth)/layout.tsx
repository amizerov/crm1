import type { Metadata } from 'next';

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
    <div className="flex items-center justify-center min-h-[70vh] w-full max-w-md mx-auto">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
        {children}
      </div>
    </div>
  );
}
