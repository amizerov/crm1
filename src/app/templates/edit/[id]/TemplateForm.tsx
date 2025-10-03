'use client';

import { updateTemplate, type Process } from '../../actions';
import Link from 'next/link';
import DelBtn from './DelBtn';

interface TemplateFormProps {
  template: Process;
  projects: Array<{ id: number; projectName: string; companyName?: string }>;
}

export default function TemplateForm({ template, projects }: TemplateFormProps) {
  const handleSubmit = async (formData: FormData) => {
    await updateTemplate(template.id, formData);
  };

  return (
    <div>
      <form action={handleSubmit} className="space-y-6">
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
            defaultValue={template.projectId}
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
            defaultValue={template.stepName}
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
            defaultValue={template.stepOrder}
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
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-500 dark:hover:bg-blue-600
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

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <DelBtn templateId={template.id} />
      </div>
    </div>
  );
}
