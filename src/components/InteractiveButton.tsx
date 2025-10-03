'use client';

import Link from 'next/link';

type InteractiveButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function InteractiveButton({ 
  href, 
  children, 
  variant = 'primary',
  size = 'md',
  className = ''
}: InteractiveButtonProps) {
  // Базовые стили
  const baseStyles = 'inline-block rounded-lg no-underline font-semibold transition-all duration-300 cursor-pointer';
  
  // Стили для вариантов
  const variantStyles = {
    primary: 'bg-blue-500 text-white shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl',
    secondary: 'bg-gray-500 text-white shadow-lg hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl',
    outline: 'bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5'
  };
  
  // Стили для размеров
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  // Комбинируем все стили
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  );
}