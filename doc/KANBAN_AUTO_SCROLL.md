# Автоматическая прокрутка канбан-доски при ховере

## Обзор

Реализована **автоматическая горизонтальная прокрутка** канбан-доски при наведении курсора на карточку задачи. Если столбец с задачей не полностью виден на экране, доска автоматически прокручивается, чтобы показать этот столбец.

## Проблема

На канбан-доске с большим количеством столбцов:

- Пользователю приходится вручную скроллить доску
- Неудобно работать с задачами в невидимых столбцах
- Потеря времени на поиск нужного столбца

## Решение

### 1. **Автоскролл при ховере на задаче**

При наведении курсора на карточку задачи:

1. Определяется, в каком столбце находится задача
2. Проверяется, виден ли столбец полностью
3. Если столбец частично скрыт - выполняется плавная прокрутка

### 2. **Улучшенный внешний вид scrollbar**

Кастомные стили для горизонтального скролла:

- Тонкий и ненавязчивый scrollbar
- Плавная анимация при наведении
- Поддержка светлой и темной темы

## Технические детали

### Refs для управления прокруткой

```typescript
// Ref для контейнера доски
const boardRef = useRef<HTMLDivElement | null>(null);

// Map с refs для всех столбцов (ключ = statusId)
const columnRefs = useRef<Map<number, HTMLDivElement>>(new Map());
```

### Функция прокрутки к столбцу

```typescript
const scrollToColumn = (statusId: number) => {
  const columnElement = columnRefs.current.get(statusId);
  const boardElement = boardRef.current;

  if (columnElement && boardElement) {
    const boardRect = boardElement.getBoundingClientRect();
    const columnRect = columnElement.getBoundingClientRect();

    // Проверяем, виден ли столбец полностью
    const isColumnVisible =
      columnRect.left >= boardRect.left && columnRect.right <= boardRect.right;

    if (!isColumnVisible) {
      // Вычисляем позицию для прокрутки с отступом
      const scrollLeft =
        columnElement.offsetLeft - boardElement.offsetLeft - 20; // 20px отступ от края

      boardElement.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth", // Плавная анимация
      });
    }
  }
};
```

### Обработчик ховера

```typescript
const handleTaskHover = (statusId: number) => {
  if (!isDragging) {
    // Не скроллим во время драга
    scrollToColumn(statusId);
  }
};
```

### Интеграция в JSX

**Контейнер доски:**

```tsx
<div
  ref={boardRef}
  className="h-full w-full overflow-x-auto"
  style={{
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e0 #f7fafc'
  }}
>
```

**Столбцы с ref:**

```tsx
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
  className="flex flex-col rounded-lg..."
>
```

**Карточка задачи с обработчиком:**

```tsx
<div
  key={task.id}
  onMouseEnter={() => handleTaskHover(task.statusId)}
  onClick={() => !isDragging && onTaskClick(task)}
  className="bg-white dark:bg-gray-700 p-4..."
>
```

## Стили Scrollbar

### globals.css

```css
/* Webkit browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 5px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Dark mode */
.dark ::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
```

### Inline стили для Firefox

```typescript
style={{
  scrollbarWidth: 'thin',
  scrollbarColor: '#cbd5e0 #f7fafc'
}}
```

## Поведение

### Сценарий 1: Столбец полностью видим

```
1. Пользователь наводит курсор на задачу
2. Проверка: columnRect.left >= boardRect.left && columnRect.right <= boardRect.right
3. Результат: true → прокрутка НЕ выполняется ✅
```

### Сценарий 2: Столбец частично скрыт слева

```
1. Пользователь наводит курсор на задачу в невидимом столбце
2. Проверка: isColumnVisible === false
3. Вычисление: scrollLeft = columnElement.offsetLeft - 20px
4. Действие: плавная прокрутка влево
5. Результат: столбец становится видимым ✅
```

### Сценарий 3: Столбец частично скрыт справа

```
1. Пользователь наводит курсор на задачу
2. Проверка: columnRect.right > boardRect.right
3. Действие: плавная прокрутка вправо
4. Результат: столбец становится видимым ✅
```

### Сценарий 4: Во время драга задачи

```
1. Пользователь перетаскивает задачу (isDragging = true)
2. Ховер на другой задаче
3. Проверка: if (!isDragging)
4. Результат: прокрутка НЕ выполняется (не мешаем драгу) ✅
```

## Преимущества

### ✅ UX улучшения

- **Мгновенный доступ** к любой задаче без ручного скролла
- **Плавная анимация** - не резко, а smooth scroll
- **Умная логика** - скроллим только если нужно

### ✅ Производительность

- **Эффективные refs** - Map для быстрого доступа
- **Условный скролл** - проверка видимости перед действием
- **Не мешает драгу** - отключается во время перетаскивания

### ✅ Визуальное качество

- **Кастомный scrollbar** - красивый и современный
- **Тематизация** - поддержка светлой и темной темы
- **Hover-эффект** - scrollbar меняет цвет при наведении

## Browser Support

### ✅ Webkit browsers (Chrome, Safari, Edge)

`::-webkit-scrollbar` стили полностью поддерживаются

### ✅ Firefox

`scrollbarWidth` и `scrollbarColor` через inline стили

### ⚠️ Older browsers

Fallback на стандартный scrollbar (graceful degradation)

## Альтернативные решения (не реализованы)

### 1. Scroll on click вместо hover

```typescript
onClick={() => {
  scrollToColumn(task.statusId);
  onTaskClick(task);
}}
```

❌ Менее удобно - требует клика

### 2. Центрирование столбца

```typescript
const scrollLeft =
  columnElement.offsetLeft -
  boardElement.offsetWidth / 2 +
  columnElement.offsetWidth / 2;
```

❌ Может быть слишком агрессивно

### 3. Auto-scroll во время драга

```typescript
// Скролл при приближении к краям
if (dragPosition.x < 100) scrollLeft();
if (dragPosition.x > window.innerWidth - 100) scrollRight();
```

⚠️ Можно добавить в будущем

## Настройка

### Изменить отступ от края

```typescript
const scrollLeft = columnElement.offsetLeft - boardElement.offsetLeft - 40; // Изменить с 20px на 40px
```

### Изменить скорость прокрутки

```typescript
boardElement.scrollTo({
  left: scrollLeft,
  behavior: "auto", // Мгновенно вместо smooth
});
```

### Отключить для мобильных

```typescript
const handleTaskHover = (statusId: number) => {
  if (window.innerWidth < 768) return; // Только для desktop
  if (!isDragging) {
    scrollToColumn(statusId);
  }
};
```

## Затронутые файлы

**1. KanbanBoard.tsx**

- Добавлены refs: `boardRef`, `columnRefs`
- Функции: `scrollToColumn()`, `handleTaskHover()`
- Обработчик: `onMouseEnter` на карточках задач

**2. globals.css**

- Стили: `::-webkit-scrollbar-*`
- Dark mode: `.dark ::-webkit-scrollbar-*`
- Hover эффекты

## Тестирование

### Ручное тестирование

1. ✅ Открыть канбан-доску с 10+ столбцами
2. ✅ Навести курсор на задачу в невидимом столбце
3. ✅ Проверить плавную прокрутку
4. ✅ Проверить, что не скроллит если столбец уже видим
5. ✅ Проверить, что не мешает драгу задач

### Edge cases

- ✅ Первый столбец (scrollLeft = 0)
- ✅ Последний столбец (не выходит за пределы)
- ✅ Один столбец (не скроллит)
- ✅ Узкий экран (корректная работа)

---

**Дата**: 5 октября 2025  
**Паттерн**: Auto-scroll on hover  
**Технологии**: React refs, smooth scroll, custom scrollbar CSS  
**Статус**: ✅ Реализовано и протестировано
