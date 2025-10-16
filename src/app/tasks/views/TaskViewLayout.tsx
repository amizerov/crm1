'use client';

import { useState, useEffect, useTransition } from 'react';
import { getTasks } from '../actions/getTasks';
import { getProjectsByCompanyForFilter } from '../actions/getProjects';
import { getTaskStatuses } from '../actions/getTaskStatuses';
import LeftPanel from './components/LeftPanel';
import Header from './components/Header';
import TaskDetails from './components/TaskDetails';
import TaskList from './list/TaskList';
import KanbanBoard from './desk/KanbanBoard';
import TaskGanttDiagram from './gantt/TaskGanttDiagram';
import InboxView from './inbox/InboxView';
import { StatusTask } from '@/app/projects/actions/statusActions';

type ViewMode = 'list' | 'desk' | 'gantt' | 'inbox';

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
  orderInStatus?: number;
}

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface TaskViewLayoutProps {
  initialTasks: Task[];
  userCompanies: UserCompany[];
  statuses: StatusTask[];
  currentUserId: number;
}

export default function TaskViewLayout({ 
  initialTasks, 
  userCompanies, 
  statuses,
  currentUserId
}: TaskViewLayoutProps) {
  // Общее состояние для всех видов
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [currentStatuses, setCurrentStatuses] = useState<StatusTask[]>(statuses);
  
  // Инициализация с первой компанией, если она есть
  const initialCompanyId = userCompanies.length > 0 ? userCompanies[0].id : 0;
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(initialCompanyId);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);

  const [projects, setProjects] = useState<{ id: number; projectName: string }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  
  // Состояние UI
  const [currentView, setCurrentView] = useState<ViewMode>('desk'); // ✅ Канбан по умолчанию
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true); // ✅ Полный экран по умолчанию

  // Инициализация из localStorage (только один раз)
  useEffect(() => {
    const initializeFromStorage = async () => {
      // Восстанавливаем UI состояние
      const savedView = localStorage.getItem('taskView') as ViewMode;
      const savedLeftPanelVisible = localStorage.getItem('leftPanelVisible');
      const savedFullscreen = localStorage.getItem('taskFullscreen');
      
      if (savedView && ['list', 'desk', 'gantt', 'inbox'].includes(savedView)) {
        setCurrentView(savedView);
      }
      if (savedLeftPanelVisible !== null) {
        setIsLeftPanelVisible(savedLeftPanelVisible === 'true');
      }
      if (savedFullscreen !== null) {
        setIsFullscreen(savedFullscreen === 'true');
      }

      // Восстанавливаем фильтры или используем первую компанию
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      const savedProjectId = localStorage.getItem('selectedProjectId');
      
      // По умолчанию используем первую компанию
      let companyIdToLoad = initialCompanyId;
      
      if (savedCompanyId) {
        const companyId = parseInt(savedCompanyId);
        // Используем сохранённую компанию только если она существует
        // (игнорируем 0 = "Все компании", так как при первой загрузке нужна конкретная компания)
        if (companyId > 0 && userCompanies.some(c => c.id === companyId)) {
          companyIdToLoad = companyId;
        }
      }
      
      // Устанавливаем компанию в state если она изменилась
      if (companyIdToLoad !== selectedCompanyId) {
        setSelectedCompanyId(companyIdToLoad);
      }
      
      // Загружаем данные для компании (первой или сохранённой)
      if (companyIdToLoad !== 0) {
        await loadDataForCompany(companyIdToLoad, savedProjectId);
      } else {
        // Если "Все компании" - загружаем все задачи
        const newTasks = await getTasks();
        setAllTasks(newTasks);
        setTasks(newTasks);
        const defaultStatuses = await getTaskStatuses();
        setCurrentStatuses(defaultStatuses);
      }
      
      setIsInitialLoading(false);
    };

    initializeFromStorage();
  }, [userCompanies]);

  const loadDataForCompany = async (companyId: number, savedProjectId?: string | null) => {
    const newTasks = await getTasks(undefined, companyId === 0 ? undefined : companyId);
    setAllTasks(newTasks);
    
    if (companyId !== 0) {
      const companyProjects = await getProjectsByCompanyForFilter(companyId);
      setProjects(companyProjects);
      
      let projectIdToLoad = 0;
      
      // Восстанавливаем проект из localStorage
      if (savedProjectId) {
        const projectId = parseInt(savedProjectId);
        if (projectId === 0 || companyProjects.some(p => p.id === projectId)) {
          projectIdToLoad = projectId;
        }
      }
      
      // Если проект не восстановлен и есть проекты - выбираем первый
      if (projectIdToLoad === 0 && companyProjects.length > 0) {
        projectIdToLoad = companyProjects[0].id;
      }
      
      // Устанавливаем выбранный проект
      setSelectedProjectId(projectIdToLoad);
      
      // Загружаем данные для проекта
      await loadDataForProject(projectIdToLoad, newTasks);
      return;
    } else {
      setProjects([]);
    }
    
    // По умолчанию - все задачи и статусы
    setTasks(newTasks);
    const defaultStatuses = await getTaskStatuses();
    setCurrentStatuses(defaultStatuses);
  };

  const loadDataForProject = async (projectId: number, tasksData?: Task[]) => {
    const dataToFilter = tasksData || allTasks;
    
    // Загружаем статусы для проекта
    const projectStatuses = await getTaskStatuses(projectId === 0 ? undefined : projectId);
    setCurrentStatuses(projectStatuses);
    
    // Фильтруем задачи
    if (projectId === 0) {
      setTasks(dataToFilter);
    } else {
      const filtered = dataToFilter.filter(task => task.projectId === projectId);
      setTasks(filtered);
    }
  };

  // Обработчики изменений (БЕЗ перерисовки всего компонента)
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    localStorage.setItem('taskView', view);
  };

  const handleCompanyChange = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    setSelectedProjectId(0);
    localStorage.setItem('selectedCompanyId', companyId.toString());
    localStorage.removeItem('selectedProjectId');
    
    startTransition(async () => {
      await loadDataForCompany(companyId);
    });
  };

  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    localStorage.setItem('selectedProjectId', projectId.toString());
    
    startTransition(async () => {
      await loadDataForProject(projectId);
    });
  };

  const handleRefreshTasks = async () => {
    startTransition(async () => {
      const newTasks = await getTasks(undefined, selectedCompanyId === 0 ? undefined : selectedCompanyId);
      setAllTasks(newTasks);
      await loadDataForProject(selectedProjectId, newTasks);
    });
  };

  // UI обработчики
  const toggleLeftPanel = () => {
    setIsLeftPanelVisible(prev => {
      const newValue = !prev;
      localStorage.setItem('leftPanelVisible', newValue.toString());
      return newValue;
    });
  };

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    localStorage.setItem('taskFullscreen', newFullscreen.toString());
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setAllTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Рендерим основной контент в зависимости от вида
  const renderMainContent = () => {
    if (isInitialLoading) {
      return (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Загрузка задач...</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      tasks,
      statuses: currentStatuses,
      onTaskClick: handleTaskClick,
      isPending,
      companyId: selectedCompanyId || undefined,
      projectId: selectedProjectId || undefined,
      onTaskCreated: handleRefreshTasks,
      selectedTaskId: selectedTask?.id,
      onTaskDeleted: handleTaskDeleted,
      currentUserId
    };

    switch (currentView) {
      case 'list':
        return <TaskList {...commonProps} />;
      case 'desk':
        return <KanbanBoard {...commonProps} />;
      case 'gantt':
        return <TaskGanttDiagram {...commonProps} />;
      case 'inbox':
        return <InboxView tasks={tasks} currentUserId={currentUserId} />;
      default:
        return <TaskList {...commonProps} />;
    }
  };

  return (
    <div 
      className="flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{
        height: isFullscreen ? '100vh' : 'calc(100vh - 180px)', // Учитываем header (~60px) + footer (~60px) + main padding (~60px)
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        width: '100%',
        overflow: 'hidden',
        maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 180px)'
      }}
    >
      {/* Header - НЕ перерисовывается при смене вида */}
      <Header 
        isLeftPanelVisible={isLeftPanelVisible}
        onToggleLeftPanel={toggleLeftPanel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Основной контент */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Panel - НЕ перерисовывается при смене вида */}
        {isLeftPanelVisible && (
          <LeftPanel 
            userCompanies={userCompanies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
            isPending={isPending}
            onViewChange={handleViewChange}
          />
        )}

        {/* Main Content - ТОЛЬКО это перерисовывается */}
        <div className="flex-1 min-w-0 relative">
          {renderMainContent()}
        </div>
      </div>

      {/* Task Details Panel - НЕ перерисовывается */}
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