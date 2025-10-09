-- Создание таблицы UserSettings для хранения персональных настроек пользователей
-- Это необходимо для сохранения настроек видимости колонок и других пользовательских предпочтений

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserSettings' AND xtype='U')
BEGIN
    CREATE TABLE UserSettings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        settingsJson NVARCHAR(MAX) NOT NULL, -- JSON с настройками пользователя
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        -- Ограничение: один пользователь - одна запись настроек
        CONSTRAINT UQ_UserSettings_UserId UNIQUE (userId)
    );
    
    -- Индекс для быстрого поиска по userId
    CREATE INDEX IX_UserSettings_UserId ON UserSettings(userId);
    
    PRINT 'Таблица UserSettings успешно создана';
END
ELSE
BEGIN
    PRINT 'Таблица UserSettings уже существует';
END

-- Пример структуры JSON с настройками:
/*
{
  "taskTableColumns": [
    {
      "key": "id",
      "title": "ID",
      "visible": true,
      "width": "80px"
    },
    {
      "key": "taskName",
      "title": "Название",
      "visible": true
    },
    {
      "key": "description",
      "title": "Описание",
      "visible": false
    }
  ],
  "preferences": {
    "theme": "light",
    "language": "ru"
  }
}
*/
