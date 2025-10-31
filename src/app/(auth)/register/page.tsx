import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Регистрация
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Создайте аккаунт в TMS, RCC
        </p>
      </div>

      <RegisterForm />
    </>
  );
}
