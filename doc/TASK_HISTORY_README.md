# История задач (Task History)

## Описание

Система логирования всех изменений задачи с централизованным подходом через единый метод `logTaskHistory`.

## Структура БД

### Таблица TaskHistory

```sql
CREATE TABLE TaskHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    taskId INT NOT NULL,
    userId INT NOT NULL,
    actionType NVARCHAR(50) NOT NULL,
    fieldName NVARCHAR(100),
    oldValue NVARCHAR(MAX),
    newValue NVARCHAR(MAX),
    description NVARCHAR(500),
    dtc DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES [Users](id)
);
```

## Типы действий (actionType)

- `created` - создание задачи
- `status_changed` - изменение статуса
- `assigned` / `executor_changed` - назначение/изменение исполнителя
- `priority_changed` - изменение приоритета
- `deadline_changed` - изменение дедлайна
- `startdate_changed` - изменение даты начала
- `name_changed` - изменение названия
- `description_changed` - изменение описания
- `document_added` - добавление документа
- `document_deleted` - удаление документа
- `comment_added` - добавление комментария
- `comment_edited` - редактирование комментария
- `comment_deleted` - удаление комментария
- `moved` - перемещение задачи
- `updated` - общее обновление
- `deleted` - удаление задачи

## Использование

### 1. Импорт

```typescript
import { logTaskHistory } from "@/app/tasks/actions/taskHistory";
```

### 2. Логирование изменения

```typescript
// При создании задачи
await logTaskHistory(taskId, {
  actionType: "created",
});

// При изменении статуса
await logTaskHistory(taskId, {
  actionType: "status_changed",
  fieldName: "status",
  oldValue: "To Do",
  newValue: "In Progress",
});

// При добавлении документа
await logTaskHistory(taskId, {
  actionType: "document_added",
  newValue: fileName,
});

// При удалении документа
await logTaskHistory(taskId, {
  actionType: "document_deleted",
  oldValue: fileName,
});
```

### 3. Автоматическая генерация описания

Функция `generateHistoryDescription` автоматически создаёт человекочитаемое описание:

```typescript
// Вместо ручного описания
description: 'изменил(а) статус с "To Do" на "In Progress"'

// Можно просто передать тип и значения
actionType: 'status_changed',
oldValue: 'To Do',
newValue: 'In Progress'
// Описание сгенерируется автоматически
```

## Интеграция

### Уже реализовано

✅ **Загрузка документов** - `src/app/tasks/actions/taskDocuments.ts`

- Логирование при загрузке документа (`document_added`)
- Логирование при удалении документа (`document_deleted`)

### Где добавить логирование

📝 **Обновление задачи** - `src/app/tasks/actions/updateTaskFromKanban.ts`

```typescript
// После успешного обновления
if (oldTask.statusId !== newTask.statusId) {
  await logTaskHistory(taskId, {
    actionType: "status_changed",
    oldValue: oldTask.statusName,
    newValue: newTask.statusName,
  });
}

if (oldTask.executorId !== newTask.executorId) {
  await logTaskHistory(taskId, {
    actionType: "executor_changed",
    oldValue: oldTask.executorName || "Не назначен",
    newValue: newTask.executorName || "Не назначен",
  });
}

// И так далее для всех полей...
```

📝 **Создание задачи** - где создаётся задача

```typescript
await logTaskHistory(newTaskId, {
  actionType: "created",
});
```

📝 **Комментарии** - когда будет реализован функционал

```typescript
await logTaskHistory(taskId, {
  actionType: "comment_added",
});
```

## UI компонент

Компонент истории находится в `src/app/tasks/views/common/TaskHistoryTab.tsx`

### Особенности UI:

- Timeline с иконками для каждого типа действия
- Цветовое кодирование по типам действий
- Относительные временные метки ("5 мин. назад", "2 ч. назад")
- Отображение старых и новых значений для изменений
- Автоматическая загрузка при открытии вкладки
- Responsive дизайн с поддержкой тёмной темы

## Тестирование

Используйте скрипт `sql/test_task_history.sql` для создания тестовых данных:

```sql
-- Укажите ID существующей задачи
DECLARE @taskId INT = 456;
DECLARE @userId INT = 1;

-- Скрипт создаст несколько тестовых записей истории
```

## Преимущества подхода

1. **Централизация** - один метод для всех типов логирования
2. **Автоматическое описание** - не нужно вручную писать текст
3. **Типизация** - TypeScript проверяет типы действий
4. **Гибкость** - легко добавить новые типы действий
5. **История для аудита** - все изменения записываются с пользователем и временем

## Будущие улучшения

- [ ] Фильтрация истории по типам действий
- [ ] Поиск в истории
- [ ] Экспорт истории в PDF/CSV
- [ ] Отмена изменений (undo)
- [ ] Сравнение версий (diff)
- [ ] Группировка изменений по сессиям
