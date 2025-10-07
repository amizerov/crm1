'use client';

import { useState, useEffect, useTransition } from 'react';
import { getTasks } from '../../actions/getTasks';
import { getProjectsByCompanyForFilter } from '../../actions/getProjects';
import { getTaskStatuses } from '../../actions/getTaskStatuses';
import LeftPanel from '../common/LeftPanel';
import TaskList from './TaskList';
import TaskDetails from '../common/TaskDetails';
import Header from '../common/Header';
import { StatusTask } from '@/app/projects/actions/statusActions';

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
  projectId?: number;
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

interface ListLayoutProps {
  initialTasks: Task[];
  userCompanies: UserCompany[];
  statuses: StatusTask[];
  currentUserId: number;
  onViewChange?: (view: 'list' | 'desk') => void;
}

export default function ListLayout({ 
  initialTasks, 
  userCompanies, 
  statuses,
  currentUserId,
  onViewChange
}: ListLayoutProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [currentStatuses, setCurrentStatuses] = useState<StatusTask[]>(statuses);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [projects, setProjects] = useState<{ id: number; projectName: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false); // Для списка по умолчанию обычный режим
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState<boolean>(true);

  // При загрузке компонента проверяем localStorage
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    const savedProjectId = localStorage.getItem('selectedProjectId');
    const savedLeftPanelVisible = localStorage.getItem('leftPanelVisible');
    
    // Восстанавливаем состояние левой панели
    if (savedLeftPanelVisible !== null) {
      setIsLeftPanelVisible(savedLeftPanelVisible === 'true');
    }
    
    const loadInitialData = async () => {
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId);
        if (companyId === 0 || userCompanies.some(c => c.id === companyId)) {
          setSelectedCompanyId(companyId);
          
          // Загружаем задачи и проекты для сохраненной компании
          const newTasks = await getTasks(undefined, companyId === 0 ? undefined : companyId);
          setAllTasks(newTasks);
          
          if (companyId !== 0) {
            const companyProjects = await getProjectsByCompanyForFilter(companyId);
            setProjects(companyProjects);
            
            // Восстанавливаем выбранный проект, если он сохранен и существует
            if (savedProjectId) {
              const projectId = parseInt(savedProjectId);
              if (projectId === 0 || companyProjects.some(p => p.id === projectId)) {
                setSelectedProjectId(projectId);
                
                // Загружаем статусы для проекта
                const projectStatuses = await getTaskStatuses(projectId === 0 ? undefined : projectId);
                setCurrentStatuses(projectStatuses);
                
                // Фильтруем задачи по проекту
                if (projectId === 0) {
                  setTasks(newTasks);
                } else {
                  const filtered = newTasks.filter(task => task.projectId === projectId);
                  setTasks(filtered);
                }
              } else {
                setTasks(newTasks);
              }
            } else {
              // Загружаем статусы по умолчанию
              const defaultStatuses = await getTaskStatuses();
              setCurrentStatuses(defaultStatuses);
              setTasks(newTasks);
            }
          } else {
            setTasks(newTasks);
          }
        } else {
          // Если нет сохраненной компании, загружаем статусы по умолчанию
          const defaultStatuses = await getTaskStatuses();
          setCurrentStatuses(defaultStatuses);
        }
      }
      setIsInitialLoading(false);
    };
    
    loadInitialData();
    
    // Проверяем сохраненное состояние полноэкранного режима для списка
    const savedFullscreen = localStorage.getItem('listFullscreen');
    if (savedFullscreen !== null) {
      setIsFullscreen(savedFullscreen === 'true');
    }
  }, [userCompanies]);

  // Скрываем/показываем header и footer при изменении isFullscreen
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
    localStorage.setItem('listFullscreen', newFullscreen.toString());
  };

  const toggleLeftPanel = () => {
    setIsLeftPanelVisible(prev => {
      const newValue = !prev;
      localStorage.setItem('leftPanelVisible', newValue.toString());
      return newValue;
    });
  };

  const handleCompanyChange = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    setSelectedProjectId(0);
    localStorage.setItem('selectedCompanyId', companyId.toString());
    localStorage.removeItem('selectedProjectId');
    
    setIsInitialLoading(true);
    
    startTransition(async () => {
      const newTasks = await getTasks(undefined, companyId === 0 ? undefined : companyId);
      setAllTasks(newTasks);
      setTasks(newTasks);
      
      // Загружаем статусы по умолчанию (projectId IS NULL)
      const defaultStatuses = await getTaskStatuses();
      setCurrentStatuses(defaultStatuses);
      
      if (companyId !== 0) {
        const companyProjects = await getProjectsByCompanyForFilter(companyId);
        setProjects(companyProjects);
      } else {
        setProjects([]);
      }
      
      setIsInitialLoading(false);
    });
  };

  const handleRefreshTasks = async () => {
    startTransition(async () => {
      const newTasks = await getTasks(undefined, selectedCompanyId === 0 ? undefined : selectedCompanyId);
      setAllTasks(newTasks);
      
      if (selectedProjectId === 0) {
        setTasks(newTasks);
      } else {
        const filtered = newTasks.filter(task => task.projectId === selectedProjectId);
        setTasks(filtered);
      }
    });
  };

  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    localStorage.setItem('selectedProjectId', projectId.toString());
    
    setIsInitialLoading(true);
    
    startTransition(async () => {
      // Загружаем статусы для проекта (если projectId = 0, загружаются статусы по умолчанию)
      const projectStatuses = await getTaskStatuses(projectId === 0 ? undefined : projectId);
      setCurrentStatuses(projectStatuses);
      
      // Фильтруем задачи
      if (projectId === 0) {
        setTasks(allTasks);
      } else {
        const filtered = allTasks.filter(task => task.projectId === projectId);
        setTasks(filtered);
      }
      setIsInitialLoading(false);
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  const handleTaskDeleted = (taskId: number) => {
    // Удаляем задачу из локального состояния
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setAllTasks(prev => prev.filter(task => task.id !== taskId));
    // Закрываем панель, если удаленная задача была выбрана
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
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
      {/* Navigation Header */}
      <Header 
        isLeftPanelVisible={isLeftPanelVisible}
        onToggleLeftPanel={toggleLeftPanel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        title="Список задач"
        currentView="list"
        onViewChange={onViewChange}
      />

      {/* Основной контент */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Panel */}
        {isLeftPanelVisible && (
          <LeftPanel 
            userCompanies={userCompanies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
            isPending={isPending}
          />
        )}

        {/* Task List */}
        <div className="flex-1 min-w-0 relative">
          {isInitialLoading ? (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Загрузка задач...</p>
              </div>
            </div>
          ) : (
            <TaskList 
              tasks={tasks}
              statuses={currentStatuses}
              onTaskClick={handleTaskClick}
              isPending={isPending}
              companyId={selectedCompanyId || undefined}
              projectId={selectedProjectId || undefined}
              onTaskCreated={handleRefreshTasks}
              selectedTaskId={selectedTask?.id}
            />
          )}
        </div>
      </div>

      {/* Task Details Panel */}
      {selectedTask && (
        <TaskDetails 
          task={selectedTask}
          currentUserId={currentUserId}
          onClose={handleClosePanel}
          onTaskUpdated={handleRefreshTasks}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}