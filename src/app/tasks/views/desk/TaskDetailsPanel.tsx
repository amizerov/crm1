'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { updateTaskFromKanban } from '../../actions/updateTaskFromKanban';
import { deleteTaskFromKanban } from '../../actions/deleteTaskFromKanban';
import { getTaskStatuses } from '../../actions/getTaskStatuses';
import { getPriorities } from '../../actions/getPriorities';
import { getEmployees, getEmployeesByCompany } from '@/app/employees/actions';

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

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export default function TaskDetailsPanel({ task, onClose, onTaskUpdated }: TaskDetailsPanelProps) {
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
  
  // Состояние формы
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    taskName: task.taskName,
    description: task.description || '',
    statusId: task.statusId,
    priorityId: task.priorityId || 0,
    executorId: task.executorId || 0,
    dedline: task.dedline || ''
  });
  const [statuses, setStatuses] = useState<Array<{id: number; status: string}>>([]);
  const [priorities, setPriorities] = useState<Array<{id: number; priority: string}>>([]);
  const [employees, setEmployees] = useState<Array<{id: number; Name: string; displayName?: string}>>([]);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  
  // Загрузка справочников
  useEffect(() => {
    const loadData = async () => {
      const [statusesData, prioritiesData] = await Promise.all([
        getTaskStatuses(),
        getPriorities()
      ]);
      setStatuses(statusesData);
      setPriorities(prioritiesData);
      
      // Загружаем сотрудников в зависимости от компании задачи
      const employeesData = task.companyId 
        ? await getEmployeesByCompany(task.companyId)
        : await getEmployees();
      setEmployees(employeesData);
    };
    loadData();
  }, [task.companyId]); // Перезагружаем при смене компании

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
  }, [onClose, isResizing]);

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
      case 'Низкий': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Средний': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Срочный': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
          dedline: formData.dedline || undefined
        });
        
        if (result.success) {
          setIsEditing(false);
          if (onTaskUpdated) {
            await onTaskUpdated();
          }
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
      dedline: task.dedline || ''
    });
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }
    
    setIsSaving(true);
    startTransition(async () => {
      try {
        const result = await deleteTaskFromKanban(task.id);
        
        if (result.success) {
          onClose(); // Закрываем панель
          if (onTaskUpdated) {
            await onTaskUpdated(); // Обновляем список задач
          }
        } else {
          console.error('Error deleting task:', result.error);
          alert(result.error || 'Ошибка при удалении');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Ошибка при удалении задачи');
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
        top: '64px', // Отступ от header (высота header примерно 64px)
        bottom: '80px', // Отступ от footer (высота footer примерно 80px)
        height: 'calc(100vh - 144px)', // Высота между header и footer
        width: `${width}px`,
        maxHeight: 'calc(100vh - 144px)', // Максимальная высота
        overflow: 'hidden' // Предотвращаем переполнение
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
          ${isResizing ? 'bg-blue-500 w-2' : 'hover:bg-blue-400'}
        `}
        style={{ zIndex: 51 }}
      />
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {isEditing ? 'Редактирование задачи' : 'Детали задачи'}
        </h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.taskName.trim()}
                className="
                  w-8 h-8 
                  bg-gray-600 hover:bg-gray-700 
                  disabled:bg-gray-400 disabled:cursor-not-allowed
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
                  bg-gray-500 hover:bg-gray-600 
                  disabled:bg-gray-400 disabled:cursor-not-allowed
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
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="
                w-8 h-8 
                bg-gray-600 hover:bg-gray-700 
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
          )}
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="
              w-8 h-8 
              bg-gray-600 hover:bg-gray-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed
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
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID задачи */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ID: #{task.id}
        </div>

        {isEditing ? (
          <>
            {/* Форма редактирования */}
            
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Название задачи *
              </label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => setFormData({...formData, taskName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Статус *
              </label>
              <select
                value={formData.statusId}
                onChange={(e) => setFormData({...formData, statusId: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.status}</option>
                ))}
              </select>
            </div>

            {/* Приоритет */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Приоритет
              </label>
              <select
                value={formData.priorityId}
                onChange={(e) => setFormData({...formData, priorityId: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="0">Не выбрано</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.priority}</option>
                ))}
              </select>
            </div>

            {/* Исполнитель */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Исполнитель
              </label>
              <select
                value={formData.executorId}
                onChange={(e) => setFormData({...formData, executorId: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="0">Не назначен</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.displayName || employee.Name}</option>
                ))}
              </select>
            </div>

            {/* Дата создания (только чтение) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Дата создания
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm">
                📅 {formatDate(task.dtc)}
              </div>
            </div>

            {/* Дедлайн */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Дедлайн
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.dedline)}
                onChange={(e) => setFormData({...formData, dedline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </>
        ) : (
          <>
            {/* Режим просмотра */}
            
            {/* Название */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {task.taskName}
              </h3>
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Статус
              </label>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                {task.statusName}
              </span>
            </div>

            {/* Приоритет */}
            {task.priorityName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Приоритет
                </label>
                <span className={`inline-block px-3 py-1 rounded text-sm ${getPriorityColor(task.priorityName)}`}>
                  {task.priorityName}
                </span>
              </div>
            )}

            {/* Исполнитель */}
            {task.executorName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Исполнитель
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span className="text-gray-900 dark:text-gray-100">{task.executorName}</span>
                </div>
              </div>
            )}

            {/* Даты */}
            <div className="grid grid-cols-2 gap-4">
              {task.startDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Начало
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    📅 {formatDate(task.startDate)}
                  </div>
                </div>
              )}
              {task.dedline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дедлайн
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    ⏰ {formatDate(task.dedline)}
                  </div>
                </div>
              )}
            </div>

            {/* Описание */}
            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Описание
                </label>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            )}

            {/* Даты создания и обновления */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <strong>Создано:</strong> {formatDate(task.dtc)}
              </div>
              {task.dtu && (
                <div>
                  <strong>Обновлено:</strong> {formatDate(task.dtu)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Футер с кнопками действий */}
      {!isEditing && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/tasks/edit/${task.id}`}
            className="
              block w-full px-4 py-2 
              bg-gray-600 hover:bg-gray-700 
              text-white text-center
              rounded
              transition-colors
              no-underline
            "
          >
            📝 Полное редактирование
          </Link>
        </div>
      )}
    </div>
  );
}
