# Управление порядком задач в Gantt диаграмме

## 📋 Как работает порядок отображения

Порядок задач в Gantt диаграмме определяется порядком элементов в массиве `ganttTasks`. Задача, которая находится первой в массиве, отображается вверху диаграммы.

## 🎯 Способы управления порядком

### 1. Сортировка по дате начала (по умолчанию)

Задачи отсортированы по дате начала — задачи, которые начинаются раньше, показываются выше:

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => {
  return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime();
});
```

**Результат:**
```
1. Задача A (начало: 1 окт)  [====]
2. Задача B (начало: 3 окт)      [======]
3. Задача C (начало: 5 окт)          [===]
```

### 2. Сортировка по ID

Для сортировки по ID (обычно совпадает с порядком создания):

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => a.id - b.id);
```

### 3. Сортировка по названию (алфавитная)

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => 
  a.taskName.localeCompare(b.taskName, 'ru')
);
```

### 4. Сортировка по статусу (этап workflow)

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => {
  const statusA = statuses.find(s => s.id === a.statusId);
  const statusB = statuses.find(s => s.id === b.statusId);
  return (statusA?.stepOrder || 999) - (statusB?.stepOrder || 999);
});
```

### 5. Сортировка по приоритету

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => 
  (a.priorityId || 999) - (b.priorityId || 999)
);
```

### 6. Ручной порядок через поле `orderInStatus`

Используйте существующее поле `orderInStatus` из базы данных:

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => 
  (a.orderInStatus || 999) - (b.orderInStatus || 999)
);
```

Это поле можно обновлять через Drag & Drop в Kanban доске.

### 7. Комбинированная сортировка

Сначала по приоритету, затем по дате:

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => {
  // Сначала по приоритету
  const priorityDiff = (a.priorityId || 999) - (b.priorityId || 999);
  if (priorityDiff !== 0) return priorityDiff;
  
  // Потом по дате начала
  return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime();
});
```

## 🔧 Как изменить способ сортировки

Откройте файл `TaskGanttDiagram.tsx` и найдите блок:

```typescript
const sortedTasks = tasksWithDates.sort((a, b) => {
  // Закомментируйте текущий способ
  // return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime();
  
  // Раскомментируйте нужный
  return a.id - b.id;
});
```

## 🎨 Визуальное изменение порядка

### Вариант 1: Drag & Drop в списке (будущая фичаstache)

Добавить возможность перетаскивать задачи в левой панели диаграммы:

```typescript
<GanttChart
  tasks={ganttTasks}
  TaskListTable={(props) => (
    <DraggableTaskList 
      {...props}
      onReorder={(taskId, newIndex) => {
        // TODO: сохранить новый порядок
      }}
    />
  )}
/>
```

### Вариант 2: Кнопки "вверх/вниз" для каждой задачи

Добавить действия в контекстное меню:

```typescript
const moveTaskUp = async (taskId: number) => {
  const index = tasks.findIndex(t => t.id === taskId);
  if (index > 0) {
    // Обменять orderInStatus с предыдущей задачей
    await updateTaskOrder(taskId, tasks[index - 1].orderInStatus);
  }
};
```

## 🗄️ Сохранение пользовательского порядка в БД

Если нужно сохранить ручной порядок, создайте новую таблицу или используйте `orderInStatus`:

```sql
-- SQL для обновления порядка
UPDATE Tasks 
SET orderInStatus = @newOrder
WHERE id = @taskId;
```

Server action:

```typescript
// src/app/tasks/views/gantt/actions/updateTaskOrder.ts
'use server';

export async function updateTaskOrder(taskId: number, newOrder: number) {
  const connection = await getConnection();
  
  await connection.request()
    .input('taskId', sql.Int, taskId)
    .input('newOrder', sql.Int, newOrder)
    .query('UPDATE Tasks SET orderInStatus = @newOrder WHERE id = @taskId');
  
  revalidatePath('/tasks/views');
  return { success: true };
}
```

## 💡 Рекомендации

1. **По умолчанию**: Используйте сортировку по дате начала — логично для timeline
2. **Для контроля**: Добавьте селектор сортировки в панель управления
3. **Для гибкости**: Используйте `orderInStatus` + возможность ручного изменения

## 🎬 Пример: Селектор типа сортировки

```typescript
const [sortBy, setSortBy] = useState<'date' | 'id' | 'name' | 'status'>('date');

const sortedTasks = useMemo(() => {
  const sorted = [...tasksWithDates];
  
  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => 
        new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
      );
    case 'id':
      return sorted.sort((a, b) => a.id - b.id);
    case 'name':
      return sorted.sort((a, b) => a.taskName.localeCompare(b.taskName, 'ru'));
    case 'status':
      return sorted.sort((a, b) => {
        const sA = statuses.find(s => s.id === a.statusId);
        const sB = statuses.find(s => s.id === b.statusId);
        return (sA?.stepOrder || 999) - (sB?.stepOrder || 999);
      });
    default:
      return sorted;
  }
}, [tasksWithDates, sortBy, statuses]);

// В UI:
<select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
  <option value="date">По дате начала</option>
  <option value="id">По ID</option>
  <option value="name">По названию</option>
  <option value="status">По статусу</option>
</select>
```
