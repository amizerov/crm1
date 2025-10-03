import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import InteractiveButton from '@/components/InteractiveButton';

export default async function HomePage() {
  // Проверяем авторизацию пользователя
  const currentUser = await getCurrentUser();
  
  if (currentUser) {
    // Если пользователь авторизован, перенаправляем на дашборд
    redirect('/dashboard');
  }

  // Если не авторизован, показываем стартовую страницу
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-5 py-10">
      {/* Логотип и заставка */}
      <div className="mb-[60px]">
        <div className="text-7xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-5 drop-shadow-lg">
          Argo CRM
        </div>
        
        <div className="text-2xl text-gray-500 dark:text-gray-400 mb-3 font-light">
          Система управления взаимоотношениями с клиентами
        </div>
        
        <div className="text-base text-gray-400 dark:text-gray-500 max-w-[600px] leading-relaxed">
          Управляйте задачами, клиентами и проектами в одном месте. 
          Эффективное решение для организации работы вашей команды.
        </div>
      </div>

      {/* Кнопка входа */}
      <div className="mb-10">
        <InteractiveButton href="/login" size="lg">
          Войти в систему
        </InteractiveButton>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[900px] w-full">
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300">
          <div className="text-5xl mb-4">
            📋
          </div>
          <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-3 font-semibold">
            Управление задачами
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Создавайте, назначайте и отслеживайте выполнение задач с удобной системой приоритетов
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300">
          <div className="text-5xl mb-4">
            👥
          </div>
          <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-3 font-semibold">
            База клиентов
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Ведите полную базу данных клиентов с контактной информацией и историей взаимодействий
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300">
          <div className="text-5xl mb-4">
            📊
          </div>
          <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-3 font-semibold">
            Аналитика и отчеты
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Получайте детальную статистику по работе команды и эффективности процессов
          </p>
        </div>
      </div>
    </div>
  );
}