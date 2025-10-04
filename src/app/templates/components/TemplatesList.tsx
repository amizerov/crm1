'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Template } from '../actions/getTemplates';
import { deleteTemplate } from '../actions/templateActions';

interface TemplatesListProps {
  templates: Template[];
}

export default function TemplatesList({ templates }: TemplatesListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (templateId: number, templName: string) => {
    if (!confirm(`Удалить шаблон "${templName}" и все его шаги?`)) {
      return;
    }

    setDeleting(templateId);
    const result = await deleteTemplate(templateId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Ошибка при удалении');
    }
    setDeleting(null);
  };

  const handleEdit = (templateId: number) => {
    router.push(`/templates/${templateId}`);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Нет созданных шаблонов процессов
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Создайте первый шаблон, чтобы использовать его в проектах
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {template.templName}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Создан: {new Date(template.dtc).toLocaleDateString('ru-RU')}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(template.id)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              ✏️ Редактировать
            </button>
            <button
              onClick={() => handleDelete(template.id, template.templName)}
              disabled={deleting === template.id}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
              title="Удалить шаблон"
            >
              {deleting === template.id ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
