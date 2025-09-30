// Основной тип задачи
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
  userId?: number;
  companyId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
};

// Конфигурация колонок таблицы
export type ColumnConfig = {
  key: string;
  title: string;
  visible: boolean;
  width?: string;
};

// Дефолтные колонки для таблицы задач
export const defaultTaskColumns: ColumnConfig[] = [
  { key: 'id', title: 'ID', visible: true, width: '80px' },
  { key: 'taskName', title: 'Название', visible: true },
  { key: 'description', title: 'Описание', visible: false },
  { key: 'statusName', title: 'Статус', visible: true, width: '120px' },
  { key: 'priorityName', title: 'Приоритет', visible: true, width: '100px' },
  { key: 'executorName', title: 'Исполнитель', visible: true, width: '150px' },
  { key: 'startDate', title: 'Начало', visible: false, width: '100px' },
  { key: 'dedline', title: 'Дедлайн', visible: true, width: '100px' }
];

// Конфигурация сортировки
export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

// Типы для props компонентов
export type TaskTableProps = {
  tasks: Task[];
  userId: number;
  onSort?: (field: string) => void;
  sortConfig?: SortConfig;
};

export type TaskRowProps = {
  task: Task;
  isCollapsed?: boolean;
  onToggle?: () => void;
  visibleColumns: ColumnConfig[];
};