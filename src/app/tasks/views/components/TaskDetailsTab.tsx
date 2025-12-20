'use client';

import TaskDescription from './TaskDescription';

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
  typeId?: number;
  typeName?: string;
  typeColor?: string;
  dtc: string;
  dtu?: string;
  level?: number;
  hasChildren?: boolean;
}

interface Status {
  id: number;
  status: string;
}

interface Priority {
  id: number;
  priority: string;
}

interface Employee {
  id: number;
  Name: string;
  displayName?: string;
}

interface TaskType {
  id: number;
  projectId: number;
  typeName: string;
  typeOrder: number;
  typeColor: string | null;
}

interface TaskDetailsTabProps {
  task: Task;
  isEditing: boolean;
  formData: {
    taskName: string;
    description: string;
    statusId: number;
    priorityId: number;
    executorId: number;
    typeId: number;
    startDate: string;
    dedline: string;
  };
  statuses: Status[];
  priorities: Priority[];
  employees: Employee[];
  taskTypes: TaskType[];
  onFormDataChange: (formData: any) => void;
}

export default function TaskDetailsTab({
  task,
  isEditing,
  formData,
  statuses,
  priorities,
  employees,
  taskTypes,
  onFormDataChange
}: TaskDetailsTabProps) {
  
  const getPriorityColor = (priorityName: string) => {
    switch(priorityName) {
      case 'Низкий': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Средний': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Срочный': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) return 'Не указано';
    
    try {
      let date: Date;
      
      // Если уже объект Date, используем его
      if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        // Если строка, парсим её
        const dateString = String(dateInput).trim();
        
        // Преобразуем в ISO формат если нужно
        const isoString = dateString.includes(' ') 
          ? dateString.replace(' ', 'T') 
          : dateString;
        
        date = new Date(isoString);
      }
      
      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        return 'Не указано';
      }
      
      const formatted = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return 'Не указано';
    }
  };

  const formatDateForInput = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    try {
      let date: Date;
      
      // Если уже объект Date, используем его
      if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        // Если строка, парсим её
        const dateString = String(dateInput).trim();
        
        // Преобразуем в ISO формат если нужно
        const isoString = dateString.includes(' ') 
          ? dateString.replace(' ', 'T') 
          : dateString;
        
        date = new Date(isoString);
      }
      
      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Преобразуем в формат для datetime-local: "2025-10-06T12:00"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date for input:', dateInput, error);
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ID задачи */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
        ID: #{task.id}
      </div>

      {isEditing ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Название */}
          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => onFormDataChange({...formData, taskName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 font-semibold"
              placeholder="Название задачи *"
              required
            />
          </div>

          {/* Список полей */}
          <div className="space-y-2 text-sm flex-shrink-0">
            {/* Этап */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Этап:</label>
              <select
                value={formData.statusId}
                onChange={(e) => onFormDataChange({...formData, statusId: Number(e.target.value)})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.status}</option>
                ))}
              </select>
            </div>

            {/* Приоритет */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Приоритет:</label>
              <select
                value={formData.priorityId}
                onChange={(e) => onFormDataChange({...formData, priorityId: Number(e.target.value)})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="0">Не выбрано</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.priority}</option>
                ))}
              </select>
            </div>

            {/* Тип задачи */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Тип задачи:</label>
              <select
                value={formData.typeId}
                onChange={(e) => onFormDataChange({...formData, typeId: Number(e.target.value)})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="0">Не выбрано</option>
                {taskTypes.map(taskType => (
                  <option key={taskType.id} value={taskType.id}>
                    {taskType.typeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Исполнитель */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Исполнитель:</label>
              <select
                value={formData.executorId}
                onChange={(e) => onFormDataChange({...formData, executorId: Number(e.target.value)})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="0">Не назначен</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.displayName || employee.Name}</option>
                ))}
              </select>
            </div>

            {/* Дата начала */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Начало:</label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => onFormDataChange({...formData, startDate: e.target.value})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>

            {/* Дедлайн */}
            <div className="flex items-center gap-3">
              <label className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Дедлайн:</label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.dedline)}
                onChange={(e) => onFormDataChange({...formData, dedline: e.target.value})}
                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
          </div>

          {/* Описание на всю ширину */}
          <TaskDescription
            taskId={task.id}
            projectId={task.projectId || 0}
            taskName={task.taskName}
            description={task.description || ''}
            isEditable={true}
          />
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Название */}
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {task.taskName}
            </h3>
          </div>

          {/* Список свойств */}
          <div className="space-y-2 text-sm flex-shrink-0">
            {/* Этап */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Этап:</span>
              <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded text-xs font-medium">
                {task.statusName}
              </span>
            </div>

            {/* Приоритет */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Приоритет:</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${task.priorityName ? getPriorityColor(task.priorityName) : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {task.priorityName || 'Не указан'}
              </span>
            </div>

            {/* Тип задачи */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Тип задачи:</span>
              {task.typeName ? (
                <span 
                  className="inline-block px-2.5 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: task.typeColor || '#6B7280' }}
                >
                  {task.typeName}
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">Не указан</span>
              )}
            </div>

            {/* Исполнитель */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Исполнитель:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {task.executorName || 'Не назначен'}
              </span>
            </div>

            {/* Дата начала работ */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Начало работ:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {task.startDate ? formatDate(task.startDate) : 'Не указано'}
              </span>
            </div>

            {/* Дедлайн */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Дедлайн:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {task.dedline ? formatDate(task.dedline) : 'Не указан'}
              </span>
            </div>

            {/* Проект */}
            {task.projectId && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Проект:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {task.projectName ? `${task.projectName} (ID: ${task.projectId})` : `ID: ${task.projectId}`}
                </span>
              </div>
            )}

            {/* Компания */}
            {task.companyId && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Компания:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {task.companyName ? `${task.companyName} (ID: ${task.companyId})` : `ID: ${task.companyId}`}
                </span>
              </div>
            )}

            {/* Дата обновления */}
            {task.dtu && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Обновлено:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(task.dtu)}
                </span>
              </div>
            )}

            {/* Родительская задача */}
            {task.parentId && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">Родитель:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  #{task.parentId}
                </span>
              </div>
            )}
          </div>

          {/* Описание/Цель задачи на всю ширину */}
          <TaskDescription
            taskId={task.id}
            projectId={task.projectId || 0}
            taskName={task.taskName}
            description={task.description || ''}
            isEditable={true}
          />
        </div>
      )}
    </div>
  );
}
