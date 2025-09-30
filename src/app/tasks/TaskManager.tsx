'use client';

import { useState, useMemo } from 'react';
import TaskTable from './TaskTable';
import TaskFilters from './TaskFilters';
import { taskUtils, type Task, type FilterType } from './taskUtils';
import { getCompleted } from './actions/getCompleted';

interface TaskManagerProps {
  tasks: Task[];
  userId: number;
  executorId?: number;
  executorName?: string;
}

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

export default function TaskManager({ tasks: initialTasks, userId, executorId, executorName }: TaskManagerProps) {
  const [currentTasks, setCurrentTasks] = useState<Task[]>(initialTasks);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Обработчик изменения фильтра
  const handleFilterChange = async (filter: FilterType) => {
    console.log('Изменяется фильтр на:', filter);
    setCurrentFilter(filter);
    
    if (filter === 'completed') {
      // Загружаем только выполненные задачи
      try {
        const completedTasks = await getCompleted(executorId);
        setCurrentTasks(completedTasks);
      } catch (error) {
        console.error('Ошибка при загрузке выполненных задач:', error);
      }
    } else {
      // Возвращаемся к исходному набору активных задач
      console.log('Возвращаемся к исходным задачам:', initialTasks.length);
      setCurrentTasks(initialTasks);
    }
  };

  // Подсчитываем задачи по категориям
  const tasksCount = useMemo(() => {
    console.log('Подсчитываем категории для задач:', currentTasks.length, currentTasks);
    return taskUtils.countTasksByCategories(currentTasks, userId);
  }, [currentTasks, userId]);

  // Фильтруем и сортируем задачи
  const processedTasks = useMemo(() => {
    console.log('Фильтруем задачи:', currentFilter, 'из', currentTasks.length);
    
    let filtered;
    
    // Если фильтр 'completed' и мы уже загрузили выполненные задачи, не фильтруем их снова
    if (currentFilter === 'completed' && currentTasks !== initialTasks) {
      filtered = currentTasks; // Используем уже загруженные выполненные задачи как есть
    } else {
      // Для всех остальных фильтров используем стандартную фильтрацию
      filtered = taskUtils.filterTasks(currentTasks, currentFilter, userId);
    }
    
    console.log('После фильтрации:', filtered.length, filtered);
    
    // Затем сортируем, если есть конфигурация сортировки
    if (sortConfig) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof Task] || '';
        const bValue = b[sortConfig.field as keyof Task] || '';
        
        // Специальная обработка для дат
        if (sortConfig.field === 'dedline' || sortConfig.field === 'dtc' || sortConfig.field === 'dtu') {
          const aDate = aValue ? new Date(aValue as string).getTime() : 0;
          const bDate = bValue ? new Date(bValue as string).getTime() : 0;
          
          // Для дедлайна: задачи без дедлайна в конец
          if (sortConfig.field === 'dedline') {
            if (!aValue && !bValue) return 0;
            if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
            if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          }
          
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // Обработка для числовых полей
        if (sortConfig.field === 'id' || sortConfig.field === 'priority') {
          const aNum = Number(aValue) || 0;
          const bNum = Number(bValue) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Строковая сортировка
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    return filtered;
  }, [currentTasks, currentFilter, sortConfig, userId]);

  const handleSort = (field: string) => {
    setSortConfig(prevSort => {
      if (prevSort?.field === field) {
        // Переключаем направление сортировки
        if (prevSort.direction === 'asc') {
          return { field, direction: 'desc' };
        } else {
          return null; // Сброс сортировки
        }
      } else {
        // Новое поле, сортируем по возрастанию
        return { field, direction: 'asc' };
      }
    });
  };

  return (
    <>
      {/* Фильтры */}
      <TaskFilters
        onFilterChange={handleFilterChange}
        currentFilter={currentFilter}
        tasksCount={tasksCount}
      />

      {/* Информация о сортировке */}
      {sortConfig && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          marginBottom: 8,
          fontSize: 12, 
          color: '#6c757d' 
        }}>
          <span>
            Сортировка: <strong>{getFieldDisplayName(sortConfig.field)}</strong>
          </span>
          <span style={{ fontSize: 14, marginLeft: 8 }}>
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        </div>
      )}

      {/* Таблица задач */}
      <TaskTable 
        tasks={processedTasks} 
        userId={userId}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </>
  );
}

// Вспомогательная функция для описания фильтров
function getFilterDescription(filter: FilterType): string {
  switch (filter) {
    case 'important':
      return 'Важные задачи';
    case 'forgotten':
      return 'Забытые задачи';
    case 'overdue':
      return 'Просроченные задачи';
    case 'completed':
      return 'Выполненные задачи';
    case 'my':
      return 'Мои задачи';
    case 'unassigned':
      return 'Без исполнителя';
    default:
      return 'Все задачи';
  }
}

// Вспомогательная функция для отображения названий полей
function getFieldDisplayName(field: string): string {
  switch (field) {
    case 'id': return 'ID';
    case 'name': return 'Название';
    case 'dtc': return 'Дата создания';
    case 'dtu': return 'Дата изменения';
    case 'dedline': return 'Дедлайн';
    case 'priority': return 'Приоритет';
    case 'status': return 'Статус';
    case 'executorName': return 'Исполнитель';
    default: return field;
  }
}
