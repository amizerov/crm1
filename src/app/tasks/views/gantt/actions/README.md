# Gantt Server Actions

Server Actions для взаимодействия с диаграммой Ганта и базой данных MSSQL.

## 📋 Список Actions

### 1. updateTaskDates

Обновляет даты начала и окончания задачи при drag & drop на диаграмме.

**Файл:** `updateTaskDates.ts`

**Параметры:**
- `taskId: number` - ID задачи
- `startDate: string` - Дата начала в формате ISO (YYYY-MM-DD)
- `dedline: string` - Дата окончания в формате ISO (YYYY-MM-DD)

**Возвращает:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Валидация:**
- Проверка корректности формата дат
- Дата окончания не может быть раньше даты начала

**Использование:**
```typescript
const result = await updateTaskDates(57, '2025-10-05', '2025-10-10');
if (result.success) {
  console.log('✅ Dates updated');
}
```

**SQL запрос:**
```sql
UPDATE Tasks 
SET 
  startDate = @startDate, 
  dedline = @dedline,
  dtu = GETDATE()
WHERE id = @taskId
```

---

### 2. updateTaskProgress

Обновляет прогресс задачи и автоматически меняет статус в зависимости от процента выполнения.

**Файл:** `updateTaskProgress.ts`

**Параметры:**
- `taskId: number` - ID задачи
- `progress: number` - Прогресс от 0 до 100
- `statuses: Array<{ id, stepOrder, status }>` - Массив статусов для определения нового статуса

**Возвращает:**
```typescript
{
  success: boolean;
  newStatusId?: number;  // ID нового статуса
  error?: string;
}
```

**Логика:**
1. Рассчитывает целевой `stepOrder` на основе прогресса
2. Находит ближайший статус по `stepOrder`
3. Если прогресс = 100%, устанавливает последний статус
4. Обновляет `statusId` задачи в БД

**Пример:**
```typescript
// Прогресс 60% → статус с stepOrder ≈ 3 из 5
const result = await updateTaskProgress(57, 60, statuses);
console.log('New status:', result.newStatusId); // → statusId с stepOrder = 3
```

**SQL запрос:**
```sql
UPDATE Tasks 
SET 
  statusId = @statusId,
  dtu = GETDATE()
WHERE id = @taskId
```

---

### 3. deleteTask

Удаляет задачу с диаграммы Ганта. Проверяет наличие подзадач перед удалением.

**Файл:** `deleteTask.ts`

**Параметры:**
- `taskId: number` - ID задачи для удаления

**Возвращает:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Валидация:**
- Проверяет наличие подзадач (parentId = taskId)
- Если есть подзадачи, возвращает ошибку

**Использование:**
```typescript
const result = await deleteTask(57);
if (!result.success) {
  alert(result.error); // "Нельзя удалить задачу с подзадачами..."
}
```

**SQL запросы:**
```sql
-- Проверка подзадач
SELECT COUNT(*) as count 
FROM Tasks 
WHERE parentId = @taskId

-- Удаление
DELETE FROM Tasks 
WHERE id = @taskId
```

---

## 🔄 Интеграция в TaskGanttDiagram

Все actions интегрированы в компонент через callbacks:

```typescript
<GanttChart
  tasks={ganttTasks}
  
  // Изменение дат через drag & drop
  onDateChange={async (task) => {
    const result = await updateTaskDates(
      parseInt(task.id),
      task.start.toISOString().split('T')[0],
      task.end.toISOString().split('T')[0]
    );
    if (!result.success) {
      alert('Ошибка: ' + result.error);
    }
  }}
  
  // Изменение прогресса через ползунок
  onProgressChange={async (task) => {
    const result = await updateTaskProgress(
      parseInt(task.id),
      task.progress,
      statuses
    );
    console.log('New status:', result.newStatusId);
  }}
  
  // Удаление через клавишу Delete
  onDelete={async (task) => {
    if (!confirm(`Удалить "${task.name}"?`)) return false;
    
    const result = await deleteTask(parseInt(task.id));
    return result.success;
  }}
/>
```

---

## 🎯 Поведение после выполнения

После успешного выполнения любого action:

1. ✅ **База данных обновлена** - изменения сохранены в MSSQL
2. 🔄 **Кеш инвалидирован** - `revalidatePath('/tasks/views')`
3. 🖥️ **UI автоматически обновлён** - React Server Components перерендерит страницу

---

## 🛡️ Обработка ошибок

Все actions возвращают объект с `success` и опциональным `error`:

```typescript
const result = await updateTaskDates(...);

if (result.success) {
  // ✅ Успешно
  console.log('Saved!');
} else {
  // ❌ Ошибка
  alert('Ошибка: ' + result.error);
}
```

---

## 📝 TODO

- [ ] Добавить оптимистичные обновления (Optimistic UI)
- [ ] Добавить toast-уведомления вместо alert()
- [ ] Добавить undo/redo для изменений
- [ ] Логировать изменения в историю задачи
- [ ] Добавить валидацию прав доступа (проверка userId)
- [ ] Добавить batch-операции для множественных изменений

---

## 🔍 Отладка

Все actions логируют свои действия в консоль:

```
📅 updateTaskDates: { taskId: 57, startDate: '2025-10-05', dedline: '2025-10-10' }
✅ Task dates updated: [1]

📊 updateTaskProgress: { taskId: 57, progress: 75 }
🎯 New status: { progress: 75, targetStep: 4, newStatusId: 35, stepOrder: 4 }
✅ Task progress updated: [1]

🗑️ deleteTask: { taskId: 57 }
✅ Task deleted: [1]
```

---

## 📚 Связанные файлы

- `TaskGanttDiagram.tsx` - интеграция actions
- `@/db/connect` - подключение к MSSQL
- `StatusTask` - типы статусов из `@/app/projects/actions/statusActions`
