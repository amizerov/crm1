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
    <div className="flex items-center justify-center min-h-full py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 -my-5">
      {children}
    </div>
  );
}
