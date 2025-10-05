'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { updateTaskFromKanban } from '../../actions/updateTaskFromKanban';
import { deleteTaskFromKanban } from '../../actions/deleteTaskFromKanban';
import { getTaskStatuses } from '../../actions/getTaskStatuses';
import { getPriorities } from '../../actions/getPriorities';
import { getEmployees, getEmployeesByCompany } from '@/app/employees/actions';
import { getTaskActions, TaskAction } from '../../actions/taskActions';
import TaskDetailsTab from './TaskDetailsTab';
import TaskActionsTab from './TaskActionsTab';
import TaskDocumentsTab from './TaskDocumentsTab';
import TaskHistoryTab from './TaskHistoryTab';

type TabType = 'details' | 'actions' | 'documents' | 'history';

interface Task {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  statusName: string;
  priorityId?: number;
  priorityName?: string;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  executorName?: string;
  userId?: number;
  userName?: string;
  companyId?: number;
  companyName?: string;
  projectId?: number;
  projectName?: string;
  dtc: string;
  dtu?: string;
  level?: number;
  hasChildren?: boolean;
}

interface TaskDetailsPanelProps {
  task: Task;
  currentUserId: number;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: (taskId: number) => void;
}

export default function TaskDetailsPanel({ task: initialTask, currentUserId, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskDetailsPanelWidth');
      return saved ? parseInt(saved) : 384; // 384px = w-96
    }
    return 384;
  });
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  // Локальное состояние для задачи, чтобы обновлять данные после сохранения
  const [task, setTask] = useState(initialTask);
  
  // Обновляем task при изменении initialTask
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);
  
  // Состояние табов
  const [activeTab, setActiveTab] = useState<TabType>('details');
  
  // Состояние модала подтверждения удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Состояние формы
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    taskName: task.taskName,
    description: task.description || '',
    statusId: task.statusId,
    priorityId: task.priorityId || 0,
    executorId: task.executorId || 0,
    startDate: task.startDate || '',
    dedline: task.dedline || ''
  });
  const [statuses, setStatuses] = useState<Array<{id: number; status: string}>>([]);
  const [priorities, setPriorities] = useState<Array<{id: number; priority: string}>>([]);
  const [employees, setEmployees] = useState<Array<{id: number; Name: string; displayName?: string}>>([]);
  const [actions, setActions] = useState<TaskAction[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  
  // Загрузка справочников
  useEffect(() => {
    const loadData = async () => {
      const [statusesData, prioritiesData, actionsData] = await Promise.all([
        getTaskStatuses(task.projectId),
        getPriorities(),
        getTaskActions(task.id)
      ]);
      setStatuses(statusesData);
      setPriorities(prioritiesData);
      setActions(actionsData);
      
      // Загружаем сотрудников в зависимости от компании задачи
      const employeesData = task.companyId 
        ? await getEmployeesByCompany(task.companyId)
        : await getEmployees();
      setEmployees(employeesData);
    };
    loadData();
  }, [task.companyId, task.projectId, task.id]); // Перезагружаем при смене компании, проекта или задачи

  // Изменение размера
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(320, Math.min(800, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('taskDetailsPanelWidth', width.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width]);

  // Закрытие при клике вне панели
  useEffect(() => {
    if (isResizing) return; // Не закрывать при изменении размера
    if (showDeleteModal) return; // НЕ закрывать панель, если открыто модальное окно удаления!

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Добавляем слушатель с небольшой задержкой, чтобы не закрыть панель сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isResizing, showDeleteModal]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Не указано';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priorityName?: string) => {
    switch(priorityName) {
      case 'Низкий': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Средний': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Срочный': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    startTransition(async () => {
      try {
        const result = await updateTaskFromKanban({
          id: task.id,
          taskName: formData.taskName,
          description: formData.description || undefined,
          statusId: formData.statusId,
          priorityId: formData.priorityId || undefined,
          executorId: formData.executorId || undefined,
          startDate: formData.startDate || undefined,
          dedline: formData.dedline || undefined
        });
        
        if (result.success) {
          // Обновляем локальное состояние задачи с новыми данными
          setTask(prev => ({
            ...prev,
            taskName: formData.taskName,
            description: formData.description,
            statusId: formData.statusId,
            priorityId: formData.priorityId,
            executorId: formData.executorId,
            startDate: formData.startDate,
            dedline: formData.dedline,
            updatedAt: new Date()
          }));
          
          setIsEditing(false);
          if (onTaskUpdated) {
            await onTaskUpdated();
          }
          // Панель остается открытой после сохранения
        } else {
          console.error('Error updating task:', result.error);
          alert(result.error || 'Ошибка при сохранении');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        alert('Ошибка при сохранении задачи');
      } finally {
        setIsSaving(false);
      }
    });
  };
  
  const handleCancel = () => {
    setFormData({
      taskName: task.taskName,
      description: task.description || '',
      statusId: task.statusId,
      priorityId: task.priorityId || 0,
      executorId: task.executorId || 0,
      startDate: task.startDate || '',
      dedline: task.dedline || ''
    });
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    setShowDeleteModal(false);
    
    // 1. Оптимистично удаляем задачу из UI
    if (onTaskDeleted) {
      onTaskDeleted(task.id);
    }
    
    // 2. Закрываем панель
    onClose();
    
    // 3. Отправляем запрос на сервер в фоне
    setIsSaving(true);
    startTransition(async () => {
      try {
        const result = await deleteTaskFromKanban(task.id);
        
        if (result.success) {
          // Успешно удалено - НЕ обновляем с сервера, т.к. оптимистичное удаление уже сработало
          // Обновление произойдет при следующем обновлении списка задач (создание, перемещение и т.д.)
        } else {
          console.error('Error deleting task:', result.error);
          alert(result.error || 'Ошибка при удалении');
          // При ошибке обновляем данные с сервера (откат)
          if (onTaskUpdated) {
            await onTaskUpdated();
          }
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Ошибка при удалении задачи');
        // При ошибке обновляем данные с сервера (откат)
        if (onTaskUpdated) {
          await onTaskUpdated();
        }
      } finally {
        setIsSaving(false);
      }
    });
  };
  
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  return (
    <>
      <div 
        ref={panelRef}
        className="
          fixed right-0 
          bg-white dark:bg-gray-800 
          border-l border-gray-200 dark:border-gray-700 
          flex flex-col 
          shadow-2xl
          z-50
        "
        style={{ 
          top: '3.7rem', // 64px в rem (py-3 + содержимое + border)
          bottom: '0px',
          height: 'calc(100vh - 4rem)',
          width: `${width}px`,
          maxHeight: 'calc(100vh - 4rem)',
          overflow: 'hidden'
        }}
      >
      {/* Ресайзер */}
      <div
        onMouseDown={handleResizeStart}
        className={`
          absolute left-0 top-0 bottom-0 w-1
          hover:w-2
          cursor-col-resize
          transition-all
          ${isResizing ? 'bg-sky-600 w-2' : 'hover:bg-sky-400'}
        `}
        style={{ zIndex: 51 }}
      />
      {/* Табы в стиле Windows */}
      <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-900 px-2 pt-1 border-b border-slate-300 dark:border-slate-600">
        <div className="flex gap-0.5">
          <button
            onClick={() => setActiveTab('details')}
            className={`
              px-4 text-sm font-medium transition-all cursor-pointer
              rounded-t-lg border border-b-0 relative
              ${activeTab === 'details' 
                ? 'py-2.5 bg-white dark:bg-gray-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white dark:after:bg-gray-800' 
                : 'py-2 mt-1 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }
            `}
          >
            Детали
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`
              px-4 text-sm font-medium transition-all cursor-pointer
              rounded-t-lg border border-b-0 relative
              ${activeTab === 'actions' 
                ? 'py-2.5 bg-white dark:bg-gray-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white dark:after:bg-gray-800' 
                : 'py-2 mt-1 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }
            `}
          >
            Действия
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`
              px-4 text-sm font-medium transition-all cursor-pointer
              rounded-t-lg border border-b-0 relative
              ${activeTab === 'documents' 
                ? 'py-2.5 bg-white dark:bg-gray-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white dark:after:bg-gray-800' 
                : 'py-2 mt-1 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }
            `}
          >
            Документы
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              px-4 text-sm font-medium transition-all cursor-pointer
              rounded-t-lg border border-b-0 relative
              ${activeTab === 'history' 
                ? 'py-2.5 bg-white dark:bg-gray-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white dark:after:bg-gray-800' 
                : 'py-2 mt-1 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }
            `}
          >
            История
          </button>
        </div>
      </div>

      {/* Заголовок таба с кнопками действий */}
      {activeTab === 'details' && (
        <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between gap-2 -mt-px">
          {isEditing ? (
            <>
              {/* Информация о создании задачи */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Создано: {formatDate(task.dtc)}
                </span>
                {task.userName && (
                  <span>
                    Создатель: {task.userName}
                  </span>
                )}
              </div>
              
              {/* Кнопки управления */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.taskName.trim()}
                  className="
                    w-8 h-8 
                    bg-slate-600 hover:bg-slate-700 
                    disabled:bg-slate-400 disabled:cursor-not-allowed
                    text-white 
                    rounded 
                    flex items-center justify-center
                    transition-colors 
                    cursor-pointer
                  "
                  title="Сохранить"
                >
                  💾
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="
                    w-8 h-8 
                    bg-slate-500 hover:bg-slate-600 
                    disabled:bg-slate-400 disabled:cursor-not-allowed
                    text-white 
                    rounded 
                    flex items-center justify-center
                    transition-colors 
                    cursor-pointer
                  "
                  title="Отмена"
                >
                  ❌
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Информация о создании задачи */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Создано: {formatDate(task.dtc)}
                </span>
                {task.userName && (
                  <span>
                    Создатель: {task.userName}
                  </span>
                )}
              </div>
              
              {/* Кнопки управления */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    w-8 h-8 
                    bg-slate-600 hover:bg-slate-700 
                    text-white 
                    rounded 
                    flex items-center justify-center
                    transition-colors 
                    cursor-pointer
                  "
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSaving}
                  className="
                    w-8 h-8 
                    bg-rose-600 hover:bg-rose-700 
                    disabled:bg-rose-400 disabled:cursor-not-allowed
                    text-white 
                    rounded 
                    flex items-center justify-center
                    transition-colors 
                    cursor-pointer
                  "
                  title="Удалить задачу"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Вкладка Детали */}
        {activeTab === 'details' && (
          <TaskDetailsTab
            task={task}
            isEditing={isEditing}
            formData={formData}
            statuses={statuses}
            priorities={priorities}
            employees={employees}
            onFormDataChange={setFormData}
          />
        )}

        {/* Вкладка Действия */}
        {activeTab === 'actions' && (
          <TaskActionsTab
            taskId={task.id}
            currentUserId={currentUserId}
            initialActions={actions}
            onActionsUpdate={async () => {
              const newActions = await getTaskActions(task.id);
              setActions(newActions);
            }}
          />
        )}

        {/* Вкладка Документы */}
        {activeTab === 'documents' && (
          <TaskDocumentsTab taskId={task.id} />
        )}

        {/* Вкладка История */}
        {activeTab === 'history' && (
          <TaskHistoryTab taskId={task.id} />
        )}
      </div>
    </div>

    {/* Модальное окно подтверждения удаления */}
    {showDeleteModal && (
      <>
        {/* Backdrop - затемнение фона */}
        <div 
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
        />
        
        {/* Модальное окно */}
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-rose-500 p-6 z-[61] max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Подтверждение удаления
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Вы уверены, что хотите удалить задачу &quot;{task.taskName}&quot;? 
                Это действие нельзя будет отменить.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-not-allowed text-white rounded transition-colors cursor-pointer"
                >
                  {isSaving ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}
