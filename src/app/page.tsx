import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Slider from '@/components/Slider';

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect('/dashboard');

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <section className="max-w-6xl w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded">БЕСПЛАТНО</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Argo Task Manager — для команд и личных дел</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Управляйте разработкой и повседневными делами с помощью шаблонов и визуальных инструментов.</p>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Шаблоны Канбан колонок</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="px-3 py-2 bg-white dark:bg-gray-800 rounded border">Agile (To Do / In Progress / Review / Done)</li>
                  <li className="px-3 py-2 bg-white dark:bg-gray-800 rounded border">Scrum (Backlog / Sprint / In Progress / Done)</li>
                  <li className="px-3 py-2 bg-white dark:bg-gray-800 rounded border">Личный (Идея / Завтра / Сегодня / Готово)</li>
                </ul>
              </div>

              <div className="mt-6">
                <Link href="/register" className="block w-full text-center bg-blue-900 text-white py-2 rounded-md font-medium">Начать бесплатно</Link>
                <Link href="/login" className="block w-full text-center mt-3 border border-gray-300 text-sm rounded-md py-2">Войти</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}