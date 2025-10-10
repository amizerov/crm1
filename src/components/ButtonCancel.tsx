'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ButtonCancelProps {
  /** URL для перехода при отмене. Если пустой, используется router.back() */
  href?: string;
  /** Текст на кнопке */
  text?: string;
  /** Дополнительные стили для кнопки */
  style?: React.CSSProperties;
}

export default function ButtonCancel({ 
  href, 
  text = 'Отмена', 
  style 
}: ButtonCancelProps) {
  const router = useRouter();

  // Если href не указан или пустой, используем router.back()
  if (!href) {
    return (
      <button 
        type="button" 
        onClick={() => router.back()}
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          border: 'none', 
          borderRadius: 4, 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...style
        }}
      >
        {text}
      </button>
    );
  }

  // Если href указан, используем Link
  return (
    <Link href={href}>
      <button type="button" style={{ 
        padding: '12px 24px', 
        backgroundColor: '#6c757d', 
        color: 'white', 
        border: 'none', 
        borderRadius: 4, 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}>
        {text}
      </button>
    </Link>
  );
}
