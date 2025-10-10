'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { quickAddTask } from '../../actions/quickAddTask';
import { updateTaskStatus } from '../../actions/updateTaskStatus';
import { updateTaskOrder } from '../../actions/updateTaskOrder';
import TaskCard from './components/TaskCard';

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
  orderInStatus?: number;
}

interface Status {
  id: number;
  status: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  statuses: Status[];
  onTaskClick: (task: Task) => void;
  isPending: boolean;
  companyId?: number;
  projectId?: number;
  onTaskCreated?: () => void;
  onTaskDeleted?: (taskId: number) => void;
  selectedTaskId?: number;
}

export default function KanbanBoard({ 
  tasks, 
  statuses, 
  onTaskClick,
  isPending,
  companyId,
  projectId,
  onTaskCreated,
  onTaskDeleted,
  selectedTaskId
}: KanbanBoardProps) {
  const [addingToStatus, setAddingToStatus] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isActionPending, startTransition] = useTransition();
  const isSubmitting = isCreating || isActionPending;
  
  // Оптимистичное обновление - локальная копия задач
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  
  // Задачи, которые находятся в процессе обновления
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());
  
  // Кастомный drag and drop
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  
  // Состояние для визуального индикатора позиции вставки
  const [insertPosition, setInsertPosition] = useState<{ statusId: number; index: number } | null>(null);
  
  // Refs для автоскролла
  const boardRef = useRef<HTMLDivElement | null>(null);
  const columnRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Состояние для pan-скролла (drag-to-scroll)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 });
  
  // Состояние для отслеживания ширины правой панели
  const [rightPanelWidth, setRightPanelWidth] = useState(0);

  // Синхронизация с пропсами tasks
  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  // Отслеживаем ширину правой панели
  useEffect(() => {
    if (!selectedTaskId) {
      setRightPanelWidth(0);
      return;
    }

    // Функция для обновления ширины панели
    const updatePanelWidth = () => {
      const detailsPanel = document.querySelector('[data-task-details-panel]');
      if (detailsPanel) {
        const width = detailsPanel.getBoundingClientRect().width;
        // Используем только реальную ширину панели без лишнего отступа
        setRightPanelWidth(width);
      } else {
        // Fallback - базовая ширина панели
        setRightPanelWidth(600);
      }
    };

    // Обновляем сразу
    updatePanelWidth();

    // Отслеживаем изменения размера (при ресайзе панели)
    const resizeObserver = new ResizeObserver(updatePanelWidth);
    const detailsPanel = document.querySelector('[data-task-details-panel]');
    
    if (detailsPanel) {
      resizeObserver.observe(detailsPanel);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedTaskId]);

  // Автоматическая прокрутка к выбранной задаче при открытии панели деталей
  useEffect(() => {
    if (selectedTaskId && rightPanelWidth > 0) {
      // Прокручиваем к столбцу ТОЛЬКО когда rightPanelWidth обновилась
      const selectedTask = optimisticTasks.find(task => task.id === selectedTaskId);
      if (selectedTask) {
        // Увеличиваем задержку до окончания анимации панели (300ms + запас)
        setTimeout(() => {
          scrollToColumn(selectedTask.statusId, true); // force = true при открытии панели
        }, 350); // 300ms анимация панели + 50ms запас
      }
    }
  }, [selectedTaskId, rightPanelWidth]); // Добавлена зависимость от rightPanelWidth!

  // useEffect для обработки pan-скролла (drag-to-scroll)
  useEffect(() => {
    if (!isPanning) return;

    const handlePanMove = (e: MouseEvent) => {
      if (!boardRef.current) return;
      
      const dx = e.clientX - panStart.x;
      boardRef.current.scrollLeft = panStart.scrollLeft - dx;
    };

    const handlePanEnd = () => {
      setIsPanning(false);
      if (boardRef.current) {
        boardRef.current.style.cursor = 'grab';
        boardRef.current.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', handlePanEnd);

    return () => {
      document.removeEventListener('mousemove', handlePanMove);
      document.removeEventListener('mouseup', handlePanEnd);
    };
  }, [isPanning, panStart]);

  // Функция для оптимистичного удаления задачи
  const handleTaskDelete = (taskId: number) => {
    // Мгновенно удаляем задачу из UI
    setOptimisticTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Вызываем колбэк родителя, если он есть
    if (onTaskDeleted) {
      onTaskDeleted(taskId);
    }
  };

  // Функция автоматической прокрутки к столбцу при ховере на столбце
  const scrollToColumn = (statusId: number, force: boolean = false) => {
    const columnElement = columnRefs.current.get(statusId);
    const boardElement = boardRef.current;
    
    if (columnElement && boardElement) {
      const boardRect = boardElement.getBoundingClientRect();
      const columnRect = columnElement.getBoundingClientRect();
      
      // Проверяем, является ли это последним столбцом
      const activeStatuses = statuses.filter(status => 
        status.status !== 'На паузе' && 
        status.status !== 'Отменено'
      );
      const lastStatusId = activeStatuses[activeStatuses.length - 1]?.id;
      const isLastColumn = statusId === lastStatusId;
      
      // Используем актуальную ширину правой панели из state
      const rightMargin = 20; // Небольшой отступ для красоты
      const totalRightSpace = rightPanelWidth + rightMargin;
      
      // Проверяем видимость столбца с учётом правой панели
      const visibleRight = boardRect.right - totalRightSpace;
      const isColumnVisible = 
        columnRect.left >= boardRect.left && 
        columnRect.right <= visibleRight;
      
      // Если force=true (открытие панели) ИЛИ столбец не виден
      if (force || !isColumnVisible) {
        // Если столбец справа от видимой области ИЛИ force=true
        if (force || columnRect.right > visibleRight) {
          // Для последнего столбца не добавляем запас, для остальных добавляем 100px
          const scrollExtra = isLastColumn ? 60 : 100;
          
          const targetScrollLeft = 
            boardElement.scrollLeft + 
            (columnRect.right - visibleRight) + 
            scrollExtra; // Запас только если не последний столбец
          
          boardElement.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        }
        // Если столбец слева от видимой области
        else if (columnRect.left < boardRect.left) {
          // Прокручиваем так, чтобы был виден текущий столбец + часть предыдущего слева
          // Вычитаем 80px чтобы показать ~80px предыдущего столбца слева
          const targetScrollLeft = 
            boardElement.scrollLeft + 
            (columnRect.left - boardRect.left) - 
            80; // Показываем текущий столбец + ~80px предыдущего
          
          boardElement.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Обработчик начала pan-скролла (drag-to-scroll) на пустом месте доски
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    // Проверяем, что клик НЕ на карточке задачи
    const target = e.target as HTMLElement;
    const isTaskCard = target.closest('[data-task-card]');
    
    // Если клик на карточке - пропускаем (обработается handleMouseDown для drag задачи)
    if (isTaskCard) return;
    
    // Если клик на кнопке или input - пропускаем
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    
    // Запускаем pan-скролл
    e.preventDefault();
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      scrollLeft: boardRef.current?.scrollLeft || 0
    });
    
    // Меняем курсор
    if (boardRef.current) {
      boardRef.current.style.cursor = 'grabbing';
      boardRef.current.style.userSelect = 'none';
    }
  };

  // Обработчик ховера на столбце с задержкой
  const handleColumnHover = (statusId: number) => {
    if (isDragging || isPanning) return; // Не скроллим во время драга или pan
    
    // Очищаем предыдущий таймер
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Устанавливаем задержку 300ms перед прокруткой
    hoverTimeoutRef.current = setTimeout(() => {
      scrollToColumn(statusId);
    }, 500);
  };
  
  // Обработчик выхода мыши из столбца - отменяем отложенную прокрутку
  const handleColumnLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Фильтруем статусы: исключаем только "На паузе" и "Отменено"
  const activeStatuses = statuses.filter(status => 
    status.status !== 'На паузе' && 
    status.status !== 'Отменено'
  );
  
  // Группируем задачи по активным статусам (используем optimisticTasks)
  // Сортируем задачи по orderInStatus
  const tasksByStatus = activeStatuses.map(status => ({
    status,
    tasks: optimisticTasks
      .filter(task => task.statusId === status.id && task.level === 0) // Только корневые задачи
      .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0)) // Сортировка по порядку
  }));

  const handleAddTask = (statusId: number) => {
    if (!newTaskName.trim() || !companyId) return;

    setIsCreating(true);

    startTransition(async () => {
      try {
        const result = await quickAddTask({
          taskName: newTaskName.trim(),
          statusId,
          companyId,
          projectId: projectId && projectId > 0 ? projectId : undefined
        });

        if (result?.success) {
          setNewTaskName('');
          setAddingToStatus(null);
          if (onTaskCreated) {
            await onTaskCreated();
          }
        } else if (result?.error) {
          console.error('Error creating task:', result.error);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      } finally {
        setIsCreating(false);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask(statusId);
    } else if (e.key === 'Escape') {
      setAddingToStatus(null);
      setNewTaskName('');
    }
  };

  // Функция для определения позиции вставки
  const getInsertPosition = (e: MouseEvent, statusId: number): number => {
    if (!draggedTask) return 0;
    
    const columnElement = columnRefs.current.get(statusId);
    if (!columnElement) return 0;
    
    // Находим контейнер с задачами
    const tasksContainer = columnElement.querySelector('[data-tasks-container]');
    if (!tasksContainer) return 0;
    
    // Получаем задачи этой колонки из данных (не из DOM)
    const columnTasks = optimisticTasks.filter(
      task => task.statusId === statusId && 
              task.level === 0 && 
              task.id !== draggedTask.id // Исключаем перетаскиваемую
    ).sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0));
    
    if (columnTasks.length === 0) return 0;
    
    // Получаем DOM элементы для вычисления позиции
    const taskCards = Array.from(tasksContainer.querySelectorAll('[data-task-card]'))
      .filter(el => {
        const card = el as HTMLElement;
        return !card.classList.contains('opacity-30');
      }) as HTMLElement[];
    
    if (taskCards.length === 0) return 0;
    
    const mouseY = e.clientY;
    
    // Находим ближайшую карточку
    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i];
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;
      
      if (mouseY < cardMiddle) {
        return i; // Вставить перед этой карточкой
      }
    }
    
    // Вставить в конец
    return taskCards.length;
  };

  // Кастомный drag and drop
  const handleMouseDown = (e: React.MouseEvent, task: Task) => {
    // Только левая кнопка мыши
    if (e.button !== 0) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setDraggedTask(task);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    // Сохраняем размеры элемента
    draggedElementRef.current = target.cloneNode(true) as HTMLDivElement;
    draggedElementRef.current.style.width = rect.width + 'px';
    
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({
        x: e.clientX,
        y: e.clientY
      });

      // Определяем, над какой колонкой находимся
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const column = elements.find(el => el.hasAttribute('data-status-id'));
      
      if (column) {
        const statusId = parseInt(column.getAttribute('data-status-id') || '0');
        setDragOverStatus(statusId);
        
        // Определяем позицию вставки
        const position = getInsertPosition(e, statusId);
        setInsertPosition({ statusId, index: position });
      } else {
        setDragOverStatus(null);
        setInsertPosition(null);
      }
    };

    const handleMouseUp = async () => {
      if (draggedTask && dragOverStatus) {
        const oldStatusId = draggedTask.statusId;
        const newStatusId = dragOverStatus;
        const taskId = draggedTask.id;
        const oldOrder = draggedTask.orderInStatus ?? 0;
        
        // Находим название нового статуса
        const newStatus = statuses.find(s => s.id === newStatusId);
        const newStatusName = newStatus?.status || '';
        
        // Определяем позицию вставки (если не была установлена, используем конец списка)
        const targetPosition = insertPosition?.index ?? 0;
        
        console.log('🎯 Drag & Drop:', {
          taskId,
          taskName: draggedTask.taskName,
          oldStatusId,
          newStatusId,
          oldOrder,
          targetPosition,
          insertPosition
        });
        
        // 1. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ - пересчитываем порядок всех задач
        setOptimisticTasks(prevTasks => {
          // Создаем копию массива задач
          const updatedTasks = prevTasks.map(task => ({ ...task }));
          
          // Находим перетаскиваемую задачу
          const draggedTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
          if (draggedTaskIndex === -1) return prevTasks;
          
          const movedTask = updatedTasks[draggedTaskIndex];
          
          // Если перемещение внутри одной колонки
          if (oldStatusId === newStatusId) {
            // Получаем все задачи этой колонки (корневые)
            const columnTasks = updatedTasks
              .filter(t => t.statusId === newStatusId && t.level === 0)
              .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0));
            
            // Удаляем перетаскиваемую из старой позиции
            const taskIndexInColumn = columnTasks.findIndex(t => t.id === taskId);
            if (taskIndexInColumn !== -1) {
              columnTasks.splice(taskIndexInColumn, 1);
            }
            
            // Вставляем на новую позицию
            columnTasks.splice(targetPosition, 0, movedTask);
            
            // Пересчитываем orderInStatus для всех задач в колонке
            columnTasks.forEach((task, index) => {
              const taskInArray = updatedTasks.find(t => t.id === task.id);
              if (taskInArray) {
                taskInArray.orderInStatus = index;
              }
            });
          } else {
            // Перемещение между колонками
            
            // 1. Обновляем задачи в старой колонке (сдвигаем вверх после удаления)
            updatedTasks
              .filter(t => t.statusId === oldStatusId && t.level === 0)
              .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0))
              .forEach((task, index) => {
                if (task.id !== taskId) {
                  task.orderInStatus = index;
                }
              });
            
            // 2. Обновляем задачи в новой колонке (сдвигаем вниз для вставки)
            const newColumnTasks = updatedTasks
              .filter(t => t.statusId === newStatusId && t.level === 0)
              .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0));
            
            // Вставляем перетаскиваемую задачу
            newColumnTasks.splice(targetPosition, 0, movedTask);
            
            // Пересчитываем orderInStatus
            newColumnTasks.forEach((task, index) => {
              const taskInArray = updatedTasks.find(t => t.id === task.id);
              if (taskInArray) {
                taskInArray.statusId = newStatusId;
                taskInArray.statusName = newStatusName;
                taskInArray.orderInStatus = index;
              }
            });
          }
          
          return updatedTasks;
        });
        
        // 2. Сбрасываем состояние drag'а
        setIsDragging(false);
        setDraggedTask(null);
        setDragOverStatus(null);
        setInsertPosition(null);
        draggedElementRef.current = null;
        
        // 3. Помечаем задачу как обновляющуюся
        setUpdatingTasks(prev => new Set(prev).add(taskId));
        
        // 4. Отправляем запрос в БД в фоне
        startTransition(async () => {
          console.log('📤 Calling updateTaskOrder:', { taskId, newStatusId, targetPosition });
          
          // Используем updateTaskOrder если статус или позиция изменились
          const result = await updateTaskOrder(taskId, newStatusId, targetPosition);
          
          console.log('📥 updateTaskOrder result:', result);
          
          if (result?.success) {
            // Успешно обновлено - обновляем данные с сервера для синхронизации
            if (onTaskCreated) {
              await onTaskCreated();
            }
            // Убираем маркер обновления с небольшой задержкой для визуального эффекта
            setTimeout(() => {
              setUpdatingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
              });
            }, 300);
          } else if (result?.error) {
            console.error('Error updating task order:', result.error);
            // В случае ошибки - откатываем изменения
            setOptimisticTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === taskId 
                  ? { ...task, statusId: oldStatusId }
                  : task
              )
            );
            // Убираем маркер обновления
            setUpdatingTasks(prev => {
              const newSet = new Set(prev);
              newSet.delete(taskId);
              return newSet;
            });
            // Можно также показать уведомление об ошибке
            alert('Ошибка при перемещении задачи: ' + result.error);
          }
        });
      } else {
        // Если просто отпустили без перемещения
        setIsDragging(false);
        setDraggedTask(null);
        setDragOverStatus(null);
        setInsertPosition(null);
        draggedElementRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedTask, dragOverStatus, insertPosition, onTaskCreated, statuses]);

  return (
    <div 
      ref={boardRef}
      onMouseDown={handleBoardMouseDown}
      className="h-full w-full overflow-x-auto"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e0 #f7fafc',
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
    >
      <div 
        className="h-full p-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeStatuses.length}, minmax(240px, 320px))`,
          gap: '1rem',
          gridAutoFlow: 'column',
          gridTemplateRows: '1fr',
          // Добавляем padding справа к grid-контейнеру равный ширине панели
          paddingRight: rightPanelWidth ? `${rightPanelWidth}px` : '0px',
          transition: 'padding-right 0.3s ease-in-out',
          minWidth: 'fit-content'
        }}
      >
        {tasksByStatus.map(({ status, tasks: statusTasks }) => (
          <div 
            key={status.id}
            ref={(el) => {
              if (el) {
                columnRefs.current.set(status.id, el);
              } else {
                columnRefs.current.delete(status.id);
              }
            }}
            data-status-id={status.id}
            onMouseEnter={() => handleColumnHover(status.id)}
            onMouseLeave={handleColumnLeave}
            className={`flex flex-col rounded-lg transition-colors min-w-[240px] overflow-hidden ${
              dragOverStatus === status.id
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {/* Заголовок колонки */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {status.status}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {statusTasks.length}
                </span>
              </div>
            </div>

            {/* Список задач */}
            <div className="flex-1 overflow-y-auto p-4" data-tasks-container style={{ minHeight: 0 }}>
              {isPending && statusTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
                </div>
              ) : statusTasks.length === 0 ? (
                <>
                  {/* Индикатор вставки в пустую колонку */}
                  {insertPosition?.statusId === status.id && insertPosition.index === 0 && (
                    <div className="h-1 bg-blue-500 rounded mb-3 animate-pulse" />
                  )}
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    Нет задач
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {statusTasks.map((task, index) => {
                    const isUpdating = updatingTasks.has(task.id);
                    const showInsertionLine = 
                      insertPosition?.statusId === status.id && 
                      insertPosition.index === index &&
                      draggedTask?.id !== task.id;
                    
                    return (
                      <div key={task.id}>
                        {/* Линия вставки ПЕРЕД карточкой */}
                        {showInsertionLine && (
                          <div className="h-1 bg-blue-500 rounded mb-3 animate-pulse" />
                        )}
                        
                        <TaskCard
                          task={task}
                          isDragging={isDragging}
                          draggedTask={draggedTask}
                          selectedTaskId={selectedTaskId}
                          isUpdating={isUpdating}
                          onMouseDown={handleMouseDown}
                          onClick={() => !isDragging && onTaskClick(task)}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Линия вставки в КОНЕЦ списка */}
                  {insertPosition?.statusId === status.id && 
                   insertPosition.index === statusTasks.length && (
                    <div className="h-1 bg-blue-500 rounded mt-3 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Форма добавления задачи */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              {addingToStatus === status.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, status.id)}
                    placeholder="Напишите название задачи"
                    autoFocus
                    disabled={isSubmitting}
                    className="
                      w-full px-3 py-2
                      text-sm
                      bg-white dark:bg-gray-700
                      border border-gray-300 dark:border-gray-600
                      rounded
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:opacity-50
                    "
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(status.id)}
                      disabled={!newTaskName.trim() || isSubmitting}
                      className="
                        px-3 py-1.5
                        text-sm text-white
                        bg-blue-600 hover:bg-blue-700
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        rounded
                        transition-colors cursor-pointer
                      "
                    >
                      {isSubmitting ? 'Создание...' : 'Добавить задачу'}
                    </button>
                    <button
                      onClick={() => {
                        setAddingToStatus(null);
                        setNewTaskName('');
                      }}
                      disabled={isSubmitting}
                      className="
                        px-3 py-1.5
                        text-sm text-gray-700 dark:text-gray-300
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        rounded
                        transition-colors
                      "
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingToStatus(status.id)}
                  disabled={!companyId || isSubmitting}
                  className="
                    w-full px-3 py-2 
                    text-sm text-gray-700 dark:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    rounded
                    transition-colors
                    flex items-center gap-2 cursor-pointer
                  "
                  title={!companyId ? 'Выберите компанию для добавления задачи' : ''}
                >
                  <span className="text-lg">+</span>
                  <span>Добавить задачу</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Плавающая карточка при перетаскивании */}
      {isDragging && draggedTask && draggedElementRef.current && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x - dragOffset.x,
            top: dragPosition.y - dragOffset.y,
            pointerEvents: 'none',
            zIndex: 10000,
            width: draggedElementRef.current.style.width,
            transform: 'rotate(3deg)',
            transition: 'none'
          }}
        >
          <div className="shadow-2xl border-2 border-blue-500 rounded-lg">
            <TaskCard
              task={draggedTask}
              isDragging={false}
              draggedTask={null}
              selectedTaskId={undefined}
              isUpdating={false}
              onMouseDown={() => {}}
              onClick={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
