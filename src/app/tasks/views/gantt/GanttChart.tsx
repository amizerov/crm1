'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { GanttProps } from './types/public-types';

// Динамический импорт с отключением SSR для избежания ошибок с DOM API
const GanttComponent = dynamic<GanttProps>(
  () => import('./components/gantt/gantt').then(mod => mod.Gantt as ComponentType<GanttProps>),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Загрузка диаграммы Ганта...</p>
        </div>
      </div>
    )
  }
);

export default GanttComponent;
