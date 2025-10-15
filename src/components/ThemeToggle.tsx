'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Избегаем hydration mismatch - рендерим кнопку только после монтирования
  useEffect(() => {
    setMounted(true);
  }, []);

  // Пока не смонтировано - показываем нейтральную версию
  if (!mounted) {
    return (
      <button
        className="fixed top-24 left-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-lg z-[1002] opacity-80 hover:opacity-100 cursor-pointer"
        aria-label="Toggle theme"
        disabled
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
    );
  }

  const handleClick = () => {
    console.log('🎨 Theme toggle clicked');
    console.log('📊 Current theme:', theme);
    console.log('🔍 HTML classList before:', document.documentElement.classList.toString());
    toggleTheme();
    setTimeout(() => {
      console.log('✅ HTML classList after:', document.documentElement.classList.toString());
      console.log('💾 localStorage:', localStorage.getItem('theme'));
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-24 left-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-lg z-[1002] opacity-80 hover:opacity-100 cursor-pointer"
      aria-label="Toggle theme"
      title={`Переключить тему (текущая: ${theme === 'dark' ? 'тёмная' : 'светлая'})`}
    >
      {theme === 'light' ? (
        // Иконка луны - переключить на темную тему
        <svg
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Иконка солнца - переключить на светлую тему
        <svg
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}