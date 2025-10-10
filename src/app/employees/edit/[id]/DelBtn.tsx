'use client';

import { useState } from 'react';
import { deleteEmployeeAction } from './actions';
import { useRouter } from 'next/navigation';

interface DelBtnProps {
  employeeId: number;
  employeeName: string;
}

export default function DelBtn({ employeeId, employeeName }: DelBtnProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', employeeId.toString());
      await deleteEmployeeAction(formData);
      router.push('/employees');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Ошибка при удалении сотрудника');
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        🗑 Удалить
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 32,
            borderRadius: 8,
            maxWidth: 400,
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>
              ⚠️ Подтвердите удаление
            </h3>
            <p>
              Вы действительно хотите удалить сотрудника <strong>{employeeName}</strong>?
            </p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Это действие нельзя отменить.
            </p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
