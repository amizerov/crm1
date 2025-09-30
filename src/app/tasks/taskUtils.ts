export type Task = {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
};

export type FilterType = 'all' | 'important' | 'forgotten' | 'overdue' | 'my' | 'unassigned' | 'completed';

// Утилиты для определения категорий задач
export const taskUtils = {
  // Важные задачи: высокий приоритет ИЛИ близкий дедлайн ИЛИ статус "Критично"
  isImportant: (task: Task): boolean => {
    // Высокий приоритет (ID 1 обычно = Высокий)
    const isHighPriority = task.priorityId === 1 || task.priorityName?.toLowerCase().includes('высок') || task.priorityName?.toLowerCase().includes('критич');
    
    // Близкий дедлайн (менее 3 дней)
    let hasNearDeadline = false;
    if (task.dedline) {
      const deadlineDate = new Date(task.dedline);
      const today = new Date();
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      hasNearDeadline = diffDays <= 3 && diffDays >= 0;
    }
    
    // Критичный статус
    const isCriticalStatus = task.statusName?.toLowerCase().includes('критич') || task.statusName?.toLowerCase().includes('срочн');
    
    return isHighPriority || hasNearDeadline || isCriticalStatus;
  },

  // Забытые задачи: давно не обновлялись (более 7 дней) и не завершены
  isForgotten: (task: Task): boolean => {
    // Исключаем завершённые задачи (statusId = 5)
    const isCompleted = task.statusId === 5 || task.statusName?.toLowerCase().includes('готов') || task.statusName?.toLowerCase().includes('завершен') || task.statusName?.toLowerCase().includes('закрыт');
    if (isCompleted) return false;

    // Проверяем дату последнего обновления
    const lastUpdate = task.dtu ? new Date(task.dtu) : new Date(task.dtc);
    const today = new Date();
    const diffDays = Math.ceil((today.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
    
    return diffDays > 7;
  },

  // Просроченные задачи: дедлайн прошел, но задача не завершена
  isOverdue: (task: Task): boolean => {
    if (!task.dedline) return false;
    
    // Исключаем завершённые задачи (statusId = 5)
    const isCompleted = task.statusId === 5 || task.statusName?.toLowerCase().includes('готов') || task.statusName?.toLowerCase().includes('завершен') || task.statusName?.toLowerCase().includes('закрыт');
    if (isCompleted) return false;
    
    const deadlineDate = new Date(task.dedline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Сравниваем только даты
    deadlineDate.setHours(0, 0, 0, 0);
    
    return deadlineDate < today;
  },

  // Мои задачи: назначены текущему пользователю
  isMy: (task: Task, currentUserId: number): boolean => {
    return task.executorId === currentUserId;
  },

  // Без исполнителя
  isUnassigned: (task: Task): boolean => {
    return !task.executorId;
  },

  // Выполненные задачи: со статусом ID = 5 (Готово)
  isCompleted: (task: Task): boolean => {
    return task.statusId === 5 || 
           task.statusName?.toLowerCase() === 'готово' || 
           task.statusName?.toLowerCase().includes('завершен') || 
           task.statusName?.toLowerCase().includes('выполнен');
  },

  // Фильтрация задач по типу
  filterTasks: (tasks: Task[], filterType: FilterType, currentUserId?: number): Task[] => {
    switch (filterType) {
      case 'important':
        return tasks.filter(task => taskUtils.isImportant(task));
      case 'forgotten':
        return tasks.filter(task => taskUtils.isForgotten(task));
      case 'overdue':
        return tasks.filter(task => taskUtils.isOverdue(task));
      case 'my':
        return currentUserId ? tasks.filter(task => taskUtils.isMy(task, currentUserId)) : [];
      case 'unassigned':
        return tasks.filter(task => taskUtils.isUnassigned(task));
      case 'completed':
        return tasks.filter(task => taskUtils.isCompleted(task));
      case 'all':
      default:
        return tasks;
    }
  },

  // Подсчет задач по категориям
  countTasksByCategories: (tasks: Task[], currentUserId?: number) => {
    return {
      all: tasks.length,
      important: tasks.filter(task => taskUtils.isImportant(task)).length,
      forgotten: tasks.filter(task => taskUtils.isForgotten(task)).length,
      overdue: tasks.filter(task => taskUtils.isOverdue(task)).length,
      my: currentUserId ? tasks.filter(task => taskUtils.isMy(task, currentUserId)).length : 0,
      unassigned: tasks.filter(task => taskUtils.isUnassigned(task)).length,
      completed: tasks.filter(task => taskUtils.isCompleted(task)).length,
    };
  },

  // Получить цветовой индикатор для задачи
  getTaskIndicator: (task: Task): { color: string; icon: string; tooltip: string } | null => {
    if (taskUtils.isOverdue(task)) {
      return { color: '#e83e8c', icon: '⚡', tooltip: 'Просрочена' };
    }
    if (taskUtils.isImportant(task)) {
      return { color: '#dc3545', icon: '🔥', tooltip: 'Важная' };
    }
    if (taskUtils.isForgotten(task)) {
      return { color: '#fd7e14', icon: '⏰', tooltip: 'Забытая' };
    }
    return null;
  }
};
