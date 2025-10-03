'use client';

import { useState } from 'react';
import { deleteTemplate } from '../../actions';

interface DelBtnProps {
  templateId: number;
}

export default function DelBtn({ templateId }: DelBtnProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200 mb-4">
          Вы уверены, что хотите удалить этот шаблон?
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="
              px-4 py-2
              bg-red-600 hover:bg-red-700
              disabled:bg-red-400
              text-white
              rounded-lg
              font-medium
              transition-colors
            "
          >
            {isDeleting ? 'Удаление...' : 'Да, удалить'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="
              px-4 py-2
              bg-gray-200 hover:bg-gray-300
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-900 dark:text-gray-100
              rounded-lg
              font-medium
              transition-colors
            "
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="
        px-4 py-2
        bg-red-600 hover:bg-red-700
        dark:bg-red-500 dark:hover:bg-red-600
        text-white
        rounded-lg
        font-medium
        transition-colors
      "
    >
      Удалить шаблон
    </button>
  );
}
