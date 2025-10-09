import Link from "next/link";
import { getCurrentUser, logoutAction } from '@/app/(auth)/actions/login';

export default async function Header() {
  const currentUser = await getCurrentUser();

  return (
    <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 sticky top-0 z-[1000] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="text-2xl font-bold text-blue-900 dark:text-blue-400 no-underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Argo CRM
          </Link>
          
          {currentUser && (
            <Link 
              href="/dashboard" 
              className="text-gray-700 dark:text-gray-300 no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Дашборд
            </Link>
          )}
        </div>
        
        <nav className="flex items-center gap-5">
          {currentUser ? (
            <>
              <Link 
                href="/profile" 
                className="text-sm text-gray-600 dark:text-gray-400 no-underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Привет, {currentUser.nicName}!
              </Link>
              <form action={async () => {
                'use server';
                await logoutAction();
                const { redirect } = await import('next/navigation');
                redirect('/login');
              }} className="m-0">
                <button 
                  type="submit" 
                  className="bg-transparent border border-gray-500 dark:border-gray-400 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-500 hover:text-white dark:hover:bg-gray-400 transition-colors"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <Link 
              href="/login" 
              className="no-underline bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}