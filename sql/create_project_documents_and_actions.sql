-- Создание таблицы для документов проекта
CREATE TABLE ProjectDocuments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT NOT NULL,
    filename NVARCHAR(255) NOT NULL, -- Имя файла в файловой системе
    originalName NVARCHAR(255) NOT NULL, -- Оригинальное имя файла
    filePath NVARCHAR(500) NOT NULL, -- Путь к файлу
    mimeType NVARCHAR(100), -- MIME тип файла
    fileSize BIGINT, -- Размер файла в байтах
    uploaded_by INT NOT NULL, -- ID пользователя, который загрузил
    uploaded_at DATETIME DEFAULT GETDATE(), -- Дата загрузки
    
    CONSTRAINT FK_ProjectDocuments_Project 
        FOREIGN KEY (project_id) REFERENCES Project(id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectDocuments_User 
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Создание индексов для быстрого поиска
CREATE INDEX IX_ProjectDocuments_ProjectId ON ProjectDocuments(project_id);
CREATE INDEX IX_ProjectDocuments_UploadedBy ON ProjectDocuments(uploaded_by);
CREATE INDEX IX_ProjectDocuments_UploadedAt ON ProjectDocuments(uploaded_at DESC);

-- Создание таблицы для обсуждений проекта (чат)
CREATE TABLE ProjectActions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL, -- ID пользователя, который оставил сообщение
    description NVARCHAR(MAX) NOT NULL, -- Текст сообщения
    dtc DATETIME DEFAULT GETDATE(), -- Дата создания
    dtu DATETIME NULL, -- Дата обновления (если редактировали)
    
    CONSTRAINT FK_ProjectActions_Project 
        FOREIGN KEY (project_id) REFERENCES Project(id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectActions_User 
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание индексов для быстрого поиска
CREATE INDEX IX_ProjectActions_ProjectId ON ProjectActions(project_id);
CREATE INDEX IX_ProjectActions_UserId ON ProjectActions(user_id);
CREATE INDEX IX_ProjectActions_Created ON ProjectActions(dtc DESC);

-- Комментарии к таблицам
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Документы, прикрепленные к проекту',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'ProjectDocuments';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Сообщения и обсуждения по проекту (чат проекта)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'ProjectActions';