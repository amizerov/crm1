'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from './Tooltip';

interface ButtonCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: string;
  cardId: string;
  checkAvailability?: () => Promise<{
    available: boolean;
    message?: string;
    highlightCard?: string;
  }>;
  isHighlighted: boolean;
  onHighlight: (cardId: string | null) => void;
  onShowTooltip: (message: string | null) => void;
}

export default function ButtonCard({
  icon,
  title,
  description,
  href,
  color,
  cardId,
  checkAvailability,
  isHighlighted,
  onHighlight,
  onShowTooltip
}: ButtonCardProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Если есть проверка доступности - выполняем её
    if (checkAvailability) {
      const result = await checkAvailability();
      
      if (result.available) {
        router.push(href);
      } else {
        onShowTooltip(result.message || 'Недоступно');
        onHighlight(result.highlightCard || null);
        
        // Убираем подсказку через 3 секунды
        setTimeout(() => {
          onShowTooltip(null);
          onHighlight(null);
        }, 3000);
      }
    } else {
      // Если проверки нет - просто переходим
      router.push(href);
    }
  };

  const baseStyle = { 
    padding: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    userSelect: 'none' as const
  };

  // Подсветка нужной карточки
  const cardStyle = isHighlighted ? {
    ...baseStyle,
    border: '3px solid #ffc107',
    backgroundColor: '#fff8e1',
    boxShadow: '0 0 20px rgba(255, 193, 7, 0.4)',
    transform: 'scale(1.05)'
  } : baseStyle;

  return (
    <div 
      onClick={handleClick}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = isHighlighted ? 'scale(1.05)' : 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        if (!isHighlighted) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px', 
        color,
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: 0, 
        color: '#6c757d', 
        fontSize: '13px',
        lineHeight: '1.4'
      }}>
        {description}
      </p>
    </div>
  );
}
