-- Таблица для хранения токенов подтверждения email

-- Создаем таблицу VerificationToken
CREATE TABLE VerificationToken (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [Users](id) ON DELETE CASCADE
);

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_verification_token ON VerificationToken(token);
CREATE INDEX idx_verification_user ON VerificationToken(userId);

-- Добавляем поле isVerified в таблицу Users (если еще не добавлено)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Users]') AND name = 'isVerified')
BEGIN
    ALTER TABLE [Users] ADD isVerified BIT DEFAULT 0;
END
GO

-- Обновляем существующих пользователей (делаем их верифицированными)
UPDATE [Users] SET isVerified = 1 WHERE isVerified IS NULL;
GO

PRINT 'Таблица VerificationToken создана успешно!';
PRINT 'Поле isVerified добавлено в таблицу Users';
