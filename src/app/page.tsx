import { getCurrentUser } from '@/app/(auth)/actions/login';
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
      <div className="mb-12">
        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          Argo CRM
        </div>
        
        <div className="text-xl text-gray-600 dark:text-gray-300 mb-3 font-normal">
          Система управления взаимоотношениями с клиентами
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[600px] mx-auto leading-relaxed">
          Управляйте задачами, клиентами и проектами в одном месте. Эффективное
          решение для организации работы вашей команды.
        </div>
      </div>

      {/* Кнопка входа */}
      <div className="mb-12">
        <InteractiveButton href="/login" size="lg">
          Войти в систему
        </InteractiveButton>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
          <div className="text-4xl mb-3">
            📋
          </div>
          <h3 className="text-base text-gray-800 dark:text-gray-200 mb-2 font-semibold">
            Управление задачами
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Создавайте, назначайте и отслеживайте выполнение задач с удобной системой приоритетов
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
          <div className="text-4xl mb-3">
            👥
          </div>
          <h3 className="text-base text-gray-800 dark:text-gray-200 mb-2 font-semibold">
            База клиентов
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Ведите полную базу данных клиентов с контактной информацией и историей взаимодействий
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
          <div className="text-4xl mb-3">
            📊
          </div>
          <h3 className="text-base text-gray-800 dark:text-gray-200 mb-2 font-semibold">
            Аналитика и отчеты
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Получайте детальную статистику по работе команды и эффективности процессов
          </p>
        </div>
      </div>
    </div>
  );
}