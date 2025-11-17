-- Создание таблицы для хранения секретов проектов
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProjectSecrets')
BEGIN
    CREATE TABLE ProjectSecrets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_id INT NOT NULL,
        [key] NVARCHAR(255) NOT NULL,
        value NVARCHAR(MAX) NOT NULL, -- Будет храниться в зашифрованном виде
        description NVARCHAR(500) NULL,
        created_by INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ProjectSecrets_Project FOREIGN KEY (project_id) 
            REFERENCES Projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_ProjectSecrets_User FOREIGN KEY (created_by) 
            REFERENCES Users(id),
        CONSTRAINT UQ_ProjectSecrets_Key UNIQUE (project_id, [key])
    );
    
    CREATE INDEX IX_ProjectSecrets_ProjectId ON ProjectSecrets(project_id);
    PRINT 'Таблица ProjectSecrets создана';
END
ELSE
BEGIN
    PRINT 'Таблица ProjectSecrets уже существует';
END
GO

-- Создание таблицы для логирования доступа к секретам
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SecretAccessLog')
BEGIN
    CREATE TABLE SecretAccessLog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        secret_id INT NOT NULL,
        user_id INT NOT NULL,
        action NVARCHAR(50) NOT NULL, -- 'view', 'copy', 'create', 'update', 'delete'
        accessed_at DATETIME NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_SecretAccessLog_Secret FOREIGN KEY (secret_id) 
            REFERENCES ProjectSecrets(id) ON DELETE CASCADE,
        CONSTRAINT FK_SecretAccessLog_User FOREIGN KEY (user_id) 
            REFERENCES Users(id)
    );
    
    CREATE INDEX IX_SecretAccessLog_SecretId ON SecretAccessLog(secret_id);
    CREATE INDEX IX_SecretAccessLog_UserId ON SecretAccessLog(user_id);
    CREATE INDEX IX_SecretAccessLog_AccessedAt ON SecretAccessLog(accessed_at);
    PRINT 'Таблица SecretAccessLog создана';
END
ELSE
BEGIN
    PRINT 'Таблица SecretAccessLog уже существует';
END
GO

-- Добавление поля для хранения хеша мастер-пароля в таблицу Projects (опционально)
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Projects') 
    AND name = 'master_password_hash'
)
BEGIN
    ALTER TABLE Projects 
    ADD master_password_hash NVARCHAR(255) NULL;
    PRINT 'Поле master_password_hash добавлено в таблицу Projects';
END
ELSE
BEGIN
    PRINT 'Поле master_password_hash уже существует в таблице Projects';
END
GO

-- Создание тестовых секретов для существующих проектов (опционально)
/*
-- Пример добавления тестового секрета
INSERT INTO ProjectSecrets (project_id, [key], value, description, created_by, created_at, updated_at)
VALUES 
    (4, 'DATABASE_URL', 'Server=localhost;Database=TestDB;User Id=sa;Password=TestPass123;', 
     'Connection string for test database', 1, GETDATE(), GETDATE()),
    (4, 'API_KEY', 'sk-test-1234567890abcdefghijklmnopqrstuvwxyz', 
     'API key for external service', 1, GETDATE(), GETDATE());
*/

PRINT 'Миграция для секретов проектов завершена';
