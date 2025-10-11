# Система автоматического логирования истории задач

## Как это работает

Создан модуль `src/db/taskHistory.ts` который автоматически отслеживает все операции с задачами через функцию `query()`.

## Что логируется автоматически

- **INSERT** в таблицу Task → "Создана новая задача"
- **UPDATE** в таблицу Task → "Изменено поле [название]" для каждого изменённого поля
- **DELETE** из таблицы Task → "Задача удалена"

## Использование в actions

### До (ручное логирование)

```typescript
const result = await query(`
  INSERT INTO Task (taskName, description) 
  VALUES (@taskName, @description)
`, { taskName: 'Новая задача', description: 'Описание' });

// Ручное логирование
await logTaskHistory(newTaskId, { actionType: 'created' });
```

### После (автоматическое логирование)

```typescript
const result = await query(`
  INSERT INTO Task (taskName, description) 
  VALUES (@taskName, @description)
`, { taskName: 'Новая задача', description: 'Описание' });

// Логирование происходит автоматически!
// userId получается из сессии/куки автоматически
```

## Примеры автоматического логирования

### 1. Создание задачи
```typescript
await query(`
  INSERT INTO Task (taskName, userId) 
  OUTPUT INSERTED.id
  VALUES (@taskName, @userId)
`, { taskName: 'Новая задача', userId: 123 }, currentUser.id);
```
**Результат в TaskHistory:**
- actionType: 'INSERT'
- description: 'Создана новая задача'

### 2. Обновление задачи
```typescript
await query(`
  UPDATE Task 
  SET taskName = @taskName, statusId = @statusId 
  WHERE id = @taskId
`, { taskName: 'Обновлённое название', statusId: 2, taskId: 456 }, currentUser.id);
```
**Результат в TaskHistory:**
- Запись 1: fieldName: 'taskname', oldValue: 'Старое название', newValue: 'Обновлённое название'
- Запись 2: fieldName: 'statusid', oldValue: '1', newValue: '2'

### 3. Удаление задачи
```typescript
await query(`
  DELETE FROM Task WHERE id = @taskId
`, { taskId: 456 }, currentUser.id);
```
**Результат в TaskHistory:**
- actionType: 'DELETE'
- description: 'Задача удалена'

## Дополнительные функции

### Получение истории задачи
```typescript
import { getTaskHistory } from '@/db/connect';

const history = await getTaskHistory(connection, taskId);
```

### Ручное добавление записи в историю
```typescript
import { addTaskHistoryRecord } from '@/db/connect';

await addTaskHistoryRecord(
  connection,
  taskId,
  userId,
  'CUSTOM_ACTION',
  'Выполнено специальное действие',
  'customField',
  'старое значение',
  'новое значение'
);
```

## Структура таблицы TaskHistory

```sql
CREATE TABLE [TaskHistory](
  [id] [int] IDENTITY(1,1) NOT NULL,
  [taskId] [int] NULL,
  [userId] [int] NOT NULL,
  [actionType] [nvarchar](50) NOT NULL,
  [fieldName] [nvarchar](150) NULL,
  [oldValue] [nvarchar](max) NULL,
  [newValue] [nvarchar](max) NULL,
  [description] [nvarchar](500) NULL,
  [dtc] [datetime] NOT NULL DEFAULT GETDATE()
)
```

## Преимущества

✅ **Автоматичность** - не нужно помнить добавлять логирование в каждый action  
✅ **Детализация** - отслеживается изменение каждого поля отдельно  
✅ **Безопасность** - ошибки логирования не прерывают основные операции  
✅ **Производительность** - анализ запроса происходит быстро через regex  
✅ **Модульность** - весь код логирования изолирован в отдельном файле  

## Миграция существующих actions

**НЕ НУЖНО НИЧЕГО МЕНЯТЬ!** 

Все существующие вызовы `query()` будут работать как раньше:

```typescript
// Работает без изменений:
await query(sqlQuery, params);
```

История задач будет логироваться автоматически, `userId` получается из сессии.