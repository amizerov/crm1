'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    title: "Kanban — визуальный контроль",
    description: "Шаблоны: Agile, Scrum, личный жизненный шаблон.",
    image: "/screenshots/kanban-board.png",
    alt: "Kanban доска с колонками Product Backlog, Sprint Backlog, To Do, In Progress"
  },
  {
    title: "Диаграмма Ганта",
    description: "Планирование зависимостей и сроков, гибкая визуализация.",
    image: "/screenshots/gantt-chart.png",
    alt: "Диаграмма Ганта с временной шкалой и задачами"
  },
  {
    title: "Мониторинг эффективности",
    description: "Отчеты, метрики потока задач, контроль времени и производительности.",
    content: (
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-sm text-gray-400">Графики и аналитика</p>
      </div>
    )
  },
  {
    title: "Простая инструкция",
    description: "Быстрый старт в 4 шага:",
    content: (
      <div>
        <ol className="text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside space-y-2 mb-4">
          <li>Создайте проект и шаблон колонок</li>
          <li>Добавьте задачи и назначьте исполнителей</li>
          <li>Визуализируйте процесс на Канбан и Гантте</li>
          <li>Анализируйте метрики и улучшайте поток</li>
        </ol>
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-sm text-gray-400">Быстрый старт за 4 шага</p>
        </div>
      </div>
    )
  }
];

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 секунды на слайд

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="relative mt-6">
      <div 
        className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index}
              className="w-full flex-shrink-0 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {slide.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {slide.description}
              </p>
              <div className="mt-4 h-64 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                {slide.image ? (
                  <img 
                    src={slide.image}
                    alt={slide.alt}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  slide.content
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Индикаторы слайдов */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide 
                ? 'bg-blue-500' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Кнопки навигации */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}