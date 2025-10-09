'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCompany } from './actions';
import DeleteAlert from '@/components/DeleteAlert';


type DeleteButtonProps = {
  companyName: string;
  companyId: number;
};

export default function DeleteButton({ companyName, companyId }: DeleteButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await deleteCompany(companyId);
        router.push('/companies');
    } catch (error) {
        console.error('Ошибка при удалении компании:', error);
        alert('Произошла ошибка при удалении компании');
        setIsDeleting(false);
        setShowModal(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        className="
          px-6 py-3
          border border-red-300
          rounded-md
          bg-red-50 hover:bg-red-100
          text-red-700 hover:text-red-800
          text-base
          cursor-pointer
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        "
        onClick={() => setShowModal(true)}
      >
        🗑️ Удалить компанию
      </button>

      <DeleteAlert
        show={showModal}
        title="УДАЛЕНИЕ КОМПАНИИ!"
        message="Вы собираетесь удалить компанию"
        clientName={companyName}
        warnings={[
          'Это действие НЕЛЬЗЯ ОТМЕНИТЬ',
          'Все данные компании будут УДАЛЕНЫ НАВСЕГДА',
          'Связанные задачи и контакты могут быть потеряны',
          'Восстановление данных будет невозможно'
        ]}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
