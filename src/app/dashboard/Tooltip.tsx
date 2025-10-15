interface TooltipProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ message, position = 'top' }: TooltipProps) {
  const positionClasses = {
    top: '-top-[60px] left-1/2 -translate-x-1/2',
    bottom: '-bottom-[60px] left-1/2 -translate-x-1/2',
    left: '-left-[120px] top-1/2 -translate-y-1/2',
    right: '-right-[120px] top-1/2 -translate-y-1/2'
  };

  const arrowClasses = {
    top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-400 dark:border-t-yellow-500',
    bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-yellow-400 dark:border-b-yellow-500',
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-yellow-400 dark:border-l-yellow-500',
    right: 'left-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-yellow-400 dark:border-r-yellow-500'
  };

  return (
    <div 
      className={`
        absolute bg-white dark:bg-gray-800
        border-2 border-yellow-400 dark:border-yellow-500
        rounded-lg px-3 py-2
        shadow-lg z-[9999]
        whitespace-nowrap text-sm font-medium
        text-yellow-700 dark:text-yellow-300
        animate-fadeIn pointer-events-none
        ${positionClasses[position]}
      `}
    >
      {message}
      {/* Стрелка */}
      <div 
        className={`
          absolute w-0 h-0
          ${arrowClasses[position]}
        `} 
      />
    </div>
  );
}
