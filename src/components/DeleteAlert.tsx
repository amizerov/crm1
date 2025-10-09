'use client';

import React from 'react';

type AlertProps = {
  show: boolean;
  title: string;
  message: string;
  clientName: string;
  warnings: string[];
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'success' | 'secondary' | 'danger';
  children: React.ReactNode;
};

function Button({ variant = 'secondary', children, className = '', ...props }: ButtonProps) {
  const base =
    'font-semibold rounded-lg cursor-pointer transition-all duration-200 min-w-[120px] px-6 py-3 text-base';
  const variants: Record<string, string> = {
    success: 'btn-success text-white',
    secondary: 'btn-secondary text-white',
    danger: 'btn-danger text-white',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function DeleteAlert({
  show,
  title,
  message,
  clientName,
  warnings,
  onCancel,
  onConfirm,
  confirmText = 'Да, удалить навсегда',
  cancelText = 'Отменить',
  loading = false,
}: AlertProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 max-w-lg w-full shadow-2xl border-4 border-red-600 relative animate-[modalAppear_0.3s_ease-out]">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-red-600 text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">{message}</p>
        </div>
        <div className="bg-red-100 border-2 border-red-600 rounded-lg p-4 mb-6 text-center">
          <strong className="text-lg text-red-900">"{clientName}"</strong>
        </div>
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-5 mb-6">
          <h3 className="text-yellow-800 text-base font-semibold mb-3 flex items-center gap-2">🚨 Важная информация:</h3>
          <ul className="text-yellow-800 text-sm list-disc pl-5 space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="secondary" onClick={onCancel} className="min-w-[140px]">
            ↩️ {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="min-w-[180px]"
          >
            {loading ? '⏳ Удаление...' : `🗑️ ${confirmText}`}
          </Button>
        </div>
        <style jsx>{`
          @keyframes modalAppear {
            from { opacity: 0; transform: scale(0.8) translateY(-20px);}
            to { opacity: 1; transform: scale(1) translateY(0);}
          }
        `}</style>
      </div>
    </div>
  );
}