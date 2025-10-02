'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
import TaskTable from './TaskTable';
import TaskFilters from './TaskFilters';
import CompanySelector from './CompanySelector';
import { taskUtils, type Task, type FilterType } from './taskUtils';
import { getCompleted } from './actions/getCompleted';
import { getTasks } from './actions/getTasks';

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface TaskManagerProps {
  tasks: Task[];
  userId: number;
  executorId?: number;
  executorName?: string;
  userCompanies: UserCompany[];
}

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

export default function TaskManager({ tasks: initialTasks, userId, executorId, executorName, userCompanies }: TaskManagerProps) {
  const [currentTasks, setCurrentTasks] = useState<Task[]>(initialTasks);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isPending, startTransition] = useTransition();

  // При загрузке компонента проверяем localStorage
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId);
      // Проверяем, что сохраненная компания есть в списке доступных
      if (companyId === 0 || userCompanies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId);
        // Загружаем данные для сохраненной компании
        if (companyId !== 0) {
          startTransition(async () => {
            const newTasks = await getTasks(undefined, companyId);
            setCurrentTasks(newTasks);
          });
        }
      }
    }
  }, [userCompanies]);

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    
    startTransition(async () => {
      const newTasks = await getTasks(undefined, companyId === 0 ? undefined : companyId);
      setCurrentTasks(newTasks);
    });
  };

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
      {/* Заголовок и селектор компании */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-8 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 m-0">Задачи</h1>
          
          <CompanySelector 
            userCompanies={userCompanies} 
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
          />
          
          {isPending && (
            <span className="text-sm text-gray-600 dark:text-gray-400 italic">
              Загрузка...
            </span>
          )}
          
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Всего задач: {currentTasks.length}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Переключатель представлений */}
          <Link 
            href="/tasks/views/desk"
            className="
              px-4 py-2
              bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white
              rounded
              text-sm font-medium
              no-underline inline-block
              transition-colors
            "
          >
            📋 Доска
          </Link>
          
          <Link 
            href="/tasks/add"
            className="
              px-6 py-3
              bg-green-600 hover:bg-green-700 
              dark:bg-green-500 dark:hover:bg-green-600
              text-white
              rounded
              text-base font-medium
              no-underline inline-block
              transition-all duration-200
              hover:shadow-lg dark:hover:shadow-green-500/20
              hover:-translate-y-0.5
            "
          >
            + Добавить задачу
          </Link>
        </div>
      </div>

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

      {/* Оверлей загрузки */}
      {isPending && (
        <div className="relative">
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-10 flex items-center justify-center min-h-[200px]">
            <span className="text-gray-600 dark:text-gray-400">Загрузка задач...</span>
          </div>
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
