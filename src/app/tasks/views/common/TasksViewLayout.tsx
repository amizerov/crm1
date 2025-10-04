'use client';

import { useState, useEffect } from 'react';
import ListLayout from '../list/ListLayout';
import DeskLayout from '../desk/DeskLayout';

interface TasksViewLayoutProps {
  initialTasks: any[];
  userCompanies: any[];
  statuses: any[];
  currentUserId: number;
  initialView?: 'list' | 'desk';
}

export default function TasksViewLayout({
  initialTasks,
  userCompanies,
  statuses,
  currentUserId,
  initialView = 'desk'
}: TasksViewLayoutProps) {
  const [currentView, setCurrentView] = useState<'list' | 'desk'>(initialView);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация view из URL query параметра, localStorage или initialView
  useEffect(() => {
    // Проверяем query параметр в URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view') as 'list' | 'desk' | null;
    
    if (viewFromUrl && (viewFromUrl === 'list' || viewFromUrl === 'desk')) {
      setCurrentView(viewFromUrl);
      localStorage.setItem('tasksView', viewFromUrl);
    } else {
      // Если нет query параметра, используем localStorage
      const savedView = localStorage.getItem('tasksView') as 'list' | 'desk' | null;
      if (savedView && savedView !== initialView) {
        setCurrentView(savedView);
        // Обновляем URL без перезагрузки
        window.history.replaceState({}, '', `/tasks/views?view=${savedView}`);
      } else {
        // Если ничего нет, используем initialView и обновляем URL
        window.history.replaceState({}, '', `/tasks/views?view=${initialView}`);
      }
    }
    setIsInitialized(true);
  }, [initialView]);

  const handleViewChange = (view: 'list' | 'desk') => {
    setCurrentView(view);
    localStorage.setItem('tasksView', view);
    // Обновляем URL без перезагрузки страницы
    window.history.pushState({}, '', `/tasks/views?view=${view}`);
  };

  // Показываем loading во время инициализации, чтобы избежать мерцания
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {currentView === 'list' ? (
        <ListLayout
          initialTasks={initialTasks}
          userCompanies={userCompanies}
          statuses={statuses}
          currentUserId={currentUserId}
          onViewChange={handleViewChange}
        />
      ) : (
        <DeskLayout
          initialTasks={initialTasks}
          userCompanies={userCompanies}
          statuses={statuses}
          currentUserId={currentUserId}
          onViewChange={handleViewChange}
        />
      )}
    </div>
  );
}
