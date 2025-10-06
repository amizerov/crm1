import RegisterForm from './RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация - Argo CRM',
  description: 'Создайте аккаунт в Argo CRM',
};

export default function RegisterPage() {
  return (
    <div className="flex items-start justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <RegisterForm />
    </div>
  );
}
