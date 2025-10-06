# Система сохранения настроек пользователя

## Описание

Реализована многоуровневая система сохранения пользовательских настроек для таблиц:

1. **localStorage** - основное хранилище для быстрого доступа
2. **База данных** - дублирование для надежности и синхронизации между устройствами
3. **Уникальный ID устройства** - для идентификации настроек конкретного браузера/устройства

## Настройка базы данных

### 1. Создание таблицы UserSettings

Выполните SQL-скрипт для создания таблицы:

```sql
-- Файл: sql/create_user_settings_table.sql
```

Или выполните команду напрямую в SSMS/Azure Data Studio:

```sql
CREATE TABLE UserSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    deviceId NVARCHAR(255) NOT NULL,
    userId INT NULL,
    settingsJson NVARCHAR(MAX) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT UQ_UserSettings_DeviceId UNIQUE (deviceId),
    INDEX IX_UserSettings_UserId (userId),
    INDEX IX_UserSettings_UpdatedAt (updatedAt)
);
```

## Функциональность

### Автоматическое сохранение
- Настройки сохраняются в localStorage при каждом изменении
- Автоматическая синхронизация с сервером в фоне
- Graceful fallback к локальным настройкам при проблемах с сервером

### Персонализация
- Уникальный ID устройства генерируется автоматически
- Возможность привязки к пользователю в будущем
- Настройки сохраняются между сессиями

### API endpoints

**GET** `/api/user-settings?deviceId=<ID>`
- Получение настроек с сервера

**POST** `/api/user-settings`
- Сохранение настроек на сервер
```json
{
  "deviceId": "device_123",
  "settings": {
    "taskTableColumns": [...]
  },
  "userId": 1 // optional
}
```

**DELETE** `/api/user-settings?deviceId=<ID>`
- Удаление настроек пользователя

## Использование в компонентах

```typescript
import { useUserSettings } from '../../lib/userSettings';

// В компоненте
const settings = useUserSettings();

// Получение колонок
const columns = settings.getTaskTableColumns();

// Обновление колонок (автоматически сохраняется)
settings.updateTaskTableColumns(newColumns);

// Сброс к умолчанию
settings.resetTaskTableColumns();

// Ручная синхронизация с сервером
await settings.syncWithServer(userId);
```

## Отладка

Настройки можно проверить в:
1. **DevTools > Application > Local Storage** - локальные настройки
2. **DevTools > Console** - логи синхронизации
3. **База данных** - таблица UserSettings

## Расширение

Система готова к расширению:
- Добавление новых типов настроек
- Интеграция с системой аутентификации
- Синхронизация между устройствами пользователя
- Экспорт/импорт настроек
