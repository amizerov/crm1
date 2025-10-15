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
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Если есть проверка доступности - выполняем её
    if (checkAvailability) {
      const result = await checkAvailability();
      
      if (result.available) {
        router.push(href);
      } else {
        const message = result.message || 'Недоступно';
        setTooltipMessage(message);
        onShowTooltip(message);
        onHighlight(result.highlightCard || cardId);
        
        // Убираем подсказку через 3 секунды
        setTimeout(() => {
          setTooltipMessage(null);
          onShowTooltip(null);
          onHighlight(null);
        }, 3000);
      }
    } else {
      // Если проверки нет - просто переходим
      router.push(href);
    }
  };

  return (
    <div className="relative">
      <div 
        onClick={handleClick}
        className={`
          p-5 rounded-xl text-center cursor-pointer 
          transition-all duration-300 ease-in-out
          min-h-[160px] flex flex-col justify-center items-center
          select-none
          ${isHighlighted 
            ? 'border-3 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-[0_0_20px_rgba(255,193,7,0.4)] scale-105' 
            : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:-translate-y-1 hover:shadow-lg'
          }
        `}
      >
        <div className="text-4xl mb-3">{icon}</div>
        <h3 
          className="m-0 mb-2 text-lg font-semibold"
          style={{ color }}
        >
          {title}
        </h3>
        <p className="m-0 text-gray-600 dark:text-gray-400 text-xs leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
      
      {/* Тултип */}
      {tooltipMessage && (
        <Tooltip message={tooltipMessage} position="top" />
      )}
    </div>
  );
}
