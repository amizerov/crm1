'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ButtonCancelProps {
  /** URL для перехода при отмене. Если пустой, используется router.back() */
  href?: string;
  /** Текст на кнопке */
  text?: string;
  /** Дополнительный класс */
  className?: string;
}

export default function ButtonCancel({ 
  href, 
  text = 'Отмена', 
  className = '' 
}: ButtonCancelProps) {
  const router = useRouter();

  const buttonClasses = `
    px-6 py-3 
    bg-gray-500 dark:bg-gray-600
    hover:bg-gray-600 dark:hover:bg-gray-500
    text-white font-medium
    rounded transition-colors
    cursor-pointer
    ${className}
  `;

  // Если href не указан или пустой, используем router.back()
  if (!href) {
    return (
      <button 
        type="button" 
        onClick={() => router.back()}
        className={buttonClasses}
      >
        {text}
      </button>
    );
  }

  // Если href указан, используем Link
  return (
    <Link href={href}>
      <button type="button" className={buttonClasses}>
        {text}
      </button>
    </Link>
  );
}
