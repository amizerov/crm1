# Исправление сортировки статусов в TaskList

**Дата**: 8 октября 2025  
**Коммит**: `653e066`  
**Файл**: `src/app/tasks/views/list/TaskList.tsx`

## Проблема

До исправления:
- Группировка по статусу использовала `task.statusName` (строковое поле)
- Группы сортировались **по алфавиту**: `Object.keys(groupedTasks).sort()`
- Результат: статусы отображались в неправильном порядке

### Пример проблемы:

**Правильный порядок (по `stepOrder` из БД):**
1. Задумки (stepOrder = 1)
2. В процессе (stepOrder = 2)
3. Готово (stepOrder = 3)

**Фактический порядок (по алфавиту):**
1. В процессе
2. Готово
3. Задумки

---

## Решение

### Шаг 1: Использование `statusId` вместо `statusName`

**До:**
```typescript
case 'status':
  key = task.statusName || 'Без статуса';
  break;
```

**После:**
```typescript
case 'status': {
  // Используем statusId для получения актуального названия из справочника
  const status = statuses.find(s => s.id === task.statusId);
  key = status?.status || 'Без статуса';
  break;
}
```

**Преимущества:**
- ✅ Всегда актуальное название статуса из справочника
- ✅ Если статус переименован в БД — изменения сразу отобразятся
- ✅ Не зависим от денормализованного поля `task.statusName`

---

### Шаг 2: Сортировка групп по `stepOrder`

**До:**
```typescript
const groupKeys = Object.keys(groupedTasks).sort();
```

**После:**
```typescript
const groupKeys = Object.keys(groupedTasks).sort((a, b) => {
  if (groupBy === 'status') {
    // Сортируем статусы по stepOrder из справочника
    const statusA = statuses.find(s => s.status === a);
    const statusB = statuses.find(s => s.status === b);
    return (statusA?.stepOrder || 999) - (statusB?.stepOrder || 999);
  }
  // Для остальных группировок — по алфавиту
  return a.localeCompare(b);
});
```

**Логика:**
1. Если группировка по статусу (`groupBy === 'status'`):
   - Находим объект статуса в массиве `statuses` по названию
   - Сортируем по `stepOrder` (меньше = раньше)
   - Если `stepOrder` отсутствует — ставим в конец (999)
2. Для остальных группировок (исполнитель, приоритет и т.д.):
   - Сортируем по алфавиту через `localeCompare()`

---

## Технические детали

### Используемый интерфейс `StatusTask`:

```typescript
interface StatusTask {
  id: number;
  status: string;        // Название статуса
  stepOrder: number;     // Порядковый номер для сортировки
  isCompleted?: boolean; // Флаг завершённого статуса
}
```

### Данные, с которыми работает компонент:

```typescript
interface TaskListProps {
  tasks: Task[];          // Массив задач с task.statusId
  statuses: StatusTask[]; // Справочник статусов (теперь используется!)
  // ... остальные пропсы
}
```

---

## Результат

### ✅ Что исправлено:

1. **Корректный порядок статусов** — теперь соответствует `stepOrder` из БД
2. **Актуальные названия** — берутся из справочника, а не из денормализованного поля
3. **Устойчивость к изменениям** — если статус переименовать, фильтры/группировки не сломаются
4. **Читаемый код** — добавлены комментарии, объясняющие логику

### 📊 Производительность:

- `statuses.find()` вызывается для каждой задачи при группировке
- Для оптимизации можно кэшировать `Map<statusId, StatusTask>`:

```typescript
// Опциональная оптимизация (пока не критично):
const statusMap = useMemo(() => 
  new Map(statuses.map(s => [s.id, s])),
  [statuses]
);

// Использование:
const status = statusMap.get(task.statusId);
```

---

## Дальнейшие улучшения

### 1. Исправить фильтр "Завершённые задачи"

**Сейчас** (хардкод):
```typescript
if (filters.completed) {
  filtered = filtered.filter(task => 
    task.statusName === 'Готово' || task.statusName === 'Завершено'
  );
}
```

**Предлагается** (использовать флаг):
```typescript
if (filters.completed) {
  const completedStatusIds = statuses
    .filter(s => s.isCompleted)
    .map(s => s.id);
  filtered = filtered.filter(task => 
    completedStatusIds.includes(task.statusId)
  );
}
```

### 2. Вынести веса приоритетов в конфигурацию

**Сейчас** (хардкод):
```typescript
const priorityOrder: Record<string, number> = {
  'Срочный': 4, 'Высокий': 3, 'Средний': 2, 'Низкий': 1,
};
```

**Предлагается**: хранить в БД или `TASK_COLUMNS` конфиге

### 3. Кэширование справочников

```typescript
const statusMap = useMemo(() => 
  new Map(statuses.map(s => [s.id, s])),
  [statuses]
);
```

---

## Проверка работы

### Тестовый сценарий:

1. Открыть список задач
2. Выбрать группировку "По этапу"
3. Проверить порядок групп — должен соответствовать `stepOrder` из БД

### Ожидаемый результат:

```
✅ Задумки (stepOrder=1)
   - Задача 1
   - Задача 2

✅ В процессе (stepOrder=2)
   - Задача 3

✅ Готово (stepOrder=3)
   - Задача 4
```

---

## Связанные коммиты

- `d8eed29` — Исправление фильтра "Мои задачи" (добавлен `currentUserId`)
- `653e066` — Использование `statusId` и сортировка по `stepOrder` (текущий)

## Авторы

- Анализ проблемы: GitHub Copilot
- Реализация: GitHub Copilot
- Тестирование: требуется проверка пользователем
