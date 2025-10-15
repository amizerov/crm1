'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function ButtonBack({ className = '', children }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`
        bg-transparent border-none cursor-pointer
        text-gray-600 dark:text-gray-400
        hover:text-gray-800 dark:hover:text-gray-200
        text-sm p-0 whitespace-nowrap
        transition-colors
        ${className}
      `}
    >
      {children || '← Назад'}
    </button>
  );
}