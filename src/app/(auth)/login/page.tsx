import { getCurrentUser } from '../actions/login';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

type SearchParams = Promise<{
  returnTo?: string;
}>;

type LoginPageProps = {
  searchParams: SearchParams;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    // Проверяем, авторизован ли уже пользователь
    const currentUser = await getCurrentUser();
    if (currentUser) {
        // Если пользователь уже авторизован, перенаправляем на нужную страницу
        const params = await searchParams;
        const returnTo = params.returnTo || '/dashboard';
        redirect(returnTo);
    }

    // Получаем параметры для передачи в форму
    const params = await searchParams;
    const returnTo = params.returnTo;

    return (
        <>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Вход в систему
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Войдите в Argo CRM
                </p>
            </div>

            <LoginForm returnTo={returnTo} />
        </>
    );
}