'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function BackButton({ className, style, children }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        color: '#007bff',
        fontSize: 14,
        padding: 0,
        ...style
      }}
    >
      {children || '← Назад'}
    </button>
  );
}