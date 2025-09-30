'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleDeleteClient } from './actions';
import DeleteAlert from '@/components/DeleteAlert';

type DeleteButtonProps = {
  clientName: string;
  clientId: number;
};

export default function DeleteButton({ clientName, clientId }: DeleteButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try 
    {
      await handleDeleteClient(clientId);
    } 
    catch (error) {
      console.error('Ошибка при удалении клиента:', error);
      alert('Произошла ошибка при удалении клиента');
      setIsDeleting(false);
    }
    router.push('/clients');
  };

  return (
    <>
      <button 
        type="button"
        className="btn-danger"
        style={{ 
          padding: '14px 28px', 
          color: 'white', 
          border: 'none', 
          borderRadius: 8, 
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 600,
          minWidth: 120
        }}
        onClick={() => setShowModal(true)}
      >
        🗑️ Удалить
      </button>

      <DeleteAlert
        show={showModal}
        title="ОПАСНОЕ ДЕЙСТВИЕ!"
        message="Вы собираетесь удалить клиента"
        clientName={clientName}
        warnings={[
          'Это действие НЕЛЬЗЯ ОТМЕНИТЬ',
          'Все данные клиента будут УДАЛЕНЫ НАВСЕГДА',
          'История платежей и контакты будут потеряны',
          'Восстановление данных будет невозможно'
        ]}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}