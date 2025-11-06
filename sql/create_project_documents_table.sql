-- Создание таблицы для хранения документов проекта
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'ProjectDocuments')
BEGIN
    CREATE TABLE ProjectDocuments
    (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_id INT NOT NULL,
        filename NVARCHAR(255) NOT NULL,
        originalName NVARCHAR(255) NOT NULL,
        filePath NVARCHAR(500) NOT NULL,
        mimeType NVARCHAR(100) NOT NULL,
        fileSize BIGINT NOT NULL,
        uploaded_by INT NOT NULL,
        uploaded_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ProjectDocuments_Project FOREIGN KEY (project_id) REFERENCES Project(id) ON DELETE CASCADE,
        CONSTRAINT FK_ProjectDocuments_User FOREIGN KEY (uploaded_by) REFERENCES [Users](id)
    );

    -- Индексы для оптимизации запросов
    CREATE INDEX IX_ProjectDocuments_ProjectId ON ProjectDocuments(project_id);
    CREATE INDEX IX_ProjectDocuments_UploadedBy ON ProjectDocuments(uploaded_by);
    CREATE INDEX IX_ProjectDocuments_UploadedAt ON ProjectDocuments(uploaded_at DESC);

    PRINT 'Таблица ProjectDocuments успешно создана';
END
ELSE
BEGIN
    PRINT 'Таблица ProjectDocuments уже существует';
END
GO
