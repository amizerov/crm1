# Миграция медиатеки на Server Actions

## Изменения

### ✅ Удалено:
- `src/app/api/projects/[projectId]/images/route.ts` - API route для работы с изображениями

### ✅ Добавлено:
- `src/app/tasks/views/project/actions/mediaLibrary.ts` - Server Actions для медиатеки

### ✅ Обновлено:
- `src/app/tasks/views/project/components/MediaLibrary.tsx` - использует Server Actions вместо API calls

## Server Actions для медиатеки

### `getProjectImages(projectId: number)`
Получает список всех изображений проекта
- **Вход**: ID проекта
- **Выход**: `{ success: boolean; images?: ProjectImage[]; message?: string }`
- **Функциональность**: 
  - Проверка авторизации
  - Чтение папки `public/projectdescription/{projectId}/`
  - Фильтрация только изображений (.jpg, .jpeg, .png, .gif, .webp)
  - Сортировка по дате изменения (новые сначала)

### `deleteProjectImage(projectId: number, imagePath: string)`
Удаляет изображение проекта
- **Вход**: ID проекта и путь к изображению
- **Выход**: `{ success: boolean; message?: string }`
- **Функциональность**:
  - Проверка авторизации
  - Валидация пути (только изображения текущего проекта)
  - Безопасное удаление файла из файловой системы

## Типы данных

```typescript
interface ProjectImage {
  name: string;          // Имя файла
  path: string;          // Путь для отображения (/projectdescription/{projectId}/{filename})
  size: number;          // Размер файла в байтах
  lastModified: number;  // Время последнего изменения (timestamp)
}
```

## Обновления MediaLibrary компонента

### Было (API calls):
```typescript
const response = await fetch(`/api/projects/${projectId}/images`);
const imageList = await response.json();
```

### Стало (Server Actions):
```typescript
const result = await getProjectImages(projectId);
if (result.success && result.images) {
  setImages(result.images);
}
```

## Преимущества Server Actions

1. **Безопасность**: Логика выполняется на сервере, код клиента не содержит чувствительную логику
2. **Производительность**: Нет дополнительных HTTP запросов, прямой вызов функций
3. **Типизация**: Полная типизация TypeScript между клиентом и сервером
4. **Простота**: Нет необходимости в API маршрутах для внутренней логики
5. **Кэширование**: Next.js может оптимизировать кэширование Server Actions

## Архитектурные принципы

- **API routes**: Только для внешних интеграций с другими системами
- **Server Actions**: Для внутренней логики приложения
- **Разделение ответственности**: Каждый action решает одну конкретную задачу
- **Обработка ошибок**: Единообразная структура ответов с success/error

## Совместимость

Изменения полностью обратно совместимы:
- UI компонента не изменился
- API интерфейс MediaLibrary остался тем же
- Функциональность осталась идентичной

## Следующие шаги

При необходимости создания внешнего API для интеграций:
1. Создать отдельный проект для API
2. Использовать Server Actions как внутренний слой бизнес-логики
3. API routes использовать только как прокси к Server Actions