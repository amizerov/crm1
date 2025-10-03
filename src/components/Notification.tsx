'use client';

import { useState, useEffect } from 'react';

type NotificationProps = {
  message: string;
  type: 'error' | 'success';
  isVisible: boolean;
  onClose: () => void;
};

export default function Notification({ message, type, isVisible, onClose }: NotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'error' ? '#dc3545' : '#28a745',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxWidth: '400px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '24px' }}>
        {type === 'error' ? '😞' : '😊'}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {type === 'error' ? 'Ошибка входа' : 'Успешно'}
        </div>
        <div style={{ fontSize: '14px' }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
      >
        ×
      </button>
    </div>
  );
}
