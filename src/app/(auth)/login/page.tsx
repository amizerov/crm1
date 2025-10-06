import { getCurrentUser } from '@/db/loginUser';
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
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Argo CRM
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Войдите в систему
                    </p>
                </div>

                <LoginForm returnTo={returnTo} />
            </div>
        </div>
    );
}