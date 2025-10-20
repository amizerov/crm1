'use client';

import { MouseEvent, useEffect, useRef, useState, useCallback } from 'react';
import TaskCard from './TaskCard';

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

interface InsertPosition {
  statusId: number;
  index: number;
}

interface StatusColumnProps {
  status: Status;
  tasks: Task[];
  isPending: boolean;
  dragOverStatus: number | null;
  insertPosition: InsertPosition | null;
  updatingTasks: Set<number>;
  isDragging: boolean;
  draggedTask: Task | null;
  selectedTaskId?: number;
  addingToStatus: number | null;
  newTaskName: string;
  isSubmitting: boolean;
  companyId?: number;
  columnRef: (el: HTMLDivElement | null) => void;
  onColumnHover: (statusId: number) => void;
  onColumnLeave: () => void;
  onMouseDown: (e: MouseEvent, task: Task) => void;
  onTaskClick: (task: Task) => void;
  onSetAddingToStatus: (statusId: number | null) => void;
  onSetNewTaskName: (name: string) => void;
  onAddTask: (statusId: number) => void;
  onKeyDown: (e: React.KeyboardEvent, statusId: number) => void;
}

export default function StatusColumn({
  status,
  tasks,
  isPending,
  dragOverStatus,
  insertPosition,
  updatingTasks,
  isDragging,
  draggedTask,
  selectedTaskId,
  addingToStatus,
  newTaskName,
  isSubmitting,
  companyId,
  columnRef,
  onColumnHover,
  onColumnLeave,
  onMouseDown,
  onTaskClick,
  onSetAddingToStatus,
  onSetNewTaskName,
  onAddTask,
  onKeyDown
}: StatusColumnProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [scrollbarHeight, setScrollbarHeight] = useState(0);
  const [scrollbarTop, setScrollbarTop] = useState(0);
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);

  // Обновляем параметры скроллбара
  const updateScrollbar = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollHeight > container.clientHeight;
    setShowScrollbar(hasOverflow);

    if (hasOverflow) {
      const scrollRatio = container.clientHeight / container.scrollHeight;
      const thumbHeight = Math.max(30, container.clientHeight * scrollRatio);
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      const scrollProgress = maxScrollTop > 0 ? container.scrollTop / maxScrollTop : 0;
      const thumbTop = scrollProgress * (container.clientHeight - thumbHeight);

      setScrollbarHeight(thumbHeight);
      setScrollbarTop(thumbTop);
    }
  }, []);

  // Обработка клика и перетаскивания скроллбара
  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrollbarDragging(true);

    const startY = e.clientY;
    const startScrollTop = scrollContainerRef.current?.scrollTop || 0;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaY = e.clientY - startY;
      const scrollRatio = container.scrollHeight / container.clientHeight;
      const newScrollTop = startScrollTop + deltaY * scrollRatio;

      container.scrollTop = Math.max(0, Math.min(newScrollTop, container.scrollHeight - container.clientHeight));
    };

    const handleMouseUp = () => {
      setIsScrollbarDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Инициализация и обновление скроллбара
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollbar();

    const handleScroll = () => updateScrollbar();
    container.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [tasks, isPending, updateScrollbar]);

  return (
    <div 
      ref={columnRef}
      data-status-id={status.id}
      onMouseEnter={() => onColumnHover(status.id)}
      onMouseLeave={onColumnLeave}
      className={`group flex flex-col rounded-lg transition-colors min-w-[240px] overflow-hidden ${
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
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Список задач */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div 
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 hide-scrollbar" 
          data-tasks-container
        >
        {isPending && tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
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
            {tasks.map((task, index) => {
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
                    onMouseDown={onMouseDown}
                    onClick={() => !isDragging && onTaskClick(task)}
                  />
                </div>
              );
            })}
            
            {/* Линия вставки в КОНЕЦ списка */}
            {insertPosition?.statusId === status.id && 
             insertPosition.index === tasks.length && (
              <div className="h-1 bg-blue-500 rounded mt-3 animate-pulse" />
            )}
          </div>
        )}
        </div>

        {/* Кастомный скроллбар */}
        {showScrollbar && (
          <div 
            className="absolute top-0 right-0 w-3 h-full bg-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div
              className="absolute right-0 w-3 bg-gray-500 dark:bg-gray-400 opacity-40 hover:opacity-80 cursor-pointer transition-opacity duration-150"
              style={{
                height: `${scrollbarHeight}px`,
                top: `${scrollbarTop}px`
              }}
              onMouseDown={handleThumbMouseDown}
            />
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
              onChange={(e) => onSetNewTaskName(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, status.id)}
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
                onClick={() => onAddTask(status.id)}
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
                  onSetAddingToStatus(null);
                  onSetNewTaskName('');
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
            onClick={() => onSetAddingToStatus(status.id)}
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
  );
}