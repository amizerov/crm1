# Интеграция Gantt диаграммы в Next.js 15

## 📋 Описание

Компонент диаграммы Ганта интегрирован из отдельного React-проекта (`D:\Projects\React\gantt-task-react`) в Next.js 15 проект с React 19.

## 🔧 Выполненная адаптация

### 1. Добавлена директива `'use client'`
Все компоненты с React хуками помечены как клиентские:
- `gantt.tsx` - главный компонент
- `task-list.tsx`, `task-list-table.tsx` - список задач
- `task-item.tsx` - элемент задачи
- `tooltip.tsx` - всплывающая подсказка
- `vertical-scroll.tsx`, `horizontal-scroll.tsx` - прокрутка
- `task-gantt.tsx`, `task-gantt-content.tsx` - основной Gantt контент

### 2. Динамический импорт (SSR отключён)
Создан `GanttChart.tsx` с динамическим импортом для предотвращения ошибок SSR:
```typescript
const GanttComponent = dynamic<GanttProps>(
  () => import('./components/gantt/gantt').then(mod => mod.Gantt),
  { ssr: false }
);
```

### 3. Адаптация TaskGanttDiagram
- Добавлено преобразование `Task[]` (CRM) → `GanttTask[]` (Gantt)
- Реализован расчёт прогресса на основе `stepOrder` статусов
- Добавлены цвета статусов через `rgba()` палитру
- Фильтрация задач с датами (`startDate` и `dedline`)
- Обработка зависимостей через `parentId`

### 4. CSS Modules
Все стили используют `.module.css` для изоляции:
- `gantt.module.css`
- `task-list-table.module.css`
- `tooltip.module.css`
- и т.д.

## 📦 Структура файлов

```
src/app/tasks/views/gantt/
├── TaskGanttDiagram.tsx     # Главный компонент (обёртка)
├── GanttChart.tsx            # Динамический импорт Gantt
├── index.ts                  # Экспорты для удобства
├── components/
│   ├── gantt/               # Основной Gantt компонент
│   ├── task-list/           # Список задач
│   ├── task-item/           # Элементы задач (бары, майлстоуны)
│   ├── calendar/            # Календарная шкала
│   ├── grid/                # Сетка
│   └── other/               # Утилиты (скроллы, подсказки, стрелки)
├── helpers/                 # Вспомогательные функции
│   ├── bar-helper.ts
│   ├── date-helper.ts
│   └── other-helper.ts
└── types/                   # TypeScript типы
    ├── public-types.ts      # Публичные типы (Task, GanttProps, ViewMode)
    ├── bar-task.ts
    └── date-setup.ts
```

## 🎨 Использование

### Базовое использование

```typescript
import TaskGanttDiagram from '@/app/tasks/views/gantt/TaskGanttDiagram';

<TaskGanttDiagram
  tasks={tasks}
  statuses={statuses}
  onTaskClick={(task) => console.log('Clicked:', task)}
  isPending={loading}
/>
```

### С кастомизацией

```typescript
import { GanttChart, ViewMode } from '@/app/tasks/views/gantt';

<GanttChart
  tasks={ganttTasks}
  viewMode={ViewMode.Week}
  locale="ru-RU"
  columnWidth={80}
  rowHeight={60}
  barCornerRadius={6}
  todayColor="rgba(59, 130, 246, 0.15)"
  onDoubleClick={(task) => openModal(task)}
  onDateChange={(task, children) => updateTaskDates(task)}
  onProgressChange={(task, children) => updateProgress(task)}
/>
```

## 🎯 Особенности реализации

### Преобразование данных
CRM Task → Gantt Task:
```typescript
{
  id: String(task.id),           // number → string
  name: task.taskName,            // название
  start: new Date(task.startDate!),
  end: new Date(task.dedline!),
  type: 'task',
  progress: calculateProgress(task.statusId, statuses), // на основе stepOrder
  dependencies: task.parentId ? [String(task.parentId)] : undefined,
  styles: {
    backgroundColor: getStatusColor(task.statusId, statuses),
    progressColor: '#10b981',
  },
}
```

### Расчёт прогресса
Прогресс рассчитывается по позиции статуса в workflow:
```typescript
const maxStep = Math.max(...statuses.map(s => s.stepOrder), 1);
const progress = Math.round((status.stepOrder / maxStep) * 100);
```

### Цветовая палитра статусов
8 цветов для статусов (на основе stepOrder):
- Blue (#3b82f6)
- Violet (#8b5cf6)
- Green (#10b981)
- Amber (#f59e0b)
- Red (#ef4444)
- Pink (#ec4899)
- Sky (#0ea5e9)
- Lime (#84cc16)

## 🔄 TODO

- [ ] Интегрировать server actions для `onDateChange`
- [ ] Интегрировать server actions для `onProgressChange`
- [ ] Добавить переключатель ViewMode (День/Неделя/Месяц)
- [ ] Добавить экспорт диаграммы в PNG/PDF
- [ ] Реализовать drag & drop для изменения дат
- [ ] Добавить поддержку групповых операций
- [ ] Локализовать UI на русский язык

## 🐛 Известные проблемы

Нет известных проблем после адаптации.

## 📝 Лицензия

Компонент адаптирован из оригинального проекта `gantt-task-react`.
