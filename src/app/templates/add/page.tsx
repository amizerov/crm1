import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import { getProjects, createTemplate } from '../actions';
import Link from 'next/link';

export default async function AddTemplatePage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const projects = await getProjects();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/templates"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 no-underline"
        >
          ← Назад к списку
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Добавить шаблон процесса
      </h1>

      <form action={createTemplate} className="space-y-6">
        <div>
          <label 
            htmlFor="projectId" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Проект *
          </label>
          <select
            id="projectId"
            name="projectId"
            required
            className="
              w-full px-4 py-2
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
            "
          >
            <option value="">Выберите проект</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName} {project.companyName ? `(${project.companyName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label 
            htmlFor="stepName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Название шага *
          </label>
          <input
            type="text"
            id="stepName"
            name="stepName"
            required
            className="
              w-full px-4 py-2
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
            "
            placeholder="Введите название шага"
          />
        </div>

        <div>
          <label 
            htmlFor="stepOrder" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Порядок *
          </label>
          <input
            type="number"
            id="stepOrder"
            name="stepOrder"
            required
            min="1"
            defaultValue="1"
            className="
              w-full px-4 py-2
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
            "
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="
              px-6 py-2
              bg-green-600 hover:bg-green-700
              dark:bg-green-500 dark:hover:bg-green-600
              text-white
              rounded-lg
              font-medium
              transition-colors
            "
          >
            Сохранить
          </button>
          <Link
            href="/templates"
            className="
              px-6 py-2
              bg-gray-200 hover:bg-gray-300
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-900 dark:text-gray-100
              rounded-lg
              font-medium
              transition-colors
              no-underline
              inline-block
            "
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
