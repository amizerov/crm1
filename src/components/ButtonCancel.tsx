import Link from 'next/link';

interface ButtonCancelProps {
  /** URL для перехода при отмене */
  href: string;
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
