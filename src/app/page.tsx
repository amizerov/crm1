import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Slider from '@/components/Slider';

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect('/dashboard');

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <section className="max-w-6xl w-full bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-stretch">
          {/* Left: slider */}
          <div className="w-2/3 p-8">
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50">
                Cистема управления задачами
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-[60ch]">
                Контроль за потоком внедрения фич и исправления багов в IT проектах. 
                Визуализация процесса на Канбан-доске и Диаграмме Ганта. 
                Мониторинг эффективности разработки.
              </p>
            </div>

            <Slider />
          </div>

          {/* Right: short CTA and templates */}
          <aside className="w-1/3 border-l border-gray-100 dark:border-gray-800 p-6">
            <div className="sticky top-6">

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ключевые возможности</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Канбан-доски с drag & drop</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Вложенные задачи и чек-листы</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Управление проектами и документами</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>История изменений и комментарии</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Аналитика и отчеты</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Шаблоны Канбан колонок</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <strong>Agile</strong> (To Do / In Progress / Review / Done)
                  </li>
                  <li className="px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <strong>Scrum</strong> (Backlog / Sprint / In Progress / Done)
                  </li>
                  <li className="px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <strong>Личный</strong> (Идеи / Завтра / Сегодня / Готово)
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Для кого подходит</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>IT команды и разработчики</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Проектные менеджеры</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Фрилансеры и индивидуалы</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login" className="block w-full text-center mt-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-sm rounded-md py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Войти</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}