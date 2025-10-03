'use client';

import { useRouter } from 'next/navigation';
import type { Process } from './actions';

interface TemplateRowProps {
  template: Process;
}

export default function TemplateRow({ template }: TemplateRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/templates/edit/${template.id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  return (
    <tr 
      onClick={handleClick}
      className="
        hover:bg-gray-50 dark:hover:bg-gray-700 
        cursor-pointer 
        transition-colors
      "
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {template.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {template.stepName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {template.stepOrder}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {template.projectName || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(template.dtc)}
      </td>
    </tr>
  );
}
