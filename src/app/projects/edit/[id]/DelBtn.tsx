'use client';

import { useRouter } from 'next/navigation';
import { deleteProject } from './actions';
import { useState } from 'react';

interface DelBtnProps {
  projectId: number;
}

export default function DelBtn({ projectId }: DelBtnProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteProject(projectId);
      
      if (result.success) {
        router.push('/projects');
        router.refresh();
      } else {
        alert(result.error || 'Ошибка при удалении проекта');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      alert('Произошла ошибка при удалении проекта');
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        padding: '8px 16px',
        backgroundColor: isDeleting ? '#ccc' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.6 : 1
      }}
    >
      {isDeleting ? 'Удаление...' : '🗑 Удалить'}
    </button>
  );
}
