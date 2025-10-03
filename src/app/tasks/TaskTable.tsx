'use client';

import { useState, useEffect, useRef } from 'react';
import TaskRow from './TaskRow';
import { getUserSettings, saveUserSettings } from '@/db/userSettings';
import { Task, TaskTableProps, ColumnConfig, defaultTaskColumns, SortConfig } from './types';

export default function TaskTable({ tasks, userId, onSort, sortConfig }: TaskTableProps) {
  // Инициализируем с закрытыми задачами - добавляем все задачи с детьми в Set
  const [collapsedTasks, setCollapsedTasks] = useState<Set<number>>(() => {
    const initialCollapsed = new Set<number>();
    tasks.forEach(task => {
      if (task.hasChildren) {
        initialCollapsed.add(task.id);
      }
    });
    return initialCollapsed;
  });
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultTaskColumns);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, visible: boolean}>({
    x: 0, y: 0, visible: false
  });
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);
  
  // Используем ref для отслеживания, были ли загружены настройки
  const settingsLoadedRef = useRef(false);

  // Обновляем collapsedTasks при изменении задач
  useEffect(() => {
    const initialCollapsed = new Set<number>();
    tasks.forEach(task => {
      if (task.hasChildren) {
        initialCollapsed.add(task.id);
      }
    });
    setCollapsedTasks(initialCollapsed);
  }, [tasks]);

  // Получаем или создаем deviceId
  useEffect(() => {
    // Проверяем поддержку crypto в браузере
    const generateDeviceId = () => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      } else {
        // Fallback для старых браузеров
        return 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
    };

    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = generateDeviceId();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []); // Этот эффект выполняется только один раз

  // Инициализация настроек при загрузке компонента
  useEffect(() => {
    // Проверяем, что deviceId установлен и настройки еще не загружены
    if (!deviceId || settingsLoadedRef.current) return;

    const initializeSettings = async () => {
      try {
        const settingsJson = await getUserSettings(userId, deviceId);
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          if (settings.taskTableColumns) {
            // Обновляем старые настройки с новыми названиями колонок
            let needsUpdate = false;
            const savedColumns = settings.taskTableColumns.map((col: ColumnConfig) => {
              if (col.key === 'dedline' && (col.title === 'Срок' || col.title === 'Срок выполнения')) {
                needsUpdate = true;
                return { ...col, title: 'Дедлайн' };
              }
              return col;
            });
            
            // Проверяем, есть ли новые колонки в defaultTaskColumns, которых нет в сохраненных
            const savedKeys = new Set(savedColumns.map((col: ColumnConfig) => col.key));
            const newColumns = defaultTaskColumns.filter(col => !savedKeys.has(col.key));
            
            if (newColumns.length > 0) {
              needsUpdate = true;
              // Находим правильную позицию для вставки новых колонок
              const mergedColumns = [...savedColumns];
              newColumns.forEach(newCol => {
                // Находим индекс в defaultTaskColumns
                const defaultIndex = defaultTaskColumns.findIndex(dc => dc.key === newCol.key);
                // Находим, после какой колонки вставить
                let insertIndex = mergedColumns.length;
                for (let i = defaultIndex - 1; i >= 0; i--) {
                  const prevKey = defaultTaskColumns[i].key;
                  const existingIndex = mergedColumns.findIndex(mc => mc.key === prevKey);
                  if (existingIndex >= 0) {
                    insertIndex = existingIndex + 1;
                    break;
                  }
                }
                mergedColumns.splice(insertIndex, 0, newCol);
              });
              setColumns(mergedColumns);
              console.log('Добавлены новые колонки:', newColumns.map(c => c.key));
            } else {
              setColumns(savedColumns);
            }
            
            // Сохраняем обновленные настройки, если были изменения
            if (needsUpdate) {
              try {
                const finalColumns = newColumns.length > 0 ? 
                  [...savedColumns, ...newColumns] : savedColumns;
                const updatedSettings = { taskTableColumns: finalColumns };
                await saveUserSettings(userId, JSON.stringify(updatedSettings), deviceId);
                console.log('Настройки колонок обновлены');
              } catch (error) {
                console.error('Ошибка при обновлении настроек:', error);
              }
            }
          } else {
            setColumns(defaultTaskColumns);
          }
        } else {
          setColumns(defaultTaskColumns);
        }
        settingsLoadedRef.current = true;
        setIsInitialized(true);
        console.log('Настройки колонок инициализированы для устройства:', deviceId);
      } catch (error) {
        console.error('Ошибка при инициализации настроек:', error);
        setColumns(defaultTaskColumns);
        settingsLoadedRef.current = true;
        setIsInitialized(true);
      }
    };

    initializeSettings();
  }, [userId, deviceId]); // Теперь зависимости остаются постоянными

  const toggleTask = (taskId: number) => {
    setCollapsedTasks(prev => {
      const newSet = new Set<number>();
      
      // Сначала добавляем все задачи с детьми (все закрыты по умолчанию)
      tasks.forEach(task => {
        if (task.hasChildren) {
          newSet.add(task.id);
        }
      });
      
      // Если текущая задача была закрыта, открываем только её
      if (prev.has(taskId)) {
        newSet.delete(taskId);
      }
      // Если была открыта, то оставляем все закрытыми (включая её)
      
      return newSet;
    });
  };

  const toggleColumn = async (columnKey: string) => {
    const newColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    
    setColumns(newColumns);
    
    // Сохраняем изменения асинхронно
    try {
      const settings = { taskTableColumns: newColumns };
      console.log('Сохранение настроек колонок: ', settings);
      console.log('userId: ', userId, 'deviceId:', deviceId);
      const result = await saveUserSettings(userId, JSON.stringify(settings), deviceId);
      if (result.success) {
        console.log('Настройки успешно сохранены для устройства:', result.deviceId);
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек колонок:', error);
    }
  };

  const resetColumns = async () => {
    try {
      const settings = { taskTableColumns: defaultTaskColumns };
      const result = await saveUserSettings(userId, JSON.stringify(settings), deviceId);
      if (result.success) {
        setColumns(defaultTaskColumns);
        setContextMenu(prev => ({ ...prev, visible: false }));
        console.log('Настройки сброшены для устройства:', result.deviceId);
      }
    } catch (error) {
      console.error('Ошибка при сбросе настроек колонок:', error);
    }
  };

  // Функции для drag-and-drop колонок
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    // Находим индекс колонки в полном массиве columns по ключу
    const fullIndex = columns.findIndex(col => col.key === columnKey);
    setDraggedColumnIndex(fullIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnKey);
    // Добавляем полупрозрачность перетаскиваемому элементу
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Находим индекс целевой колонки в полном массиве
    const targetIndex = columns.findIndex(col => col.key === columnKey);
    
    if (draggedColumnIndex !== null && draggedColumnIndex !== targetIndex) {
      setDragOverColumnIndex(targetIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumnIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    
    const targetIndex = columns.findIndex(col => col.key === targetColumnKey);
    
    if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) {
      setDragOverColumnIndex(null);
      return;
    }

    // Создаем новый массив колонок с измененным порядком
    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);
    
    setColumns(newColumns);
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
    
    // Сохраняем изменения
    try {
      const settings = { taskTableColumns: newColumns };
      const result = await saveUserSettings(userId, JSON.stringify(settings), deviceId);
      if (result.success) {
        console.log('Порядок колонок сохранен');
      }
    } catch (error) {
      console.error('Ошибка при сохранении порядка колонок:', error);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      visible: true
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Функция для определения, должна ли задача быть видимой
  const isTaskVisible = (task: Task, index: number): boolean => {
    if (task.level === 0) return true;
    
    // Проверяем, не скрыт ли какой-либо из родителей
    for (let i = index - 1; i >= 0; i--) {
      const prevTask = tasks[i];
      if (prevTask.level! < task.level!) {
        if (collapsedTasks.has(prevTask.id)) {
          return false;
        }
        if (prevTask.level === 0) break;
      }
    }
    return true;
  };

  // Определяем, какие поля можно сортировать
  const sortableFields = ['id', 'taskName', 'projectName', 'statusName', 'priorityName', 'executorName', 'dedline', 'startDate', 'dtc', 'dtu'];
  
  const getSortIcon = (columnKey: string) => {
    if (!onSort || !sortableFields.includes(columnKey)) return null;
    
    if (sortConfig?.field === columnKey) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '⇅'; // Иконка для сортируемых полей без активной сортировки
  };

  const handleColumnClick = (columnKey: string) => {
    if (onSort && sortableFields.includes(columnKey)) {
      onSort(columnKey);
    }
  };

  const visibleTasks = tasks.filter((task, index) => isTaskVisible(task, index));
  const visibleColumns = columns.filter(col => col.visible);

  // Показываем индикатор загрузки пока настройки не инициализированы
  if (!isInitialized) {
    return (
      <div className="p-5 text-center text-gray-500 dark:text-gray-400 text-sm">
        Загрузка настроек таблицы...
      </div>
    );
  }

  return (
    <>
      {/* Глобальный обработчик клика для закрытия контекстного меню */}
      {contextMenu.visible && (
        <div 
          className="fixed inset-0 z-[999]"
          onClick={handleCloseContextMenu}
        />
      )}

      <div className="relative overflow-x-auto shadow-md rounded-lg">
        <table 
          className="w-full border-collapse bg-white dark:bg-gray-800"
          onContextMenu={handleContextMenu}
        >
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {visibleColumns.map((column) => {
                const fullIndex = columns.findIndex(col => col.key === column.key);
                return (
                  <th 
                    key={column.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.key)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, column.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.key)}
                    className={`
                      border border-gray-200 dark:border-gray-600 
                      font-semibold 
                      text-gray-800 dark:text-gray-200
                      ${sortableFields.includes(column.key) && onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none' : ''}
                      ${sortConfig?.field === column.key ? 'bg-blue-50 dark:bg-blue-900' : ''}
                      ${dragOverColumnIndex === fullIndex ? 'bg-blue-100 dark:bg-blue-800' : ''}
                      transition-colors duration-200
                    `}
                    style={{ 
                      width: column.width || 'auto',
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      position: 'relative',
                      cursor: draggedColumnIndex !== null ? 'move' : (sortableFields.includes(column.key) && onSort ? 'pointer' : 'grab')
                    }}
                    onClick={() => handleColumnClick(column.key)}
                    title={draggedColumnIndex !== null ? 'Перетащите для изменения порядка' : (sortableFields.includes(column.key) && onSort ? 'Нажмите для сортировки, зажмите для перетаскивания' : 'Зажмите для перетаскивания')}
                  >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: column.key === 'id' ? 'right' : 'left',
                      flex: 1
                    }}>
                      <span style={{ fontSize: '10px', opacity: 0.6 }}>⋮⋮</span>
                      {column.title}
                    </span>
                    {sortableFields.includes(column.key) && onSort && (
                      <span style={{ 
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: sortConfig?.field === column.key ? '#0056b3' : '#6c757d',
                        minWidth: '12px',
                        textAlign: 'right'
                      }}>
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                isCollapsed={collapsedTasks.has(task.id)}
                onToggle={() => toggleTask(task.id)}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </table>

        {/* Контекстное меню */}
        {contextMenu.visible && (
          <div
            className="
              fixed 
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600 
              rounded-md 
              shadow-lg dark:shadow-black/50 
              z-[1000] 
              min-w-[200px] 
              p-2
            "
            style={{
              top: contextMenu.y,
              left: contextMenu.x
            }}
          >
            <div className="
              px-3 py-2 
              border-b border-gray-200 dark:border-gray-700 
              font-semibold text-sm 
              text-gray-800 dark:text-gray-200
            ">
              Выбор колонок
            </div>
            {columns.map((column) => (
              <div
                key={column.key}
                className="
                  px-3 py-2 
                  cursor-pointer 
                  flex items-center gap-2 
                  text-sm 
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-colors
                "
                onClick={() => toggleColumn(column.key)}
              >
                <div className={`
                  w-4 h-4 
                  border-2 
                  rounded 
                  flex items-center justify-center 
                  transition-all 
                  ${column.visible 
                    ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600' 
                    : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
                  }
                `}>
                  {column.visible && (
                    <span className="text-white text-[10px] font-bold">✓</span>
                  )}
                </div>
                <span className={`
                  ${column.visible 
                    ? 'text-gray-800 dark:text-gray-200' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {column.title}
                </span>
              </div>
            ))}
            <div 
              className="
                px-3 py-2 
                border-t border-gray-200 dark:border-gray-700 
                cursor-pointer 
                flex items-center justify-center 
                text-sm text-blue-500 dark:text-blue-400 
                font-medium 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                transition-colors
              "
              onClick={resetColumns}
            >
              Сбросить к умолчанию
            </div>
          </div>
        )}
      </div>
    </>
  );
}