'use client';

import { useState, useEffect, useTransition } from 'react';
import { getTasks } from '../../actions/getTasks';
import LeftPanel from './LeftPanel';
import KanbanBoard from './KanbanBoard';
import TaskDetailsPanel from './TaskDetailsPanel';

interface Task {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number;
  companyId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
}

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface Status {
  id: number;
  status: string;
}

interface DeskViewProps {
  initialTasks: Task[];
  userCompanies: UserCompany[];
  statuses: Status[];
  currentUserId: number;
}

export default function DeskView({ 
  initialTasks, 
  userCompanies, 
  statuses,
  currentUserId 
}: DeskViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // При загрузке компонента проверяем localStorage
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId);
      if (companyId === 0 || userCompanies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId);
        if (companyId !== 0) {
          handleCompanyChange(companyId);
        }
      }
    }

    // Проверяем сохраненное состояние полноэкранного режима
    const savedFullscreen = localStorage.getItem('deskFullscreen');
    if (savedFullscreen !== null) {
      setIsFullscreen(savedFullscreen === 'true');
    }
  }, [userCompanies]);

  // Скрываем/показываем header и footer при монтировании и изменении isFullscreen
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    const body = document.body;
    const html = document.documentElement;
    
    if (isFullscreen) {
      // Полноэкранный режим
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      // Свернутый режим
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      
      // Делаем body flexbox с высотой 100vh
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      body.style.height = '100vh';
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      
      // Main растягивается и имеет overflow-hidden
      if (main) {
        main.style.flex = '1';
        main.style.overflow = 'hidden';
        main.style.minHeight = '0';
      }
    }

    // Восстанавливаем при размонтировании
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.height = '';
      body.style.display = '';
      body.style.flexDirection = '';
      if (main) {
        main.style.flex = '';
        main.style.overflow = '';
        main.style.minHeight = '';
      }
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    localStorage.setItem('deskFullscreen', newFullscreen.toString());
  };

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('selectedCompanyId', companyId.toString());
    
    startTransition(async () => {
      const newTasks = await getTasks(undefined, companyId === 0 ? undefined : companyId);
      setTasks(newTasks);
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  return (
    <div 
      className="flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{
        height: isFullscreen ? '100vh' : '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Верхняя панель с навигацией - компактная, фиксированная высота */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            📋 Доска задач
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Кнопка полноэкранного режима */}
          <button
            onClick={toggleFullscreen}
            className="
              px-2 py-1.5
              bg-purple-600 hover:bg-purple-700 
              dark:bg-purple-500 dark:hover:bg-purple-600
              text-white
              rounded
              text-xs font-medium
              transition-colors
              flex items-center gap-1
              whitespace-nowrap
            "
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Развернуть на весь экран'}
          >
            <span className="text-sm">⤢</span>
            <span className="hidden sm:inline">{isFullscreen ? 'Свернуть' : 'Развернуть'}</span>
          </button>
          
          <a
            href="/tasks"
            className="
              px-2 py-1.5
              bg-gray-200 hover:bg-gray-300 
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-900 dark:text-gray-100
              rounded
              text-xs font-medium
              no-underline inline-flex items-center gap-1
              transition-colors
              whitespace-nowrap
            "
          >
            <span>📊</span>
            <span className="hidden sm:inline">Таблица</span>
          </a>
          <a
            href="/tasks/add"
            className="
              px-2 py-1.5
              bg-green-600 hover:bg-green-700 
              dark:bg-green-500 dark:hover:bg-green-600
              text-white
              rounded
              text-xs font-medium
              no-underline inline-flex items-center gap-1
              transition-colors
              whitespace-nowrap
            "
          >
            <span>+</span>
            <span className="hidden sm:inline">Добавить</span>
          </a>
        </div>
      </div>

      {/* Основной контент - занимает оставшееся место */}
      <div className="flex flex-1 min-h-0">
        {/* Левая панель - Компании и Проекты */}
        <LeftPanel 
          userCompanies={userCompanies}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={handleCompanyChange}
          isPending={isPending}
        />

        {/* Центральная область - Kanban доска */}
        <div className="flex-1 min-w-0">
          <KanbanBoard 
            tasks={tasks}
            statuses={statuses}
            onTaskClick={handleTaskClick}
            isPending={isPending}
          />
        </div>

        {/* Правая панель - Детали задачи */}
        {selectedTask && (
          <TaskDetailsPanel 
            task={selectedTask}
            onClose={handleClosePanel}
          />
        )}
      </div>
    </div>
  );
}
