import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

type SearchParams = {
  returnTo?: string;
};

type LoginPageProps = {
  searchParams: SearchParams;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    // Проверяем, авторизован ли уже пользователь
    const currentUser = await getCurrentUser();
    if (currentUser) {
        // Если пользователь уже авторизован, перенаправляем на нужную страницу
        const returnTo = searchParams.returnTo || '/dashboard';
        redirect(returnTo);
    }

    return (
        <div className="flex justify-center items-center min-h-[60vh] py-10 px-5">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/50 w-full max-w-[400px] border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Argo CRM
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Войдите в систему
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}